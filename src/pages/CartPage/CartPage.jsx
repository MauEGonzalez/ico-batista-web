// /src/pages/CartPage/CartPage.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/cartContextValue.js';
import Price from '../../components/common/Price/Price.jsx';
import { imageUrl } from '../../utils/imageUrl.js';
import CurrencyToggle from '../../components/common/CurrencyToggle/CurrencyToggle.jsx';
import { buildWhatsAppUrl, selectionInquiryMessage, sizeLabel } from '../../utils/whatsapp.js';
import { CloseIcon, ChatIcon } from '../../components/common/Icons/Icons.jsx';
import styles from './CartPage.module.css';

const CartPage = () => {
  const { cartItems, subtotal, hasUnpricedItems, removeFromCart, updateQuantity, clearCart } = useCart();

  return (
    <main className={styles.mainContent}>
      <title>Mi selección | Ico Batista</title>
      <h1>Mi selección</h1>

      {cartItems.length === 0 ? (
        <div className={styles.emptyCart}>
          <p>Tu selección está vacía.</p>
          <Link to="/tienda" className={styles.shopLink}>Ir a la tienda</Link>
        </div>
      ) : (
        <div className={styles.cartContainer}>
          <div className={styles.cartItemsList}>
            {cartItems.map((item) => (
              <div key={item.key} className={styles.cartItem}>
                <Link to={`/producto/${item.id}`}>
                  <img src={imageUrl(item.image, 240)} alt={item.name} className={styles.itemImage} loading="lazy" decoding="async" />
                </Link>
                <div className={styles.itemDetails}>
                  <h3 className={styles.itemName}>{item.name}</h3>
                  {item.size && <p className={styles.itemMeta}>{sizeLabel(item.size)}</p>}
                  <p className={styles.itemPrice}><Price value={item.price} /></p>
                  <div className={styles.quantityControl}>
                    <button type="button" onClick={() => updateQuantity(item.key, -1)} aria-label="Restar una unidad">−</button>
                    <span aria-live="polite">{item.quantity}</span>
                    <button type="button" onClick={() => updateQuantity(item.key, 1)} aria-label="Sumar una unidad">+</button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeFromCart(item.key)}
                  className={styles.removeButton}
                  aria-label={`Quitar ${item.name} de tu selección`}
                >
                  <CloseIcon width={20} height={20} />
                </button>
              </div>
            ))}
          </div>

          <div className={styles.cartSummary}>
            <div className={styles.summaryHeader}>
              <h2>Tu consulta</h2>
              <CurrencyToggle />
            </div>
            {subtotal > 0 && (
              <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                <span>Total de referencia:</span>
                <span><Price value={subtotal} /></span>
              </div>
            )}
            {hasUnpricedItems && (
              <p className={styles.summaryNote}>Algunas prendas no tienen precio publicado: Ico te lo pasa por WhatsApp.</p>
            )}
            <p className={styles.summaryNote}>
              Te enviamos a WhatsApp con tu selección ya escrita. Ico te confirma disponibilidad,
              medidas, forma de pago y entrega.
            </p>
            <a
              href={buildWhatsAppUrl(selectionInquiryMessage(cartItems))}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.checkoutButton}
            >
              <ChatIcon width={20} height={20} />
              Consultar por WhatsApp
            </a>
            <button type="button" onClick={clearCart} className={styles.clearButton}>Vaciar selección</button>
          </div>
        </div>
      )}
    </main>
  );
};

export default CartPage;
