import { useEffect, useState } from 'react';
import { fmtUYU } from '../../api/entradas.js';
import styles from './TandasEditor.module.css';

const ESTADOS = { vigente: 'A la venta ahora', terminada: 'Terminada', proxima: 'Próxima', nueva: 'Nueva (sin guardar)' };
const fmtFecha = (iso) =>
  new Date(iso + 'T12:00:00').toLocaleDateString('es-UY', { weekday: 'long', day: 'numeric', month: 'long' });

/** Tandas de venta: Ico cambia hasta qué día dura cada una, el precio y el cupo. */
export default function TandasEditor({ api, onDone }) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState(null);
  const [rows, setRows] = useState([]);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  function load() {
    return api.admin.tandas().then((d) => {
      setData(d);
      setRows(d.tandas.map((t) => ({ id: t.id, nombre: t.nombre, hastaFecha: t.hastaFecha, precioUSD: t.precioUSD ?? '', cupo: t.cupo ?? '' })));
    });
  }

  useEffect(() => {
    if (open && !data) load().catch((e) => setMsg(e.message));
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (i, k) => (e) => setRows((r) => r.map((x, j) => (j === i ? { ...x, [k]: e.target.value } : x)));
  const cambios = data && (rows.length !== data.tandas.length || rows.some((r, i) => {
    const t = data.tandas[i];
    return r.hastaFecha !== t.hastaFecha || String(r.precioUSD) !== String(t.precioUSD ?? '') || String(r.cupo) !== String(t.cupo ?? '') || r.nombre !== t.nombre;
  }));

  function agregar() {
    const ult = rows[rows.length - 1];
    setRows((r) => [
      ...r,
      { id: `nueva-${Date.now()}`, nombre: `Tanda ${r.length + 1}`, hastaFecha: data.fechaEvento || ult?.hastaFecha || '', precioUSD: '', cupo: '', nueva: true },
    ]);
  }
  const quitar = (i) => () => setRows((r) => r.filter((_, j) => j !== i));

  async function save(e) {
    e.preventDefault();
    const resumen = rows
      .map((r) => `${r.nombre}: hasta el ${fmtFecha(r.hastaFecha)} (23:59), USD ${r.precioUSD}, ${r.cupo === '' ? 'sin cupo' : `cupo ${r.cupo}`}`)
      .join('\n');
    if (!window.confirm(`¿Guardar las tandas? El cambio se ve en la web enseguida.\n\n${resumen}`)) return;
    setBusy(true);
    setMsg('');
    try {
      const d = await api.admin.guardarTandas(
        rows.map((r) => ({ id: r.id, nombre: r.nombre, hastaFecha: r.hastaFecha, precioUSD: Number(r.precioUSD), cupo: r.cupo === '' ? null : Number(r.cupo) }))
      );
      setData(d);
      setMsg('Guardado. La página de entradas ya muestra los cambios.');
      onDone?.();
    } catch (err) {
      setMsg(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className={styles.wrap}>
      <button type="button" className={styles.toggle} onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        {open ? '− ' : '+ '}Tandas y precios
      </button>
      {open && !data && <p className={styles.help}>{msg || 'Cargando…'}</p>}
      {open && data && (
        <form onSubmit={save} className={styles.form}>
          <p className={styles.help}>
            Cada tanda se vende hasta las 23:59 del día elegido o hasta que se llene el cupo; después pasa sola a la
            siguiente. El precio se cobra en pesos al cambio de {data.usdUyuRate} por dólar.
          </p>
          {data.precioPrueba && <p className={styles.warn}>Ojo: está activo el precio de prueba ($ {data.precioPrueba}).</p>}
          {rows.map((r, i) => {
            const t = r.nueva ? { estado: 'nueva', vendidas: 0 } : data.tandas[i];
            return (
              <fieldset key={r.id} className={`${styles.tanda} ${t.estado === 'vigente' ? styles.vigente : ''}`}>
                <legend>
                  <input className={styles.nombre} value={r.nombre} onChange={set(i, 'nombre')} aria-label="Nombre de la tanda" maxLength={40} />
                  <span className={styles.estado}>{ESTADOS[t.estado]}</span>
                  {r.nueva && (
                    <button type="button" className={styles.quitar} onClick={quitar(i)}>
                      Quitar
                    </button>
                  )}
                </legend>
                <label>
                  <span>Hasta el día</span>
                  <input type="date" value={r.hastaFecha} onChange={set(i, 'hastaFecha')} required />
                  <small>{r.hastaFecha ? `${fmtFecha(r.hastaFecha)}, 23:59` : ''}</small>
                </label>
                <label>
                  <span>Precio (USD)</span>
                  <input type="number" min="1" step="1" inputMode="numeric" value={r.precioUSD} onChange={set(i, 'precioUSD')} required />
                  <small>{r.precioUSD ? `= ${fmtUYU(Math.round(Number(r.precioUSD) * data.usdUyuRate))}` : ''}</small>
                </label>
                <label>
                  <span>Cupo</span>
                  <input type="number" min="1" step="1" inputMode="numeric" placeholder="Sin límite" value={r.cupo} onChange={set(i, 'cupo')} />
                  <small>Vendidas: {t.vendidas}</small>
                </label>
              </fieldset>
            );
          })}
          {rows.length < 8 && (
            <button type="button" className={styles.agregar} onClick={agregar}>
              + Agregar tanda
            </button>
          )}
          <button disabled={busy || !cambios}>{busy ? 'Guardando…' : 'Guardar cambios'}</button>
          {msg && <p role="status" className={styles.help}>{msg}</p>}
        </form>
      )}
    </section>
  );
}
