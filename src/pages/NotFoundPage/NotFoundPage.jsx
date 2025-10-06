import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/layout/Header/Header.jsx';
import Footer from '../../components/layout/Footer/Footer.jsx';
import styles from './NotFoundPage.module.css';

const NotFoundPage = () => {
  return (
    <div>
      <Header />
      <main className={styles.mainContent}>
        <h1>404</h1>
        <p>La página que buscas no fue encontrada.</p>
        <Link to="/">Volver al inicio</Link>
      </main>
      <Footer />
    </div>
  );
};

export default NotFoundPage;