// /src/components/common/HamburgerMenu/HamburgerMenu.jsx

import React from 'react';
import { menuData } from '../../../menuData';
// 👇👇👇 ESTA ES LA LÍNEA CORREGIDA 👇👇👇
import MenuItem from '../MenuItem/MenuItem.jsx'; 
import styles from './HamburgerMenu.module.css';

const HamburgerMenu = ({ isOpen, onClose }) => {
  // Si no está abierto, no renderiza nada
  if (!isOpen) return null;

  return (
    // Overlay oscuro que cubre la pantalla
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.menuContainer} onClick={(e) => e.stopPropagation()}>
        <div className={styles.menuHeader}>
          <span>MENÚ</span>
          <button onClick={onClose} className={styles.closeButton}>×</button>
        </div>
        <nav className={styles.menuNav}>
          <ul>
            {menuData.map((item, index) => (
              <MenuItem key={index} item={item} />
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default HamburgerMenu;