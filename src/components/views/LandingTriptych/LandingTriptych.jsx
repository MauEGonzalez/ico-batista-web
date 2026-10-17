// /src/components/views/LandingTriptych/LandingTriptych.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../../common/Logo/Logo.jsx';
import styles from './LandingTriptych.module.css';

const LandingTriptych = () => {
  return (
    <div className={styles.triptychContainer}>
      <h1 className={styles.triptychLogo}>
        <Logo color="white" />
      </h1>
      <div className={styles.triptychPanel}>
        {/* Imágenes de la portada: prioridad alta, son lo primero que se ve */}
        <img
          src="/assets/images/portadas/landing-formal.jpg"
          alt="Modelo con prenda de la línea formal"
          fetchPriority="high"
          decoding="async"
        />
        <Link to="/mujer/formal" className={styles.panelLink}>Formal</Link>
      </div>
      <div className={`${styles.triptychPanel} ${styles.videoPanel}`}>
        <video
          src="/assets/videos/intro.mp4"
          poster="/assets/videos/intro-poster.jpg"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
        />
      </div>
      <div className={styles.triptychPanel}>
        <img
          src="/assets/images/portadas/landing-casual.jpg"
          alt="Modelo con prenda de la línea casual"
          fetchPriority="high"
          decoding="async"
        />
        <Link to="/mujer/casual" className={styles.panelLink}>Casual</Link>
      </div>
    </div>
  );
};

export default LandingTriptych;
