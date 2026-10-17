// /src/pages/AboutPage/AboutPage.jsx
// Página "Sobre Ico": taller, retrato, líneas, colecciones y próximo desfile.

/*
  Texto basado en la presentación que escribió Ico (octubre 2026).
  Cambios de historia o de las líneas: editar acá.
*/

import React from 'react';
import { Link } from 'react-router-dom';
import { COLLECTIONS } from '../../collections.js';
import styles from './AboutPage.module.css';

const IMAGES = {
  rack: '/assets/images/about/taller-perchero.jpg',
  portrait: '/assets/images/about/ico-batista-retrato.jpg',
  machine: '/assets/images/about/taller-maquina.jpg',
};

const LINES = [
  {
    name: 'By Ico Batista',
    text: 'La línea de fiesta: prendas para eventos y ocasiones especiales.',
    instagram: 'byicobatista',
  },
  {
    name: 'Ico Batista Urbano',
    text: 'La línea urbana: prendas para el día a día, con la misma atención al corte y a la tela.',
    instagram: 'icobatistaurbano',
  },
];

const PILLARS = ['Elegancia', 'Actitud', 'Fuerza', 'Libertad'];


const AboutPage = () => {
  return (
    <>
      <title>Sobre Ico | Ico Batista</title>
      <meta
        name="description"
        content="Ico Batista, marca de diseño de autor de Gonzalo Batista, diseñador de Rocha, Uruguay. Prendas a medida y piezas únicas que combinan lo vintage con las nuevas tendencias."
      />
      <main className={styles.page}>
        <header className={styles.intro}>
          <p className={styles.eyebrow}>Diseño de autor · Rocha, Uruguay</p>
          <h1 className={styles.title}>Sobre Ico</h1>
        </header>

        <figure className={styles.hero}>
          <img
            src={IMAGES.rack}
            alt="Perchero con prendas de tweed en el taller de Ico Batista, con una máquina de coser y una pared de piedra al fondo"
            className={styles.heroImage}
            width="1314"
            height="552"
            fetchPriority="high"
          />
        </figure>

        <section className={styles.bio} aria-labelledby="about-bio">
          <div className={styles.portrait}>
            <img
              src={IMAGES.portrait}
              alt="Retrato de Ico Batista sentado en un sillón"
              width="1200"
              height="1500"
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className={styles.bioText}>
            <h2 id="about-bio" className={styles.sectionTitle}>Diseño de autor desde Rocha</h2>
            <p>
              Ico Batista es una marca de diseño de autor que se presentó en septiembre de 2023.
              Detrás está Gonzalo «Ico» Batista, diseñador nacido en el departamento de Rocha, donde
              vive y trabaja hoy, en el campo y rodeado de naturaleza. Se formó en la escuela de
              Javier De La Llana, destacado diseñador uruguayo radicado en Buenos Aires.
            </p>
            <p>
              Su sello es combinar lo vintage con las nuevas tendencias sin resignar comodidad. Cada
              diseño es único, como cada persona, y muchas prendas se hacen a medida para resaltar la
              figura de quien las lleva. Para Ico cada pieza es una obra, y como el arte, no tiene género.
            </p>
            <p>
              Trabaja con responsabilidad y sensibilidad, y busca que cada prenda transmita el amor con
              el que fue creada.
            </p>
            <ul className={styles.fabrics} aria-label="Pilares de la marca">
              {PILLARS.map((pillar) => <li key={pillar}>{pillar}</li>)}
            </ul>
          </div>
        </section>

        <section className={styles.lines} aria-labelledby="about-lines">
          <h2 id="about-lines" className={styles.sectionTitle}>Dos líneas</h2>
          <div className={styles.linesGrid}>
            {LINES.map((line) => (
              <article key={line.name} className={styles.line}>
                <h3>{line.name}</h3>
                <p>{line.text}</p>
                <a
                  href={`https://www.instagram.com/${line.instagram}/`}
                  className={styles.textLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  @{line.instagram}
                </a>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.workshop} aria-labelledby="about-workshop">
          <div className={styles.workshopText}>
            <h2 id="about-workshop" className={styles.sectionTitle}>El taller</h2>
            <p>
              El taller está en el campo, en Rocha. Entre percheros, máquinas de coser y una pared de
              piedra, las ideas se convierten en moldes, pruebas y terminaciones. Ahí se toman las
              medidas, se ajustan los detalles y se termina cada pieza.
            </p>
            <p>
              Si te interesa una prenda a medida, escríbele a Ico por WhatsApp: juntos acuerdan
              medidas, telas y plazos.
            </p>
            <Link to="/tienda" className={styles.textLink}>Ver prendas disponibles</Link>
          </div>
          <div className={styles.workshopImage}>
            <img
              src={IMAGES.machine}
              alt="Máquina de coser overlock en el taller"
              width="964"
              height="729"
              loading="lazy"
              decoding="async"
            />
          </div>
        </section>

        <section className={styles.collections} aria-labelledby="about-collections">
          <h2 id="about-collections" className={styles.sectionTitle}>Colecciones</h2>
          <ul className={styles.collectionList}>
            {COLLECTIONS.map((collection) => (
              <li key={collection.slug}>
                <Link to={`/colecciones/${collection.slug}`}>{collection.title}</Link>
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.runway} aria-labelledby="about-runway">
          <p className={styles.runwayEyebrow}>Próximo desfile</p>
          <h2 id="about-runway" className={styles.runwayTitle}>El lujo del tiempo</h2>
          <p className={styles.runwayDetails}>
            <time dateTime="2026-11-29">29 de noviembre de 2026</time>
            <span aria-hidden="true"> · </span>
            16:45 hs · Ruta 15 km 55, Rocha
          </p>
          <Link to="/entradas" className={styles.runwayButton}>
            Entradas
          </Link>
        </section>
      </main>
    </>
  );
};

export default AboutPage;
