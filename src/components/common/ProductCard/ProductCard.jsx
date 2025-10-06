import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import styles from './ProductCard.module.css';

const ProductCard = ({ product }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  // Usamos useRef para guardar el ID del intervalo y poder limpiarlo
  const intervalRef = useRef(null);

  const handleMouseEnter = () => {
    // Si solo hay una imagen, no hacemos nada
    if (product.images.length <= 1) return;

    // Empezamos un intervalo que cambia la imagen cada 800ms
    intervalRef.current = setInterval(() => {
      setCurrentImageIndex(prevIndex => (prevIndex + 1) % product.images.length);
    }, 800);
  };

  const handleMouseLeave = () => {
    // Detenemos el intervalo y volvemos a la primera imagen
    clearInterval(intervalRef.current);
    setCurrentImageIndex(0);
  };

  return (
    <Link to={`/producto/${product.id}`} className={styles.cardLink}>
      <div 
        className={styles.productCard}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className={styles.imageContainer}>
          <img 
            src={product.images[currentImageIndex]} 
            alt={product.name} 
            className={styles.productImage}
          />
        </div>
        <div className={styles.productInfo}>
          <h3 className={styles.productName}>{product.name}</h3>
          {/* Podríamos agregar el precio aquí si quisiéramos */}
          {/* <p className={styles.productPrice}>${product.price.toFixed(2)}</p> */}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;