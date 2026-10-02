// /src/pages/CollectionPage/CollectionPage.jsx
import React from 'react';
import { useParams } from 'react-router-dom';
import ProductCard from '../../components/common/ProductCard/ProductCard.jsx';
import { useProducts } from '../../context/productsContextValue.js';
import { belongsTo } from '../../utils/productCategories.js';
import { getCollection } from '../../collections.js';
import NotFoundPage from '../NotFoundPage/NotFoundPage.jsx';
import styles from './CollectionPage.module.css';

const CollectionPage = () => {
  const { id } = useParams(); // slug de la colección, ej. "vestigios"
  const collection = getCollection(id);
  const { products, loading } = useProducts();

  if (!collection) {
    return <NotFoundPage />;
  }

  // Prendas que tienen esta colección entre sus categorías (se asigna desde el panel)
  const collectionProducts = products.filter((product) => belongsTo(product, `colecciones/${collection.slug}`));

  return (
    <main className={styles.mainContent}>
      <title>{`${collection.title} | Colecciones | Ico Batista`}</title>

      {collection.heroImage ? (
        <section className={styles.hero} style={{ backgroundImage: `url(${collection.heroImage})` }}>
          <div className={styles.heroOverlay}>
            <p className={styles.eyebrow}>Colección</p>
            <h1 className={styles.heroTitle}>{collection.title}</h1>
          </div>
        </section>
      ) : (
        <section className={styles.plainHeader}>
          <p className={styles.eyebrow}>Colección</p>
          <h1 className={styles.plainTitle}>{collection.title}</h1>
        </section>
      )}

      {collection.description && (
        <section className={styles.description}>
          <p>{collection.description}</p>
        </section>
      )}

      <section className={styles.productGridContainer}>
        {loading ? (
          <p className={styles.empty}>Cargando prendas…</p>
        ) : collectionProducts.length > 0 ? (
          <div className={styles.productGrid}>
            {collectionProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className={styles.empty}>Muy pronto podrás ver las prendas de esta colección.</p>
        )}
      </section>
    </main>
  );
};

export default CollectionPage;
