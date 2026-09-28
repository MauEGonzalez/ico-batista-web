// /src/components/common/HamburgerMenu/HamburgerMenu.jsx

import React from 'react';
import { menuData } from '../../../menuData';
import MenuItem from '../MenuItem/MenuItem.jsx';
import { CloseIcon } from '../Icons/Icons.jsx';
import CurrencyToggle from '../CurrencyToggle/CurrencyToggle.jsx';
import styles from './HamburgerMenu.module.css';

const HamburgerMenu = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.menuContainer}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Menú principal"
      >
        <div className={styles.menuHeader}>
          <span>MENÚ</span>
          <button type="button" onClick={onClose} className={styles.closeButton} aria-label="Cerrar menú">
            <CloseIcon />
          </button>
        </div>
        <nav className={styles.menuNav}>
          <ul>
            {menuData.map((item) => (
              <MenuItem key={item.title} item={item} />
            ))}
          </ul>
        </nav>
        <div className={styles.menuFooter}>
          <span>Ver precios en</span>
          <CurrencyToggle />
        </div>
      </div>
    </div>
  );
};

export default HamburgerMenu;
