import { useEffect, useMemo, useRef, useState } from 'react';
import { fmtUYU } from '../../api/entradas.js';
import styles from './CobroPuerta.module.css';

const nuevoIdem = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
const VACIO = { nombre: '', telefono: '', email: '', medio: '', notas: '', ingresan: true, otroMonto: false, monto: '' };

/**
 * Cobro en la puerta. El precio lo calcula el servidor (precio de puerta con promo por grupo):
 * acá solo se muestra para que quien cobra sepa cuánto pedir.
 */
export default function CobroPuerta({ api, precios = [], onDone }) {
  const max = precios.length || 10;
  const [cantidad, setCantidad] = useState(1);
  const [f, setF] = useState(VACIO);
  const [invitados, setInvitados] = useState([]);
  const [idem, setIdem] = useState(nuevoIdem);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [hecho, setHecho] = useState(null);
  const top = useRef(null);

  // al cobrar, lleva la vista al comprobante (el botón queda abajo de todo en el celular)
  useEffect(() => {
    if (hecho) top.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [hecho]);

  const fila = useMemo(() => precios.find((p) => p.cantidad === cantidad) || null, [precios, cantidad]);
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const cambiarCantidad = (n) => setCantidad(Math.min(max, Math.max(1, n)));
  // monto a cobrar: el de la tabla, o el que ponga quien cobra (precio especial)
  const montoManual = f.otroMonto && f.monto !== '' ? Math.round(Number(f.monto)) : null;
  const aCobrar = montoManual ?? fila?.totalUYU ?? null;

  async function cobrar(e) {
    e.preventDefault();
    setError('');
    if (!f.medio) return setError('Marcá si pagó en efectivo o por transferencia.');
    if (f.otroMonto && (montoManual === null || !Number.isFinite(montoManual) || montoManual < 0)) {
      return setError('Escribí el monto total que cobraste (en pesos).');
    }
    const medio = f.medio === 'efectivo' ? 'EFECTIVO' : 'TRANSFERENCIA';
    const texto = `¿Cobrar ${aCobrar !== null ? fmtUYU(aCobrar) : ''} en ${medio}?${
      montoManual !== null && fila && montoManual !== fila.totalUYU ? ` (precio normal: ${fmtUYU(fila.totalUYU)})` : ''
    }\n\n${cantidad} entrada${cantidad > 1 ? 's' : ''} a nombre de ${f.nombre}${
      f.ingresan ? '\nQuedan marcadas como ingresadas.' : ''
    }`;
    if (!window.confirm(texto)) return;
    setBusy(true);
    try {
      const { otroMonto, monto, ...datos } = f;
      const r = await api.puerta.cobrar({
        ...datos,
        totalUYU: otroMonto && monto !== '' ? Number(monto) : undefined,
        cantidad,
        invitados: invitados.slice(0, cantidad - 1).map((x) => (x || '').trim()).filter(Boolean),
        idem,
      });
      setHecho({ ...r, nombre: f.nombre, email: f.email });
      setF(VACIO);
      setInvitados([]);
      setCantidad(1);
      setIdem(nuevoIdem());
      onDone?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (hecho) {
    return (
      <section className={styles.wrap} ref={top}>
        <div className={styles.ok} role="status">
          <strong>Cobrado: {fmtUYU(hecho.totalUYU)}</strong>
          <span>
            {hecho.cantidad} entrada{hecho.cantidad > 1 ? 's' : ''} · {hecho.medio === 'efectivo' ? 'Efectivo' : 'Transferencia'}
            {hecho.cantidad > 1 ? ` · ${fmtUYU(hecho.precioUnitUYU)} c/u` : ''}
          </span>
          <ul>
            {hecho.entradas.map((t) => (
              <li key={t.code}>
                {t.nombre} <code>{t.code}</code> {t.status === 'used' ? '· ya ingresó' : ''}
              </li>
            ))}
          </ul>
          {hecho.email && <small>{hecho.enviado ? `Entrada enviada a ${hecho.email}` : 'No se pudo enviar el email (igual quedó registrada).'}</small>}
        </div>
        <button type="button" className={styles.primary} onClick={() => setHecho(null)}>
          Cobrar otra
        </button>
      </section>
    );
  }

  return (
    <section className={styles.wrap}>
      <h2 className={styles.h}>Cobrar entradas</h2>
      <form onSubmit={cobrar} className={styles.form}>
        <div className={styles.cantidad}>
          <span>¿Cuántas personas?</span>
          <div className={styles.stepper}>
            <button type="button" onClick={() => cambiarCantidad(cantidad - 1)} disabled={cantidad <= 1} aria-label="Una menos">
              −
            </button>
            <strong aria-live="polite">{cantidad}</strong>
            <button type="button" onClick={() => cambiarCantidad(cantidad + 1)} disabled={cantidad >= max} aria-label="Una más">
              +
            </button>
          </div>
        </div>
        {fila && (
          <div className={`${styles.total} ${montoManual !== null ? styles.tachado : ''}`}>
            <span>{montoManual !== null ? 'Precio normal' : 'A cobrar'}</span>
            <strong>{fmtUYU(fila.totalUYU)}</strong>
            {cantidad > 1 && <small>{fmtUYU(fila.unitUYU)} por persona</small>}
          </div>
        )}
        <label className={styles.check}>
          <input type="checkbox" checked={f.otroMonto} onChange={set('otroMonto')} />
          Cobrar otro monto (precio especial)
        </label>
        {f.otroMonto && (
          <label className={styles.monto}>
            <span>Total que cobrás, en pesos{cantidad > 1 ? ` (por las ${cantidad})` : ''}</span>
            <input type="number" min="0" step="1" inputMode="numeric" placeholder={fila ? String(fila.totalUYU) : ''} value={f.monto} onChange={set('monto')} autoFocus />
          </label>
        )}

        <input placeholder="Nombre y apellido" value={f.nombre} onChange={set('nombre')} required minLength={3} autoComplete="off" />
        {Array.from({ length: cantidad - 1 }, (_, i) => (
          <input
            key={i}
            placeholder={`Acompañante ${i + 2} · nombre (opcional)`}
            value={invitados[i] || ''}
            autoComplete="off"
            onChange={(e) =>
              setInvitados((arr) => {
                const next = [...arr];
                next[i] = e.target.value;
                return next;
              })
            }
          />
        ))}
        <input type="tel" placeholder="Celular (opcional)" value={f.telefono} onChange={set('telefono')} autoComplete="off" />
        <input type="email" placeholder="Email (opcional: le llega la entrada)" value={f.email} onChange={set('email')} autoComplete="off" />

        <fieldset className={styles.medios}>
          <legend>¿Cómo pagó?</legend>
          {[
            ['efectivo', 'Efectivo'],
            ['transferencia', 'Transferencia'],
          ].map(([m, label]) => (
            <label key={m} className={f.medio === m ? styles.medioOn : ''}>
              <input type="radio" name="medio" value={m} checked={f.medio === m} onChange={set('medio')} />
              {label}
            </label>
          ))}
        </fieldset>
        {(f.medio === 'transferencia' || f.otroMonto) && (
          <input
            placeholder={f.otroMonto ? 'Nota: por qué este precio (ej.: amiga de Ico)' : 'Nota de la transferencia (ej.: a nombre de quién)'}
            value={f.notas}
            onChange={set('notas')}
            maxLength={200}
          />
        )}
        <label className={styles.check}>
          <input type="checkbox" checked={f.ingresan} onChange={set('ingresan')} />
          Entran ahora (marcar ingreso)
        </label>
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
        <button className={styles.primary} disabled={busy}>
          {busy ? 'Registrando…' : aCobrar !== null && Number.isFinite(aCobrar) ? `Cobrar ${fmtUYU(aCobrar)}` : 'Cobrar'}
        </button>
      </form>
    </section>
  );
}
