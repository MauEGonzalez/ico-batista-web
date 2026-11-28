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
        {resumen.cortesias > 0 && (
          <>
            Cortesías: {resumen.cortesias}
            {resumen.invitados && (
              <> (confirmadas {resumen.invitados.confirmados} · no asisten {resumen.invitados.noAsisten} · sin respuesta {resumen.invitados.sinRespuesta})</>
            )}
            {' · '}
          </>
        )}
        {resumen.pagosPendientes > 0 && <>Pagos en curso: {resumen.pagosPendientes} · </>}
        Anuladas: {resumen.anuladas}
      </p>
      {resumen.porMedio && (resumen.porMedio.efectivo || resumen.porMedio.transferencia || resumen.porMedio.talonario) && (
        <p className={styles.sub}>
          Cobro: Mercado Pago {resumen.porMedio.mercadopago?.entradas || 0}
          {resumen.porMedio.efectivo && <> · Efectivo {resumen.porMedio.efectivo.entradas} ({fmtUYU(resumen.porMedio.efectivo.totalUYU)})</>}
          {resumen.porMedio.transferencia && (
            <> · Transferencia {resumen.porMedio.transferencia.entradas} ({fmtUYU(resumen.porMedio.transferencia.totalUYU)})</>
          )}
          {resumen.porMedio.talonario && (
            <> · Talonario {resumen.porMedio.talonario.entradas} ({fmtUYU(resumen.porMedio.talonario.totalUYU)})</>
          )}
        </p>
      )}
      {resumen.puerta?.entradas > 0 && (
        <div className={styles.puerta}>
          <p className={styles.sub}>
            <strong>Cobrado en puerta:</strong> {resumen.puerta.entradas} entrada{resumen.puerta.entradas === 1 ? '' : 's'} ·{' '}
            {fmtUYU(resumen.puerta.totalUYU)} (efectivo {fmtUYU(resumen.puerta.efectivo.totalUYU)} · transferencia{' '}
            {fmtUYU(resumen.puerta.transferencia.totalUYU)})
          </p>
          {resumen.puerta.porPersona.length > 0 && (
            <ul className={styles.porPersona}>
              {resumen.puerta.porPersona.map((p) => (
                <li key={p.nombre}>
                  {p.nombre}: {p.entradas} entrada{p.entradas === 1 ? '' : 's'} · efectivo {fmtUYU(p.efectivoUYU)} · transferencia{' '}
                  {fmtUYU(p.transferenciaUYU)}
                </li>
              ))}
            </ul>
          )}
          {resumen.puerta.otroPrecio?.length > 0 && (
            <>
              <p className={styles.sub}>
                <strong>Cobrados con otro precio:</strong>
              </p>
              <ul className={styles.porPersona}>
                {resumen.puerta.otroPrecio.map((o, i) => (
                  <li key={i}>
                    {o.nombre} ({o.cantidad}): {fmtUYU(o.totalUYU)}
                    {o.sugeridoUYU ? ` en vez de ${fmtUYU(o.sugeridoUYU)}` : ''} · {o.medio} · cobró {o.por || '—'}
                    {o.notas ? ` · “${o.notas}”` : ''}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
      {alerts.length > 0 && <p className={styles.alert}>⚠ {alerts.join(' · ')} — mirá “Compras para revisar” abajo.</p>}
    </section>
  );
}
