// /src/main.jsx

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { CartProvider } from './context/CartContext.jsx'; // <-- Importamos el proveedor

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 👇👇👇 Envolvemos la App con el CartProvider 👇👇👇 */}
    <CartProvider>
      <App />
    </CartProvider>
  </React.StrictMode>,
)