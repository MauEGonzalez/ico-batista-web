import React from 'react';
import Header from '../../components/layout/Header/Header.jsx';
import Footer from '../../components/layout/Footer/Footer.jsx';
import styles from './ContactPage.module.css';

const ContactPage = () => {
  return (
    <div>
      <Header />
      <main>
        <div className={styles.contactContainer}>
          <div className={styles.header}>
            <h1>Contacto</h1>
            <p>Para consultas sobre pedidos, diseños a medida o colaboraciones, por favor completa el formulario.</p>
          </div>
          <form className={styles.contactForm}>
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
            <button type="submit" className={styles.submitButton}>Enviar Mensaje</button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ContactPage;