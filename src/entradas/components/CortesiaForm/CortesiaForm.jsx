import { useState } from 'react';
import styles from './CortesiaForm.module.css';

/** Entradas de cortesía (invitados, prensa): salen sin cobro y entran a la misma lista. */
export default function CortesiaForm({ api, onDone }) {
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ nombre: '', email: '', cantidad: 1 });
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setMsg('');
    try {
      const r = await api.admin.cortesia({ ...f, cantidad: Number(f.cantidad) });
      setMsg(`Listo: ${r.entradas.length} entrada(s) creada(s)${f.email ? ' y enviadas por email' : ''}.`);
      setF({ nombre: '', email: '', cantidad: 1 });
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
          <input type="email" placeholder="Email (opcional, para enviarle la entrada)" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
          <input type="number" min="1" max="50" value={f.cantidad} onChange={(e) => setF({ ...f, cantidad: e.target.value })} aria-label="Cantidad" />
          <button disabled={busy}>Crear</button>
          {msg && <p role="status">{msg}</p>}
        </form>
      )}
    </section>
  );
}
