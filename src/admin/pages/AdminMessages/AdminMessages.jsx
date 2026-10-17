// /src/admin/pages/AdminMessages/AdminMessages.jsx
// Mensajes del formulario de /contacto: no leídos primero, marcar leído, responder por mail y borrar.
import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { adminApi } from '../../api/adminApi.js';
import { formatDateTime } from '../../utils/formatDate.js';
import styles from './AdminMessages.module.css';

// Avisa a la barra del panel que cambió la cantidad de no leídos (para el numerito de la pestaña)
const notifyUnreadChanged = () => window.dispatchEvent(new Event('admin:messages-changed'));

// No leídos primero; dentro de cada grupo, los más nuevos arriba
const sortMessages = (list) =>
  [...list].sort((a, b) => Number(a.read) - Number(b.read) || new Date(b.createdAt) - new Date(a.createdAt));

const replyLink = (message) => {
  const subject = 'Re: tu consulta a Ico Batista';
  const quoted = message.message.split('\n').map((line) => `> ${line}`).join('\n');
  const body = `Hola ${message.name.split(' ')[0]},\n\n\n\n---\nEl ${formatDateTime(message.createdAt)} escribiste:\n${quoted}`;
  // La @ va tal cual (algunos programas de mail no entienden %40); solo se escapan ? & #
  const to = message.email.replace(/[?&#]/g, encodeURIComponent);
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};

const AdminMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'
  const [confirmingId, setConfirmingId] = useState(null);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    adminApi.listMessages()
      .then(setMessages)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const unread = messages.filter((m) => !m.read).length;
  const visible = useMemo(
    () => (filter === 'unread' ? messages.filter((m) => !m.read) : messages),
    [messages, filter]
  );

  const setRead = async (message, read, { quiet = false } = {}) => {
    if (message.read === read) return;
    setBusyId(message._id);
    try {
      await adminApi.setMessageRead(message._id, read);
      setMessages((list) => sortMessages(list.map((m) => (m._id === message._id ? { ...m, read } : m))));
      notifyUnreadChanged();
      if (!quiet) toast.success(read ? 'Marcado como leído' : 'Marcado como no leído');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (message) => {
    setBusyId(message._id);
    try {
      await adminApi.deleteMessage(message._id);
      setMessages((list) => list.filter((m) => m._id !== message._id));
      notifyUnreadChanged();
      toast.success('Mensaje eliminado');
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
          <h1 className={styles.title}>Mensajes</h1>
          <p className={styles.subtitle}>
            {unread > 0 ? `${unread} sin leer · ` : ''}{messages.length} {messages.length === 1 ? 'mensaje' : 'mensajes'} del formulario de contacto
          </p>
        </div>
        {messages.length > 0 && (
          <div className={styles.filterTabs} role="group" aria-label="Filtrar mensajes">
            {[['all', 'Todos', messages.length], ['unread', 'Sin leer', unread]].map(([value, label, count]) => (
              <button
                key={value}
                type="button"
                className={filter === value ? styles.activeTab : ''}
                aria-pressed={filter === value}
                onClick={() => setFilter(value)}
              >
                {label} <span>{count}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {loading && <p className={styles.message}>Cargando mensajes…</p>}
      {error && <p className={styles.errorMessage}>{error}</p>}
      {!loading && !error && visible.length === 0 && (
        <p className={styles.message}>
          {messages.length === 0 ? 'Todavía no llegó ningún mensaje.' : 'No hay mensajes sin leer.'}
        </p>
      )}

      <ul className={styles.list}>
        {visible.map((message) => (
          <li key={message._id} className={`${styles.card} ${message.read ? '' : styles.unread}`}>
            <div className={styles.cardHeader}>
              <div className={styles.sender}>
                {!message.read && <span className={styles.dot} aria-label="Sin leer" />}
                <strong className={styles.name}>{message.name}</strong>
                <a href={`mailto:${message.email}`} className={styles.contact}>{message.email}</a>
                {message.phone && <a href={`tel:${message.phone.replace(/[^\d+]/g, '')}`} className={styles.contact}>{message.phone}</a>}
              </div>
              <time className={styles.date} dateTime={message.createdAt}>{formatDateTime(message.createdAt)}</time>
            </div>

            <p className={styles.body}>{message.message}</p>

            <div className={styles.actions}>
              <a
                href={replyLink(message)}
                className={styles.reply}
                onClick={() => setRead(message, true, { quiet: true })}
              >
                Responder
              </a>
              <button
                type="button"
                className={styles.secondary}
                disabled={busyId === message._id}
                onClick={() => setRead(message, !message.read)}
              >
                {message.read ? 'Marcar como no leído' : 'Marcar como leído'}
              </button>
              {confirmingId === message._id ? (
                <span className={styles.confirm}>
                  ¿Eliminar el mensaje?
                  <button type="button" className={styles.deleteConfirm} disabled={busyId === message._id} onClick={() => remove(message)}>
                    Sí, eliminar
                  </button>
                  <button type="button" className={styles.secondary} onClick={() => setConfirmingId(null)}>No</button>
                </span>
              ) : (
                <button type="button" className={styles.deleteLink} onClick={() => setConfirmingId(message._id)}>Eliminar</button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminMessages;
