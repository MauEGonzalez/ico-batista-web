// /src/pages/StylePage/StylePage.jsx

import React from 'react';
import { useParams, NavLink } from 'react-router-dom';
import StylePageIntro from '../../components/views/StylePageIntro/StylePageIntro.jsx';
import AutoplayVideo from '../../components/common/AutoplayVideo/AutoplayVideo.jsx';
import ImageCarousel from '../../components/common/ImageCarousel/ImageCarousel.jsx';
import NotFoundPage from '../NotFoundPage/NotFoundPage.jsx';
import styles from './StylePage.module.css';

const GENDERS = { mujer: 'Mujer', hombre: 'Hombre' };
const STYLES = { formal: 'Formal', casual: 'Casual' };

const StylePage = () => {
  const { gender, styleType } = useParams();

  // La ruta /:gender/:styleType atrapa cualquier URL de 2 partes; solo aceptamos las válidas
  if (!GENDERS[gender] || !STYLES[styleType]) {
    return <NotFoundPage />;
  }

  return (
    <main>
      <title>{`${STYLES[styleType]} ${GENDERS[gender]} | Ico Batista`}</title>

      <h1 className={styles.visuallyHidden}>{`${STYLES[styleType]} ${GENDERS[gender]}`}</h1>

      {/* Selector discreto para pasar de Mujer a Hombre (y viceversa) sin salir del estilo */}
      <nav className={styles.genderSwitch} aria-label="Elegir sección">
        {Object.entries(GENDERS).map(([key, label]) => (
          <NavLink
            key={key}
            to={`/${key}/${styleType}`}
            className={({ isActive }) => `${styles.genderLink} ${isActive ? styles.active : ''}`}
          >
            {label}
          </NavLink>
        ))}
      </nav>

      <StylePageIntro gender={gender} styleType={styleType} />

      <section className={styles.pageSection}>
        <AutoplayVideo src={`/assets/videos/placeholder-${styleType}-collection.mp4`} />
        <p>Descubre la nueva colección {STYLES[styleType].toLowerCase()}.</p>
      </section>

      <section className={styles.pageSection}>
        <ImageCarousel gender={gender} styleType={styleType} />
      </section>
    </main>
  );
};

export default StylePage;
