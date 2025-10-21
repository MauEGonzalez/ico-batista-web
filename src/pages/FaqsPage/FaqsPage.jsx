import React, { useState } from 'react';
import Header from '../../components/layout/Header/Header.jsx';
import Footer from '../../components/layout/Footer/Footer.jsx';
import styles from './FaqsPage.module.css';

// Datos de ejemplo para las preguntas
const faqData = [
  {
    question: "¿Cómo funciona el proceso de diseño a medida?",
    answer: "Nuestro proceso comienza con una consulta personal para entender tu visión. Luego, Ico Batista creará bocetos y, una vez aprobados, procederemos con la selección de telas y la confección. Se requieren de 2 a 3 pruebas para asegurar un ajuste perfecto."
  },
  {
    question: "¿Realizan envíos internacionales?",
    answer: "Sí, realizamos envíos a todo el mundo a través de transportistas premium como DHL y FedEx. Los costos y tiempos de envío varían según el destino."
  },
  {
    question: "¿Cuál es su política de devoluciones?",
    answer: "Las prendas de colección (prêt-à-porter) pueden ser devueltas o cambiadas dentro de los 14 días posteriores a la recepción, siempre que se encuentren en su estado original. Las prendas hechas a medida son de venta final y no admiten devoluciones."
  },
  {
    question: "¿Cómo debo cuidar mis prendas de alta costura?",
    answer: "Recomendamos encarecidamente la limpieza en seco profesional para todas nuestras prendas. Cada pieza incluye una etiqueta con instrucciones de cuidado específicas para los materiales utilizados."
  }
];

const FaqsPage = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const handleToggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div>
      <Header />
      <main>
        <div className={styles.faqsContainer}>
          <h1 className={styles.title}>Preguntas Frecuentes</h1>
          <div className={styles.accordion}>
            {faqData.map((faq, index) => (
              <div key={index} className={styles.faqItem}>
                <button onClick={() => handleToggle(index)} className={styles.question}>
                  <span>{faq.question}</span>
                  <span className={`${styles.icon} ${openIndex === index ? styles.open : ''}`}>+</span>
                </button>
                <div className={`${styles.answer} ${openIndex === index ? styles.open : ''}`}>
                  <p>{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FaqsPage;