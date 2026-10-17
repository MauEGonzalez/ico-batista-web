// /src/pages/AboutPage/AboutPage.jsx
// Página "Sobre Ico": taller, retrato, líneas, colecciones y próximo desfile.

/*
  IMPORTANTE: este texto lo tiene que revisar Ico antes de publicar.
  Se escribió solo con lo que sabemos (sin estudios, fechas ni premios).
  Si Ico quiere sumar su historia, va en la sección del retrato.
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
    text: 'La línea formal: prendas para eventos y ocasiones especiales.',
  },
  {
    name: 'Ico Batista Urbano',
    text: 'La línea urbana: prendas para todos los días, con la misma atención al corte y a la tela.',
  },
];

const FABRICS = ['Tweed', 'Terciopelo', 'Gasa', 'Satén', 'Lino'];


const AboutPage = () => {
  return (
    <>
      <title>Sobre Ico | Ico Batista</title>
      <meta
        name="description"
        content="Ico Batista, diseñador uruguayo. Prendas a medida y piezas únicas en stock, hechas en su taller."
      />
      <main className={styles.page}>
        <header className={styles.intro}>
          <p className={styles.eyebrow}>Ico Batista · Diseñador uruguayo</p>
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
            <h2 id="about-bio" className={styles.sectionTitle}>Prendas con nombre propio</h2>
            <p>
              Ico Batista diseña y confecciona ropa para hombre y mujer. Trabaja de dos maneras:
              prendas a medida, que se piensan junto a cada persona, y piezas en stock, muchas de
              ellas únicas, hechas en un solo talle y que no se vuelven a confeccionar.
            </p>
            <p>
              Cada prenda empieza por la tela. Tweed, terciopelo, gasa, satén y lino son parte de
              su vocabulario, y de su elección depende la caída, el peso y el carácter de la pieza.
            </p>
            <ul className={styles.fabrics} aria-label="Telas con las que trabaja">
              {FABRICS.map((fabric) => <li key={fabric}>{fabric}</li>)}
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
              </article>
            ))}
          </div>
        </section>

        <section className={styles.workshop} aria-labelledby="about-workshop">
          <div className={styles.workshopText}>
            <h2 id="about-workshop" className={styles.sectionTitle}>El taller</h2>
            <p>
              Entre percheros con prendas de tweed, máquinas de coser y una pared de piedra, las
              ideas se convierten en moldes, pruebas y terminaciones. Ahí se toman las medidas, se
              ajustan los detalles y se termina cada pieza.
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
