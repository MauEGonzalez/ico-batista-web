// /src/pages/RunwayPage/RunwayPage.jsx
// Detalle de un desfile (/desfiles/:slug): video (o la portada), datos, descripción y galería.
import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useRunways } from '../../hooks/useRunways.js';
import VideoEmbed from '../../components/common/VideoEmbed/VideoEmbed.jsx';
import Lightbox from '../../components/common/Lightbox/Lightbox.jsx';
import { imageUrl, imageSrcSet, imageDimensions } from '../../utils/imageUrl.js';
import { formatRunwayDate, collectionPath } from '../../utils/runways.js';
import NotFoundPage from '../NotFoundPage/NotFoundPage.jsx';
import styles from './RunwayPage.module.css';

const RunwayPage = () => {
  const { id } = useParams(); // slug del desfile
  const { runways, loading } = useRunways();
  const [openPhoto, setOpenPhoto] = useState(null);

  if (loading) {
    return <main className={styles.loading} aria-busy="true" />;
  }

  const runway = runways.find((item) => item.slug === id);
  if (!runway) return <NotFoundPage />;

  const date = formatRunwayDate(runway.date);
  const collectionLink = collectionPath(runway.collection);
  const paragraphs = runway.description.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

  return (
    <main className={styles.mainContent}>
      <title>{`${runway.title} | Desfiles | Ico Batista`}</title>
      {paragraphs[0] && <meta name="description" content={paragraphs[0].slice(0, 160)} />}

      <section className={styles.media}>
        {runway.video ? (
          <div className={styles.videoWrapper}>
            <VideoEmbed video={runway.video} title={runway.title} poster={runway.coverImage} />
          </div>
        ) : runway.coverImage ? (
          <img
            src={imageUrl(runway.coverImage, 2000)}
            srcSet={imageSrcSet(runway.coverImage)}
            sizes="100vw"
            alt={runway.title}
            {...imageDimensions(runway.coverImage)}
            className={styles.cover}
          />
        ) : null}
      </section>

      <section className={styles.info}>
        <p className={styles.eyebrow}>Desfile{date && <> · <time dateTime={runway.date}>{date}</time></>}</p>
        <h1 className={styles.title}>{runway.title}</h1>
        {(runway.location || runway.collection) && (
          <p className={styles.meta}>
            {runway.location}
            {runway.location && runway.collection && <span className={styles.separator}>·</span>}
            {runway.collection && (
              collectionLink
                ? <Link to={collectionLink} className={styles.collectionLink}>Colección {runway.collection}</Link>
                : <span>Colección {runway.collection}</span>
            )}
          </p>
        )}
        {paragraphs.length > 0 && (
          <div className={styles.description}>
            {paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
          </div>
        )}
      </section>

      {runway.gallery.length > 0 && (
        <section className={styles.gallerySection} aria-label="Galería de fotos">
          <div className={styles.gallery}>
            {runway.gallery.map((image, index) => (
              <button
                key={image.url}
                type="button"
                className={styles.galleryItem}
                onClick={() => setOpenPhoto(index)}
                aria-label={`Ampliar foto ${index + 1}`}
              >
                <img
                  src={imageUrl(image, 900)}
                  srcSet={imageSrcSet(image)}
                  sizes="(max-width: 600px) 50vw, (max-width: 1000px) 50vw, 33vw"
                  alt=""
                  loading="lazy"
                  {...imageDimensions(image)}
                />
              </button>
            ))}
          </div>
        </section>
      )}

      <nav className={styles.back}>
        <Link to="/desfiles">← Todos los desfiles</Link>
      </nav>

      <Lightbox images={runway.gallery} index={openPhoto} onChange={setOpenPhoto} label={runway.title} />
    </main>
  );
};

export default RunwayPage;
