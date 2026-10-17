// /src/admin/pages/AdminRunwayForm/AdminRunwayForm.jsx
// Crear o editar un desfile.
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { adminApi } from '../../api/adminApi.js';
import ImageUploader from '../../components/ImageUploader/ImageUploader.jsx';
import VideoInput from '../../components/VideoInput/VideoInput.jsx';
import { parseVideoUrl } from '../../../../server/utils/videoUrl.js';
import styles from './AdminRunwayForm.module.css';

const EMPTY = {
  title: '',
  date: '',
  location: '',
  collection: '',
  description: '',
  status: 'draft',
};

const toForm = (runway) => ({
  title: runway.title ?? '',
  date: runway.date ?? '',
  location: runway.location ?? '',
  collection: runway.collection ?? '',
  description: runway.description ?? '',
  status: runway.status ?? 'draft',
});

const toVideo = (video) => (video?.url ? { url: video.url, ...(video.publicId && { publicId: video.publicId }) } : null);

const AdminRunwayForm = () => {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY);
  const [cover, setCover] = useState([]);     // [foto] o [] (el uploader trabaja con listas)
  const [gallery, setGallery] = useState([]);
  const [video, setVideo] = useState(null);
  const [saved, setSaved] = useState({ form: EMPTY, cover: [], gallery: [], video: null });
  const [slug, setSlug] = useState('');
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const uploading = uploadingCover || uploadingGallery || uploadingVideo;

  useEffect(() => {
    if (isNew) return;
    adminApi.getRunway(id)
      .then((runway) => {
        const loaded = {
          form: toForm(runway),
          cover: runway.coverImage ? [runway.coverImage] : [],
          gallery: runway.gallery ?? [],
          video: toVideo(runway.video),
        };
        setForm(loaded.form);
        setCover(loaded.cover);
        setGallery(loaded.gallery);
        setVideo(loaded.video);
        setSaved(loaded);
        setSlug(runway.slug);
      })
      .catch((err) => {
        toast.error(err.message);
        navigate('/admin/desfiles', { replace: true });
      })
      .finally(() => setLoading(false));
  }, [id, isNew, navigate]);

  const isDirty = useMemo(
    () => JSON.stringify({ form, cover, gallery, video }) !== JSON.stringify(saved),
    [form, cover, gallery, video, saved]
  );

  // Aviso si se cierra la pestaña con cambios sin guardar
  useEffect(() => {
    if (!isDirty) return undefined;
    const warn = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [isDirty]);

  const setField = (field) => (e) => setForm((current) => ({ ...current, [field]: e.target.value }));

  const handleCoverUploading = useCallback((value) => setUploadingCover(value), []);
  const handleGalleryUploading = useCallback((value) => setUploadingGallery(value), []);
  const handleVideoUploading = useCallback((value) => setUploadingVideo(value), []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (video?.url && !parseVideoUrl(video.url)) {
      toast.error('El link del video no es de YouTube ni de Vimeo');
      return;
    }
    if (form.status === 'published') {
      if (!form.date) {
        toast.error('Para publicar el desfile necesita una fecha');
        return;
      }
      if (cover.length === 0 && !video) {
        toast.error('Para publicar el desfile necesita una foto de portada o un video');
        return;
      }
    }
    setSaving(true);
    const payload = { ...form, coverImage: cover[0] ?? null, gallery, video };
    try {
      if (isNew) {
        await adminApi.createRunway(payload);
        toast.success(form.status === 'published' ? 'Desfile creado y publicado' : 'Desfile creado como borrador');
      } else {
        await adminApi.updateRunway(id, payload);
        toast.success('Cambios guardados');
      }
      setSaved({ form, cover, gallery, video }); // Evita el aviso de "cambios sin guardar" al salir
      navigate('/admin/desfiles');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await adminApi.deleteRunway(id);
      setSaved({ form, cover, gallery, video });
      toast.success('Desfile eliminado');
      navigate('/admin/desfiles', { replace: true });
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <p className={styles.loading}>Cargando desfile…</p>;

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.header}>
        <Link to="/admin/desfiles" className={styles.back}>← Desfiles</Link>
        <h1 className={styles.title}>{isNew ? 'Nuevo desfile' : form.title || 'Editar desfile'}</h1>
        {!isNew && saved.form.status === 'published' && (
          <a href={`/desfiles/${slug}`} target="_blank" rel="noopener noreferrer" className={styles.viewLink}>
            Ver en la web ↗
          </a>
        )}
      </div>

      <section className={styles.section}>
        <h2>Datos</h2>
        <div className={styles.grid}>
          <label className={`${styles.field} ${styles.full}`}>
            <span>Título *</span>
            <input type="text" value={form.title} onChange={setField('title')} required maxLength={140} placeholder="Ej. Montevideo Fashion Week 2025" />
          </label>

          <label className={styles.field}>
            <span>Fecha del desfile <small>(obligatoria para publicar)</small></span>
            <input type="date" value={form.date} onChange={setField('date')} min="1950-01-01" max="2100-12-31" />
          </label>

          <label className={styles.field}>
            <span>Lugar</span>
            <input type="text" value={form.location} onChange={setField('location')} maxLength={160} placeholder="Ej. Teatro Solís, Montevideo" />
          </label>

          <label className={`${styles.field} ${styles.full}`}>
            <span>Colección <small>(opcional)</small></span>
            <input type="text" value={form.collection} onChange={setField('collection')} maxLength={140} placeholder="Ej. El lujo del tiempo" />
          </label>

          <label className={`${styles.field} ${styles.full}`}>
            <span>Descripción</span>
            <textarea
              rows={6}
              value={form.description}
              onChange={setField('description')}
              maxLength={5000}
              placeholder="Concepto del desfile, inspiración, música, modelos…"
            />
          </label>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Video</h2>
        <p className={styles.sectionHint}>Si hay video, se muestra arriba de todo en la página del desfile. Si no, se muestra la portada.</p>
        <VideoInput value={video} onChange={setVideo} onUploadingChange={handleVideoUploading} />
      </section>

      <section className={styles.section}>
        <h2>Portada</h2>
        <p className={styles.sectionHint}>Una foto (mejor horizontal). Se usa en el listado de desfiles y cuando no hay video.</p>
        <div className={styles.coverUploader}>
          <ImageUploader
            images={cover}
            setImages={setCover}
            onUploadingChange={handleCoverUploading}
            target="runways"
            maxImages={1}
            coverBadge={false}
            addLabel="Agregar portada"
            hint=""
          />
        </div>
      </section>

      <section className={styles.section}>
        <h2>Galería</h2>
        <ImageUploader
          images={gallery}
          setImages={setGallery}
          onUploadingChange={handleGalleryUploading}
          target="runways"
          maxImages={60}
          coverBadge={false}
          hint="Arrastrá las fotos o usá las flechas para ordenarlas (hasta 60)."
        />
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
            <strong>Publicado</strong>
            <small>Visible para todos y en el menú</small>
          </label>
        </div>
      </section>

      <div className={styles.footer}>
        {!isNew && (
          confirmDelete ? (
            <div className={styles.confirm}>
              <span>¿Eliminar el desfile, sus fotos y su video?</span>
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
            {uploading ? 'Subiendo archivos…' : saving ? 'Guardando…' : isNew ? 'Crear desfile' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default AdminRunwayForm;
