// /src/App.jsx

import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';

// Importaciones de páginas
import LandingPage from './pages/LandingPage/LandingPage.jsx';
import StylePage from './pages/StylePage/StylePage.jsx';
import AboutPage from './pages/AboutPage/AboutPage.jsx';
import ShopPage from './pages/ShopPage/ShopPage.jsx';
import CartPage from './pages/CartPage/CartPage.jsx';
import CategoryPage from './pages/CategoryPage/CategoryPage.jsx';
import ProductDetailPage from './pages/ProductDetailPage/ProductDetailPage.jsx';
import ContactPage from './pages/ContactPage/ContactPage.jsx';
import FaqsPage from './pages/FaqsPage/FaqsPage.jsx';
import TermsPage from './pages/TermsPage/TermsPage.jsx';
import PrivacyPage from './pages/PrivacyPage/PrivacyPage.jsx';
import NotFoundPage from './pages/NotFoundPage/NotFoundPage.jsx';
// 👇👇👇 IMPORTAMOS LAS NUEVAS PÁGINAS 👇👇👇
import CollectionPage from './pages/CollectionPage/CollectionPage.jsx';
import RunwayPage from './pages/RunwayPage/RunwayPage.jsx';


// Componente interno que maneja la lógica de las rutas y animaciones
const AnimatedRoutes = () => {
  const location = useLocation();

  const pageVariants = {
    initial: { opacity: 0 },
    in: { opacity: 1 },
    out: { opacity: 0 },
  };

  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.5,
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
      >
        <Routes location={location}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/:gender/:styleType" element={<StylePage />} />
          <Route path="/sobre-ico" element={<AboutPage />} />
          <Route path="/tienda" element={<ShopPage />} />
          <Route path="/carrito" element={<CartPage />} />
          <Route path="/producto/:productId" element={<ProductDetailPage />} />

          {/* 👇👇👇 RUTAS ACTUALIZADAS 👇👇👇 */}
          <Route path="/colecciones/:id" element={<CollectionPage />} />
          <Route path="/desfiles/:id" element={<RunwayPage />} />
          
          <Route path="/tienda/:gender/:category" element={<CategoryPage />} />
          <Route path="/tienda/:gender/:category/:subcategory" element={<CategoryPage />} />
          <Route path="/tienda/:gender/:category/:subcategory/:item" element={<CategoryPage />} />
          <Route path="/contacto" element={<ContactPage />} />
          <Route path="/faqs" element={<FaqsPage />} />
          <Route path="/terminos" element={<TermsPage />} />
          <Route path="/privacidad" element={<PrivacyPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

// Componente principal de la aplicación
function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'var(--accent-color)',
            color: 'var(--background-color)',
            borderRadius: '8px',
            padding: '16px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#fff',
              secondary: 'var(--accent-color)',
            },
          },
        }}
      />
      
      <AnimatedRoutes />
    </BrowserRouter>
  );
}

export default App;