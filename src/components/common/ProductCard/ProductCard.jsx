// /src/components/common/ProductCard/ProductCard.jsx

import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Price from '../Price/Price.jsx';
import { imageUrl, imageSrcSet } from '../../../utils/imageUrl.js';
import styles from './ProductCard.module.css';

const ProductCard = ({ product }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const intervalRef = useRef(null);

  // Si la tarjeta desaparece con el mouse encima, cortamos el intervalo
  useEffect(() => () => clearInterval(intervalRef.current), []);

  const handleMouseEnter = () => {
    if (product.images.length <= 1) return;
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrentImageIndex(prevIndex => (prevIndex + 1) % product.images.length);
    }, 800);
  };

  const handleMouseLeave = () => {
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
          {product.images.length > 0 && (
            <img
              src={imageUrl(product.images[currentImageIndex], 700)}
              srcSet={imageSrcSet(product.images[currentImageIndex])}
              // Ancho en pantalla: 2 columnas en celular, ~4 en desktop
              sizes="(max-width: 600px) 50vw, (max-width: 1200px) 33vw, 300px"
              alt={product.name}
              className={styles.productImage}
              loading="lazy"
              decoding="async"
            />
          )}
        </div>
        <div className={styles.productInfo}>
          <h3 className={styles.productName}>{product.name}</h3>
          <p className={styles.productPrice}><Price value={product.price} /></p>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
