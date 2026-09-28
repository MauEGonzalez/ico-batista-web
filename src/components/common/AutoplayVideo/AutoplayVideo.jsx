// /src/components/common/AutoplayVideo/AutoplayVideo.jsx

import React, { useEffect, useRef } from 'react';
import styles from './AutoplayVideo.module.css';

// Video en loop que solo se reproduce mientras está en pantalla:
// ahorra datos y batería en celulares.
// poster: imagen que se muestra mientras el video carga (opcional).
const AutoplayVideo = ({ src, poster }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {}); // Algunos navegadores bloquean el autoplay: no es un error
        } else {
          video.pause();
        }
      },
      { threshold: 0.25 }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [src]);

  return (
    <div className={styles.videoContainer}>
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        muted
        loop
        playsInline
        preload="metadata"
        className={styles.videoPlayer}
        aria-hidden="true"
      />
    </div>
  );
};

export default AutoplayVideo;
