// /src/pages/ContactPage/ContactPage.jsx
// Formulario de contacto: se guarda en nuestra base y Ico lo lee en el panel (pestaña "Mensajes").

import React, { useState } from 'react';
import { buildWhatsAppUrl } from '../../utils/whatsapp.js';
import { ChatIcon } from '../../components/common/Icons/Icons.jsx';
import styles from './ContactPage.module.css';

const EMPTY = { name: '', email: '', phone: '', message: '' };

const ContactPage = () => {
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState('idle'); // 'idle' | 'sending' | 'sent' | 'error'
  const [errorMessage, setErrorMessage] = useState('');

  const setField = (field) => (e) => setForm((current) => ({ ...current, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (status === 'sending') return;
    setStatus('sending');
    setErrorMessage('');
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // "website" es un campo trampa invisible contra robots (las personas lo dejan vacío)
        body: JSON.stringify({ ...form, website: e.target.elements.website?.value ?? '' }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || 'No pudimos enviar tu mensaje. Prueba de nuevo.');
      setStatus('sent');
      setForm(EMPTY);
    } catch (err) {
      setErrorMessage(err.message === 'Failed to fetch' ? 'Sin conexión. Revisa tu internet y prueba de nuevo.' : err.message);
      setStatus('error');
    }
  };

  return (
    <>
      <title>Contacto | Ico Batista</title>
      <meta name="description" content="Escríbele a Ico Batista para consultas sobre prendas, diseños a medida o colaboraciones." />
      <main>
        <div className={styles.contactContainer}>
          <div className={styles.header}>
            <h1>Contacto</h1>
            <p>Para consultas sobre prendas, diseños a medida o colaboraciones, escríbenos por WhatsApp o completa el formulario.</p>
            <a
              href={buildWhatsAppUrl('Hola Ico! Quería hacerte una consulta.')}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.whatsappLink}
            >
              <ChatIcon width={20} height={20} />
              Escribir por WhatsApp
            </a>
          </div>

          {status === 'sent' ? (
            <div className={styles.sent} role="status">
              <h2>¡Gracias por escribirnos!</h2>
              <p>Recibimos tu mensaje y te responderemos a la brevedad por email.</p>
              <button type="button" className={styles.linkButton} onClick={() => setStatus('idle')}>
                Enviar otro mensaje
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.contactForm}>
              <div className={styles.formGroup}>
                <label htmlFor="name">Nombre completo</label>
                <input type="text" id="name" name="name" value={form.name} onChange={setField('name')} maxLength={100} autoComplete="name" required />
              </div>
              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <label htmlFor="email">Correo electrónico</label>
                  <input type="email" id="email" name="email" value={form.email} onChange={setField('email')} maxLength={254} autoComplete="email" required />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="phone">Teléfono <span className={styles.optional}>(opcional)</span></label>
                  <input type="tel" id="phone" name="phone" value={form.phone} onChange={setField('phone')} maxLength={40} autoComplete="tel" />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="message">Mensaje</label>
                <textarea id="message" name="message" rows="6" value={form.message} onChange={setField('message')} maxLength={5000} minLength={5} required />
              </div>

              {/* Campo trampa: oculto para las personas, los robots lo completan */}
              <div className={styles.honeypot} aria-hidden="true">
                <label htmlFor="website">No completes este campo</label>
                <input type="text" id="website" name="website" tabIndex={-1} autoComplete="off" />
              </div>

              {status === 'error' && <p className={styles.error} role="alert">{errorMessage}</p>}

              <button type="submit" className={styles.submitButton} disabled={status === 'sending'}>
                {status === 'sending' ? 'Enviando…' : 'Enviar mensaje'}
              </button>
            </form>
          )}
        </div>
      </main>
    </>
  );
};

export default ContactPage;
