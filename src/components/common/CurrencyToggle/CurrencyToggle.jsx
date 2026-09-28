// /src/components/common/CurrencyToggle/CurrencyToggle.jsx
// Selector discreto "UYU | USD". La elección vale para toda la web.

import React from 'react';
import { useCurrency } from '../../../context/currencyContextValue.js';
import styles from './CurrencyToggle.module.css';

const OPTIONS = ['UYU', 'USD'];

const CurrencyToggle = ({ className = '' }) => {
  const { currency, setCurrency } = useCurrency();

  return (
    <div className={`${styles.toggle} ${className}`} role="group" aria-label="Moneda de los precios">
      {OPTIONS.map((option) => (
        <button
          key={option}
          type="button"
          className={`${styles.option} ${currency === option ? styles.active : ''}`}
          aria-pressed={currency === option}
          onClick={() => setCurrency(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
};

export default CurrencyToggle;
