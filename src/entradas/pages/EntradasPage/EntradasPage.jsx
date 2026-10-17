import { useEffect, useState } from 'react';
import { api } from '../../api/entradas.js';
import Hero from '../../components/Hero/Hero.jsx';
import EventoDatos from '../../components/EventoDatos/EventoDatos.jsx';
import CompraForm from '../../components/CompraForm/CompraForm.jsx';
import SiteFooter from '../../components/SiteFooter/SiteFooter.jsx';
import styles from './EntradasPage.module.css';

export default function EntradasPage() {
  const [config, setConfig] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // Si el servidor recién arranca, la primera consulta puede fallar: reintenta antes de mostrar error
    let cancelled = false;
    async function load(attempt = 1) {
      try {
        const c = await api.config();
        if (!cancelled) setConfig(c);
      } catch (e) {
        if (cancelled) return;
        if (attempt < 4) setTimeout(() => load(attempt + 1), attempt * 1500);
        else setError(e.message);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) return <p className={styles.state}>No pudimos cargar la página. Recargá en un momento.</p>;
  if (!config) return <p className={styles.state}>Cargando…</p>;

  return (
    <>
      <Hero evento={config.evento} />
      <EventoDatos evento={config.evento} />
      <main id="comprar" className={styles.buy}>
        <div className={styles.intro}>
          <p className="eyebrow">Entradas</p>
          <h2>Reservá tu lugar</h2>
          <p>
            Una tarde de campo para vivir la nueva colección. Entrada nominal con código QR, válida para una persona.
          </p>
        </div>
        <CompraForm config={config} />
      </main>
      <SiteFooter />
    </>
  );
}
