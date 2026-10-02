// /src/admin/pages/AdminProductForm/AdminProductForm.jsx
// Crear o editar una prenda.
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { adminApi } from '../../api/adminApi.js';
import ImageUploader from '../../components/ImageUploader/ImageUploader.jsx';
import SizesInput from '../../components/SizesInput/SizesInput.jsx';
import CategoryPicker from '../../components/CategoryPicker/CategoryPicker.jsx';
import styles from './AdminProductForm.module.css';

const EMPTY = {
  name: '',
  categories: [],
  price: '',
  sizes: [],
  measurements: '',
  description: '',
  madeToMeasure: true,
  featured: false,
  status: 'draft',
};

const toForm = (product) => ({
  name: product.name ?? '',
  categories: product.categories ?? (product.category ? [product.category] : []),
  price: product.price ?? '',
  sizes: product.sizes ?? [],
  measurements: product.measurements ?? '',
  description: product.description ?? '',
  madeToMeasure: product.madeToMeasure !== false,
  featured: Boolean(product.featured),
  status: product.status ?? 'draft',
});

const AdminProductForm = () => {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY);
  const [images, setImages] = useState([]);
  const [saved, setSaved] = useState({ form: EMPTY, images: [] }); // Último estado guardado
  const [slug, setSlug] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (isNew) return;
    adminApi.getProduct(id)
      .then((product) => {
        const loaded = toForm(product);
        setForm(loaded);
        setImages(product.images ?? []);
        setSaved({ form: loaded, images: product.images ?? [] });
        setSlug(product.slug);
        setCode(product.code ?? '');
      })
      .catch((err) => {
        toast.error(err.message);
        navigate('/admin', { replace: true });
      })
      .finally(() => setLoading(false));
  }, [id, isNew, navigate]);

  const isDirty = useMemo(
    () => JSON.stringify({ form, images }) !== JSON.stringify(saved),
    [form, images, saved]
  );

  // Aviso si se cierra la pestaña con cambios sin guardar
  useEffect(() => {
    if (!isDirty) return undefined;
    const warn = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [isDirty]);

  const setField = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleUploadingChange = useCallback((value) => setUploading(value), []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.categories.length === 0) {
      toast.error('Elegí al menos una categoría');
      return;
    }
    if (form.status === 'published' && images.length === 0) {
      toast.error('Para publicar la prenda necesita al menos una foto');
      return;
    }
    setSaving(true);
    const payload = { ...form, images, price: form.price === '' ? null : Number(form.price) };
    try {
      // Al guardar se vuelve al listado de prendas
      if (isNew) {
        await adminApi.createProduct(payload);
        toast.success(form.status === 'published' ? 'Prenda creada y publicada' : 'Prenda creada como borrador');
      } else {
        await adminApi.updateProduct(id, payload);
        toast.success('Cambios guardados');
      }
      setSaved({ form, images }); // Evita el aviso de "cambios sin guardar" al salir
      navigate('/admin');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await adminApi.deleteProduct(id);
      setSaved({ form, images }); // Evita el aviso de "cambios sin guardar"
      toast.success('Prenda eliminada');
      navigate('/admin', { replace: true });
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <p className={styles.loading}>Cargando prenda…</p>;

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.header}>
        <Link to="/admin" className={styles.back}>← Prendas</Link>
        <h1 className={styles.title}>{isNew ? 'Nueva prenda' : form.name || 'Editar prenda'}</h1>
        {code && <span className={styles.code}>{code}</span>}
        {isNew && <span className={styles.codeHint}>El código (IB-0001…) se asigna al crearla</span>}
        {!isNew && saved.form.status === 'published' && (
          <a href={`/producto/${slug}`} target="_blank" rel="noopener noreferrer" className={styles.viewLink}>
            Ver en la web ↗
          </a>
        )}
      </div>

      <section className={styles.section}>
        <h2>Fotos</h2>
        <ImageUploader images={images} setImages={setImages} onUploadingChange={handleUploadingChange} />
      </section>

      <section className={styles.section}>
        <h2>Datos</h2>
        <div className={styles.grid}>
          <label className={`${styles.field} ${styles.full}`}>
            <span>Nombre *</span>
            <input type="text" value={form.name} onChange={setField('name')} required maxLength={120} placeholder="Ej. Vestido Aurora" />
          </label>

          <div className={`${styles.field} ${styles.full}`}>
            <label htmlFor="categories">Categorías * <small>(puede ser más de una)</small></label>
            <CategoryPicker
              id="categories"
              value={form.categories}
              onChange={(categories) => setForm((f) => ({ ...f, categories }))}
            />
          </div>

          <label className={styles.field}>
            <span>Precio en pesos uruguayos</span>
            <input
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={form.price}
              onChange={setField('price')}
              placeholder="Vacío = “Consultar precio”"
            />
          </label>

          <div className={`${styles.field} ${styles.full}`}>
            <span>Talles en stock</span>
            <SizesInput value={form.sizes} onChange={(sizes) => setForm((f) => ({ ...f, sizes }))} />
          </div>

          <label className={`${styles.field} ${styles.full}`}>
            <span>Medidas <small>(opcional)</small></span>
            <input
              type="text"
              value={form.measurements}
              onChange={setField('measurements')}
              maxLength={300}
              placeholder="Ej. Busto 90 · Cintura 70 · Largo 120 cm"
            />
          </label>

          <label className={`${styles.field} ${styles.full}`}>
            <span>Descripción</span>
            <textarea
              rows={5}
              value={form.description}
              onChange={setField('description')}
              maxLength={2000}
              placeholder="Tela, corte, detalles, cuidados…"
            />
          </label>
        </div>

        <div className={styles.checks}>
          <label>
            <input type="checkbox" checked={form.madeToMeasure} onChange={setField('madeToMeasure')} />
            Se puede pedir a medida
          </label>
          <label>
            <input type="checkbox" checked={form.featured} onChange={setField('featured')} />
            Destacada (aparece en “Productos destacados”)
          </label>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Visibilidad</h2>
        <div className={styles.statusOptions} role="radiogroup" aria-label="Estado">
          <label className={form.status === 'draft' ? styles.statusActive : ''}>
            <input type="radio" name="status" value="draft" checked={form.status === 'draft'} onChange={setField('status')} />
            <strong>Borrador</strong>
            <small>No se ve en la web</small>
          </label>
          <label className={form.status === 'published' ? styles.statusActive : ''}>
            <input type="radio" name="status" value="published" checked={form.status === 'published'} onChange={setField('status')} />
            <strong>Publicada</strong>
            <small>Visible para todos</small>
          </label>
        </div>
      </section>

      <div className={styles.footer}>
        {!isNew && (
          confirmDelete ? (
            <div className={styles.confirm}>
              <span>¿Eliminar la prenda y sus fotos?</span>
              <button type="button" className={styles.deleteConfirm} onClick={handleDelete}>Sí, eliminar</button>
              <button type="button" className={styles.secondary} onClick={() => setConfirmDelete(false)}>No</button>
            </div>
          ) : (
            <button type="button" className={styles.delete} onClick={() => setConfirmDelete(true)}>Eliminar</button>
          )
        )}
        <div className={styles.footerRight}>
          {isDirty && <span className={styles.unsaved}>Cambios sin guardar</span>}
          <button type="submit" className={styles.primary} disabled={saving || uploading}>
            {uploading ? 'Subiendo fotos…' : saving ? 'Guardando…' : isNew ? 'Crear prenda' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default AdminProductForm;
