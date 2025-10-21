import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../../context/CartContext';
import styles from './MiniCart.module.css';

const MiniCart = ({ isVisible, onClose }) => {
  const { cartItems, removeFromCart } = useCart();
  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (!isVisible) return null;

  return (
    <div className={styles.miniCartOverlay} onMouseLeave={onClose}> {/* Cierra al quitar el mouse */}
      <div className={styles.miniCartContainer}>
        {cartItems.length === 0 ? (
          <p className={styles.emptyMessage}>Tu carrito está vacío.</p>
        ) : (
          <>
            <ul className={styles.itemList}>
              {cartItems.map((item) => (
                <li key={item.id} className={styles.cartItem}>
                  <img src={item.images[0]} alt={item.name} className={styles.itemImage} />
                  <div className={styles.itemDetails}>
                    <span className={styles.itemName}>{item.name}</span>
                    <span className={styles.itemPrice}>
                      {item.quantity} x ${item.price.toFixed(2)}
                    </span>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className={styles.removeButton}>×</button>
                </li>
              ))}
            </ul>
            <div className={styles.summary}>
              <div className={styles.total}>
                <span>Subtotal:</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className={styles.actions}>
                <Link to="/carrito" onClick={onClose} className={styles.viewCartButton}>Ver Carrito</Link>
                <button className={styles.checkoutButton}>Finalizar Compra</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MiniCart;