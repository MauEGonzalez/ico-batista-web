// /src/pages/FaqsPage/FaqsPage.jsx
// Preguntas frecuentes. Mantener coherente con Términos y Condiciones (/terminos).
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { buildWhatsAppUrl } from '../../utils/whatsapp.js';
import styles from './FaqsPage.module.css';

const WHATSAPP_URL = buildWhatsAppUrl('Hola Ico! Tengo una consulta.');

const faqData = [
  {
    question: '¿Cómo compro una prenda?',
    answer: (
      <>
        La web funciona como catálogo: elige las prendas que te gusten, agrégalas a tu selección y envíala por
        WhatsApp. Por ese medio te confirmamos la disponibilidad, el talle, el precio final, la forma de pago y la
        entrega o el retiro. La compra queda acordada cuando ambas partes la confirman.
      </>
    ),
  },
  {
    question: '¿Los talles que aparecen están disponibles?',
    answer: (
      <>
        Sí: los talles que figuran en cada prenda son los que hay en stock. Si necesitas otro talle, en la mayoría
        de los casos se puede confeccionar. Consúltanos por WhatsApp.
      </>
    ),
  },
  {
    question: '¿Qué significa «Pieza única»?',
    answer: (
      <>
        Que esa prenda existe solo en el talle indicado y no se vuelve a confeccionar. Si ya se vendió, no es
        posible reponerla.
      </>
    ),
  },
  {
    question: '¿Hacen prendas a medida?',
    answer: (
      <>
        Sí, muchas prendas se pueden hacer a medida. Las medidas, la tela, el precio, el plazo de confección y la
        seña se acuerdan por WhatsApp antes de empezar.
      </>
    ),
  },
  {
    question: '¿Puedo comprar solo una parte de un look?',
    answer: (
      <>
        Sí. Todas las prendas se venden por separado, aunque en las fotos aparezcan combinadas en un conjunto.
      </>
    ),
  },
  {
    question: '¿Las prendas son para dama o para caballero?',
    answer: (
      <>
        La sección formal se organiza en Dama y Caballero, pero la línea urbana es sin género: cada prenda la usa
        quien quiera. Si tienes dudas con el calce, te ayudamos a elegir por WhatsApp.
      </>
    ),
  },
  {
    question: '¿En qué moneda están los precios?',
    answer: (
      <>
        En pesos uruguayos. El valor en dólares es solo una referencia aproximada. El precio que vale es el que se
        confirma por WhatsApp al acordar la compra.
      </>
    ),
  },
  {
    question: '¿Cómo recibo mi compra?',
    answer: (
      <>
        La entrega o el retiro se coordinan por WhatsApp según dónde estés. Ahí te contamos las opciones y, si
        corresponde, el costo de envío.
      </>
    ),
  },
  {
    question: '¿Cómo cuido mis prendas?',
    answer: (
      <>
        Cada prenda tiene sus cuidados en la ficha del producto, según su tela. Como regla general, las telas
        delicadas (gasa, satén, terciopelo, tweed) agradecen la limpieza en seco o el lavado a mano en agua fría.
      </>
    ),
  },
  {
    question: '¿Cómo compro entradas para un evento?',
    answer: (
      <>
        Las entradas se compran online en la <Link to="/entradas">página de entradas</Link>, con tarjeta o con
        Mercado Pago. Apenas se acredita el pago te llega por email tu entrada con un código QR, que se muestra en
        la puerta desde el celular.
      </>
    ),
  },
];

const FaqsPage = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const handleToggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
      <title>Preguntas Frecuentes | Ico Batista</title>
      <meta
        name="description"
        content="Cómo comprar prendas de Ico Batista, talles, prendas a medida, piezas únicas, precios, entregas y entradas a eventos."
      />
      <main>
        <div className={styles.faqsContainer}>
          <h1 className={styles.title}>Preguntas Frecuentes</h1>
          <div className={styles.accordion}>
            {faqData.map((faq, index) => (
              <div key={faq.question} className={styles.faqItem}>
                <button
                  type="button"
                  onClick={() => handleToggle(index)}
                  className={styles.question}
                  aria-expanded={openIndex === index}
                >
                  <span>{faq.question}</span>
                  <span className={`${styles.icon} ${openIndex === index ? styles.open : ''}`} aria-hidden="true">
                    +
                  </span>
                </button>
                <div className={`${styles.answer} ${openIndex === index ? styles.open : ''}`}>
                  <p>{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
          <p className={styles.more}>
            ¿Tienes otra pregunta?{' '}
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
              Escríbenos por WhatsApp
            </a>
            .
          </p>
        </div>
      </main>
    </>
  );
};

export default FaqsPage;
