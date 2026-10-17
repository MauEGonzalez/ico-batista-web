// /src/components/common/Lightbox/Lightbox.jsx
// Foto ampliada a pantalla completa, con flechas (y teclado) para pasar a la anterior/siguiente.
import React, { useEffect } from 'react';
import { imageUrl, imageSrcSet } from '../../../utils/imageUrl.js';
import { CloseIcon } from '../Icons/Icons.jsx';
import styles from './Lightbox.module.css';

// images: lista de fotos; index: la que se muestra (null = cerrado); onChange(nuevoIndex | null)
const Lightbox = ({ images, index, onChange, label = 'Foto' }) => {
  const isOpen = index !== null && index >= 0 && index < images.length;

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onChange(null);
      if (e.key === 'ArrowRight') onChange((index + 1) % images.length);
      if (e.key === 'ArrowLeft') onChange((index - 1 + images.length) % images.length);
    };
    window.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, index, images.length, onChange]);

  if (!isOpen) return null;
  const image = images[index];
  const many = images.length > 1;

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label={`${label} ${index + 1} de ${images.length}`} onClick={() => onChange(null)}>
      <button type="button" className={styles.close} onClick={() => onChange(null)} aria-label="Cerrar">
        <CloseIcon />
      </button>
      <img
        src={imageUrl(image, 2000)}
        srcSet={imageSrcSet(image)}
        sizes="100vw"
        alt={`${label} ${index + 1}`}
        className={styles.image}
        onClick={(e) => e.stopPropagation()}
      />
      {many && (
        <>
          <button
            type="button"
            className={`${styles.nav} ${styles.prev}`}
            onClick={(e) => { e.stopPropagation(); onChange((index - 1 + images.length) % images.length); }}
            aria-label="Foto anterior"
          >
            ‹
          </button>
          <button
            type="button"
            className={`${styles.nav} ${styles.next}`}
            onClick={(e) => { e.stopPropagation(); onChange((index + 1) % images.length); }}
            aria-label="Foto siguiente"
          >
            ›
          </button>
          <span className={styles.counter}>{index + 1} / {images.length}</span>
        </>
      )}
    </div>
  );
};

export default Lightbox;
