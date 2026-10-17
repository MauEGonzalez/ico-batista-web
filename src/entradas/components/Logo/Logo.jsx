import styles from './Logo.module.css';

/** Monograma IB + wordmark. variant: "light" (sobre fondo oscuro) | "dark" */
export default function Logo({ variant = 'dark', height = 72, wordmark = true }) {
  return (
    <div className={`${styles.logo} ${styles[variant]}`}>
      <img src={`/assets/images/eventos/logo_${variant}.png`} alt="Monograma IB de Ico Batista" style={{ height }} />
      {wordmark && <span className={styles.word}>ICO BATISTA</span>}
    </div>
  );
}
