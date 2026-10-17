import styles from './ListaEntradas.module.css';

const FILTROS = [
  ['', 'Todas'],
  ['valid', 'Faltan ingresar'],
  ['used', 'Ya ingresaron'],
  ['void', 'Anuladas'],
  ['yes', 'Invitados confirmados'],
  ['pending', 'Invitados sin responder'],
  ['no', 'Invitados que no asisten'],
];

const RSVP = { yes: 'Confirmó asistencia', no: 'No asiste', pending: 'Sin respuesta' };

export default function ListaEntradas({ data, q, estado, onQ, onEstado, onIngreso, onDeshacer, onAnular, loading }) {
  return (
    <section className={styles.wrap}>
      <div className={styles.head}>
        <h2 className={styles.h}>Lista de entradas</h2>
        <span className={styles.count}>{data ? `${data.total} resultado${data.total === 1 ? '' : 's'}` : ''}</span>
      </div>
      <input
        className={styles.search}
        type="search"
        value={q}
        onChange={(e) => onQ(e.target.value)}
        placeholder="Buscar por nombre, email, celular o código"
        aria-label="Buscar entradas"
      />
      <div className={styles.chips} role="group" aria-label="Filtrar">
        {FILTROS.map(([v, label]) => (
          <button key={v} className={estado === v ? styles.active : ''} onClick={() => onEstado(v)}>
            {label}
          </button>
        ))}
      </div>

      <ul className={styles.list}>
        {data?.items.map((t) => (
          <li key={t.id} className={`${styles.row} ${styles[t.status]}`}>
            <div className={styles.info}>
              <strong>{t.nombre}</strong>
              <span className={styles.meta}>
                <code>{t.code}</code> · {t.tipo === 'cortesia' ? 'Cortesía' : t.tandaId.toUpperCase()}
                {t.email ? ` · ${t.email}` : ''}
              </span>
              {t.tipo === 'cortesia' && t.status !== 'void' && (
                <span className={`${styles.meta} ${styles[`rsvp_${t.rsvp}`] || ''}`}>{RSVP[t.rsvp] || RSVP.pending}</span>
              )}
              {t.status === 'used' && t.checkedInAt && (
                <span className={styles.meta}>
                  Ingresó {new Date(t.checkedInAt).toLocaleString('es-UY', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
            <div className={styles.actions}>
              {t.status === 'valid' && (
                <>
                  <button className={styles.primary} onClick={() => onIngreso(t.code)}>
                    Marcar ingreso
                  </button>
                  <button className={styles.ghost} onClick={() => onAnular(t.code)} title="Anular entrada">
                    Anular
                  </button>
                </>
              )}
              {t.status === 'used' && (
                <button className={styles.ghost} onClick={() => onDeshacer(t.code)}>
                  Deshacer
                </button>
              )}
              {t.status === 'void' && <span className={styles.badge}>Anulada</span>}
            </div>
          </li>
        ))}
      </ul>
      {data && data.items.length === 0 && !loading && <p className={styles.empty}>No hay entradas para mostrar.</p>}
      {data && data.total > data.items.length && (
        <p className={styles.empty}>Mostrando {data.items.length} de {data.total}. Afiná la búsqueda para ver el resto.</p>
      )}
    </section>
  );
}
