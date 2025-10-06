import React from 'react';
import Header from '../../components/layout/Header/Header.jsx';
import Footer from '../../components/layout/Footer/Footer.jsx';
import styles from './ShopPage.module.css';

const ShopPage = () => {
  return (
    <div>
      <Header />
      <main className={styles.mainContent}>
        <h1>Tienda</h1>
        <p>Las colecciones de la tienda se mostrarán aquí.</p>
      </main>
      <Footer />
    </div>
  );
};

export default ShopPage;