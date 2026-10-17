// /src/admin/pages/AdminEntradas/AdminEntradas.jsx
// Pestaña "Entradas" del panel: ventas, lista de ingreso, cortesías y CSV del desfile.
// Usa la misma sesión del panel (cookie), no una clave aparte.
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { createEntradasApi } from '../../../entradas/api/entradas.js';
import EntradasPanel from '../../../entradas/components/AdminEntradas/AdminEntradas.jsx';
import EntradasShell from '../../../entradas/components/EntradasShell/EntradasShell.jsx';
import styles from './AdminEntradas.module.css';

const AdminEntradas = () => {
  const navigate = useNavigate();
  const api = useMemo(() => createEntradasApi(), []);
  return (
    <div className={styles.page}>
      <EntradasShell embedded>
        <EntradasPanel api={api} onAuthError={() => navigate('/admin/login', { state: { from: '/admin/entradas' } })} />
      </EntradasShell>
    </div>
  );
};

export default AdminEntradas;
