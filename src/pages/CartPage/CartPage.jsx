import React from 'react';
import Header from '../../components/layout/Header/Header.jsx';
import Footer from '../../components/layout/Footer/Footer.jsx';
import styles from './CartPage.module.css';

const CartPage = () => {
  return (
    <div>
      <Header />
      <main className={styles.mainContent}>
        <h1>Carrito de Compras</h1>
        <p>Actualmente no hay artículos en tu carrito.</p>
      </main>
      <Footer />
    </div>
  );
};

export default CartPage;