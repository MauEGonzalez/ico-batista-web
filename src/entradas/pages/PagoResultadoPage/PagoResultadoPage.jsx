import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../../api/entradas.js';
import Logo from '../../components/Logo/Logo.jsx';
import styles from './PagoResultadoPage.module.css';

const POLL_MS = 3000;
const GIVE_UP_MS = 3 * 60 * 1000;

export default function PagoResultadoPage() {
  const [params] = useSearchParams();
  const ordenId = params.get('orden');
  const r = params.get('r'); // ok | fail | pending (según back_url de MP)
  const [orden, setOrden] = useState(null);
  const [error, setError] = useState('');
  const [gaveUp, setGaveUp] = useState(false);
  const started = useRef(Date.now());

  useEffect(() => {
    if (!ordenId) return;
    let stop = false;
    let n = 0;
    async function tick() {
      if (stop) return;
      try {
        n += 1;
        // el webhook suele llegar solo; si tarda, le pedimos al servidor que consulte a MP
        const o = n >= 3 && n % 3 === 0 ? await api.syncOrden(ordenId) : await api.orden(ordenId);
        if (stop) return;
        setOrden(o);
        if (o.status === 'paid') return;
      } catch (e) {
        if (e.status === 404) {
          setError('No encontramos esta compra.');
          return;
        }
      }
      if (Date.now() - started.current > GIVE_UP_MS) return setGaveUp(true);
      setTimeout(tick, POLL_MS);
    }
    tick();
    return () => {
      stop = true;
    };
  }, [ordenId]);

  let view;
  if (!ordenId || error) {
    view = <Message title="No encontramos tu compra" text={error || 'El enlace no es válido.'} />;
  } else if (orden?.status === 'paid') {
    view = (
      <>
        <p className="eyebrow">Pago acreditado</p>
        <h1 className={styles.title}>¡Gracias por tu compra!</h1>
        <p className={styles.text}>
          {orden.emailEnviado
            ? `Te enviamos ${orden.entradas.length === 1 ? 'tu entrada' : 'tus entradas'} a ${orden.email}.`
            : `Estamos enviando ${orden.entradas.length === 1 ? 'tu entrada' : 'tus entradas'} a ${orden.email}. Puede demorar un par de minutos.`}{' '}
          Revisá también la carpeta de spam.
        </p>
        <ul className={styles.list}>
          {orden.entradas.map((t) => (
            <li key={t.code}>
              <span>
                Entrada {t.seq} · <code>{t.code}</code>
              </span>
              <Link to={`/entrada/${t.code}`}>Ver entrada</Link>
            </li>
          ))}
        </ul>
      </>
    );
  } else if (r === 'fail' || orden?.mpStatus === 'rejected') {
    view = (
      <Message
        title="No se pudo completar el pago"
        text="No se hizo ningún cobro. Podés intentarlo de nuevo con otro medio de pago."
        action={<Link to="/entradas#comprar">Volver a intentar</Link>}
      />
    );
  } else if (orden && ['expired', 'cancelled'].includes(orden.status)) {
    view = <Message title="La compra venció" text="Pasó el tiempo para pagar. Podés iniciar una nueva compra." action={<Link to="/entradas#comprar">Comprar entradas</Link>} />;
  } else if (gaveUp) {
    view = (
      <Message
        title="Seguimos confirmando tu pago"
        text="Si ya pagaste, tu entrada te va a llegar por email apenas Mercado Pago confirme el pago (puede tardar si pagaste en efectivo). No hace falta que vuelvas a pagar."
      />
    );
  } else {
    view = (
      <>
        <div className={styles.spinner} aria-hidden="true" />
        <h1 className={styles.title}>Confirmando tu pago…</h1>
        <p className={styles.text}>Esto toma unos segundos. No cierres esta página.</p>
      </>
    );
  }

  return (
    <main className={styles.page}>
      <Logo variant="dark" height={64} />
      <section className={styles.card} aria-live="polite">
        {view}
      </section>
    </main>
  );
}

function Message({ title, text, action }) {
  return (
    <>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.text}>{text}</p>
      {action && <p className={styles.action}>{action}</p>}
    </>
  );
}
