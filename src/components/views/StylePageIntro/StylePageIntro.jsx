import React from 'react';
import { Link } from 'react-router-dom'; // Importamos Link para los nuevos enlaces
import styles from './StylePageIntro.module.css';

const StylePageIntro = ({ styleType }) => {
  // Definimos las categorías según el tipo de estilo
  const categories = {
    formal: [
      { name: "Fiesta", path: "/formal/fiesta", image: `/assets/images/placeholder-formal-fiesta.jpg` },
      { name: "Coctel", path: "/formal/coctel", image: `/assets/images/placeholder-formal-coctel.jpg` },
      { name: "Gala", path: "/formal/gala", image: `/assets/images/placeholder-formal-gala.jpg` },
    ],
    casual: [
      { name: "Básicos", path: "/casual/basicos", image: `/assets/images/placeholder-casual-basicos.jpg` },
      { name: "Conjuntos", path: "/casual/conjuntos", image: `/assets/images/placeholder-casual-conjuntos.jpg` },
    ],
  };

  const currentCategories = categories[styleType] || []; // Obtiene las categorías correctas

  return (
    <div className={styles.introContainer}>
      {currentCategories.map((category) => (
        <div key={category.name} className={styles.introImagePanel}>
          <img src={category.image} alt={`Prendas ${styleType} - ${category.name}`} />
          {/* El nombre de la categoría es ahora un Link */}
          <Link to={category.path} className={styles.categoryLink}>
            {category.name}
          </Link>
        </div>
      ))}
    </div>
  );
};

export default StylePageIntro;