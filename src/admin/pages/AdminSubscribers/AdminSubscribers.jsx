// /src/admin/pages/AdminSubscribers/AdminSubscribers.jsx
// Personas suscriptas a "Novedades" (footer de la web): lista, búsqueda, CSV y borrar.
import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { adminApi } from '../../api/adminApi.js';
import { formatDateTime } from '../../utils/formatDate.js';
import styles from './AdminSubscribers.module.css';

// CSV compatible con Excel en español: separador ";" y BOM para que respete los acentos
const toCsv = (subscribers) => {
  const escape = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
  const rows = subscribers.map((s) => [s.email, new Date(s.createdAt).toISOString().slice(0, 10), s.source].map(escape).join(';'));
  return `\uFEFF${['email;fecha;origen', ...rows].join('\r\n')}`;
};

const downloadCsv = (subscribers) => {
  const blob = new Blob([toCsv(subscribers)], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `suscriptores-ico-batista-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const AdminSubscribers = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [confirmingId, setConfirmingId] = useState(null);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    adminApi.listSubscribers()
      .then(setSubscribers)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return term ? subscribers.filter((s) => s.email.includes(term)) : subscribers;
  }, [subscribers, search]);

  const remove = async (subscriber) => {
    setBusyId(subscriber._id);
    try {
      await adminApi.deleteSubscriber(subscriber._id);
      setSubscribers((list) => list.filter((s) => s._id !== subscriber._id));
      toast.success('Suscriptor eliminado');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusyId(null);
      setConfirmingId(null);
    }
  };

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Suscriptores</h1>
          <p className={styles.subtitle}>
            {subscribers.length} {subscribers.length === 1 ? 'persona suscripta' : 'personas suscriptas'} a “Novedades”
          </p>
        </div>
        <button
          type="button"
          className={styles.primary}
          onClick={() => downloadCsv(filtered)}
          disabled={filtered.length === 0}
        >
          Descargar CSV
        </button>
      </div>

      {subscribers.length > 0 && (
        <input
          type="search"
          placeholder="Buscar por email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.search}
          aria-label="Buscar suscriptores"
        />
      )}

      {loading && <p className={styles.message}>Cargando suscriptores…</p>}
      {error && <p className={styles.errorMessage}>{error}</p>}
      {!loading && !error && filtered.length === 0 && (
        <p className={styles.message}>
          {subscribers.length === 0
            ? 'Todavía no se suscribió nadie. El formulario está en el pie de todas las páginas de la web.'
            : 'Ningún email coincide con la búsqueda.'}
        </p>
      )}

      {filtered.length > 0 && (
        <ul className={styles.list}>
          {filtered.map((subscriber) => (
            <li key={subscriber._id} className={styles.row}>
              <div className={styles.info}>
                <a href={`mailto:${subscriber.email}`} className={styles.email}>{subscriber.email}</a>
                <span className={styles.date}>{formatDateTime(subscriber.createdAt)}</span>
              </div>
              {confirmingId === subscriber._id ? (
                <div className={styles.confirm}>
                  <span>¿Borrar?</span>
                  <button type="button" className={styles.deleteConfirm} disabled={busyId === subscriber._id} onClick={() => remove(subscriber)}>
                    Sí, borrar
                  </button>
                  <button type="button" className={styles.secondary} onClick={() => setConfirmingId(null)}>No</button>
                </div>
              ) : (
                <button type="button" className={styles.deleteLink} onClick={() => setConfirmingId(subscriber._id)}>
                  Borrar
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminSubscribers;
