import { useEffect, useState } from 'react';
import { fmtUYU } from '../../api/entradas.js';
import styles from './VentaManualForm.module.css';

const EMPTY = { nombre: '', email: '', telefono: '', cantidad: 1, medio: 'efectivo', totalUYU: '', notas: '' };

/**
 * Venta directa: alguien le pagó a Ico en efectivo o por transferencia.
 * Crea la entrada como una venta más (descuenta cupo y suma a lo recaudado) y se la manda por email.
 */
export default function VentaManualForm({ api, onDone }) {
  const [open, setOpen] = useState(false);
  const [f, setF] = useState(EMPTY);
  const [precio, setPrecio] = useState(null); // precio en pesos de la tanda vigente
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
  const sugerido = (precio || 0) * Number(f.cantidad || 0);
  const total = f.totalUYU === '' ? sugerido : Number(f.totalUYU);

  async function submit(e) {
    e.preventDefault();
    const resumen = `${f.cantidad} entrada(s) para ${f.nombre}, cobradas en ${f.medio} (${fmtUYU(total)}). Se envían a ${f.email}.`;
    if (!window.confirm(`¿Confirmás la venta?\n\n${resumen}`)) return;
    setBusy(true);
    setMsg('');
    try {
      const r = await api.admin.ventaManual({
        ...f,
        cantidad: Number(f.cantidad),
        totalUYU: f.totalUYU === '' ? undefined : Number(f.totalUYU),
      });
      setMsg(
        r.enviado
          ? `Listo: ${r.entradas.length} entrada(s) creada(s) y enviadas a ${f.email}.`
          : `Entradas creadas, pero el email no salió. Reenvialo desde "Compras para revisar".`
      );
      setF(EMPTY);
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
        {open ? '− ' : '+ '}Venta en efectivo o transferencia
      </button>
      {open && (
        <form onSubmit={submit} className={styles.form}>
          <p className={styles.help}>
            Para alguien que le pagó directamente a Ico. Cuenta como venta y le llega la entrada con QR por email.
          </p>
          <input placeholder="Nombre y apellido" value={f.nombre} onChange={set('nombre')} required minLength={3} />
          <input type="email" placeholder="Email (acá le llega la entrada)" value={f.email} onChange={set('email')} required />
          <input type="tel" placeholder="Celular (opcional)" value={f.telefono} onChange={set('telefono')} />
          <label className={styles.row}>
            <span>Cantidad</span>
            <input type="number" min="1" max="50" value={f.cantidad} onChange={set('cantidad')} />
          </label>
          <fieldset className={styles.medios}>
            <legend>Cómo pagó</legend>
            {['efectivo', 'transferencia'].map((m) => (
              <label key={m}>
                <input type="radio" name="medio" value={m} checked={f.medio === m} onChange={set('medio')} />
                {m === 'efectivo' ? 'Efectivo' : 'Transferencia'}
              </label>
            ))}
          </fieldset>
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
