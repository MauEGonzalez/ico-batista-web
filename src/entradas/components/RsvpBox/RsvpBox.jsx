// Confirmación de asistencia de una invitación de cortesía.
// El link del email trae ?asistencia=si|no, pero NO responde solo: el invitado confirma con un clic
// (así los antivirus que abren los links del mail no confirman por él).
import { useState } from 'react';
import { api } from '../../api/entradas.js';
import styles from './RsvpBox.module.css';

const TEXTS = {
  yes: 'Confirmaste tu asistencia. ¡Te esperamos!',
  no: 'Nos avisaste que no vas a poder asistir. Gracias por responder.',
};

export default function RsvpBox({ code, initial = 'pending', suggested = '' }) {
  const [rsvp, setRsvp] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function answer(respuesta) {
    setBusy(true);
    setError('');
    try {
      const r = await api.rsvp(code, respuesta);
      setRsvp(r.rsvp);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  if (rsvp !== 'pending') {
    return (
      <div className={styles.box} role="status">
        <p className={styles.done}>{TEXTS[rsvp]}</p>
        <button type="button" className={styles.link} onClick={() => setRsvp('pending')}>
          Cambiar respuesta
        </button>
      </div>
    );
  }

  return (
    <div className={styles.box}>
      <p className="eyebrow">Confirmación de asistencia</p>
      <p className={styles.question}>¿Vas a poder acompañarnos?</p>
      <div className={styles.actions}>
        <button
          type="button"
          className={`${styles.yes} ${suggested === 'no' ? styles.dim : ''}`}
          disabled={busy}
          onClick={() => answer('yes')}
        >
          Confirmar asistencia
        </button>
        <button
          type="button"
          className={`${styles.no} ${suggested === 'no' ? styles.highlight : ''}`}
          disabled={busy}
          onClick={() => answer('no')}
        >
          No podré asistir
        </button>
      </div>
      {error && <p className={styles.error} role="alert">{error}</p>}
    </div>
  );
}
