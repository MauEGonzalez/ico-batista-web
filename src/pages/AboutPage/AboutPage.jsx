import React from 'react';
import Header from '../../components/layout/Header/Header.jsx';
import Footer from '../../components/layout/Footer/Footer.jsx';
import styles from './AboutPage.module.css';

const AboutPage = () => {
  return (
    <div>
      <Header />
      <main className={styles.aboutContent}>
        <h1>Sobre Ico Batista</h1>
        <p>Aquí irá la historia del diseñador.</p>
      </main>
      <Footer />
    </div>
  );
};

// LA LÍNEA MÁGICA QUE FALTABA:
export default AboutPage;