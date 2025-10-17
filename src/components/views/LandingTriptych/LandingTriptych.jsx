// /src/components/views/LandingTriptych/LandingTriptych.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../../common/Logo/Logo.jsx';
import styles from './LandingTriptych.module.css';

const LandingTriptych = () => {
  return (
    <div className={styles.triptychContainer}>
      <div className={styles.triptychLogo}>
        <Logo color="white" />
      </div>
      <div className={styles.triptychPanel}>
        <img src="/assets/images/placeholder-formal.jpg" alt="Modelo estilo formal" />
        {/* 👇👇👇 RUTA CORREGIDA 👇👇👇 */}
        <Link to="/mujer/formal" className={styles.panelLink}>Formal</Link>
      </div>
      <div className={styles.triptychPanel}>
        <video src="/assets/videos/placeholder-intro.mp4" autoPlay loop muted playsInline></video>
      </div>
      <div className={styles.triptychPanel}>
        <img src="/assets/images/placeholder-casual.jpg" alt="Modelo estilo casual" />
        {/* 👇👇👇 RUTA CORREGIDA 👇👇👇 */}
        <Link to="/mujer/casual" className={styles.panelLink}>Casual</Link>
      </div>
    </div>
  );
};

export default LandingTriptych;