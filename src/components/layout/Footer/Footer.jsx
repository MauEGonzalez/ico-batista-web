// /src/components/layout/Footer/Footer.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.mainFooter}>
      <div className={styles.footerContent}>
        <div className={styles.footerSection}>
          <h4>Novedades</h4>
          <p>Suscríbete para recibir las últimas colecciones y noticias.</p>
          <div className={styles.subscribeForm}>
            <input type="email" placeholder="Ingresa tu email" className={styles.subscribeInput} />
            <button type="submit" className={styles.subscribeButton}>Suscribir</button>
          </div>
        </div>

        <div className={styles.footerSection}>
          <h4>Explorar</h4>
          <ul className={styles.footerLinksList}>
            <li><Link to="/sobre-ico">Sobre Ico</Link></li>
            <li><Link to="/tienda">Tienda</Link></li>
            <li><Link to="/mujer/formal">Formal</Link></li>
            <li><Link to="/mujer/casual">Casual</Link></li>
          </ul>
        </div>

        <div className={styles.footerSection}>
          <h4>Ayuda</h4>
          <ul className={styles.footerLinksList}>
            {/* 👇👇👇 LINKS ACTUALIZADOS 👇👇👇 */}
            <li><Link to="/faqs">Preguntas Frecuentes</Link></li>
            <li><Link to="/contacto">Contacto</Link></li>
            <li><Link to="/terminos">Términos y Condiciones</Link></li>
            <li><Link to="/privacidad">Política de Privacidad</Link></li>
          </ul>
        </div>

        <div className={styles.footerSection}>
          <h4>Síguenos</h4>
          <div className={styles.socialIcons}>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a>
            <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer">TikTok</a>
          </div>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <p>© 2025 Ico Batista. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;