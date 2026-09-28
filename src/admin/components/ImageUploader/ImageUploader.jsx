// /src/admin/components/ImageUploader/ImageUploader.jsx
// Subir fotos (arrastrando o eligiendo), ver el progreso, ordenarlas y quitarlas.
// La primera foto es la portada de la prenda.
import React, { useEffect, useRef, useState } from 'react';
import { uploadImage } from '../../utils/uploadImage.js';
import { imageUrl } from '../../../utils/imageUrl.js';
import styles from './ImageUploader.module.css';

const MAX_PARALLEL = 3; // Fotos subiendo a la vez

// images: fotos ya subidas. setImages: setter de estado (acepta función).
const ImageUploader = ({ images, setImages, onUploadingChange = () => {} }) => {
  const [uploads, setUploads] = useState([]); // Fotos subiendo: { tempId, name, preview, progress, error }
  const [dragOver, setDragOver] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const inputRef = useRef(null);

  const activeUploads = uploads.filter((u) => !u.error).length;
  useEffect(() => { onUploadingChange(activeUploads > 0); }, [activeUploads, onUploadingChange]);

  // Libera las vistas previas al desmontar
  const uploadsRef = useRef(uploads);
  uploadsRef.current = uploads;
  useEffect(() => () => uploadsRef.current.forEach((u) => URL.revokeObjectURL(u.preview)), []);

  const updateUpload = (tempId, changes) =>
    setUploads((list) => list.map((u) => (u.tempId === tempId ? { ...u, ...changes } : u)));

  const handleFiles = async (fileList) => {
    const files = [...fileList].filter((file) => file.type.startsWith('image/') || /\.(heic|heif)$/i.test(file.name));
    if (files.length === 0) return;

    const queue = files.map((file) => ({
      file,
      tempId: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    }));
    setUploads((list) => [
      ...list,
      ...queue.map(({ file, tempId }) => ({ tempId, name: file.name, preview: URL.createObjectURL(file), progress: 0 })),
    ]);

    // Sube de a MAX_PARALLEL fotos, respetando el orden en que se eligieron
    const results = new Array(queue.length);
    let next = 0;
    const worker = async () => {
      while (next < queue.length) {
        const index = next;
        next += 1;
        const { file, tempId } = queue[index];
        try {
          results[index] = await uploadImage(file, (progress) => updateUpload(tempId, { progress }));
          setUploads((list) => {
            const done = list.find((u) => u.tempId === tempId);
            if (done) URL.revokeObjectURL(done.preview);
            return list.filter((u) => u.tempId !== tempId);
          });
        } catch (error) {
          updateUpload(tempId, { error: error.message });
        }
      }
    };
    await Promise.all(Array.from({ length: Math.min(MAX_PARALLEL, queue.length) }, worker));
    const uploaded = results.filter(Boolean);
    if (uploaded.length > 0) setImages((list) => [...list, ...uploaded]);
  };

  const dismissUpload = (tempId) =>
    setUploads((list) => {
      const item = list.find((u) => u.tempId === tempId);
      if (item) URL.revokeObjectURL(item.preview);
      return list.filter((u) => u.tempId !== tempId);
    });

  const move = (from, to) => {
    if (to < 0 || to >= images.length || from === to) return;
    setImages((list) => {
      const copy = [...list];
      const [item] = copy.splice(from, 1);
      copy.splice(to, 0, item);
      return copy;
    });
  };

  const remove = (index) => setImages((list) => list.filter((_, i) => i !== index));

  return (
    <div className={styles.uploader}>
      <div className={styles.grid}>
        {images.map((image, index) => (
          <figure
            key={image.publicId}
            className={`${styles.item} ${draggedIndex === index ? styles.dragging : ''}`}
            draggable
            onDragStart={() => setDraggedIndex(index)}
            onDragEnd={() => setDraggedIndex(null)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (draggedIndex !== null) move(draggedIndex, index);
              setDraggedIndex(null);
            }}
          >
            <img src={imageUrl(image, 300)} alt={`Foto ${index + 1}`} className={styles.image} />
            {index === 0 && <span className={styles.cover}>Portada</span>}
            <div className={styles.controls}>
              <button type="button" onClick={() => move(index, index - 1)} disabled={index === 0} aria-label="Mover a la izquierda">←</button>
              <button type="button" onClick={() => move(index, index + 1)} disabled={index === images.length - 1} aria-label="Mover a la derecha">→</button>
              <button type="button" onClick={() => remove(index)} className={styles.remove} aria-label="Quitar foto">✕</button>
            </div>
          </figure>
        ))}

        {uploads.map((upload) => (
          <figure key={upload.tempId} className={`${styles.item} ${styles.uploading}`}>
            <img src={upload.preview} alt="" className={styles.image} />
            {upload.error ? (
              <div className={styles.uploadError}>
                <span>{upload.error}</span>
                <button type="button" onClick={() => dismissUpload(upload.tempId)}>Cerrar</button>
              </div>
            ) : (
              <div className={styles.progress}>
                <div className={styles.progressBar} style={{ width: `${upload.progress}%` }} />
                <span>{upload.progress < 100 ? `${upload.progress}%` : 'Procesando…'}</span>
              </div>
            )}
          </figure>
        ))}

        <button
          type="button"
          className={`${styles.dropzone} ${dragOver ? styles.dropzoneActive : ''}`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            if (draggedIndex === null) setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (draggedIndex === null) handleFiles(e.dataTransfer.files);
          }}
        >
          <span className={styles.plus}>+</span>
          <span>Agregar fotos</span>
          <small>Arrastralas acá o tocá para elegir</small>
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = ''; // Permite volver a elegir la misma foto
        }}
      />
      <p className={styles.hint}>
        La primera foto es la portada. Arrastrá las fotos o usá las flechas para ordenarlas.
      </p>
    </div>
  );
};

export default ImageUploader;
