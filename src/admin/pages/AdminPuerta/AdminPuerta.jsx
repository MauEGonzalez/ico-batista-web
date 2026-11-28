// /src/admin/pages/AdminPuerta/AdminPuerta.jsx
// Pantalla de la puerta el día del evento: la usa el personal de puerta (y Ico, para ver lo mismo que ellos).
import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createEntradasApi } from '../../../entradas/api/entradas.js';
import PuertaPanel from '../../../entradas/components/PuertaPanel/PuertaPanel.jsx';
import EntradasShell from '../../../entradas/components/EntradasShell/EntradasShell.jsx';
import { useAdminAuth } from '../../context/adminAuthValue.js';
import styles from './AdminPuerta.module.css';

const AdminPuerta = () => {
  const navigate = useNavigate();
  const { user } = useAdminAuth();
  const api = useMemo(() => createEntradasApi(), []);
  return (
    <div className={styles.page}>
      {user?.role !== 'puerta' && (
        <p className={styles.preview}>
          Así ve la puerta el personal de puerta. <Link to="/admin/entradas">Volver a Entradas</Link>
        </p>
      )}
      <EntradasShell embedded>
        <PuertaPanel api={api} onAuthError={() => navigate('/admin/login', { state: { from: '/admin/puerta' } })} />
      </EntradasShell>
    </div>
  );
};

export default AdminPuerta;
