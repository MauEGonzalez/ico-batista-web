import React from 'react';
import { useParams } from 'react-router-dom';
import Header from '../../components/layout/Header/Header.jsx';
import Footer from '../../components/layout/Footer/Footer.jsx';
import styles from './RunwayPage.module.css';

// Datos de ejemplo para los desfiles
const runwayInfo = {
  '1': {
    title: 'Desfile Primavera/Verano 2025',
    description: 'Una celebración de la fluidez y el movimiento. Filmado en los jardines escultóricos, este desfile explora la interacción entre la naturaleza y la sastrería.',
    videoSrc: '/assets/videos/desfile-1-video.mp4'
  },
  '2': {
    title: 'Desfile Otoño/Invierno 2024',
    description: 'Dramatismo y estructura. Este desfile presenta siluetas audaces en un entorno industrial, jugando con las sombras y la luz.',
    videoSrc: '/assets/videos/desfile-2-video.mp4'
  }
};

const RunwayPage = () => {
  const { id } = useParams();
  const runway = runwayInfo[id];

  if (!runway) {
    return <div>Desfile no encontrado</div>;
  }

  return (
    <div>
      <Header />
      <main className={styles.mainContent}>
        <section className={styles.videoContainer}>
          <video 
            src={runway.videoSrc} 
            controls 
            autoPlay 
            loop 
            muted 
            className={styles.videoPlayer}
          >
            Tu navegador no soporta el tag de video.
          </video>
        </section>

        <section className={styles.infoContainer}>
          <h1 className={styles.title}>{runway.title}</h1>
          <p className={styles.description}>{runway.description}</p>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default RunwayPage;