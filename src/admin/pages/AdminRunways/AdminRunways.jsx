// /src/admin/pages/AdminRunways/AdminRunways.jsx
// Listado de desfiles: publicar / pasar a borrador, editar y eliminar.
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { adminApi } from '../../api/adminApi.js';
import { imageUrl } from '../../../utils/imageUrl.js';
import { formatDay } from '../../utils/formatDate.js';
import styles from './AdminRunways.module.css';

const AdminRunways = () => {
  const [runways, setRunways] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmingId, setConfirmingId] = useState(null); // Desfile que se está por eliminar
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    adminApi.listRunways()
      .then(setRunways)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const published = runways.filter((r) => r.status === 'published').length;

  const toggleStatus = async (runway) => {
    const next = runway.status === 'published' ? 'draft' : 'published';
    setBusyId(runway._id);
    try {
      await adminApi.updateRunway(runway._id, { status: next });
      setRunways((list) => list.map((r) => (r._id === runway._id ? { ...r, status: next } : r)));
      toast.success(next === 'published' ? 'Desfile publicado' : 'Desfile pasado a borrador');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (runway) => {
    setBusyId(runway._id);
    try {
      await adminApi.deleteRunway(runway._id);
      setRunways((list) => list.filter((r) => r._id !== runway._id));
      toast.success('Desfile eliminado');
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
          <h1 className={styles.title}>Desfiles</h1>
          <p className={styles.subtitle}>
            {published} {published === 1 ? 'publicado' : 'publicados'} · {runways.length - published} {runways.length - published === 1 ? 'borrador' : 'borradores'}
          </p>
        </div>
        <Link to="/admin/desfiles/nuevo" className={styles.newButton}>+ Nuevo desfile</Link>
      </div>

      <p className={styles.help}>
        “Desfiles” aparece en el menú de la web recién cuando hay al menos un desfile publicado.
      </p>

      {loading && <p className={styles.message}>Cargando desfiles…</p>}
      {error && <p className={styles.errorMessage}>{error}</p>}
      {!loading && !error && runways.length === 0 && (
        <p className={styles.message}>Todavía no hay desfiles cargados.</p>
      )}

      {runways.length > 0 && (
        <ul className={styles.list}>
          {runways.map((runway) => (
            <li key={runway._id} className={styles.row}>
              <Link to={`/admin/desfiles/${runway._id}`} className={styles.thumbLink}>
                {runway.cover
                  ? <img src={imageUrl(runway.cover, 240)} alt="" className={styles.thumb} loading="lazy" />
                  : <div className={styles.noThumb}>{runway.hasVideo ? 'Video' : 'Sin portada'}</div>}
              </Link>
              <div className={styles.info}>
                <Link to={`/admin/desfiles/${runway._id}`} className={styles.name}>{runway.title}</Link>
                <span className={styles.meta}>
                  {[formatDay(runway.date) || 'Sin fecha', runway.location].filter(Boolean).join(' · ')}
                </span>
                <span className={styles.meta}>
                  {runway.collection && <>{runway.collection} · </>}
                  {runway.galleryCount} {runway.galleryCount === 1 ? 'foto' : 'fotos'}
                  {runway.hasVideo && ' · con video'}
                </span>
              </div>

              {confirmingId === runway._id ? (
                <div className={styles.confirm}>
                  <span>¿Eliminar el desfile, sus fotos y su video?</span>
                  <button type="button" className={styles.deleteConfirm} disabled={busyId === runway._id} onClick={() => remove(runway)}>
                    {busyId === runway._id ? 'Eliminando…' : 'Sí, eliminar'}
                  </button>
                  <button type="button" className={styles.secondary} onClick={() => setConfirmingId(null)}>No</button>
                </div>
              ) : (
                <div className={styles.actions}>
                  <button
                    type="button"
                    className={`${styles.status} ${runway.status === 'published' ? styles.published : styles.draft}`}
                    onClick={() => toggleStatus(runway)}
                    disabled={busyId === runway._id}
                    title={runway.status === 'published' ? 'Pasar a borrador' : 'Publicar'}
                  >
                    {runway.status === 'published' ? 'Publicado' : 'Borrador'}
                  </button>
                  <Link to={`/admin/desfiles/${runway._id}`} className={styles.link}>Editar</Link>
                  <button type="button" className={styles.deleteLink} onClick={() => setConfirmingId(runway._id)}>Eliminar</button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminRunways;
