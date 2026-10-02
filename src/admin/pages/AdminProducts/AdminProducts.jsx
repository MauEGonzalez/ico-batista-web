// /src/admin/pages/AdminProducts/AdminProducts.jsx
// Listado de prendas con búsqueda, filtros y acciones masivas (publicar / pasar a borrador varias a la vez).
import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { adminApi } from '../../api/adminApi.js';
import { CATEGORY_OPTIONS, categoryLabel } from '../../../categories.js';
import { formatPrice, hasPrice } from '../../../utils/formatPrice.js';
import { imageUrl } from '../../../utils/imageUrl.js';
import { getCategories, belongsTo } from '../../../utils/productCategories.js';
import styles from './AdminProducts.module.css';

const normalize = (text) => text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [category, setCategory] = useState('');
  const [selected, setSelected] = useState(() => new Set()); // ids elegidos con las casillas
  const [confirming, setConfirming] = useState(null);         // 'published' | 'draft' mientras se confirma
  const [bulkBusy, setBulkBusy] = useState(false);

  useEffect(() => {
    adminApi.listProducts()
      .then(setProducts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const term = normalize(search.trim());
    return products.filter((product) =>
      (status === 'all' || product.status === status) &&
      (!category || belongsTo(product, category)) &&
      (!term || normalize(`${product.name} ${product.code ?? ''} ${getCategories(product).map(categoryLabel).join(' ')}`).includes(term))
    );
  }, [products, search, status, category]);

  // Solo cuentan las elegidas que siguen visibles con los filtros actuales
  const selectedVisible = useMemo(
    () => filtered.filter((p) => selected.has(p._id)),
    [filtered, selected]
  );
  const allVisibleSelected = filtered.length > 0 && selectedVisible.length === filtered.length;

  const toggleSelect = (id) => {
    setConfirming(null);
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setConfirming(null);
    setSelected(allVisibleSelected ? new Set() : new Set(filtered.map((p) => p._id)));
  };

  const clearSelection = () => {
    setSelected(new Set());
    setConfirming(null);
  };

  const applyBulkStatus = async (nextStatus) => {
    const ids = selectedVisible.map((p) => p._id);
    setBulkBusy(true);
    try {
      const { updated, updatedIds, skipped } = await adminApi.bulkStatus(ids, nextStatus);
      const changed = new Set(updatedIds);
      setProducts((list) => list.map((p) => (changed.has(p._id) ? { ...p, status: nextStatus } : p)));
      toast.success(nextStatus === 'published'
        ? `${updated} ${updated === 1 ? 'prenda publicada' : 'prendas publicadas'}`
        : `${updated} ${updated === 1 ? 'prenda pasada' : 'prendas pasadas'} a borrador`);
      if (skipped.length > 0) {
        const list = skipped.slice(0, 5).map((p) => `${p.code || p.name} (${p.reason})`).join(', ');
        toast.error(`No se publicaron ${skipped.length}: ${list}${skipped.length > 5 ? '…' : ''}`, { duration: 7000 });
        // Quedan elegidas solo las que no se pudieron publicar, para revisarlas
        setSelected(new Set(skipped.map((p) => String(p.id))));
      } else {
        setSelected(new Set());
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBulkBusy(false);
      setConfirming(null);
    }
  };

  const counts = useMemo(() => ({
    all: products.length,
    published: products.filter((p) => p.status === 'published').length,
    draft: products.filter((p) => p.status === 'draft').length,
  }), [products]);

  // Publicar / pasar a borrador sin entrar a editar
  const toggleStatus = async (product) => {
    const next = product.status === 'published' ? 'draft' : 'published';
    if (next === 'published' && product.imageCount === 0) {
      toast.error('Agregá al menos una foto antes de publicar');
      return;
    }
    try {
      await adminApi.updateProduct(product._id, { status: next });
      setProducts((list) => list.map((p) => (p._id === product._id ? { ...p, status: next } : p)));
      toast.success(next === 'published' ? 'Prenda publicada' : 'Prenda pasada a borrador');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Prendas</h1>
          <p className={styles.subtitle}>
            {counts.published} publicadas · {counts.draft} borradores
          </p>
        </div>
        <Link to="/admin/prendas/nueva" className={styles.newButton}>+ Nueva prenda</Link>
      </div>

      <div className={styles.filters}>
        <input
          type="search"
          placeholder="Buscar por nombre, código o categoría…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.search}
          aria-label="Buscar prendas"
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Filtrar por categoría">
          <option value="">Todas las categorías</option>
          <option value="mujer">Mujer (todo)</option>
          <option value="hombre">Hombre (todo)</option>
          {CATEGORY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        <div className={styles.statusTabs} role="group" aria-label="Filtrar por estado">
          {[['all', 'Todas'], ['published', 'Publicadas'], ['draft', 'Borradores']].map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={status === value ? styles.activeTab : ''}
              aria-pressed={status === value}
              onClick={() => setStatus(value)}
            >
              {label} <span>{counts[value]}</span>
            </button>
          ))}
        </div>
      </div>

      {loading && <p className={styles.message}>Cargando prendas…</p>}
      {error && <p className={styles.errorMessage}>{error}</p>}
      {!loading && !error && filtered.length === 0 && (
        <p className={styles.message}>
          {products.length === 0 ? 'Todavía no hay prendas cargadas.' : 'Ninguna prenda coincide con la búsqueda.'}
        </p>
      )}

      {filtered.length > 0 && (
        <div className={`${styles.bulkBar} ${selectedVisible.length > 0 ? styles.bulkActive : ''}`}>
          <label className={styles.selectAll}>
            <input
              type="checkbox"
              checked={allVisibleSelected}
              ref={(el) => {
                if (el) el.indeterminate = selectedVisible.length > 0 && !allVisibleSelected;
              }}
              onChange={toggleSelectAll}
            />
            {selectedVisible.length > 0
              ? `${selectedVisible.length} ${selectedVisible.length === 1 ? 'seleccionada' : 'seleccionadas'}`
              : `Seleccionar todas (${filtered.length})`}
          </label>

          {selectedVisible.length > 0 && (
            confirming ? (
              <div className={styles.bulkActions}>
                <span>
                  ¿{confirming === 'published' ? 'Publicar' : 'Pasar a borrador'} {selectedVisible.length}{' '}
                  {selectedVisible.length === 1 ? 'prenda' : 'prendas'}?
                </span>
                <button type="button" className={styles.bulkPrimary} disabled={bulkBusy} onClick={() => applyBulkStatus(confirming)}>
                  {bulkBusy ? 'Aplicando…' : 'Sí, confirmar'}
                </button>
                <button type="button" className={styles.bulkSecondary} disabled={bulkBusy} onClick={() => setConfirming(null)}>
                  Cancelar
                </button>
              </div>
            ) : (
              <div className={styles.bulkActions}>
                <button type="button" className={styles.bulkPrimary} onClick={() => setConfirming('published')}>
                  Publicar
                </button>
                <button type="button" className={styles.bulkSecondary} onClick={() => setConfirming('draft')}>
                  Pasar a borrador
                </button>
                <button type="button" className={styles.bulkLink} onClick={clearSelection}>
                  Quitar selección
                </button>
              </div>
            )
          )}
        </div>
      )}

      <ul className={styles.list}>
        {filtered.map((product) => (
          <li key={product._id} className={`${styles.row} ${selected.has(product._id) ? styles.rowSelected : ''}`}>
            <input
              type="checkbox"
              className={styles.rowCheck}
              checked={selected.has(product._id)}
              onChange={() => toggleSelect(product._id)}
              aria-label={`Seleccionar ${product.name}`}
            />
            <Link to={`/admin/prendas/${product._id}`} className={styles.thumbLink}>
              {product.cover
                ? <img src={imageUrl(product.cover, 160)} alt="" className={styles.thumb} loading="lazy" />
                : <div className={styles.noThumb}>Sin foto</div>}
            </Link>
            <div className={styles.info}>
              <Link to={`/admin/prendas/${product._id}`} className={styles.name}>{product.name}</Link>
              <span className={styles.category}>
                {product.code && <strong className={styles.code}>{product.code}</strong>}
                {getCategories(product).map(categoryLabel).join(' · ')}
              </span>
              <span className={styles.meta}>
                {hasPrice(product.price) ? formatPrice(product.price) : 'Sin precio'}
                {' · '}{product.imageCount} {product.imageCount === 1 ? 'foto' : 'fotos'}
                {product.featured && ' · ★ Destacada'}
              </span>
            </div>
            <button
              type="button"
              className={`${styles.status} ${product.status === 'published' ? styles.published : styles.draft}`}
              onClick={() => toggleStatus(product)}
              title={product.status === 'published' ? 'Pasar a borrador' : 'Publicar'}
            >
              {product.status === 'published' ? 'Publicada' : 'Borrador'}
            </button>
            <Link to={`/admin/prendas/${product._id}`} className={styles.edit}>Editar</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminProducts;
