import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../../context/CartContext'; // Importamos el hook del carrito
import styles from './CartWidget.module.css';

const CartWidget = () => {
  const { cartItems } = useCart();
  const itemCount = cartItems.length;

  return (
    <Link to="/carrito" className={styles.cartWidget}>
      <span className={styles.cartIcon}>🛒</span>
      {/* El contador solo se muestra si hay items en el carrito */}
      {itemCount > 0 && (
        <span className={styles.cartCounter}>{itemCount}</span>
      )}
    </Link>
  );
};

export default CartWidget;