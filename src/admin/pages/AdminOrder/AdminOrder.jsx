// /src/admin/pages/AdminOrder/AdminOrder.jsx
// "Orden y vista previa": definir en qué orden aparecen las prendas en la web
// y ver al lado cómo queda la página real (en compu o en celular).
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { adminApi } from '../../api/adminApi.js';
import { SECTION_OPTIONS } from '../../../categories.js';
import { belongsTo } from '../../../utils/productCategories.js';
import { imageUrl } from '../../../utils/imageUrl.js';
import styles from './AdminOrder.module.css';

const DEVICES = {
  desktop: { label: 'Computadora', width: 1280 },
  mobile: { label: 'Celular', width: 390 },
};

// Reemplaza, dentro del orden general, las posiciones que ocupan las prendas de la sección
// por el nuevo orden de esa sección. Así reordenar "Vestidos" no desordena el resto.
const mergeOrder = (globalIds, sectionIds) => {
  const inSection = new Set(sectionIds);
  const result = [...globalIds];
  let next = 0;
  result.forEach((id, index) => {
    if (inSection.has(id)) {
      result[index] = sectionIds[next];
      next += 1;
    }
  });
  return result;
};

const moveItem = (list, from, to) => {
  const copy = [...list];
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
};

// Vista previa: la web real dentro de un iframe, escalada para que entre en la columna
const Preview = ({ url, device, reloadKey }) => {
  const frameRef = useRef(null);
  const [box, setBox] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const element = frameRef.current;
    if (!element) return undefined;
    const observer = new ResizeObserver(([entry]) => {
      setBox({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const deviceWidth = DEVICES[device].width;
  const scale = box.width ? Math.min(1, box.width / deviceWidth) : 1;
  const src = `${url}${url.includes('?') ? '&' : '?'}preview=${reloadKey}`;

  return (
    <div ref={frameRef} className={styles.previewFrame}>
      {box.width > 0 && (
        <iframe
          key={src + device}
          title="Vista previa de la web"
          src={src}
          className={styles.iframe}
          style={{
            width: deviceWidth,
            height: box.height / scale,
            transform: `scale(${scale})`,
            left: Math.max(0, (box.width - deviceWidth * scale) / 2),
          }}
        />
      )}
    </div>
  );
};

const AdminOrder = () => {
  const [products, setProducts] = useState([]);
  const [order, setOrder] = useState([]);       // ids publicados en el orden actual (con cambios sin guardar)
  const [savedOrder, setSavedOrder] = useState([]);
  const [section, setSection] = useState('');
  const [device, setDevice] = useState('desktop');
  const [reloadKey, setReloadKey] = useState(() => Date.now());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);

  useEffect(() => {
    adminApi.listProducts()
      .then((list) => {
        const published = list
          .filter((p) => p.status === 'published')
          .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
        setProducts(published);
        const ids = published.map((p) => p._id);
        setOrder(ids);
        setSavedOrder(ids);
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  const byId = useMemo(() => new Map(products.map((p) => [p._id, p])), [products]);
  const sectionInfo = SECTION_OPTIONS.find((option) => option.value === section);
  const visibleIds = useMemo(
    () => order.filter((id) => !section || belongsTo(byId.get(id), section)),
    [order, section, byId]
  );
  const isDirty = order.join() !== savedOrder.join();

  // Aviso si se cierra la pestaña con cambios sin guardar
  useEffect(() => {
    if (!isDirty) return undefined;
    const warn = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [isDirty]);

  const move = (from, to) => {
    if (to < 0 || to >= visibleIds.length || from === to) return;
    setOrder((current) => mergeOrder(current, moveItem(visibleIds, from, to)));
  };

  const save = async () => {
    setSaving(true);
    try {
      await adminApi.saveOrder(order);
      setSavedOrder(order);
      setReloadKey(Date.now()); // Recarga la vista previa con el orden nuevo
      toast.success('Orden guardado: ya se ve así en la web');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className={styles.message}>Cargando prendas…</p>;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Orden y vista previa</h1>
          <p className={styles.subtitle}>
            Arrastrá las prendas (o usá las flechas) para elegir en qué orden aparecen en la web.
            Solo se muestran las publicadas.
          </p>
        </div>
        <div className={styles.headerActions}>
          {isDirty && (
            <button type="button" className={styles.secondary} onClick={() => setOrder(savedOrder)} disabled={saving}>
              Descartar cambios
            </button>
          )}
          <button type="button" className={styles.primary} onClick={save} disabled={!isDirty || saving}>
            {saving ? 'Guardando…' : isDirty ? 'Guardar orden' : 'Orden guardado'}
          </button>
        </div>
      </div>

      <div className={styles.toolbar}>
        <select value={section} onChange={(e) => setSection(e.target.value)} aria-label="Sección de la web">
          <option value="">Todas las prendas publicadas ({order.length})</option>
          {SECTION_OPTIONS.map((option) => {
            const count = order.filter((id) => belongsTo(byId.get(id), option.value)).length;
            return (
              <option key={option.value} value={option.value} disabled={count === 0}>
                {option.label} ({count})
              </option>
            );
          })}
        </select>
        <div className={styles.deviceTabs} role="group" aria-label="Ver la vista previa en">
          {Object.entries(DEVICES).map(([key, { label }]) => (
            <button
              key={key}
              type="button"
              className={device === key ? styles.activeTab : ''}
              aria-pressed={device === key}
              onClick={() => setDevice(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.workspace}>
        <section className={styles.editor} aria-label="Orden de las prendas">
          {visibleIds.length === 0 ? (
            <p className={styles.message}>No hay prendas publicadas en esta sección.</p>
          ) : (
            <ol className={styles.grid}>
              {visibleIds.map((id, index) => {
                const product = byId.get(id);
                return (
                  <li
                    key={id}
                    className={`${styles.card} ${dragIndex === index ? styles.dragging : ''}`}
                    draggable
                    onDragStart={() => setDragIndex(index)}
                    onDragEnd={() => setDragIndex(null)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (dragIndex !== null) move(dragIndex, index);
                      setDragIndex(null);
                    }}
                  >
                    <span className={styles.position}>{index + 1}</span>
                    {product.cover
                      ? <img src={imageUrl(product.cover, 300)} alt="" className={styles.image} draggable={false} loading="lazy" />
                      : <div className={styles.noImage}>Sin foto</div>}
                    <div className={styles.cardInfo}>
                      <span className={styles.name}>{product.name}</span>
                      {product.code && <span className={styles.code}>{product.code}</span>}
                    </div>
                    <div className={styles.controls}>
                      <button type="button" onClick={() => move(index, 0)} disabled={index === 0} title="Mover al principio" aria-label="Mover al principio">⇤</button>
                      <button type="button" onClick={() => move(index, index - 1)} disabled={index === 0} title="Mover antes" aria-label="Mover antes">←</button>
                      <button type="button" onClick={() => move(index, index + 1)} disabled={index === visibleIds.length - 1} title="Mover después" aria-label="Mover después">→</button>
                      <button type="button" onClick={() => move(index, visibleIds.length - 1)} disabled={index === visibleIds.length - 1} title="Mover al final" aria-label="Mover al final">⇥</button>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </section>

        <aside className={`${styles.preview} ${styles[device]}`} aria-label="Vista previa">
          <div className={styles.previewHeader}>
            <span>Vista previa{sectionInfo ? `: ${sectionInfo.label}` : ''}</span>
            {sectionInfo && (
              <a href={sectionInfo.url} target="_blank" rel="noopener noreferrer">Abrir ↗</a>
            )}
          </div>
          {sectionInfo ? (
            <>
              {isDirty && <p className={styles.previewNote}>Guardá el orden para verlo reflejado acá.</p>}
              <Preview url={sectionInfo.url} device={device} reloadKey={reloadKey} />
            </>
          ) : (
            <p className={styles.previewEmpty}>
              Elegí una sección arriba (por ejemplo “Mujer › Formal › Fiesta”) para ver cómo se ve en la web.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
};

export default AdminOrder;
