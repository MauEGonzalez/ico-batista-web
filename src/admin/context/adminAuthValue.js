// /src/admin/context/adminAuthValue.js
import { createContext, useContext } from 'react';

export const AdminAuthContext = createContext(null);

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error('useAdminAuth debe usarse dentro de <AdminAuthProvider>');
  return context;
};
