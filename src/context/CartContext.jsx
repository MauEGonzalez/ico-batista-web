// /src/context/CartContext.jsx

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import toast from 'react-hot-toast';
import { CartContext } from './cartContextValue.js';
import { hasPrice } from '../utils/formatPrice.js';

const STORAGE_KEY = 'icobatista-cart';

// "Mi selección": las prendas que la persona quiere consultar por WhatsApp.
// Cada línea es un producto + talle. Así el mismo producto en S y en M son dos líneas distintas.
const buildKey = (productId, size) => `${productId}__${size || 'unico'}`;

const loadCart = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const CartProvider = ({ children }) => {
  // El carrito se recupera de localStorage, así no se pierde al recargar la página
  const [cartItems, setCartItems] = useState(loadCart);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
    } catch {
      // Modo privado o almacenamiento lleno: el carrito sigue funcionando en memoria
    }
  }, [cartItems]);

  const addToCart = useCallback((product, size) => {
    const key = buildKey(product.id, size);
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.key === key);
      if (existingItem) {
        return prevItems.map(item =>
          item.key === key ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      // Guardamos solo lo necesario para mostrar el carrito
      return [...prevItems, {
        key,
        id: product.id,
        name: product.name,
        price: product.price,
        image: typeof product.images?.[0] === 'string' ? product.images[0] : product.images?.[0]?.url,
        size: size || null,
        quantity: 1,
      }];
    });
    const sizeText = size === 'A medida' ? ' (a medida)' : size ? ` (talle ${size})` : '';
    toast.success(`${product.name}${sizeText} añadido a tu selección`);
  }, []);

  const removeFromCart = useCallback((key) => {
    setCartItems(prevItems => prevItems.filter(item => item.key !== key));
  }, []);

  const updateQuantity = useCallback((key, amount) => {
    setCartItems(prevItems =>
      prevItems
        .map(item => item.key === key ? { ...item, quantity: item.quantity + amount } : item)
        .filter(item => item.quantity > 0)
    );
  }, []);

  const clearCart = useCallback(() => setCartItems([]), []);

  const value = useMemo(() => ({
    cartItems,
    totalItems: cartItems.reduce((sum, item) => sum + item.quantity, 0),
    // Subtotal en pesos de las prendas con precio; las que no tienen se consultan aparte
    subtotal: cartItems.reduce((sum, item) => sum + (hasPrice(item.price) ? item.price * item.quantity : 0), 0),
    hasUnpricedItems: cartItems.some(item => !hasPrice(item.price)),
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
  }), [cartItems, addToCart, removeFromCart, updateQuantity, clearCart]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
