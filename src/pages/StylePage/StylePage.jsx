import React from 'react';
import Header from '../../components/layout/Header/Header.jsx';
import Footer from '../../components/layout/Footer/Footer.jsx';
import StylePageIntro from '../../components/views/StylePageIntro/StylePageIntro.jsx';
import AutoplayVideo from '../../components/common/AutoplayVideo/AutoplayVideo.jsx';
import ImageCarousel from '../../components/common/ImageCarousel/ImageCarousel.jsx';
import styles from './StylePage.module.css';

// Recibimos 'styleType' para saber si es "formal" o "casual" y mostrar contenido diferente
const StylePage = ({ styleType }) => {
  return (
    <div>
      <Header />
      <main className={styles.stylePageContent}>
        <StylePageIntro styleType={styleType} />
        <section className={styles.pageSection}>
          <AutoplayVideo src={`/assets/videos/placeholder-${styleType}-collection.mp4`} />
          <p>Descripción del video de la colección {styleType}.</p>
        </section>
        <section className={styles.pageSection}>
          <h3>Galería</h3>
          <ImageCarousel styleType={styleType} />
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default StylePage;