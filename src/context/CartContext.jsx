// /src/context/CartContext.jsx

import React, { createContext, useState, useContext } from 'react';
import toast from 'react-hot-toast'; // Importamos la función toast

// 1. Creamos el Contexto
const CartContext = createContext();

// 2. Creamos un Hook personalizado para usar el contexto más fácilmente
export const useCart = () => {
  return useContext(CartContext);
};

// 3. Creamos el Componente Proveedor que envolverá nuestra aplicación
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (productToAdd) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === productToAdd.id);
      
      if (existingItem) {
        // Si el item ya existe, incrementamos su cantidad
        return prevItems.map(item =>
          item.id === productToAdd.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // Si es un item nuevo, lo añadimos con cantidad 1
        return [...prevItems, { ...productToAdd, quantity: 1 }];
      }
    });
    // REEMPLAZAMOS LA ALERTA POR LA NOTIFICACIÓN TOAST
    toast.success(`${productToAdd.name} añadido al carrito!`);
  };

  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, amount) => {
    setCartItems(prevItems => {
      return prevItems.map(item => {
        if (item.id === productId) {
          const newQuantity = item.quantity + amount;
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
        }
        return item;
      }).filter(Boolean); // filter(Boolean) elimina los items que se volvieron null (cantidad 0)
    });
  };

  const clearCart = () => {
    setCartItems([]);
  };

  // El valor que proveeremos a los componentes hijos
  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};