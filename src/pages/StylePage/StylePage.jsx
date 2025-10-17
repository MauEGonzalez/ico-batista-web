// /src/pages/StylePage/StylePage.jsx

import React from 'react';
import { useParams } from 'react-router-dom'; // Importamos useParams
import Header from '../../components/layout/Header/Header.jsx';
import Footer from '../../components/layout/Footer/Footer.jsx';
import StylePageIntro from '../../components/views/StylePageIntro/StylePageIntro.jsx';
import AutoplayVideo from '../../components/common/AutoplayVideo/AutoplayVideo.jsx';
import ImageCarousel from '../../components/common/ImageCarousel/ImageCarousel.jsx';
import styles from './StylePage.module.css';

const StylePage = () => {
  // Leemos los parámetros directamente de la URL (ej: /mujer/formal)
  const { gender, styleType } = useParams();

  return (
    <div>
      <Header />
      <main> {/* Quitamos la clase de aquí para que use el main global */}
        {/* Pasamos ambos parámetros a los componentes hijos */}
        <StylePageIntro gender={gender} styleType={styleType} />
        
        <section className={styles.pageSection}>
          <AutoplayVideo src={`/assets/videos/placeholder-${styleType}-collection.mp4`} />
          <p>Descubre la nueva colección {styleType}.</p>
        </section>
        
        <section className={styles.pageSection}>
          <ImageCarousel styleType={styleType} />
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default StylePage;