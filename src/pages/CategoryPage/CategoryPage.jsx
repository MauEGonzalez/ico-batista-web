// /src/pages/CategoryPage/CategoryPage.jsx

import React, { useState } from 'react'; // Importamos useState
import { useParams } from 'react-router-dom';
import Header from '../../components/layout/Header/Header.jsx';
import Footer from '../../components/layout/Footer/Footer.jsx';
import ProductCard from '../../components/common/ProductCard/ProductCard.jsx';
import NotFoundPage from '../NotFoundPage/NotFoundPage.jsx';
import { productsData } from '../../productsData';
import { menuData } from '../../menuData';
import { motion } from 'framer-motion';
import styles from './CategoryPage.module.css';

// --- Función Auxiliar para validar la ruta (se mantiene igual) ---
const isPathValid = (path, menuItems) => {
  for (const item of menuItems) {
    if (item.path === path) return true;
    if (item.children && isPathValid(path, item.children)) return true;
  }
  return false;
};

const CategoryPage = () => {
  const params = useParams();
  
  // --- Nuevo estado para el ordenamiento ---
  const [sortOrder, setSortOrder] = useState('default'); // Opciones: 'default', 'price-asc', 'price-desc'

  // ... (toda la lógica de validación de ruta y filtro se mantiene igual) ...
  const pathSegments = [
    '/tienda', params.gender, params.category, params.subcategory, params.item
  ].filter(Boolean);
  
  let fullPath = pathSegments.join('/');
  if (params.id && location.pathname.includes('colecciones')) {
    fullPath = `/colecciones/${params.id}`;
  } else if (params.id && location.pathname.includes('desfiles')) {
    fullPath = `/desfiles/${params.id}`;
  }

  const isValid = isPathValid(fullPath, menuData);

  if (!isValid) {
    return <NotFoundPage />;
  }
  
  const filterPath = fullPath.replace(/^\/tienda\//, '');
  const filteredProducts = productsData.filter(product => 
    product.category.startsWith(filterPath)
  );

  // --- Lógica de Ordenamiento ---
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortOrder === 'price-asc') {
      return a.price - b.price; // Menor a mayor precio
    }
    if (sortOrder === 'price-desc') {
      return b.price - a.price; // Mayor a menor precio
    }
    return 0; // Orden por defecto (el que viene de la 'base de datos')
  });

  const pageTitle = params.item || params.subcategory || params.category || params.id || 'Productos';
  const formattedTitle = pageTitle.charAt(0).toUpperCase() + pageTitle.slice(1);

  const gridVariants = {
    hidden: { transition: { staggerChildren: 0.1 } },
    visible: { transition: { staggerChildren: 0.1, staggerDirection: 1 } }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div>
      <Header />
      <main>
        <div className={styles.categoryHeader}>
          <h1>{formattedTitle}</h1>
          
          {/* 👇👇👇 NUEVO SELECTOR DE ORDENAMIENTO 👇👇👇 */}
          <div className={styles.filterContainer}>
            <label htmlFor="sort-select">Ordenar por:</label>
            <select 
              id="sort-select" 
              className={styles.sortSelect}
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="default">Destacados</option>
              <option value="price-asc">Precio: Menor a Mayor</option>
              <option value="price-desc">Precio: Mayor a Menor</option>
            </select>
          </div>
        </div>
        
        {sortedProducts.length > 0 ? (
          <motion.div 
            className={styles.productGrid}
            key={sortOrder} // Forzamos la re-animación al cambiar el orden
            variants={gridVariants}
            initial="hidden"
            animate="visible"
          >
            {sortedProducts.map(product => (
              <motion.div key={product.id} variants={cardVariants}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <p className={styles.noProducts}>No hay productos en esta categoría por el momento.</p>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default CategoryPage;