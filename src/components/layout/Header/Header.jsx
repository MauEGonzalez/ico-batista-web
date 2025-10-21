// /src/components/layout/Header/Header.jsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../../common/Logo/Logo.jsx';
import HamburgerMenu from '../../common/HamburgerMenu/HamburgerMenu.jsx';
import SearchOverlay from '../../common/SearchOverlay/SearchOverlay.jsx';
import CartWidget from '../../common/CartWidget/CartWidget.jsx';
import MiniCart from '../../common/MiniCart/MiniCart.jsx'; // <-- Importamos el MiniCart
import styles from './Header.module.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMiniCartVisible, setIsMiniCartVisible] = useState(false); // <-- Nuevo estado

  const handleCloseMenu = () => {
    setIsMenuOpen(false);
  };

  // Usaremos un temporizador para evitar que el MiniCart se cierre inmediatamente
  let hideMiniCartTimer;
  const handleShowMiniCart = () => {
    clearTimeout(hideMiniCartTimer); // Cancela cualquier temporizador de cierre pendiente
    setIsMiniCartVisible(true);
  };
  const handleHideMiniCart = () => {
    // Espera un poco antes de cerrar, por si el usuario mueve el mouse al MiniCart
    hideMiniCartTimer = setTimeout(() => {
      setIsMiniCartVisible(false);
    }, 300); // 300 milisegundos de espera
  };

  return (
    <>
      <header className={styles.mainHeader}>
        <div className={styles.headerSection}>
          <button onClick={() => setIsMenuOpen(true)} className={styles.hamburgerMenu}>☰</button>
        </div>
        
        <div className={styles.headerSection}>
          <Link to="/">
            <Logo />
          </Link>
        </div>
        
        <div className={`${styles.headerSection} ${styles.actionsContainer}`}> {/* Añadimos una clase contenedora */}
          <button onClick={() => setIsSearchOpen(true)} className={styles.searchIcon}>⚲</button>
          
          {/* Envolvemos el CartWidget para detectar el hover */}
          <div 
            className={styles.cartWidgetContainer} 
            onMouseEnter={handleShowMiniCart} 
            onMouseLeave={handleHideMiniCart} // Inicia el temporizador para cerrar
          >
            <CartWidget />
            {/* El MiniCart se renderiza aquí y es controlado por el estado */}
            <MiniCart isVisible={isMiniCartVisible} onClose={handleHideMiniCart} />
          </div>
        </div>
      </header>
      
      <HamburgerMenu isOpen={isMenuOpen} onClose={handleCloseMenu} />
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};

export default Header;