import React from 'react';
import styles from './Logo.module.css';

// El componente ahora acepta una prop "color"
const Logo = ({ color = 'inherit' }) => {
  const logoStyle = {
    color: color, // Aplica el color recibido
    textShadow: color === 'white' ? '1px 1px 3px rgba(0,0,0,0.5)' : 'none' // Aplica sombra solo si es blanco
  };

  return (
    <div className={styles.logoText} style={logoStyle}>
      ICO BATISTA
    </div>
  );
};

export default Logo;