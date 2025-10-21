import React from 'react';
import Header from '../../components/layout/Header/Header.jsx';
import Footer from '../../components/layout/Footer/Footer.jsx';
import styles from '../LegalPage.module.css'; // Usamos el CSS compartido

const TermsPage = () => {
  return (
    <div>
      <Header />
      <main>
        <div className={styles.legalContainer}>
          <h1 className={styles.title}>Términos y Condiciones</h1>
          <div className={styles.content}>
            <h2>1. Aceptación de los Términos</h2>
            <p>Al acceder y utilizar este sitio web, usted acepta y se compromete a cumplir con los términos y condiciones de uso descritos en este documento. Si no está de acuerdo con alguna parte de los términos, no podrá utilizar nuestro servicio.</p>
            
            <h2>2. Propiedad Intelectual</h2>
            <p>Todo el contenido presente en este sitio, incluyendo pero no limitado a textos, gráficos, logos, imágenes, y diseños de las prendas, es propiedad de Ico Batista y está protegido por las leyes de derechos de autor y propiedad intelectual.</p>

            {/* ... Aquí irían más secciones de la plantilla ... */}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsPage;