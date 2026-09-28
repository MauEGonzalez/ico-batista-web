// /src/components/common/MiniCart/MiniCart.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../../context/cartContextValue.js';
import Price from '../Price/Price.jsx';
import { imageUrl } from '../../../utils/imageUrl.js';
import { buildWhatsAppUrl, selectionInquiryMessage, sizeLabel } from '../../../utils/whatsapp.js';
import { CloseIcon } from '../Icons/Icons.jsx';
import styles from './MiniCart.module.css';

const MiniCart = ({ isVisible, onClose }) => {
  const { cartItems, subtotal, removeFromCart } = useCart();

  if (!isVisible) return null;

  return (
    <div className={styles.miniCartOverlay}>
      <div className={styles.miniCartContainer}>
        {cartItems.length === 0 ? (
          <p className={styles.emptyMessage}>Tu selección está vacía.</p>
        ) : (
          <>
            <ul className={styles.itemList}>
              {cartItems.map((item) => (
                <li key={item.key} className={styles.cartItem}>
                  <img src={imageUrl(item.image, 160)} alt={item.name} className={styles.itemImage} loading="lazy" decoding="async" />
                  <div className={styles.itemDetails}>
                    <span className={styles.itemName}>{item.name}</span>
                    {item.size && <span className={styles.itemMeta}>{sizeLabel(item.size)}</span>}
                    <span className={styles.itemPrice}>
                      {item.quantity} × <Price value={item.price} />
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.key)}
                    className={styles.removeButton}
                    aria-label={`Quitar ${item.name} de tu selección`}
                  >
                    <CloseIcon width={16} height={16} />
                  </button>
                </li>
              ))}
            </ul>
            <div className={styles.summary}>
              <div className={styles.total}>
                <span>Subtotal:</span>
                <span><Price value={subtotal} /></span>
              </div>
              <div className={styles.actions}>
                <Link to="/carrito" onClick={onClose} className={styles.viewCartButton}>Ver selección</Link>
                <a
                  href={buildWhatsAppUrl(selectionInquiryMessage(cartItems))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.checkoutButton}
                >
                  Consultar
                </a>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MiniCart;
