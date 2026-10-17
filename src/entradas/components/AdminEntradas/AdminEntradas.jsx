import { useCallback, useEffect, useRef, useState } from 'react';
import ResumenEntradas from '../ResumenEntradas/ResumenEntradas.jsx';
import IngresoRapido from '../IngresoRapido/IngresoRapido.jsx';
import ListaEntradas from '../ListaEntradas/ListaEntradas.jsx';
import CortesiaForm from '../CortesiaForm/CortesiaForm.jsx';
import OrdenesRevisar from '../OrdenesRevisar/OrdenesRevisar.jsx';
import styles from './AdminEntradas.module.css';

/**
 * Panel de entradas. Es independiente de cómo se autentique Ico:
 * recibe `api` (createEntradasApi con sus headers) y se puede montar dentro del panel existente.
 */
export default function AdminEntradas({ api, onAuthError }) {
  const [resumen, setResumen] = useState(null);
  const [lista, setLista] = useState(null);
  const [ordenes, setOrdenes] = useState([]);
  const [q, setQ] = useState('');
  const [estado, setEstado] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const filters = useRef({ q, estado });
  filters.current = { q, estado };

  const handle = useCallback(
    (e) => {
      if (e.status === 401) onAuthError?.();
      else setError(e.message);
    },
    [onAuthError]
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const { q, estado } = filters.current;
      const params = { limit: 300 };
      if (q) params.q = q;
      if (estado) params.estado = estado;
      const [r, l, review, failed] = await Promise.all([
        api.admin.resumen(),
        api.admin.lista(params),
        api.admin.ordenes('review'),
        api.admin.ordenes('paid'),
      ]);
      setResumen(r);
      setLista(l);
      setOrdenes([...review, ...failed.filter((o) => o.emailStatus === 'failed' && o.comprador.email)]);
      setError('');
    } catch (e) {
      handle(e);
    } finally {
      setLoading(false);
    }
  }, [api, handle]);

  // búsqueda con pequeña demora
  useEffect(() => {
    const t = setTimeout(refresh, 250);
    return () => clearTimeout(t);
  }, [q, estado, refresh]);

  // refresco automático (para ver ventas nuevas e ingresos de otros dispositivos)
  useEffect(() => {
    const t = setInterval(refresh, 20000);
    return () => clearInterval(t);
  }, [refresh]);

  const act = (fn) => async (...args) => {
    try {
      await fn(...args);
      await refresh();
    } catch (e) {
      handle(e);
      if (e.status !== 401) alert(e.message);
    }
  };

  async function exportar() {
    try {
      const blob = await api.admin.exportCsv();
      const url = URL.createObjectURL(blob);
      const a = Object.assign(document.createElement('a'), { href: url, download: 'entradas.csv' });
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      handle(e);
    }
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.top}>
        <h1 className={styles.title}>Entradas · El lujo del tiempo</h1>
        <div className={styles.topActions}>
          <button onClick={refresh}>{loading ? 'Actualizando…' : 'Actualizar'}</button>
          <button onClick={exportar}>Exportar CSV</button>
        </div>
      </div>
      {error && <p className={styles.error} role="alert">{error}</p>}
      <ResumenEntradas resumen={resumen} />
      <OrdenesRevisar ordenes={ordenes} onReenviar={act((id) => api.admin.reenviar(id))} />
      <IngresoRapido api={api} onDone={refresh} />
      <ListaEntradas
        data={lista}
        q={q}
        estado={estado}
        loading={loading}
        onQ={setQ}
        onEstado={setEstado}
        onIngreso={act((c) => api.admin.ingreso(c))}
        onDeshacer={act((c) => api.admin.deshacer(c))}
        onAnular={act(async (c) => {
          if (window.confirm('¿Anular esta entrada? Ya no va a servir para ingresar.')) await api.admin.anular(c);
        })}
      />
      <CortesiaForm api={api} onDone={refresh} />
    </div>
  );
}
