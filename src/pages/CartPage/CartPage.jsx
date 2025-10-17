// /src/pages/CartPage/CartPage.jsx

import React from 'react';
import Header from '../../components/layout/Header/Header.jsx';
import Footer from '../../components/layout/Footer/Footer.jsx';
import { useCart } from '../../context/CartContext.jsx';
import styles from './CartPage.module.css';
import { Link } from 'react-router-dom';

const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart } = useCart();

  // Calculamos el total multiplicando precio por cantidad
  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div>
      <Header />
      <main className={styles.mainContent}>
        <h1>Carrito de Compras</h1>
        
        {cartItems.length === 0 ? (
          <div className={styles.emptyCart}>
            <p>Tu carrito está vacío.</p>
            <Link to="/tienda" className={styles.shopLink}>Ir a la tienda</Link>
          </div>
        ) : (
          <div className={styles.cartContainer}>
            <div className={styles.cartItemsList}>
              {cartItems.map((item) => (
                <div key={item.id} className={styles.cartItem}>
                  <img src={item.images[0]} alt={item.name} className={styles.itemImage} />
                  <div className={styles.itemDetails}>
                    <h3 className={styles.itemName}>{item.name}</h3>
                    <p className={styles.itemPrice}>${item.price.toFixed(2)}</p>
                    <div className={styles.quantityControl}>
                      <button onClick={() => updateQuantity(item.id, -1)}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)}>+</button>
                    </div>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className={styles.removeButton}>×</button>
                </div>
              ))}
            </div>

            <div className={styles.cartSummary}>
              <h2>Resumen del Pedido</h2>
              <div className={styles.summaryRow}>
                <span>Subtotal:</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Envío:</span>
                <span>A calcular</span>
              </div>
              <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <button className={styles.checkoutButton}>Finalizar Compra</button>
              <button onClick={clearCart} className={styles.clearButton}>Vaciar Carrito</button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default CartPage;