import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../../common/Logo/Logo.jsx';
import styles from './LandingTriptych.module.css'; // <-- CSS Modules

const LandingTriptych = () => {
  return (
    <main className={styles.triptychContainer}>
      <div className={styles.triptychLogo}>
        <Logo color="white" /> {/* <-- Le decimos que sea blanco */}
      </div>
      <div className={styles.triptychPanel}>
        <img src="/assets/images/placeholder-formal.jpg" alt="Modelo estilo Formal" />
        <Link to="/formal" className={styles.panelLink}>Formal</Link>
      </div>
      <div className={styles.triptychPanel}>
        <video src="/assets/videos/placeholder-intro.mp4" autoPlay loop muted playsInline></video>
      </div>
      <div className={styles.triptychPanel}>
        <img src="/assets/images/placeholder-casual.jpg" alt="Modelo estilo casual" />
        <Link to="/casual" className={styles.panelLink}>Casual</Link>
      </div>
    </main>
  );
};

export default LandingTriptych;