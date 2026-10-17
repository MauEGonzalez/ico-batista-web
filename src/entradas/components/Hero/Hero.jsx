import Logo from '../Logo/Logo.jsx';
import styles from './Hero.module.css';

export default function Hero({ evento }) {
  return (
    <header className={styles.hero}>
      <img
        className={styles.photo}
        src="/assets/images/eventos/story_people.webp"
        width="1620"
        height="1110"
        fetchPriority="high"
        alt=""
      />
      <div className={styles.shade} />
      <div className={styles.content}>
        <Logo variant="light" height={72} />
        <div className={styles.titleBlock}>
          <p className={styles.kicker}>{evento.subtitulo}</p>
          <h1 className={styles.title}>
            El lujo
            <br />
            del tiempo
          </h1>
          <p className={styles.tag}>Una nueva experiencia está por comenzar.</p>
          <a className={styles.cta} href="#comprar">
            Comprar entradas
          </a>
        </div>
      </div>
    </header>
  );
}
