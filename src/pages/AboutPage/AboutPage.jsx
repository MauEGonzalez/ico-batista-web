// /src/pages/AboutPage/AboutPage.jsx

import React from 'react';
import styles from './AboutPage.module.css';

const AboutPage = () => {
  return (
    <>
      <title>Sobre Ico | Ico Batista</title>
      <main>
        <div className={styles.aboutContainer}>
          <div className={styles.hero}>
            <img src="/assets/images/about-hero.jpg" alt="El taller del diseñador Ico Batista" className={styles.heroImage} />
            <div className={styles.heroOverlay}>
              <h1 className={styles.heroTitle}>La Esencia de la Creación</h1>
            </div>
          </div>
          
          <section className={styles.bioSection}>
            <div className={styles.bioImageContainer}>
              <img src="/assets/images/ico-batista-portrait.jpg" alt="Retrato de Ico Batista" loading="lazy" decoding="async" />
            </div>
            <div className={styles.bioTextContainer}>
              <h2>Filosofía de Diseño</h2>
              <p>En el corazón de cada creación de Ico Batista yace una profunda reverencia por la forma humana y la narrativa personal. No se trata solo de vestir el cuerpo, sino de esculpir una identidad. Cada puntada, cada corte y cada elección de tejido es un diálogo entre la tradición artesanal y una visión audazmente contemporánea.</p>
              <p>Creemos en la moda lenta, en piezas atemporales que trascienden las temporadas. Nuestro atelier es un laboratorio de ideas donde la sostenibilidad no es una opción, sino el punto de partida. Buscamos la belleza en la imperfección, la fuerza en la delicadeza y el lujo en la autenticidad.</p>
            </div>
          </section>

          <section className={styles.videoSection}>
            <h2>El Proceso Creativo</h2>
            <div className={styles.videoWrapper}>
              <video src="/assets/videos/atelier-process.mp4" controls autoPlay loop muted playsInline preload="metadata"></video>
            </div>
          </section>
        </div>
      </main>
    </>
  );
};

export default AboutPage;