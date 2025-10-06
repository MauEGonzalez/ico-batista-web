import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../../components/layout/Header/Header.jsx';
import Footer from '../../components/layout/Footer/Footer.jsx';
import { productsData } from '../../productsData';
import NotFoundPage from '../NotFoundPage/NotFoundPage.jsx';
import styles from './ProductDetailPage.module.css';

const ProductDetailPage = () => {
  const { productId } = useParams();
  
  // Buscamos el producto en nuestra "base de datos" por su ID
  const product = productsData.find(p => p.id === productId);

  // Si no se encuentra el producto, mostramos la página 404
  if (!product) {
    return <NotFoundPage />;
  }

  return (
    <div>
      <Header />
      <main className={styles.pageContainer}>
        <div className={styles.productDetail}>
          {/* Galería de Imágenes */}
          <div className={styles.imageGallery}>
            {product.images.map((image, index) => (
              <img key={index} src={image} alt={`${product.name} - vista ${index + 1}`} />
            ))}
          </div>
          
          {/* Información del Producto */}
          <div className={styles.productInfo}>
            <h1 className={styles.productName}>{product.name}</h1>
            <p className={styles.productPrice}>${product.price.toFixed(2)}</p>
            <p className={styles.productDescription}>{product.description}</p>
            
            {/* Aquí irían los selectores de talle, color, etc. */}
            
            <button className={styles.addButton}>Añadir al Carrito</button>
            <Link to="/tienda" className={styles.backLink}>← Volver a la tienda</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetailPage;