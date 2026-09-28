// /src/admin/context/AdminAuthContext.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AdminAuthContext } from './adminAuthValue.js';
import { adminApi } from '../api/adminApi.js';

export const AdminAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true); // Verificando si ya hay sesión

  useEffect(() => {
    adminApi.me()
      .then(({ user: current }) => setUser(current))
      .catch(() => setUser(null))
      .finally(() => setChecking(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const { user: loggedUser } = await adminApi.login(email, password);
    setUser(loggedUser);
  }, []);

  const logout = useCallback(async () => {
    await adminApi.logout().catch(() => {});
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, checking, login, logout }), [user, checking, login, logout]);

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
};
