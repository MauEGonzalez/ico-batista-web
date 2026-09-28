// /src/components/common/Price/Price.jsx
// Muestra un precio en la moneda elegida. Si la prenda no tiene precio, muestra "Consultar precio".

import React from 'react';
import { useCurrency } from '../../../context/currencyContextValue.js';
import { hasPrice } from '../../../utils/formatPrice.js';
import styles from './Price.module.css';

const Price = ({ value, className = '' }) => {
  const { currency, format } = useCurrency();

  if (!hasPrice(value)) {
    return <span className={`${styles.consult} ${className}`}>Consultar precio</span>;
  }

  return (
    <span
      className={className}
      title={currency === 'USD' ? 'Valor aproximado según el tipo de cambio del día' : undefined}
    >
      {currency === 'USD' && <span className={styles.approx} aria-label="aproximadamente">≈ </span>}
      {format(value)}
    </span>
  );
};

export default Price;
