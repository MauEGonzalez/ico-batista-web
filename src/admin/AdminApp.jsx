// /src/admin/AdminApp.jsx
// Panel de administración. Se descarga solo cuando alguien entra a /admin.
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminAuthProvider } from './context/AdminAuthContext.jsx';
import AdminLayout from './components/AdminLayout/AdminLayout.jsx';
import AdminLogin from './pages/AdminLogin/AdminLogin.jsx';
import AdminProducts from './pages/AdminProducts/AdminProducts.jsx';
import AdminProductForm from './pages/AdminProductForm/AdminProductForm.jsx';

const AdminApp = () => (
  <AdminAuthProvider>
    <title>Panel | Ico Batista</title>
    <meta name="robots" content="noindex, nofollow" />
    <Routes>
      <Route path="login" element={<AdminLogin />} />
      <Route element={<AdminLayout />}>
        <Route index element={<AdminProducts />} />
        <Route path="prendas/nueva" element={<AdminProductForm />} />
        <Route path="prendas/:id" element={<AdminProductForm />} />
      </Route>
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  </AdminAuthProvider>
);

export default AdminApp;
