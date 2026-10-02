// /src/components/common/ImageCarousel/ImageCarousel.jsx

import React, { useRef } from 'react'; // Importamos useRef
import styles from './ImageCarousel.module.css';
import { useProducts } from '../../../context/productsContextValue.js';
import { belongsTo } from '../../../utils/productCategories.js';
import ProductCard from '../ProductCard/ProductCard.jsx';

const ImageCarousel = ({ gender, styleType }) => {
  // Creamos una referencia que apuntará a nuestro contenedor de productos
  const trackRef = useRef(null);

  // Filtra por género Y estilo (antes solo por estilo y mezclaba hombre con mujer)
  const { products } = useProducts();
  // Primero las marcadas como destacadas en el panel
  const featuredProducts = products
    .filter(product => belongsTo(product, `${gender}/${styleType}`))
    .sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)))
    .slice(0, 8);

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
          type="button"
          className={`${styles.scrollButton} ${styles.left}`}
          onClick={() => handleScroll('left')}
          aria-label="Ver productos anteriores"
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
          type="button"
          className={`${styles.scrollButton} ${styles.right}`}
          onClick={() => handleScroll('right')}
          aria-label="Ver más productos"
        >
          &#8250;
        </button>

      </div>
    </div>
  );
};

export default ImageCarousel;