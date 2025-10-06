import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../../common/Logo/Logo.jsx';
import HamburgerMenu from '../../common/HamburgerMenu/HamburgerMenu.jsx'; // <-- Importa el menú
import styles from './Header.module.css';

const Header = () => {
  // Estado para controlar si el menú está abierto
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Función para cerrar el menú
  const handleCloseMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      <header className={styles.mainHeader}>
        <div className={styles.headerSection}>
          {/* El botón ahora abre el menú */}
          <button onClick={() => setIsMenuOpen(true)} className={styles.hamburgerMenu}>☰</button>
        </div>
        <div className={styles.headerSection}>
          <Link to="/">
            <Logo />
          </Link>
        </div>
        <div className={styles.headerSection}>
          <button className={styles.searchIcon}>⚲</button>
        </div>
      </header>
      {/* El componente del menú se renderiza aquí */}
      <HamburgerMenu isOpen={isMenuOpen} onClose={handleCloseMenu} />
    </>
  );
};

export default Header;