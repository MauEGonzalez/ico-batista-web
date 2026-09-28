// /src/components/layout/Header/Header.jsx

import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logo from '../../common/Logo/Logo.jsx';
import HamburgerMenu from '../../common/HamburgerMenu/HamburgerMenu.jsx';
import SearchOverlay from '../../common/SearchOverlay/SearchOverlay.jsx';
import CartWidget from '../../common/CartWidget/CartWidget.jsx';
import MiniCart from '../../common/MiniCart/MiniCart.jsx';
import { MenuIcon, SearchIcon } from '../../common/Icons/Icons.jsx';
import styles from './Header.module.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMiniCartVisible, setIsMiniCartVisible] = useState(false);
  // useRef mantiene el temporizador entre renders (con una variable común se perdía y no se cancelaba)
  const hideMiniCartTimer = useRef(null);
  const { pathname } = useLocation();

  // El header ya no se vuelve a montar en cada página, así que cerramos todo al navegar
  useEffect(() => {
    setIsMenuOpen(false);
    setIsSearchOpen(false);
    setIsMiniCartVisible(false);
  }, [pathname]);

  // Tecla Escape cierra menú y buscador
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Evita que la página de fondo scrollee con el menú o el buscador abiertos
  useEffect(() => {
    document.body.style.overflow = isMenuOpen || isSearchOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen, isSearchOpen]);

  useEffect(() => () => clearTimeout(hideMiniCartTimer.current), []);

  const handleShowMiniCart = () => {
    clearTimeout(hideMiniCartTimer.current);
    setIsMiniCartVisible(true);
  };

  const handleHideMiniCart = () => {
    clearTimeout(hideMiniCartTimer.current);
    hideMiniCartTimer.current = setTimeout(() => setIsMiniCartVisible(false), 300);
  };

  return (
    <>
      <header className={styles.mainHeader}>
        <div className={styles.left}>
          <button
            type="button"
            onClick={() => setIsMenuOpen(true)}
            className={styles.iconButton}
            aria-label="Abrir menú"
            aria-expanded={isMenuOpen}
          >
            <MenuIcon />
          </button>
          {/* En celulares la lupa va a la izquierda para equilibrar el header */}
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className={`${styles.iconButton} ${styles.searchMobile}`}
            aria-label="Buscar productos"
          >
            <SearchIcon />
          </button>
        </div>

        <Link to="/" className={styles.logoLink} aria-label="Ico Batista — inicio">
          <Logo />
        </Link>

        <div className={styles.right}>
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className={`${styles.iconButton} ${styles.searchDesktop}`}
            aria-label="Buscar productos"
          >
            <SearchIcon />
          </button>

          <div
            className={styles.cartWidgetContainer}
            onMouseEnter={handleShowMiniCart}
            onMouseLeave={handleHideMiniCart}
          >
            <CartWidget />
            <MiniCart isVisible={isMiniCartVisible} onClose={() => setIsMiniCartVisible(false)} />
          </div>
        </div>
      </header>

      <HamburgerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};

export default Header;
