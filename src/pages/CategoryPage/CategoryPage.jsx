// /src/pages/CategoryPage/CategoryPage.jsx

import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import ProductCard from '../../components/common/ProductCard/ProductCard.jsx';
import NotFoundPage from '../NotFoundPage/NotFoundPage.jsx';
import { useProducts } from '../../context/productsContextValue.js';
import { menuData } from '../../menuData';
import { hasPrice } from '../../utils/formatPrice.js';
import styles from './CategoryPage.module.css';

// Busca en el menú el item con esa ruta (sirve para validar la URL y para sacar el título lindo)
const findMenuItem = (path, menuItems) => {
  for (const item of menuItems) {
    if (item.path === path) return item;
    if (item.children) {
      const found = findMenuItem(path, item.children);
      if (found) return found;
    }
  }
  return null;
};

const gridVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const CategoryPage = () => {
  const { gender, category, subcategory, item } = useParams();
  const [sortOrder, setSortOrder] = useState('default'); // 'default' | 'price-asc' | 'price-desc'
  const { products, loading, error } = useProducts();

  const fullPath = ['/tienda', gender, category, subcategory, item].filter(Boolean).join('/');
  const menuItem = findMenuItem(fullPath, menuData);
  const filterPath = fullPath.replace(/^\/tienda\//, '');

  const sortedProducts = useMemo(() => {
    // El "/" final evita que, por ejemplo, "mujer/casual/sport" incluya "mujer/casual/sportswear"
    const filtered = products.filter(product =>
      product.category === filterPath || product.category.startsWith(`${filterPath}/`)
    );
    // Las prendas sin precio ("Consultar precio") quedan siempre al final
    const priceOf = (p) => (hasPrice(p.price) ? p.price : null);
    const byPrice = (dir) => (a, b) => {
      if (priceOf(a) === null) return 1;
      if (priceOf(b) === null) return -1;
      return dir * (a.price - b.price);
    };
    if (sortOrder === 'price-asc') return [...filtered].sort(byPrice(1));
    if (sortOrder === 'price-desc') return [...filtered].sort(byPrice(-1));
    return filtered;
  }, [filterPath, sortOrder, products]);

  if (!menuItem) {
    return <NotFoundPage />;
  }

  const genderLabel = gender === 'hombre' ? 'Hombre' : 'Mujer';
  const title = menuItem.title;

  return (
    <main>
      <title>{`${title} ${genderLabel} | Ico Batista`}</title>

      <div className={styles.categoryHeader}>
        <p className={styles.eyebrow}>{genderLabel}</p>
        <h1>{title}</h1>

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

      {loading ? (
        <p className={styles.noProducts}>Cargando prendas…</p>
      ) : error ? (
        <p className={styles.noProducts}>{error}</p>
      ) : sortedProducts.length > 0 ? (
        <Motion.div
          className={styles.productGrid}
          key={sortOrder} // Re-anima al cambiar el orden
          variants={gridVariants}
          initial="hidden"
          animate="visible"
        >
          {sortedProducts.map(product => (
            <Motion.div key={product.id} variants={cardVariants}>
              <ProductCard product={product} />
            </Motion.div>
          ))}
        </Motion.div>
      ) : (
        <p className={styles.noProducts}>No hay productos en esta categoría por el momento.</p>
      )}
    </main>
  );
};

export default CategoryPage;
