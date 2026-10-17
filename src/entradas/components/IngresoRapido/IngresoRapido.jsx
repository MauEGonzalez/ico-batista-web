import { useRef, useState } from 'react';
import styles from './IngresoRapido.module.css';

/** Control en puerta por código: tipear, pegar el link del QR o usar un lector. */
export default function IngresoRapido({ api, onDone }) {
  const [code, setCode] = useState('');
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const input = useRef(null);

  async function submit(e) {
    e.preventDefault();
    if (!code.trim() || busy) return;
    setBusy(true);
    try {
      const r = await api.admin.ingreso(code.trim());
      setResult({ ok: true, title: 'Puede pasar', detail: r.entrada.nombre, extra: r.entrada.code });
      onDone?.();
    } catch (err) {
      const d = err.data || {};
      if (err.code === 'ya_ingreso') {
        const hora = d.checkedInAt ? new Date(d.checkedInAt).toLocaleTimeString('es-UY', { hour: '2-digit', minute: '2-digit' }) : '';
        setResult({ ok: false, title: 'Ya ingresó', detail: d.nombre, extra: hora && `Ingresó a las ${hora}` });
      } else if (err.code === 'anulada') {
        setResult({ ok: false, title: 'Entrada anulada', detail: d.nombre });
      } else if (err.code === 'no_existe') {
        setResult({ ok: false, title: 'No existe', detail: 'Revisá el código' });
      } else {
        setResult({ ok: false, title: 'Error', detail: err.message });
      }
    } finally {
      setBusy(false);
      setCode('');
      input.current?.focus();
    }
  }

  return (
    <section className={styles.wrap}>
      <h2 className={styles.h}>Ingreso por código</h2>
      <form onSubmit={submit} className={styles.form}>
        <input
          ref={input}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="XXXX-XXXX-XXXX"
          autoCapitalize="characters"
          autoComplete="off"
          aria-label="Código de la entrada"
        />
        <button disabled={busy}>Validar</button>
      </form>
      {result && (
        <div className={`${styles.result} ${result.ok ? styles.ok : styles.bad}`} role="status">
          <strong>{result.title}</strong>
          {result.detail && <span className={styles.name}>{result.detail}</span>}
          {result.extra && <small>{result.extra}</small>}
        </div>
      )}
    </section>
  );
}
