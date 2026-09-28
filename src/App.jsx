// /src/App.jsx

import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import MainLayout from './components/layout/MainLayout/MainLayout.jsx';
import ScrollToTop from './components/common/ScrollToTop/ScrollToTop.jsx';

// Cada página se descarga recién cuando se visita (code splitting),
// así la primera carga del sitio es mucho más liviana.
const LandingPage = lazy(() => import('./pages/LandingPage/LandingPage.jsx'));
const StylePage = lazy(() => import('./pages/StylePage/StylePage.jsx'));
const AboutPage = lazy(() => import('./pages/AboutPage/AboutPage.jsx'));
const ShopPage = lazy(() => import('./pages/ShopPage/ShopPage.jsx'));
const CartPage = lazy(() => import('./pages/CartPage/CartPage.jsx'));
const CategoryPage = lazy(() => import('./pages/CategoryPage/CategoryPage.jsx'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage/ProductDetailPage.jsx'));
const CollectionPage = lazy(() => import('./pages/CollectionPage/CollectionPage.jsx'));
const RunwayPage = lazy(() => import('./pages/RunwayPage/RunwayPage.jsx'));
const ContactPage = lazy(() => import('./pages/ContactPage/ContactPage.jsx'));
const FaqsPage = lazy(() => import('./pages/FaqsPage/FaqsPage.jsx'));
const TermsPage = lazy(() => import('./pages/TermsPage/TermsPage.jsx'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage/PrivacyPage.jsx'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage/NotFoundPage.jsx'));
// Panel de administración (se descarga aparte, solo al entrar a /admin)
const AdminApp = lazy(() => import('./admin/AdminApp.jsx'));

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'var(--accent-color)',
            color: 'var(--background-color)',
            borderRadius: '4px',
            padding: '14px 16px',
            fontFamily: 'var(--primary-font)',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
          },
          success: {
            duration: 3000,
            iconTheme: { primary: '#fff', secondary: '#000' },
          },
        }}
      />

      <Routes>
        {/* Panel de administración: sin header ni footer de la web */}
        <Route
          path="/admin/*"
          element={<Suspense fallback={null}><AdminApp /></Suspense>}
        />

        {/* Portada: sin header (tiene el logo propio sobre el tríptico) */}
        <Route element={<MainLayout showHeader={false} />}>
          <Route index element={<LandingPage />} />
        </Route>

        {/* Resto del sitio: con header fijo */}
        <Route element={<MainLayout />}>
          <Route path="/sobre-ico" element={<AboutPage />} />
          <Route path="/tienda" element={<ShopPage />} />
          <Route path="/tienda/:gender/:category" element={<CategoryPage />} />
          <Route path="/tienda/:gender/:category/:subcategory" element={<CategoryPage />} />
          <Route path="/tienda/:gender/:category/:subcategory/:item" element={<CategoryPage />} />
          <Route path="/producto/:productId" element={<ProductDetailPage />} />
          <Route path="/carrito" element={<CartPage />} />
          <Route path="/colecciones/:id" element={<CollectionPage />} />
          <Route path="/desfiles/:id" element={<RunwayPage />} />
          <Route path="/contacto" element={<ContactPage />} />
          <Route path="/faqs" element={<FaqsPage />} />
          <Route path="/terminos" element={<TermsPage />} />
          <Route path="/privacidad" element={<PrivacyPage />} />
          {/* /:gender/:styleType valida adentro que sea hombre|mujer y formal|casual */}
          <Route path="/:gender/:styleType" element={<StylePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
