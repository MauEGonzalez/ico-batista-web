import { useEffect, useState } from 'react';
import { fmtUYU } from '../../api/entradas.js';
import styles from './VentaManualForm.module.css';

const EMPTY = { nombre: '', email: '', telefono: '', cantidad: 1, medio: 'talonario', talonarioNum: '', local: '', totalUYU: '', notas: '' };
const MEDIOS = [
  ['talonario', 'Talonario'],
  ['efectivo', 'Efectivo'],
  ['transferencia', 'Transferencia'],
];

/**
 * Venta fuera de la web: entrada de talonario vendida en un local, o pago a Ico en efectivo o transferencia.
 * Crea la entrada como una venta más (descuenta cupo y suma a lo recaudado) y se la manda por email.
 */
export default function VentaManualForm({ api, onDone }) {
  const [open, setOpen] = useState(false);
  const [f, setF] = useState(EMPTY);
  const [precio, setPrecio] = useState(null); // precio en pesos de la tanda vigente
  const [invitados, setInvitados] = useState([]);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open || precio !== null) return;
    api
      .config()
      .then((c) => setPrecio(c.venta?.abierta ? c.venta.precioUYU : 0))
      .catch(() => setPrecio(0));
  }, [open, precio, api]);

  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));
  const esTalonario = f.medio === 'talonario';
  const cantidad = esTalonario ? 1 : Number(f.cantidad || 0);
  const sugerido = (precio || 0) * cantidad;
  const total = f.totalUYU === '' ? sugerido : Number(f.totalUYU);

  async function submit(e) {
    e.preventDefault();
    const origen = esTalonario ? `entrada Nº ${f.talonarioNum} del talonario${f.local ? ` (${f.local})` : ''}` : `${cantidad} entrada(s) cobradas en ${f.medio}`;
    const resumen = `${f.nombre}: ${origen}, ${fmtUYU(total)}. Se envía a ${f.email}.`;
    if (!window.confirm(`¿Confirmás la venta?\n\n${resumen}`)) return;
    setBusy(true);
    setMsg('');
    try {
      const r = await api.admin.ventaManual({
        ...f,
        cantidad,
        invitados: invitados.slice(0, cantidad - 1),
        totalUYU: f.totalUYU === '' ? undefined : Number(f.totalUYU),
      });
      setMsg(
        r.enviado
          ? `Listo: ${r.entradas.length} entrada(s) creada(s) y enviadas a ${f.email}.`
          : `Entradas creadas, pero el email no salió. Reenvialo desde "Compras para revisar".`
      );
      setF((x) => ({ ...EMPTY, medio: x.medio, local: x.local }));
      setInvitados([]); // deja listo para cargar la siguiente del mismo local
      onDone?.();
    } catch (err) {
      setMsg(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className={styles.wrap}>
      <button type="button" className={styles.toggle} onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        {open ? '− ' : '+ '}Cargar venta (talonario, efectivo o transferencia)
      </button>
      {open && (
        <form onSubmit={submit} className={styles.form}>
          <p className={styles.help}>
            Para entradas vendidas fuera de la web. Cuenta como venta y a la persona le llega por email la misma entrada con QR que
            si hubiera comprado online.
          </p>
          <fieldset className={styles.medios}>
            <legend>Cómo se vendió</legend>
            {MEDIOS.map(([m, label]) => (
              <label key={m}>
                <input type="radio" name="medio" value={m} checked={f.medio === m} onChange={set('medio')} />
                {label}
              </label>
            ))}
          </fieldset>
          {esTalonario && (
            <div className={styles.pair}>
              <input
                inputMode="numeric"
                placeholder="Nº de la entrada (ej.: 027)"
                value={f.talonarioNum}
                onChange={set('talonarioNum')}
                required
              />
              <input placeholder="Local que la vendió" value={f.local} onChange={set('local')} />
            </div>
          )}
          <input placeholder="Nombre y apellido" value={f.nombre} onChange={set('nombre')} required minLength={3} />
          <input type="email" placeholder="Email (acá le llega la entrada)" value={f.email} onChange={set('email')} required />
          <input type="tel" placeholder="Celular (opcional)" value={f.telefono} onChange={set('telefono')} />
          {!esTalonario && (
            <label className={styles.row}>
              <span>Cantidad</span>
              <input type="number" min="1" max="50" value={f.cantidad} onChange={set('cantidad')} />
            </label>
          )}
          {!esTalonario &&
            Array.from({ length: Math.max(0, cantidad - 1) }, (_, i) => (
              <input
                key={i}
                placeholder={`Invitado ${i + 2} · nombre y apellido`}
                value={invitados[i] || ''}
                onChange={(e) =>
                  setInvitados((arr) => {
                    const next = [...arr];
                    next[i] = e.target.value;
                    return next;
                  })
                }
              />
            ))}
          <label className={styles.row}>
            <span>Monto cobrado (pesos)</span>
            <input
              type="number"
              min="0"
              inputMode="numeric"
              placeholder={precio ? String(sugerido) : 'Monto'}
              value={f.totalUYU}
              onChange={set('totalUYU')}
            />
          </label>
          {precio > 0 && f.totalUYU === '' && (
            <p className={styles.help}>Si lo dejás vacío se registra el precio de la tanda: {fmtUYU(sugerido)}.</p>
          )}
          <input placeholder="Nota (opcional, ej.: pagó USD 65)" value={f.notas} onChange={set('notas')} maxLength={200} />
          <button disabled={busy}>{busy ? 'Enviando…' : 'Crear y enviar entrada'}</button>
          {msg && <p role="status">{msg}</p>}
        </form>
      )}
    </section>
  );
}
