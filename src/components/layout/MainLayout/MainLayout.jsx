// /src/components/layout/MainLayout/MainLayout.jsx
// Estructura común de todas las páginas: Header + contenido + Footer.
// El Header y el Footer quedan fijos; solo el contenido hace la transición al navegar.

import React, { Suspense, useState } from 'react';
import { useLocation, useOutlet } from 'react-router-dom';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import Header from '../Header/Header.jsx';
import Footer from '../Footer/Footer.jsx';
import styles from './MainLayout.module.css';

const pageVariants = {
  initial: { opacity: 0 },
  in: { opacity: 1 },
  out: { opacity: 0 },
};

const pageTransition = { type: 'tween', ease: 'easeInOut', duration: 0.35 };

// "Congela" la página que se está yendo para que la animación de salida muestre
// la página anterior y no la nueva.
const FrozenOutlet = () => {
  const outlet = useOutlet();
  const [frozen] = useState(outlet);
  return frozen;
};

const MainLayout = ({ showHeader = true }) => {
  const location = useLocation();

  return (
    <div className={styles.layout}>
      {showHeader && <Header />}
      <AnimatePresence mode="wait" initial={false}>
        <Motion.div
          key={location.pathname}
          className={styles.content}
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          transition={pageTransition}
        >
          <Suspense fallback={<div className={styles.loader} aria-hidden="true" />}>
            <FrozenOutlet />
          </Suspense>
        </Motion.div>
      </AnimatePresence>
      <Footer />
    </div>
  );
};

export default MainLayout;
