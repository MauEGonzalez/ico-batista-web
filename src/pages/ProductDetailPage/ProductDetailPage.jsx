// /src/pages/ProductDetailPage/ProductDetailPage.jsx

import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../../components/layout/Header/Header.jsx';
import Footer from '../../components/layout/Footer/Footer.jsx';
import { productsData } from '../../productsData';
import NotFoundPage from '../NotFoundPage/NotFoundPage.jsx';
import { useCart } from '../../context/CartContext.jsx';
import styles from './ProductDetailPage.module.css';

const ProductDetailPage = () => {
  const { productId } = useParams();
  const { addToCart } = useCart();
  const product = productsData.find(p => p.id === productId);

  // Estado para la imagen principal y el zoom
  const [selectedImage, setSelectedImage] = useState(product?.images[0]);
  const [zoomPosition, setZoomPosition] = useState({ x: '50%', y: '50%' });

  if (!product) {
    return <NotFoundPage />;
  }

  const handleAddToCart = () => {
    addToCart(product);
  };

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPosition({ x: `${x}%`, y: `${y}%` });
  };

  return (
    <div>
      <Header />
      <main className={styles.pageContainer}>
        <div className={styles.productDetail}>
          <div className={styles.imageGallery}>
            {/* Contenedor de la Imagen Principal con Zoom */}
            <div 
              className={styles.mainImageContainer}
              onMouseMove={handleMouseMove}
            >
              <img 
                src={selectedImage} 
                alt={`${product.name} - vista principal`}
                className={styles.mainImage}
                style={{ transformOrigin: `${zoomPosition.x} ${zoomPosition.y}` }}
              />
            </div>
            {/* Miniaturas */}
            <div className={styles.thumbnailContainer}>
              {product.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${product.name} - vista ${index + 1}`}
                  className={`${styles.thumbnail} ${selectedImage === image ? styles.active : ''}`}
                  onClick={() => setSelectedImage(image)}
                />
              ))}
            </div>
          </div>
          
          <div className={styles.productInfo}>
            <h1 className={styles.productName}>{product.name}</h1>
            <p className={styles.productPrice}>${product.price.toFixed(2)}</p>
            <p className={styles.productDescription}>{product.description}</p>
            
            {/* Selectores de Talle y Color (UI-only) */}
            <div className={styles.selectors}>
              <div className={styles.selectorGroup}>
                <label>Talle:</label>
                <div className={styles.options}>
                  <button>S</button>
                  <button>M</button>
                  <button>L</button>
                </div>
              </div>
            </div>
            
            <button onClick={handleAddToCart} className={styles.addButton}>Añadir al Carrito</button>
            <Link to="/tienda" className={styles.backLink}>← Volver a la tienda</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetailPage;