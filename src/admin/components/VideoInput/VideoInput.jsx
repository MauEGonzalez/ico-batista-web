// /src/admin/components/VideoInput/VideoInput.jsx
// Video de un desfile: pegar un link de YouTube/Vimeo o subir un archivo a Cloudinary.
// value: { url, publicId? } | null
import React, { useEffect, useRef, useState } from 'react';
import { parseVideoUrl } from '../../../../server/utils/videoUrl.js';
import { uploadVideo } from '../../utils/uploadVideo.js';
import styles from './VideoInput.module.css';

const PROVIDER_LABEL = { youtube: 'YouTube', vimeo: 'Vimeo', cloudinary: 'Video subido' };

const VideoInput = ({ value, onChange, onUploadingChange = () => {} }) => {
  const [progress, setProgress] = useState(null); // null = no está subiendo
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  useEffect(() => { onUploadingChange(progress !== null); }, [progress, onUploadingChange]);

  const url = value?.url ?? '';
  const parsed = url ? parseVideoUrl(url) : null;
  const isUploaded = parsed?.provider === 'cloudinary';

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      setError('El archivo no es un video');
      return;
    }
    setError('');
    setProgress(0);
    try {
      const uploaded = await uploadVideo(file, setProgress);
      onChange(uploaded);
    } catch (err) {
      setError(err.message);
    } finally {
      setProgress(null);
    }
  };

  if (isUploaded) {
    return (
      <div className={styles.wrapper}>
        <video src={url} controls preload="metadata" className={styles.preview} />
        <div className={styles.row}>
          <span className={styles.ok}>✓ {PROVIDER_LABEL.cloudinary}</span>
          <button type="button" className={styles.remove} onClick={() => onChange(null)}>Quitar video</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <label className={styles.field}>
        <span>Link de YouTube o Vimeo</span>
        <input
          type="url"
          inputMode="url"
          value={url}
          onChange={(e) => onChange(e.target.value.trim() ? { url: e.target.value } : null)}
          placeholder="https://www.youtube.com/watch?v=…"
          maxLength={500}
          disabled={progress !== null}
        />
      </label>
      {url && (parsed ? (
        <>
          <span className={styles.ok}>✓ Link de {PROVIDER_LABEL[parsed.provider]}</span>
          <div className={styles.embed}>
            <iframe src={parsed.embedUrl} title="Vista previa del video" allow="encrypted-media; picture-in-picture; fullscreen" allowFullScreen loading="lazy" />
          </div>
        </>
      ) : (
        <span className={styles.warning}>Ese link no es de YouTube ni de Vimeo. Copiá el link del video desde el botón “Compartir”.</span>
      ))}

      {!url && (
        <div className={styles.upload}>
          <span className={styles.or}>o</span>
          {progress !== null ? (
            <div className={styles.progress} role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
              <div className={styles.progressBar} style={{ width: `${progress}%` }} />
              <span>{progress < 100 ? `Subiendo video… ${progress}%` : 'Procesando…'}</span>
            </div>
          ) : (
            <button type="button" className={styles.uploadButton} onClick={() => inputRef.current?.click()}>
              Subir un video (hasta 100 MB)
            </button>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="video/*"
            hidden
            onChange={(e) => {
              handleFile(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
        </div>
      )}
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
};

export default VideoInput;
