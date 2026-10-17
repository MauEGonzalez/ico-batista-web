import styles from './EventoDatos.module.css';

export default function EventoDatos({ evento }) {
  const items = [
    ['Fecha', evento.fechaTexto],
    ['Horario', evento.horario],
    ['Lugar', `${evento.lugar}\n${evento.ciudad}`],
    ['Dress code', evento.dressCode],
  ];
  return (
    <section className={styles.wrap} aria-label="Datos del evento">
      <dl className={styles.grid}>
        {items.map(([k, v]) => (
          <div key={k} className={styles.item}>
            <dt className="eyebrow">{k}</dt>
            <dd className={styles.value}>{v}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
