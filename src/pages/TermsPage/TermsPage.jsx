// /src/pages/TermsPage/TermsPage.jsx
// Términos y condiciones del sitio icobatista.com (Uruguay).
// Si cambia algo, actualizar también UPDATED_AT.

import React from 'react';
import { Link } from 'react-router-dom';
import { buildWhatsAppUrl } from '../../utils/whatsapp.js';
import styles from '../LegalPage.module.css';

const UPDATED_AT = { iso: '2026-10-16', label: '16 de octubre de 2026' };
const CONTACT_EMAIL = 'contacto@icobatista.com';
const WHATSAPP_URL = buildWhatsAppUrl('Hola Ico! Tengo una consulta sobre los términos y condiciones de la web.');

const SECTIONS = [
  { id: 'titular', title: 'Quién está detrás del sitio' },
  { id: 'uso', title: 'Uso del sitio' },
  { id: 'catalogo', title: 'Prendas y catálogo' },
  { id: 'precios', title: 'Precios' },
  { id: 'a-medida', title: 'Prendas a medida' },
  { id: 'pieza-unica', title: 'Piezas únicas' },
  { id: 'fotos', title: 'Fotos y colores' },
  { id: 'entradas', title: 'Entradas a eventos' },
  { id: 'propiedad', title: 'Propiedad intelectual' },
  { id: 'responsabilidad', title: 'Responsabilidad' },
  { id: 'ley', title: 'Ley aplicable' },
  { id: 'cambios', title: 'Cambios y contacto' },
];

const TermsPage = () => {
  return (
    <>
      <title>Términos y Condiciones | Ico Batista</title>
      <meta name="description" content="Términos y condiciones de uso del sitio de Ico Batista: catálogo, precios, prendas a medida y entradas a eventos." />
      <main>
        <article className={styles.legalContainer}>
          <header className={styles.header}>
            <h1 className={styles.title}>Términos y Condiciones</h1>
            <p className={styles.updated}>
              Última actualización: <time dateTime={UPDATED_AT.iso}>{UPDATED_AT.label}</time>
            </p>
          </header>

          <p className={styles.lead}>
            Estos términos explican cómo funciona icobatista.com. Al navegar el sitio, hacer una
            consulta o comprar una entrada, aceptas estas condiciones. Si algo no queda claro,
            escríbenos antes de seguir.
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
            <section id="titular">
              <h2>1. Quién está detrás del sitio</h2>
              <p>
                Este sitio pertenece a Gonzalo Federico Batista Rodriguez, diseñador que trabaja
                bajo la marca «Ico Batista». Puedes contactarlo por correo a{' '}
                <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> o por{' '}
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">WhatsApp (+598&nbsp;99&nbsp;861&nbsp;922)</a>.
              </p>
            </section>

            <section id="uso">
              <h2>2. Uso del sitio</h2>
              <p>
                Puedes usar el sitio para conocer las prendas, las colecciones y los eventos de Ico
                Batista, hacer consultas y comprar entradas. Te pedimos usarlo de buena fe: no
                intentar dañarlo, acceder a zonas restringidas ni usar sus contenidos con fines
                comerciales sin autorización.
              </p>
            </section>

            <section id="catalogo">
              <h2>3. Prendas y catálogo</h2>
              <p>
                Las prendas se muestran a modo de catálogo: <strong>el sitio no vende prendas en
                línea</strong>. Puedes armar tu selección y enviarla por WhatsApp, donde se
                confirman la disponibilidad, el talle, el precio final, la forma de pago y la
                entrega o retiro. La compra queda acordada recién cuando ambas partes la confirman
                por ese medio.
              </p>
            </section>

            <section id="precios">
              <h2>4. Precios</h2>
              <ul>
                <li>Los precios se publican en pesos uruguayos (UYU).</li>
                <li>
                  El valor en dólares (USD) es solo una referencia aproximada, calculada con un
                  tipo de cambio que puede no estar actualizado.
                </li>
                <li>
                  Los precios pueden cambiar sin aviso. El precio que vale es el que se confirma
                  por WhatsApp al momento de acordar la compra.
                </li>
              </ul>
            </section>

            <section id="a-medida">
              <h2>5. Prendas a medida</h2>
              <p>
                Muchas prendas se pueden hacer a medida. En ese caso, las medidas, la tela, el
                precio, los plazos de confección y la seña se acuerdan por WhatsApp antes de
                empezar. Como se trata de una prenda hecha especialmente para ti, conviene revisar
                bien las medidas y los detalles antes de confirmar.
              </p>
            </section>

            <section id="pieza-unica">
              <h2>6. Piezas únicas</h2>
              <p>
                Cuando una prenda figura como <strong>«Pieza única»</strong>, existe solo en el
                talle indicado y no se vuelve a confeccionar. Si ya fue vendida, no es posible
                reponerla.
              </p>
            </section>

            <section id="fotos">
              <h2>7. Fotos y colores</h2>
              <p>
                Cuidamos que las fotos sean fieles, pero los colores pueden variar según la luz de
                la toma y la pantalla de cada dispositivo. Si el tono exacto es importante para ti,
                pide más fotos o detalles por WhatsApp.
              </p>
            </section>

            <section id="entradas">
              <h2>8. Entradas a eventos</h2>
              <p>
                En el sitio se pueden comprar entradas para desfiles y otros eventos de Ico Batista.
              </p>
              <ul>
                <li>
                  El pago se realiza a través de Mercado Pago. Al pagar, también aplican los
                  términos de Mercado Pago.
                </li>
                <li>
                  Una vez acreditado el pago, recibes la entrada por correo electrónico con un
                  código QR único.
                </li>
                <li>
                  La entrada es personal y vale para un solo ingreso. El QR se valida en la puerta:
                  una vez usado, no permite volver a ingresar. Te recomendamos no compartirlo.
                </li>
                <li>
                  Los cambios, devoluciones y reembolsos se rigen por la normativa uruguaya de
                  relaciones de consumo (Ley N.º 17.250 y sus normas complementarias).
                </li>
                <li>
                  Si el evento se cancela, se reintegra el importe pagado por la entrada.
                </li>
              </ul>
            </section>

            <section id="propiedad">
              <h2>9. Propiedad intelectual</h2>
              <p>
                Los diseños de las prendas, las fotos, los textos, el logo y la marca «Ico Batista»
                pertenecen a su titular o se usan con autorización. No está permitido copiarlos,
                reproducirlos ni usarlos con fines comerciales sin permiso escrito. Compartir
                enlaces al sitio o a una prenda está siempre bienvenido.
              </p>
            </section>

            <section id="responsabilidad">
              <h2>10. Responsabilidad</h2>
              <p>
                Hacemos lo posible para que la información del sitio sea correcta y esté
                disponible, pero puede haber errores, demoras o interrupciones técnicas. Ante
                cualquier diferencia, vale lo que se confirme por WhatsApp o por correo. El sitio
                puede tener enlaces a servicios de terceros (como WhatsApp, Instagram o Mercado
                Pago), que tienen sus propias condiciones. Nada de lo anterior limita los derechos
                que te da la ley como consumidor.
              </p>
            </section>

            <section id="ley">
              <h2>11. Ley aplicable</h2>
              <p>
                Estos términos se rigen por las leyes de la República Oriental del Uruguay.
                Cualquier diferencia se intentará resolver primero de forma directa y amistosa.
              </p>
            </section>

            <section id="cambios">
              <h2>12. Cambios y contacto</h2>
              <p>
                Podemos actualizar estos términos. La fecha de la última actualización figura
                arriba. Para cualquier consulta, escribe a{' '}
                <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. Para saber cómo
                tratamos tus datos, lee la <Link to="/privacidad">Política de Privacidad</Link>.
              </p>
            </section>
          </div>
        </article>
      </main>
    </>
  );
};

export default TermsPage;
