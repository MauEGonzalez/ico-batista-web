// /src/pages/RunwaysPage/RunwaysPage.jsx
// Listado de desfiles publicados (/desfiles), los más recientes primero.
import React from 'react';
import { Link } from 'react-router-dom';
import { useRunways } from '../../hooks/useRunways.js';
import { imageUrl, imageSrcSet } from '../../utils/imageUrl.js';
import { formatRunwayDate, runwayThumbnail } from '../../utils/runways.js';
import styles from './RunwaysPage.module.css';

const RunwaysPage = () => {
  const { runways, loading, error } = useRunways();

  return (
    <main className={styles.mainContent}>
      <title>Desfiles | Ico Batista</title>
      <meta name="description" content="Desfiles de Ico Batista: videos, fotos y colecciones presentadas en pasarela." />

      <section className={styles.header}>
        <p className={styles.eyebrow}>Pasarela</p>
        <h1 className={styles.title}>Desfiles</h1>
      </section>

      <section className={styles.listContainer}>
        {loading ? (
          <p className={styles.empty}>Cargando desfiles…</p>
        ) : error ? (
          <p className={styles.empty}>No pudimos cargar los desfiles. Prueba recargar la página.</p>
        ) : runways.length === 0 ? (
          <p className={styles.empty}>Muy pronto podrás ver aquí los desfiles de Ico.</p>
        ) : (
          <ul className={`${styles.list} ${runways.length === 1 ? styles.single : ''}`}>
            {runways.map((runway) => {
              const thumbnail = runwayThumbnail(runway);
              const meta = [formatRunwayDate(runway.date), runway.location].filter(Boolean).join(' · ');
              return (
                <li key={runway.slug}>
                  <Link to={`/desfiles/${runway.slug}`} className={styles.card}>
                    <div className={styles.media}>
                      {thumbnail ? (
                        <img
                          src={imageUrl(thumbnail, 1000)}
                          srcSet={imageSrcSet(thumbnail)}
                          sizes="(max-width: 900px) 100vw, 50vw"
                          alt=""
                          loading="lazy"
                          className={styles.image}
                        />
                      ) : (
                        <span className={styles.noImage}>{runway.title}</span>
                      )}
                      {runway.video && <span className={styles.play} aria-hidden="true">▶</span>}
                    </div>
                    <div className={styles.info}>
                      {meta && <p className={styles.meta}>{meta}</p>}
                      <h2 className={styles.cardTitle}>{runway.title}</h2>
                      {runway.collection && <p className={styles.collection}>Colección {runway.collection}</p>}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
};

export default RunwaysPage;
