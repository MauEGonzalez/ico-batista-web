// /src/admin/components/AdminLayout/AdminLayout.jsx
// Estructura del panel. Si no hay sesión, manda al login.
import React from 'react';
import { Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../../context/adminAuthValue.js';
import Logo from '../../../components/common/Logo/Logo.jsx';
import styles from './AdminLayout.module.css';

const AdminLayout = () => {
  const { user, checking, logout } = useAdminAuth();
  const location = useLocation();

  if (checking) {
    return <div className={styles.loading}>Cargando…</div>;
  }
  if (!user) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return (
    <div className={styles.layout}>
      <header className={styles.topbar}>
        <Link to="/admin" className={styles.brand}>
          <Logo />
          <span className={styles.badge}>Panel</span>
        </Link>
        <nav className={styles.actions}>
          <a href="/" target="_blank" rel="noopener noreferrer" className={styles.link}>Ver la web ↗</a>
          <span className={styles.user}>{user.name || user.email}</span>
          <button type="button" onClick={logout} className={styles.logout}>Salir</button>
        </nav>
      </header>
      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
