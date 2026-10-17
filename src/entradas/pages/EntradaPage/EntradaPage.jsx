import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../api/entradas.js';
import TicketCard from '../../components/TicketCard/TicketCard.jsx';
import styles from './EntradaPage.module.css';

export default function EntradaPage() {
  const { code } = useParams();
  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.ticket(code).then(setTicket).catch((e) => setError(e.status === 404 ? 'No encontramos esta entrada.' : e.message));
  }, [code]);

  return (
    <div className={styles.page}>
      {error && <p className={styles.msg}>{error}</p>}
      {!ticket && !error && <p className={styles.msg}>Cargando entrada…</p>}
      {ticket && (
        <>
          <TicketCard ticket={ticket} />
          <div className={styles.actions}>
            <button onClick={() => window.print()}>Imprimir / guardar PDF</button>
          </div>
        </>
      )}
    </div>
  );
}
