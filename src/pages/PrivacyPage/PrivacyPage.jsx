import React from 'react';
import styles from '../LegalPage.module.css'; // Usamos el CSS compartido

const PrivacyPage = () => {
  return (
    <>
      <title>Política de Privacidad | Ico Batista</title>
      <main>
        <div className={styles.legalContainer}>
          <h1 className={styles.title}>Política de Privacidad</h1>
          <div className={styles.content}>
            <h2>1. Información que Recopilamos</h2>
            <p>Recopilamos información personal que usted nos proporciona voluntariamente, como su nombre, dirección de correo electrónico y dirección postal, al realizar un pedido, suscribirse a nuestro boletín o completar el formulario de contacto.</p>
            
            <h2>2. Uso de la Información</h2>
            <p>La información que recopilamos se utiliza para procesar transacciones, enviar correos electrónicos periódicos sobre nuestras colecciones y novedades, y mejorar la experiencia del cliente. No compartiremos su información personal con terceros sin su consentimiento, excepto cuando sea necesario para cumplir con la ley.</p>

            {/* ... Aquí irían más secciones de la plantilla ... */}
          </div>
        </div>
      </main>
    </>
  );
};

export default PrivacyPage;