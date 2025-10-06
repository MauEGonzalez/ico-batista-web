import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './MenuItem.module.css';

const MenuItem = ({ item }) => {
  // Estado para saber si el submenú está abierto o cerrado
  const [isOpen, setIsOpen] = useState(false);

  // Si el item tiene hijos (subcategorías)
  if (item.children) {
    return (
      <li className={styles.menuItem}>
        <button onClick={() => setIsOpen(!isOpen)} className={styles.toggleButton}>
          {item.title}
          {/* La flecha cambia de dirección si está abierto */}
          <span className={`${styles.arrow} ${isOpen ? styles.open : ''}`}>›</span>
        </button>
        {/* Si está abierto, muestra los hijos */}
        {isOpen && (
          <ul className={styles.submenu}>
            {item.children.map((child, index) => (
              <MenuItem key={index} item={child} />
            ))}
          </ul>
        )}
      </li>
    );
  } else {
    // Si no tiene hijos, es un link normal
    return (
      <li className={styles.menuItem}>
        <Link to={item.path} className={styles.menuLink}>
          {item.title}
        </Link>
      </li>
    );
  }
};

export default MenuItem;