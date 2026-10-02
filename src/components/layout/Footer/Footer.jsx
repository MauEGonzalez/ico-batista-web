// /src/components/layout/Footer/Footer.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { buildWhatsAppUrl } from '../../../utils/whatsapp.js';
import { SOCIAL_LINKS, DEVELOPER } from '../../../config/contact.js';
import styles from './Footer.module.css';

const currentYear = new Date().getFullYear();

const Footer = () => {
  const handleSubscribe = (e) => {
    e.preventDefault();
    // TODO: conectar con el backend o un servicio de newsletter (Mailchimp, Brevo, etc.)
  };

  return (
    <footer className={styles.mainFooter}>
      <div className={styles.footerContent}>
        <div className={styles.footerSection}>
          <h4>Novedades</h4>
          <p>Suscríbete para recibir las últimas colecciones y noticias.</p>
          <form className={styles.subscribeForm} onSubmit={handleSubscribe}>
            <input
              type="email"
              placeholder="Ingresa tu email"
              aria-label="Tu email"
              className={styles.subscribeInput}
              required
            />
            <button type="submit" className={styles.subscribeButton}>Suscribir</button>
          </form>
        </div>

        <div className={styles.footerSection}>
          <h4>Explorar</h4>
          <ul className={styles.footerLinksList}>
            <li><Link to="/sobre-ico">Sobre Ico</Link></li>
            <li><Link to="/tienda">Tienda</Link></li>
            <li><Link to="/mujer/formal">Moda Mujer</Link></li>
            <li><Link to="/hombre/formal">Moda Hombre</Link></li>
          </ul>
        </div>

        <div className={styles.footerSection}>
          <h4>Ayuda</h4>
          <ul className={styles.footerLinksList}>
            <li><Link to="/faqs">Preguntas Frecuentes</Link></li>
            <li><Link to="/contacto">Contacto</Link></li>
            <li><Link to="/terminos">Términos y Condiciones</Link></li>
            <li><Link to="/privacidad">Política de Privacidad</Link></li>
          </ul>
        </div>

        <div className={styles.footerSection}>
          <h4>Síguenos</h4>
          <ul className={styles.socialList}>
            {SOCIAL_LINKS.map(({ label, detail, url }) => (
              <li key={url}>
                <a href={url} target="_blank" rel="noopener noreferrer">
                  {label}
                  {detail && <span className={styles.socialDetail}> · {detail}</span>}
                </a>
              </li>
            ))}
            <li>
              <a href={buildWhatsAppUrl('Hola Ico! Quería hacerte una consulta.')} target="_blank" rel="noopener noreferrer">
                WhatsApp
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <p>© {currentYear} Ico Batista. Todos los derechos reservados.</p>
        <p className={styles.credit}>
          Desarrollado por{' '}
          <a href={DEVELOPER.url} target="_blank" rel="noopener noreferrer">{DEVELOPER.name}</a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
