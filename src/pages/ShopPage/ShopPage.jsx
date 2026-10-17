// /src/pages/ShopPage/ShopPage.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import styles from './ShopPage.module.css';

const ShopPage = () => {
  return (
    <>
      <title>Tienda | Ico Batista</title>
      {/* Usamos un div en lugar de <main> para tener control total del layout */}
      <div className={styles.shopContainer}>
        
        {/* Panel de Hombre */}
        <Link to="/hombre/formal" className={styles.portalLink}>
          <div className={`${styles.portalPanel} ${styles.hombre}`}>
            <h2 className={styles.portalTitle}>Moda Caballero</h2>
          </div>
        </Link>
        
        {/* Panel de Mujer */}
        <Link to="/mujer/formal" className={styles.portalLink}>
          <div className={`${styles.portalPanel} ${styles.mujer}`}>
            <h2 className={styles.portalTitle}>Moda Dama</h2>
          </div>
        </Link>

      </div>
    </>
  );
};

export default ShopPage;