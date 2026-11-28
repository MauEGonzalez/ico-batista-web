import { useCallback, useEffect, useRef, useState } from 'react';
import { fmtUYU } from '../../api/entradas.js';
import IngresoRapido from '../IngresoRapido/IngresoRapido.jsx';
import ListaEntradas from '../ListaEntradas/ListaEntradas.jsx';
import CobroPuerta from '../CobroPuerta/CobroPuerta.jsx';
import styles from './PuertaPanel.module.css';

const fmtNota = (iso) =>
  new Date(iso).toLocaleString('es-UY', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

/**
 * Pantalla de la puerta: notas de Ico, control de ingreso (código o búsqueda) y cobro de entradas.
 * No muestra lo recaudado.
 */
export default function PuertaPanel({ api, onAuthError }) {
  const [info, setInfo] = useState(null);
  const [lista, setLista] = useState(null);
  const [q, setQ] = useState('');
  const [estado, setEstado] = useState('');
  const [vista, setVista] = useState('ingreso');
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
      const params = { limit: 100 };
      if (q) params.q = q;
      if (estado) params.estado = estado;
      const [i, l] = await Promise.all([api.puerta.info(), api.puerta.lista(params)]);
      setInfo(i);
      setLista(l);
      setError('');
    } catch (e) {
      handle(e);
    } finally {
      setLoading(false);
    }
  }, [api, handle]);

  useEffect(() => {
    const t = setTimeout(refresh, 250);
    return () => clearTimeout(t);
  }, [q, estado, refresh]);

  useEffect(() => {
    const t = setInterval(refresh, 20000);
    return () => clearInterval(t);
  }, [refresh]);

  const act = (fn) => async (code) => {
    try {
      await fn(code);
      await refresh();
    } catch (e) {
      handle(e);
      if (e.status !== 401) alert(e.message);
    }
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.top}>
        <div>
          <h1 className={styles.title}>Puerta</h1>
          {info && (
            <p className={styles.sub}>
              {info.evento.nombre} · {info.evento.horario}
            </p>
          )}
        </div>
        {info && (
          <div className={styles.count} aria-label="Ingresos">
            <strong>{info.ingresaron}</strong>
            <span>ingresaron · faltan {info.faltanIngresar}</span>
          </div>
        )}
      </div>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      {info?.notas?.length > 0 && (
        <section className={styles.notas} aria-label="Notas para la puerta">
          <h2>Para tener en cuenta</h2>
          <ul>
            {info.notas.map((n) => (
              <li key={n.id}>
                <p>{n.texto}</p>
                <small>{fmtNota(n.at)}</small>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className={styles.tabs} role="tablist">
        <button role="tab" aria-selected={vista === 'ingreso'} className={vista === 'ingreso' ? styles.on : ''} onClick={() => setVista('ingreso')}>
          Controlar ingreso
        </button>
        <button role="tab" aria-selected={vista === 'cobrar'} className={vista === 'cobrar' ? styles.on : ''} onClick={() => setVista('cobrar')}>
          Cobrar entradas
        </button>
      </div>

      {vista === 'ingreso' ? (
        <>
          <IngresoRapido api={api} ingresar={api.puerta.ingreso} onDone={refresh} />
          <ListaEntradas
            data={lista}
            q={q}
            estado={estado}
            loading={loading}
            onQ={setQ}
            onEstado={setEstado}
            onIngreso={act((c) => api.puerta.ingreso(c))}
            onDeshacer={act((c) => api.puerta.deshacer(c))}
          />
        </>
      ) : (
        <>
          <CobroPuerta api={api} precios={info?.precios || []} onDone={refresh} />
          {info?.precios?.length > 0 && (
            <section className={styles.precios} aria-label="Precios en puerta">
              <h2>Precios en puerta</h2>
              <p className={styles.sub}>
                USD {info.precioUSD} = {fmtUYU(info.precios[0].unitUYU)} por persona. En grupo pagan menos cada uno:
              </p>
              <table>
                <tbody>
                  {info.precios.map((p) => (
                    <tr key={p.cantidad}>
                      <td>
                        {p.cantidad} persona{p.cantidad > 1 ? 's' : ''}
                      </td>
                      <td>{fmtUYU(p.unitUYU)} c/u</td>
                      <td>
                        <strong>{fmtUYU(p.totalUYU)}</strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}
        </>
      )}
    </div>
  );
}
