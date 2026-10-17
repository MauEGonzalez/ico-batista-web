// /src/components/views/StylePageIntro/StylePageIntro.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import styles from './StylePageIntro.module.css';

const IMG = '/assets/images/portadas';

// Recuadros por página. Solo se muestran subcategorías que tienen prendas publicadas,
// ordenadas de la que más tiene a la que menos. Las fotos son del catálogo (código de prenda al lado).
// Fotos 3:4 (900×1200). Si se agrega una subcategoría, alcanza con sumarla acá.
const SUBCATEGORIES = {
  hombre: {
    formal: [
      { name: 'Trajes', path: '/tienda/hombre/formal/trajes', image: `${IMG}/hombre-formal-trajes.jpg` }, // IB-0021
      { name: 'Camisas', path: '/tienda/hombre/formal/camisas', image: `${IMG}/hombre-formal-camisas.jpg` }, // IB-0032
      { name: 'Pantalones', path: '/tienda/hombre/formal/pantalones', image: `${IMG}/hombre-formal-pantalones.jpg` }, // IB-0033
    ],
    casual: [
      { name: 'Camisas', path: '/tienda/hombre/casual/camisas', image: `${IMG}/hombre-casual-camisas.jpg` }, // IB-0094
      { name: 'Pantalones', path: '/tienda/hombre/casual/pantalones', image: `${IMG}/hombre-casual-pantalones.jpg` }, // IB-0089
    ],
  },
  mujer: {
    formal: [
      { name: 'Cóctel', path: '/tienda/mujer/formal/coctel', image: `${IMG}/mujer-formal-coctel.jpg` }, // IB-0055
      { name: 'Fiesta', path: '/tienda/mujer/formal/fiesta', image: `${IMG}/mujer-formal-fiesta.jpg` }, // IB-0146
    ],
    casual: [
      // Única subcategoría con prendas: va como banner ancho (3 conjuntos: IB-0067, IB-0078, IB-0074)
      // y en celular una sola foto vertical (IB-0069).
      {
        name: 'Básicos',
        path: '/tienda/mujer/casual/basicos',
        image: `${IMG}/mujer-casual-basicos.jpg`,
        imageMobile: `${IMG}/mujer-casual-basicos-movil.jpg`,
      },
    ],
  },
};

const StylePageIntro = ({ gender, styleType }) => {
  const currentSubcategories = SUBCATEGORIES[gender]?.[styleType] || [];
  const count = currentSubcategories.length;
  if (!count) return null;

  return (
    <div className={`${styles.introContainer} ${styles[`cols${count}`] ?? ''}`}>
      {currentSubcategories.map((category) => (
        <Link key={category.path} to={category.path} className={styles.introImagePanel}>
          <picture>
            {category.imageMobile && <source media="(max-width: 600px)" srcSet={category.imageMobile} />}
            <img
              src={category.image}
              alt={`${category.name} — ${gender === 'hombre' ? 'Hombre' : 'Mujer'} ${styleType}`}
              decoding="async"
            />
          </picture>
          <span className={styles.categoryLink}>{category.name}</span>
        </Link>
      ))}
    </div>
  );
};

export default StylePageIntro;
