import { useState } from 'react';
import styles from './CortesiaForm.module.css';

/** Entradas de cortesía (invitados, prensa): salen sin cobro y entran a la misma lista. */
export default function CortesiaForm({ api, onDone }) {
  const [open, setOpen] = useState(false);
  const EMPTY = { nombre: '', email: '', cantidad: 1, enviar: true };
  const [f, setF] = useState(EMPTY);
  const [invitados, setInvitados] = useState([]);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setMsg('');
    try {
      const cantidad = Number(f.cantidad);
      const r = await api.admin.cortesia({ ...f, cantidad, invitados: invitados.slice(0, cantidad - 1) });
      setMsg(
        `Listo: ${r.entradas.length} entrada(s) agregada(s) a la lista${r.enviado ? ` y enviadas a ${f.email}` : ', sin enviar email'}.`
      );
      setF(EMPTY);
      setInvitados([]);
      onDone?.();
    } catch (err) {
      setMsg(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className={styles.wrap}>
      <button className={styles.toggle} onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        {open ? '− ' : '+ '}Agregar cortesía
      </button>
      {open && (
        <form onSubmit={submit} className={styles.form}>
          <input placeholder="Nombre y apellido" value={f.nombre} onChange={(e) => setF({ ...f, nombre: e.target.value })} required />
          <input type="email" placeholder="Email (opcional)" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
          <label className={styles.check}>
            <input type="checkbox" checked={f.enviar} onChange={(e) => setF({ ...f, enviar: e.target.checked })} disabled={!f.email} />
            Enviarle la invitación por email
          </label>
          <p className={styles.help}>
            {f.email && f.enviar
              ? 'Le llega la invitación con su QR por email.'
              : 'Solo queda registrada en la lista de la puerta (no se envía ningún email).'}
          </p>
          <label className={styles.row}>
            <span>Cantidad</span>
            <input type="number" min="1" max="50" value={f.cantidad} onChange={(e) => setF({ ...f, cantidad: e.target.value })} />
          </label>
          {Array.from({ length: Math.max(0, Number(f.cantidad) - 1) }, (_, i) => (
            <input
              key={i}
              placeholder={`Invitado ${i + 2} · nombre (opcional)`}
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
          <button disabled={busy}>{f.email && f.enviar ? 'Crear y enviar' : 'Agregar a la lista'}</button>
          {msg && <p role="status">{msg}</p>}
        </form>
      )}
    </section>
  );
}
