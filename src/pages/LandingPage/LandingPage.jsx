// /src/pages/LandingPage/LandingPage.jsx
import React from 'react';
import Footer from '../../components/layout/Footer/Footer.jsx';
import LandingTriptych from '../../components/views/LandingTriptych/LandingTriptych.jsx';
import styles from './LandingPage.module.css'; // <-- Importa el CSS

const LandingPage = () => {
  return (
    <div className={styles.landingPage}> {/* <-- Aplica la clase */}
      <LandingTriptych />
      <Footer />
    </div>
  );
};

export default LandingPage;