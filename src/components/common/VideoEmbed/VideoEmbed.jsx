// /src/components/common/VideoEmbed/VideoEmbed.jsx
// Video de un desfile: YouTube/Vimeo se embeben con un iframe 16:9; los subidos a Cloudinary con <video>.
// video: { provider, url, embedUrl } tal como lo devuelve /api/runways
import React from 'react';
import { imageUrl } from '../../../utils/imageUrl.js';
import styles from './VideoEmbed.module.css';

// Cloudinary entrega el video en el formato y calidad justos para cada navegador
const optimizedVideoUrl = (url) => url.replace('/video/upload/', '/video/upload/f_auto,q_auto/');

const VideoEmbed = ({ video, title, poster }) => {
  if (!video) return null;

  if (video.provider === 'cloudinary') {
    return (
      <video
        className={styles.video}
        src={optimizedVideoUrl(video.url)}
        poster={poster ? imageUrl(poster, 1600) : undefined}
        controls
        playsInline
        preload="metadata"
      >
        Tu navegador no puede reproducir este video.
      </video>
    );
  }

  if (!video.embedUrl) return null;
  return (
    <div className={styles.frame}>
      <iframe
        src={video.embedUrl}
        title={title ? `Video: ${title}` : 'Video del desfile'}
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        loading="lazy"
      />
    </div>
  );
};

export default VideoEmbed;
