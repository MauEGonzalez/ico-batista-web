import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { api } from '../../api/entradas.js';
import TicketCard from '../../components/TicketCard/TicketCard.jsx';
import styles from './EntradaPage.module.css';

export default function EntradaPage() {
  const { code } = useParams();
  const [params] = useSearchParams();
  const asistencia = params.get('asistencia'); // viene del email: si | no
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
          <TicketCard ticket={ticket} rsvpSuggested={asistencia === 'no' ? 'no' : asistencia === 'si' ? 'yes' : ''} />
          <div className={styles.actions}>
            <button onClick={() => window.print()}>Imprimir / guardar PDF</button>
          </div>
        </>
      )}
    </div>
  );
}
