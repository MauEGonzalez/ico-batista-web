// /src/components/views/StylePageIntro/StylePageIntro.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import styles from './StylePageIntro.module.css';

const StylePageIntro = ({ gender, styleType }) => {
  // Creamos una estructura de datos para todas las subcategorías
  const subcategories = {
    hombre: {
      formal: [
        { name: "Trajes", path: "/tienda/hombre/formal/trajes", image: `/assets/images/placeholder-hombre-trajes.jpg` },
        { name: "Camisas", path: "/tienda/hombre/formal/camisas", image: `/assets/images/placeholder-hombre-camisas.jpg` },
        { name: "Pantalones", path: "/tienda/hombre/formal/pantalones", image: `/assets/images/placeholder-hombre-pantalones.jpg` },
      ],
      casual: [
        { name: "Básicos", path: "/tienda/hombre/casual/basicos", image: `/assets/images/placeholder-hombre-basicos.jpg` },
        { name: "Conjuntos", path: "/tienda/hombre/casual/conjuntos", image: `/assets/images/placeholder-hombre-conjuntos.jpg` },
      ]
    },
    mujer: {
      formal: [
        { name: "Fiesta", path: "/tienda/mujer/formal/fiesta", image: `/assets/images/placeholder-formal-fiesta.jpg` },
        { name: "Coctel", path: "/tienda/mujer/formal/coctel", image: `/assets/images/placeholder-formal-coctel.jpg` },
        { name: "Gala", path: "/tienda/mujer/formal/gala", image: `/assets/images/placeholder-formal-gala.jpg` },
      ],
      casual: [
        { name: "Básicos", path: "/tienda/mujer/casual/basicos", image: `/assets/images/placeholder-casual-basicos.jpg` },
        { name: "Conjuntos", path: "/tienda/mujer/casual/conjuntos", image: `/assets/images/placeholder-casual-conjuntos.jpg` },
      ]
    }
  };

  // Buscamos las subcategorías correctas usando el género y el estilo
  const currentSubcategories = subcategories[gender]?.[styleType] || [];

  return (
    <div className={styles.introContainer}>
      {currentSubcategories.map((category) => (
        <div key={category.name} className={styles.introImagePanel}>
          <img src={category.image} alt={`Prendas ${gender} ${styleType} - ${category.name}`} />
          <Link to={category.path} className={styles.categoryLink}>
            {category.name}
          </Link>
        </div>
      ))}
    </div>
  );
};

export default StylePageIntro;