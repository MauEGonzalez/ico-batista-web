// /src/components/layout/Footer/Footer.jsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { buildWhatsAppUrl } from '../../../utils/whatsapp.js';
import { SOCIAL_LINKS, DEVELOPER } from '../../../config/contact.js';
import styles from './Footer.module.css';

const currentYear = new Date().getFullYear();

const Footer = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle' | 'sending' | 'done' | 'error'
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (status === 'sending') return;
    setStatus('sending');
    setErrorMessage('');
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // "website" es un campo trampa invisible contra robots (las personas lo dejan vacío)
        body: JSON.stringify({ email, source: 'footer', website: e.target.elements.website?.value ?? '' }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || 'No pudimos suscribirte. Prueba de nuevo.');
      setStatus('done');
    } catch (err) {
      setErrorMessage(err.message === 'Failed to fetch' ? 'Sin conexión. Prueba de nuevo.' : err.message);
      setStatus('error');
    }
  };

  return (
    <footer className={styles.mainFooter}>
      <div className={styles.footerContent}>
        <div className={styles.footerSection}>
          <h4>Novedades</h4>
          {status === 'done' ? (
            <p className={styles.subscribeDone} role="status">¡Listo! Te avisaremos de las novedades.</p>
          ) : (
            <>
              <p>Suscríbete para recibir las últimas colecciones y noticias.</p>
              <form className={styles.subscribeForm} onSubmit={handleSubscribe}>
                <input
                  type="email"
                  name="email"
                  placeholder="Ingresa tu email"
                  aria-label="Tu email"
                  className={styles.subscribeInput}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  maxLength={254}
                  autoComplete="email"
                  required
                />
                {/* Campo trampa: oculto para las personas, los robots lo completan */}
                <input type="text" name="website" tabIndex={-1} autoComplete="off" className={styles.honeypot} aria-hidden="true" />
                <button type="submit" className={styles.subscribeButton} disabled={status === 'sending'}>
                  {status === 'sending' ? 'Enviando…' : 'Suscribir'}
                </button>
              </form>
              {status === 'error' && <p className={styles.subscribeError} role="alert">{errorMessage}</p>}
            </>
          )}
        </div>

        <div className={styles.footerSection}>
          <h4>Explorar</h4>
          <ul className={styles.footerLinksList}>
            <li><Link to="/sobre-ico">Sobre Ico</Link></li>
            <li><Link to="/tienda">Tienda</Link></li>
            <li><Link to="/mujer/formal">Moda Dama</Link></li>
            <li><Link to="/hombre/formal">Moda Caballero</Link></li>
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
