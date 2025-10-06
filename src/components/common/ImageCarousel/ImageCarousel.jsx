import React from 'react';
import styles from './ImageCarousel.module.css';

const ImageCarousel = ({ styleType }) => {
  return (
    <div className={styles.carouselContainer}>
      <p>El carrusel de imágenes para la sección {styleType} irá aquí.</p>
      {/* Lógica del carrusel y las imágenes irán aquí */}
    </div>
  );
};

export default ImageCarousel;