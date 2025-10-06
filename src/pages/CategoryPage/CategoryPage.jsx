import React from 'react';
import { useParams } from 'react-router-dom';
import Header from '../../components/layout/Header/Header.jsx';
import Footer from '../../components/layout/Footer/Footer.jsx';
import ProductCard from '../../components/common/ProductCard/ProductCard.jsx';
import { productsData } from '../../productsData'; // Importamos nuestros productos
import styles from './CategoryPage.module.css';

const CategoryPage = () => {
  const params = useParams();
  const categoryPath = Object.values(params).join('/');

  // Filtramos los productos que pertenecen a esta categoría
  const filteredProducts = productsData.filter(product => 
    product.category.startsWith(categoryPath)
  );

  return (
    <div>
      <Header />
      <main>
        <div className={styles.categoryHeader}>
          <h1>Categoría: {categoryPath.charAt(0).toUpperCase() + categoryPath.slice(1)}</h1>
        </div>
        
        {filteredProducts.length > 0 ? (
          <div className={styles.productGrid}>
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className={styles.noProducts}>No hay productos en esta categoría por el momento.</p>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default CategoryPage;