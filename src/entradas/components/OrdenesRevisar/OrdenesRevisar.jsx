import { fmtUYU } from '../../api/entradas.js';
import styles from './OrdenesRevisar.module.css';

/** Compras con algo raro (monto distinto) o con el email sin enviar. */
export default function OrdenesRevisar({ ordenes, onReenviar }) {
  if (!ordenes || ordenes.length === 0) return null;
  return (
    <section className={styles.wrap}>
      <h2 className={styles.h}>Compras para revisar</h2>
      <ul className={styles.list}>
        {ordenes.map((o) => (
          <li key={o.orden}>
            <div>
              <strong>{o.comprador.nombre}</strong> · {o.comprador.email}
              <br />
              <small>
                {o.cantidad} entrada(s) · {fmtUYU(o.totalUYU)} ·{' '}
                {o.status === 'review' ? 'Monto distinto: revisar en Mercado Pago' : o.emailError ? `Email falló: ${o.emailError}` : 'Email sin enviar'}
                {o.flags.length > 0 && ` · ${o.flags.join(', ')}`}
              </small>
            </div>
            {o.status === 'paid' && <button onClick={() => onReenviar(o.orden)}>Reenviar email</button>}
          </li>
        ))}
      </ul>
    </section>
  );
}
