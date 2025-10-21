import React from 'react';
import { useParams } from 'react-router-dom';
import Header from '../../components/layout/Header/Header.jsx';
import Footer from '../../components/layout/Footer/Footer.jsx';
import ProductCard from '../../components/common/ProductCard/ProductCard.jsx';
import { productsData } from '../../productsData';
import styles from './CollectionPage.module.css';

// Datos de ejemplo para las colecciones (luego podríamos mover esto a un archivo)
const collectionsInfo = {
  '1': {
    title: 'Colección "Amanecer"',
    description: 'Una exploración de la luz y la silueta. Esta colección captura la paleta de colores del amanecer, desde los tonos fríos de la noche hasta los cálidos dorados del sol naciente, utilizando sedas fluidas y linos estructurados.',
    heroImage: '/assets/images/collections/coleccion-1-hero.jpg'
  },
  '2': {
    title: 'Colección "Nocturna"',
    description: 'Inspirada en la arquitectura de la ciudad de noche. Esta colección se centra en texturas ricas, cortes nítidos y una paleta monocromática interrumpida por destellos de luz, combinando cuero, paño de lana y detalles metálicos.',
    heroImage: '/assets/images/collections/coleccion-2-hero.jpg'
  }
};

const CollectionPage = () => {
  const { id } = useParams(); // Obtiene el '1' o '2' de la URL
  const collection = collectionsInfo[id];
  
  // Filtramos los productos que pertenecen a esta colección específica
  const collectionProducts = productsData.filter(
    product => product.category === `colecciones/${id}`
  );

  if (!collection) {
    // Podríamos redirigir a 404, pero por ahora mostramos un mensaje
    return <div>Colección no encontrada</div>;
  }

  return (
    <div>
      <Header />
      <main className={styles.mainContent}>
        {/* Hero de la Colección */}
        <section className={styles.hero} style={{ backgroundImage: `url(${collection.heroImage})` }}>
          <div className={styles.heroOverlay}>
            <h1 className={styles.heroTitle}>{collection.title}</h1>
          </div>
        </section>

        {/* Descripción */}
        <section className={styles.description}>
          <p>{collection.description}</p>
        </section>

        {/* Grilla de Productos */}
        <section className={styles.productGridContainer}>
          <h2 className={styles.gridTitle}>Looks de la Colección</h2>
          <div className={styles.productGrid}>
            {collectionProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default CollectionPage;