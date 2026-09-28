// /src/admin/pages/AdminLogin/AdminLogin.jsx
import React, { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/adminAuthValue.js';
import Logo from '../../../components/common/Logo/Logo.jsx';
import styles from './AdminLogin.module.css';

const AdminLogin = () => {
  const { user, checking, login } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!checking && user) {
    return <Navigate to={location.state?.from || '/admin'} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate(location.state?.from || '/admin', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <form className={styles.card} onSubmit={handleSubmit}>
        <div className={styles.logo}><Logo /></div>
        <p className={styles.subtitle}>Panel de administración</p>

        <label className={styles.field}>
          <span>Email</span>
          <input
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />
        </label>
        <label className={styles.field}>
          <span>Contraseña</span>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        {error && <p className={styles.error} role="alert">{error}</p>}

        <button type="submit" className={styles.submit} disabled={submitting}>
          {submitting ? 'Ingresando…' : 'Ingresar'}
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;
