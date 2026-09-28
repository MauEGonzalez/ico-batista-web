import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { CartProvider } from './context/CartContext.jsx';
import { CurrencyProvider } from './context/CurrencyContext.jsx';
import { ProductsProvider } from './context/ProductsContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ProductsProvider>
      <CurrencyProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </CurrencyProvider>
    </ProductsProvider>
  </React.StrictMode>,
)