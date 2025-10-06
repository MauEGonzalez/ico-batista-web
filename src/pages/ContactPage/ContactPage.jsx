import React from 'react';
import Header from '../../components/layout/Header/Header.jsx';
import Footer from '../../components/layout/Footer/Footer.jsx';
import styles from './ContactPage.module.css';

const ContactPage = () => {
  return (
    <div>
      <Header />
      <main className={styles.mainContent}>
        <h1>Contacto</h1>
        <p>Aquí irá el formulario de contacto especial para prendas a medida.</p>
      </main>
      <Footer />
    </div>
  );
};

export default ContactPage;