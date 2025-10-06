import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Importaciones de las páginas
import LandingPage from './pages/LandingPage/LandingPage.jsx';
import StylePage from './pages/StylePage/StylePage.jsx';
import AboutPage from './pages/AboutPage/AboutPage.jsx';
import ShopPage from './pages/ShopPage/ShopPage.jsx';
import CartPage from './pages/CartPage/CartPage.jsx';
import ContactPage from './pages/ContactPage/ContactPage.jsx';
import CategoryPage from './pages/CategoryPage/CategoryPage.jsx';
import NotFoundPage from './pages/NotFoundPage/NotFoundPage.jsx';
import ProductDetailPage from './pages/ProductDetailPage/ProductDetailPage.jsx'; // <-- Nueva

function App() {
  return (
    <BrowserRouter>
      {/* Ya no necesitamos un div extra aquí, #root se encarga de todo */}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/formal" element={<StylePage styleType="formal" />} />
        <Route path="/casual" element={<StylePage styleType="casual" />} />
        <Route path="/sobre-ico" element={<AboutPage />} />
        <Route path="/tienda" element={<ShopPage />} />
        <Route path="/carrito" element={<CartPage />} />
        <Route path="/contacto" element={<ContactPage />} />

        {/* Rutas para colecciones y desfiles */}
        <Route path="/colecciones/:id" element={<CategoryPage />} />
        <Route path="/desfiles/:id" element={<CategoryPage />} />
        <Route path="/producto/:productId" element={<ProductDetailPage />} />
        {/* Rutas para las categorías de la tienda */}
        <Route path="/tienda/:gender/:category" element={<CategoryPage />} />
        <Route path="/tienda/:gender/:category/:subcategory" element={<CategoryPage />} />
        <Route path="/tienda/:gender/:category/:subcategory/:item" element={<CategoryPage />} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;