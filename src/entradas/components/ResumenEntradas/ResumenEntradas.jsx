import { fmtUYU } from '../../api/entradas.js';
import styles from './ResumenEntradas.module.css';

export default function ResumenEntradas({ resumen }) {
  if (!resumen) return null;
  const stats = [
    ['Vendidas', resumen.vendidas],
    ['Recaudado', fmtUYU(resumen.recaudadoUYU)],
    ['Ingresaron', `${resumen.ingresaron} / ${resumen.entradasValidas}`],
    ['Faltan ingresar', resumen.faltanIngresar],
  ];
  const alerts = [
    resumen.ordenesParaRevisar > 0 && `${resumen.ordenesParaRevisar} compra(s) para revisar`,
    resumen.emailsFallidos > 0 && `${resumen.emailsFallidos} email(s) sin enviar`,
  ].filter(Boolean);
  return (
    <section className={styles.wrap} aria-label="Resumen">
      <div className={styles.grid}>
        {stats.map(([k, v]) => (
          <div key={k} className={styles.stat}>
            <span className={styles.label}>{k}</span>
            <strong className={styles.value}>{v}</strong>
          </div>
        ))}
      </div>
      <p className={styles.sub}>
        {resumen.cortesias > 0 && <>Cortesías: {resumen.cortesias} · </>}
        {resumen.pagosPendientes > 0 && <>Pagos en curso: {resumen.pagosPendientes} · </>}
        Anuladas: {resumen.anuladas}
      </p>
      {alerts.length > 0 && <p className={styles.alert}>⚠ {alerts.join(' · ')} — mirá “Compras para revisar” abajo.</p>}
    </section>
  );
}
