// /src/pages/ProximamentePage/ProximamentePage.jsx
// Pantalla pública mientras la tienda no está lanzada (ver /src/launch.js).
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { WHATSAPP_NUMBER, DEVELOPER } from '../../config/contact.js';
import styles from './ProximamentePage.module.css';

export default function ProximamentePage() {
  useEffect(() => {
    const prev = document.title;
    document.title = 'Ico Batista — Próximamente';
    return () => {
      document.title = prev;
    };
  }, []);

  return (
    <main className={styles.page}>
      <div className={styles.photo} aria-hidden="true" />
      <section className={styles.content}>
        <img className={styles.logo} src="/assets/images/eventos/logo_light.webp" width="217" height="300" alt="Ico Batista" />
        <p className={styles.eyebrow}>Próximamente</p>
        <h1 className={styles.title}>
          Sitio en <span>desarrollo</span>
        </h1>
        <p className={styles.text}>
          Estamos terminando los últimos detalles de la nueva tienda online de Ico Batista. Muy pronto podrás
          recorrerla.
        </p>
        <div className={styles.actions}>
          <Link to="/entradas" className={styles.primary}>
            Entradas para el desfile
          </Link>
          <a className={styles.secondary} href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer">
            Consultas por WhatsApp
          </a>
        </div>
        <a className={styles.ig} href="https://www.instagram.com/byicobatista/" target="_blank" rel="noreferrer">
          @byicobatista
        </a>
        <p className={styles.credit}>
          Desarrollado por{' '}
          <a href={DEVELOPER.url} target="_blank" rel="noopener noreferrer">
            {DEVELOPER.name}
          </a>
        </p>
      </section>
    </main>
  );
}
