// /src/pages/PrivacyPage/PrivacyPage.jsx
// Política de privacidad según la Ley N.º 18.331 de Protección de Datos Personales (Uruguay).
// Si se suma un proveedor nuevo (ej. otro servicio de email), agregarlo en "Quién más accede".

import React from 'react';
import { Link } from 'react-router-dom';
import { buildWhatsAppUrl } from '../../utils/whatsapp.js';
import styles from '../LegalPage.module.css';

const UPDATED_AT = { iso: '2026-10-16', label: '16 de octubre de 2026' };
const CONTACT_EMAIL = 'contacto@icobatista.com';
const WHATSAPP_URL = buildWhatsAppUrl('Hola Ico! Tengo una consulta sobre mis datos personales.');

const SECTIONS = [
  { id: 'responsable', title: 'Responsable' },
  { id: 'datos', title: 'Qué datos recopilamos y para qué' },
  { id: 'navegador', title: 'Datos guardados en tu navegador' },
  { id: 'proveedores', title: 'Quién más accede a los datos' },
  { id: 'conservacion', title: 'Cuánto tiempo los guardamos' },
  { id: 'derechos', title: 'Tus derechos' },
  { id: 'novedades', title: 'Darte de baja de las novedades' },
  { id: 'seguridad', title: 'Seguridad' },
  { id: 'autoridad', title: 'Autoridad de control' },
  { id: 'cambios', title: 'Cambios en esta política' },
];

const DATA_USES = [
  {
    title: 'Formulario de contacto',
    data: 'Nombre, email, teléfono (opcional) y tu mensaje.',
    purpose: 'Responder tu consulta.',
  },
  {
    title: 'Suscripción a novedades',
    data: 'Tu email.',
    purpose: 'Enviarte novedades sobre colecciones, desfiles y eventos. Solo si te suscribes.',
  },
  {
    title: 'Compra de entradas',
    data: 'Nombre, email y teléfono (si se pide en el formulario).',
    purpose:
      'Emitir tu entrada con código QR, enviártela por email, controlar el ingreso al evento y avisarte si hay cambios.',
  },
  {
    title: 'Consultas por WhatsApp',
    data: 'Tu número, tu nombre de perfil y lo que escribas en la conversación.',
    purpose: 'Responder sobre prendas, prendas a medida, disponibilidad, precios y entregas.',
  },
];

const PROVIDERS = [
  { name: 'Vercel', role: 'aloja el sitio web.' },
  { name: 'MongoDB Atlas', role: 'base de datos donde se guardan consultas, suscripciones y entradas.' },
  { name: 'Cloudinary', role: 'aloja las imágenes del sitio.' },
  { name: 'Mercado Pago', role: 'procesa los pagos de las entradas.' },
  { name: 'Proveedor de envío de emails', role: 'envía las entradas y las respuestas por correo.' },
  { name: 'WhatsApp (Meta)', role: 'cuando eliges escribirnos por ese medio.' },
];

const PrivacyPage = () => {
  return (
    <>
      <title>Política de Privacidad | Ico Batista</title>
      <meta name="description" content="Cómo trata Ico Batista tus datos personales: qué datos recopila, para qué, quién accede y cómo ejercer tus derechos (Ley 18.331)." />
      <main>
        <article className={styles.legalContainer}>
          <header className={styles.header}>
            <h1 className={styles.title}>Política de Privacidad</h1>
            <p className={styles.updated}>
              Última actualización: <time dateTime={UPDATED_AT.iso}>{UPDATED_AT.label}</time>
            </p>
          </header>

          <p className={styles.lead}>
            Aquí te contamos qué datos personales se recogen en icobatista.com, para qué se usan y
            qué derechos tienes. Esta política sigue la Ley N.º 18.331 de Protección de Datos
            Personales de Uruguay.
          </p>

          <nav className={styles.toc} aria-label="Contenido">
            <p className={styles.tocTitle}>Contenido</p>
            <ol>
              {SECTIONS.map((section) => (
                <li key={section.id}><a href={`#${section.id}`}>{section.title}</a></li>
              ))}
            </ol>
          </nav>

          <div className={styles.content}>
            <section id="responsable">
              <h2>1. Responsable</h2>
              <p>
                El responsable de tus datos es Gonzalo Federico Batista Rodriguez, diseñador que
                trabaja bajo la marca «Ico Batista». Contacto:{' '}
                <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> o{' '}
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">WhatsApp (+598&nbsp;99&nbsp;861&nbsp;922)</a>.
              </p>
            </section>

            <section id="datos">
              <h2>2. Qué datos recopilamos y para qué</h2>
              <p>
                Solo pedimos los datos necesarios para cada cosa que haces en el sitio, y solo
                cuando tú los das:
              </p>
              <dl className={styles.dataList}>
                {DATA_USES.map((item) => (
                  <div key={item.title} className={styles.dataItem}>
                    <dt>{item.title}</dt>
                    <dd><strong>Datos:</strong> {item.data}</dd>
                    <dd><strong>Para qué:</strong> {item.purpose}</dd>
                  </div>
                ))}
              </dl>
              <p>
                <strong>Pagos:</strong> los datos de pago los procesa directamente Mercado Pago.
                Este sitio no ve ni guarda los datos de tu tarjeta; solo recibe la confirmación de
                que el pago se aprobó.
              </p>
              <p>
                No usamos tus datos para otros fines distintos de los indicados y{' '}
                <strong>no los vendemos ni los cedemos</strong> a terceros con fines comerciales.
              </p>
            </section>

            <section id="navegador">
              <h2>3. Datos guardados en tu navegador</h2>
              <p>
                Para que el sitio recuerde tus preferencias, se guardan en tu propio navegador
                (almacenamiento local) la moneda que elegiste para ver los precios y las prendas
                que agregaste a «Mi selección». Esos datos quedan en tu dispositivo, no se envían a
                nuestros servidores y puedes borrarlos cuando quieras desde la configuración de tu
                navegador.
              </p>
            </section>

            <section id="proveedores">
              <h2>4. Quién más accede a los datos</h2>
              <p>
                Para que el sitio funcione usamos servicios de terceros que alojan o procesan datos
                por cuenta nuestra. Algunos tienen sus servidores fuera de Uruguay:
              </p>
              <ul>
                {PROVIDERS.map((provider) => (
                  <li key={provider.name}><strong>{provider.name}</strong>: {provider.role}</li>
                ))}
              </ul>
              <p>
                Además, podríamos tener que entregar datos si lo exige una autoridad competente
                conforme a la ley.
              </p>
            </section>

            <section id="conservacion">
              <h2>5. Cuánto tiempo los guardamos</h2>
              <p>
                Guardamos los datos solo el tiempo necesario para cumplir con su finalidad: las
                consultas, mientras dure la conversación y un tiempo razonable después; el email de
                novedades, hasta que te des de baja; los datos de entradas, el tiempo necesario
                para el evento y para cumplir obligaciones legales o atender reclamos. Después se
                eliminan.
              </p>
            </section>

            <section id="derechos">
              <h2>6. Tus derechos</h2>
              <p>Según la Ley N.º 18.331, en cualquier momento puedes pedir:</p>
              <ul>
                <li><strong>Acceso:</strong> saber qué datos tuyos tenemos.</li>
                <li><strong>Rectificación y actualización:</strong> corregir datos errados o desactualizados.</li>
                <li><strong>Inclusión:</strong> agregar datos que falten.</li>
                <li><strong>Supresión:</strong> que borremos tus datos.</li>
              </ul>
              <p>
                Para hacerlo, escribe a <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>{' '}
                indicando qué necesitas. Podemos pedirte algún dato para confirmar que eres el
                titular. Es gratuito.
              </p>
            </section>

            <section id="novedades">
              <h2>7. Darte de baja de las novedades</h2>
              <p>
                Puedes dejar de recibir novedades cuando quieras, escribiendo a{' '}
                <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> o usando el enlace de baja
                del correo, si lo incluye. Los emails necesarios por una compra (por ejemplo, tu
                entrada) se siguen enviando aunque te des de baja.
              </p>
            </section>

            <section id="seguridad">
              <h2>8. Seguridad</h2>
              <p>
                El sitio usa conexión segura (HTTPS) y el acceso al panel de administración está
                restringido. Aunque ningún sistema es infalible, tomamos medidas razonables para
                proteger tus datos.
              </p>
            </section>

            <section id="autoridad">
              <h2>9. Autoridad de control</h2>
              <p>
                Si consideras que tus datos no fueron tratados correctamente, puedes presentar un
                reclamo ante la Unidad Reguladora y de Control de Datos Personales (URCDP), el
                organismo de control en Uruguay
                (<a href="https://www.gub.uy/unidad-reguladora-control-datos-personales" target="_blank" rel="noopener noreferrer">gub.uy/urcdp</a>).
              </p>
            </section>

            <section id="cambios">
              <h2>10. Cambios en esta política</h2>
              <p>
                Si cambiamos esta política, publicaremos la nueva versión aquí con su fecha de
                actualización. Consulta también los <Link to="/terminos">Términos y Condiciones</Link>.
              </p>
            </section>
          </div>
        </article>
      </main>
    </>
  );
};

export default PrivacyPage;
