import React from 'react';
import styles from './AutoplayVideo.module.css';

// Recibe la ruta del video a través de "src"
const AutoplayVideo = ({ src }) => {
  return (
    <div className={styles.videoContainer}>
      <video src={src} autoPlay loop muted playsInline className={styles.videoPlayer}></video>
      {/* Aquí agregaremos los controles de play/pausa más adelante */}
    </div>
  );
};

export default AutoplayVideo;