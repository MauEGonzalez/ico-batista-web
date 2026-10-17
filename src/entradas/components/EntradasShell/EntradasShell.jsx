// /src/entradas/components/EntradasShell/EntradasShell.jsx
// Envoltorio de las páginas del desfile: aplica la estética del evento (fondo off-white, serif)
// sin afectar al resto del sitio.
import React from 'react';
import styles from './EntradasShell.module.css';

// embedded: dentro del panel (sin fondo ni alto completo)
const EntradasShell = ({ children, embedded = false }) => (
  <div className={`${styles.root} ${embedded ? styles.embedded : ''}`}>
    {!embedded && (
      <>
        <title>Entradas · El lujo del tiempo | Ico Batista</title>
        <meta
          name="description"
          content="El lujo del tiempo: desfile de Ico Batista el 29 de noviembre de 2026 en Rocha, Uruguay. Comprá tu entrada online."
        />
      </>
    )}
    {children}
  </div>
);

export default EntradasShell;
