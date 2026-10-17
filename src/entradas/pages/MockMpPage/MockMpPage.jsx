import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api, fmtUYU } from '../../api/entradas.js';
import styles from './MockMpPage.module.css';

/** SOLO desarrollo (MP_MODE=mock): simula la pantalla de pago de Mercado Pago. */
export default function MockMpPage() {
  const [params] = useSearchParams();
  const pref = params.get('pref');
  const [info, setInfo] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.mock.pref(pref).then(setInfo).catch((e) => setError(e.message));
  }, [pref]);

  async function pagar(status) {
    const r = await api.mock.pagar(pref, status);
    window.location.assign(r.redirect);
  }

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <p className={styles.badge}>SIMULADOR · no es Mercado Pago real</p>
        {error && <p>{error}</p>}
        {info && (
          <>
            <h1>{info.titulo}</h1>
            <p>
              {info.cantidad} × {fmtUYU(info.unitario)}
            </p>
            <p className={styles.total}>{fmtUYU(info.total)}</p>
            <button onClick={() => pagar('approved')}>Pagar (aprobado)</button>
            <button className={styles.secondary} onClick={() => pagar('rejected')}>
              Simular pago rechazado
            </button>
          </>
        )}
      </div>
    </main>
  );
}
