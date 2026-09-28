// /src/pages/ContactPage/ContactPage.jsx

import React, { useRef, useState } from 'react';
import emailjs from '@emailjs/browser';
import toast from 'react-hot-toast'; // Usaremos las notificaciones que ya instalamos
import { buildWhatsAppUrl } from '../../utils/whatsapp.js';
import { ChatIcon } from '../../components/common/Icons/Icons.jsx';
import styles from './ContactPage.module.css';

const ContactPage = () => {
  const form = useRef();
  const [isLoading, setIsLoading] = useState(false);

  const sendEmail = (e) => {
    e.preventDefault(); // Previene el refresco de la página
    setIsLoading(true); // Muestra el estado de carga en el botón

    // Usamos las variables de entorno de Vite
    const serviceID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    emailjs.sendForm(serviceID, templateID, form.current, publicKey)
      .then((result) => {
          console.log(result.text);
          toast.success('¡Mensaje enviado con éxito!');
          e.target.reset(); // Resetea el formulario
      }, (error) => {
          console.log(error.text);
          toast.error('Hubo un error al enviar el mensaje. Intenta de nuevo.');
      })
      .finally(() => {
          setIsLoading(false); // Oculta el estado de carga
      });
  };

  return (
    <>
      <title>Contacto | Ico Batista</title>
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
          
          {/* El formulario ahora tiene el ref y el onSubmit */}
          <form ref={form} onSubmit={sendEmail} className={styles.contactForm}>
            <div className={styles.formGroup}>
              <label htmlFor="name">Nombre Completo</label>
              <input type="text" id="name" name="name" required />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="email">Correo Electrónico</label>
              <input type="email" id="email" name="email" required />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="subject">Asunto</label>
              <input type="text" id="subject" name="subject" required />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="message">Mensaje</label>
              <textarea id="message" name="message" rows="6" required></textarea>
            </div>
            
            <button type="submit" className={styles.submitButton} disabled={isLoading}>
              {isLoading ? 'Enviando...' : 'Enviar Mensaje'}
            </button>
          </form>
        </div>
      </main>
    </>
  );
};

export default ContactPage;