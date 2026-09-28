// /src/pages/LandingPage/LandingPage.jsx
import React from 'react';
import LandingTriptych from '../../components/views/LandingTriptych/LandingTriptych.jsx';
import styles from './LandingPage.module.css';

const LandingPage = () => {
  return (
    <div className={styles.landingPage}>
      <title>Ico Batista | Diseño de autor</title>
      <LandingTriptych />
    </div>
  );
};

export default LandingPage;
