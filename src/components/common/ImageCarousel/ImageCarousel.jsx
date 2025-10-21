// /src/components/common/ImageCarousel/ImageCarousel.jsx

import React, { useRef } from 'react'; // Importamos useRef
import styles from './ImageCarousel.module.css';
import { productsData } from '../../../productsData';
import ProductCard from '../ProductCard/ProductCard.jsx';

const ImageCarousel = ({ styleType }) => {
  // Creamos una referencia que apuntará a nuestro contenedor de productos
  const trackRef = useRef(null);

  const featuredProducts = productsData.filter(product => 
    product.category.includes(styleType)
  ).slice(0, 8);

  if (featuredProducts.length === 0) {
    return null;
  }

  // Función para desplazar el carrusel
  const handleScroll = (direction) => {
    if (trackRef.current) {
      const scrollAmount = trackRef.current.clientWidth * 0.8; // Desplaza el 80% del ancho visible
      
      if (direction === 'left') {
        trackRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        trackRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  return (
    <div className={styles.carouselContainer}>
      <h2 className={styles.carouselTitle}>Productos Destacados</h2>
      
      {/* Contenedor que envuelve el carrusel y las flechas */}
      <div className={styles.carouselWrapper}>
        
        {/* Botón Izquierdo */}
        <button 
          className={`${styles.scrollButton} ${styles.left}`} 
          onClick={() => handleScroll('left')}
        >
          &#8249;
        </button>
        
        {/* El carrusel ahora tiene la referencia 'trackRef' */}
        <div className={styles.carouselTrack} ref={trackRef}>
          {featuredProducts.map(product => (
            <div key={product.id} className={styles.carouselItem}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* Botón Derecho */}
        <button 
          className={`${styles.scrollButton} ${styles.right}`} 
          onClick={() => handleScroll('right')}
        >
          &#8250;
        </button>

      </div>
    </div>
  );
};

export default ImageCarousel;