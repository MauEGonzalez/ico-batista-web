import { useEffect, useState } from 'react';
import styles from './NotasPuertaEditor.module.css';

const fmt = (iso) => new Date(iso).toLocaleString('es-UY', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

/** Notas para quien está en la puerta: las ve arriba de todo en su pantalla. */
export default function NotasPuertaEditor({ api }) {
  const [open, setOpen] = useState(false);
  const [notas, setNotas] = useState(null);
  const [texto, setTexto] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open || notas) return;
    api.admin
      .notasPuerta()
      .then((d) => setNotas(d.notas))
      .catch((e) => setMsg(e.message));
  }, [open, notas, api]);

  async function run(fn) {
    setBusy(true);
    setMsg('');
    try {
      const d = await fn();
      setNotas(d.notas);
      return true;
    } catch (e) {
      setMsg(e.message);
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function agregar(e) {
    e.preventDefault();
    if (await run(() => api.admin.agregarNotaPuerta(texto))) setTexto('');
  }

  return (
    <section className={styles.wrap}>
      <button type="button" className={styles.toggle} onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        {open ? '− ' : '+ '}Notas para la puerta{notas?.length ? ` (${notas.length})` : ''}
      </button>
      {open && (
        <div className={styles.body}>
          <p className={styles.help}>Quien esté en la puerta las ve arriba de todo en su pantalla (se actualiza sola cada 20 segundos).</p>
          <form onSubmit={agregar} className={styles.form}>
            <textarea
              rows={3}
              maxLength={600}
              placeholder="Ej.: Los invitados de AgroConsignas entran con la lista, no pagan."
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              required
            />
            <button disabled={busy || texto.trim().length < 2}>Agregar nota</button>
          </form>
          {notas?.length === 0 && <p className={styles.help}>Todavía no hay notas.</p>}
          <ul className={styles.list}>
            {notas?.map((n) => (
              <li key={n.id}>
                <div>
                  <p>{n.texto}</p>
                  <small>
                    {fmt(n.at)}
                    {n.por ? ` · ${n.por}` : ''}
                  </small>
                </div>
                <button
                  type="button"
                  className={styles.del}
                  disabled={busy}
                  onClick={() => window.confirm('¿Borrar esta nota?') && run(() => api.admin.borrarNotaPuerta(n.id))}
                >
                  Borrar
                </button>
              </li>
            ))}
          </ul>
          {msg && <p role="status" className={styles.help}>{msg}</p>}
        </div>
      )}
    </section>
  );
}
