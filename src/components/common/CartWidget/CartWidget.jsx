// /src/components/common/CartWidget/CartWidget.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../../context/cartContextValue.js';
import { BagIcon } from '../Icons/Icons.jsx';
import styles from './CartWidget.module.css';

const CartWidget = () => {
  // totalItems suma las unidades de "Mi selección" (2 remeras iguales = 2)
  const { totalItems } = useCart();

  return (
    <Link
      to="/carrito"
      className={styles.cartWidget}
      aria-label={totalItems > 0 ? `Mi selección: ${totalItems} prendas` : 'Mi selección (vacía)'}
    >
      <BagIcon className={styles.cartIcon} />
      {totalItems > 0 && (
        <span className={styles.cartCounter} aria-hidden="true">{totalItems > 99 ? '99+' : totalItems}</span>
      )}
    </Link>
  );
};

export default CartWidget;
