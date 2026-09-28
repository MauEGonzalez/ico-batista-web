import React from 'react';
import { Link } from 'react-router-dom';
import styles from './NotFoundPage.module.css';

const NotFoundPage = () => {
  return (
    <>
      <title>Página no encontrada | Ico Batista</title>
      <main className={styles.mainContent}>
        <h1>404</h1>
        <p>La página que buscas no fue encontrada.</p>
        <Link to="/">Volver al inicio</Link>
      </main>
    </>
  );
};

export default NotFoundPage;