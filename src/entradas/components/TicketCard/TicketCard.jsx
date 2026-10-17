import { api } from '../../api/entradas.js';
import RsvpBox from '../RsvpBox/RsvpBox.jsx';
import styles from './TicketCard.module.css';

/** Entrada digital (réplica del diseño de la entrada impresa). */
export default function TicketCard({ ticket, rsvpSuggested = '' }) {
  const ev = ticket.evento;
  const inactive = ticket.status !== 'valid';
  const stamp = inactive && <div className={styles.stamp}>{ticket.status === 'used' ? 'YA INGRESÓ' : 'ANULADA'}</div>;

  // Invitación de cortesía: la pieza gráfica de Ico + nombre, código y QR
  if (ticket.tipo === 'cortesia') {
    return (
      <article className={styles.ticket}>
        <img
          className={styles.invitation}
          src="/assets/images/eventos/invitacion-cortesia.jpg"
          alt={`Invitación privada — ${ev.nombre}, ${ev.fechaTexto}, ${ev.horario}, ${ev.lugar}, ${ev.ciudad}`}
        />
        <div className={styles.stub}>
          <div className={styles.who}>
            <div>
              <p className="eyebrow">Invitación de cortesía</p>
              <p className={styles.name}>{ticket.nombre}</p>
            </div>
            <div>
              <p className="eyebrow">Código</p>
              <p className={styles.code}>{ticket.code}</p>
            </div>
            <p className={styles.help}>Presentá este QR en el acceso. Válida para una persona.</p>
          </div>
          <div className={styles.qrBox}>
            <img src={api.qrUrl(ticket.code)} alt={`Código QR ${ticket.code}`} width="190" height="190" />
            {stamp}
          </div>
          {ticket.status !== 'void' && (
            <RsvpBox code={ticket.code} initial={ticket.rsvp || 'pending'} suggested={rsvpSuggested} />
          )}
        </div>
      </article>
    );
  }

  return (
    <article className={styles.ticket}>
      <div className={styles.top}>
        <img className={styles.photo} src="/assets/images/eventos/story_people.webp" alt="" />
        <div className={styles.shade} />
        <div className={styles.brand}>
          <img src="/assets/images/eventos/logo_light.webp" alt="Monograma IB" />
          <span>ICO BATISTA</span>
        </div>
      </div>

      <div className={styles.body}>
        <p className="eyebrow">{ev.subtitulo}</p>
        <h1 className={styles.title}>
          EL LUJO
          <br />
          DEL TIEMPO
        </h1>
        <p className={styles.tag}>Una nueva experiencia está por comenzar.</p>
        <dl className={styles.grid}>
          <div>
            <dt className="eyebrow">Fecha</dt>
            <dd>{ev.fechaTexto}</dd>
          </div>
          <div>
            <dt className="eyebrow">Horario</dt>
            <dd>{ev.horario}</dd>
          </div>
          <div>
            <dt className="eyebrow">Lugar</dt>
            <dd>
              {ev.lugar}
              <br />
              {ev.ciudad}
            </dd>
          </div>
          <div>
            <dt className="eyebrow">Dress code</dt>
            <dd>{ev.dressCode}</dd>
          </div>
        </dl>
      </div>

      <div className={styles.cut} aria-hidden="true">
        <i /> <b /> <i />
      </div>

      <div className={styles.stub}>
        <div className={styles.who}>
          <div>
            <p className="eyebrow">Entrada general</p>
            <p className={styles.name}>{ticket.nombre}</p>
          </div>
          <div>
            <p className="eyebrow">Código</p>
            <p className={styles.code}>{ticket.code}</p>
          </div>
          <p className={styles.help}>Presentá esta entrada en el acceso. Válida para una persona.</p>
        </div>
        <div className={styles.qrBox}>
          <img src={api.qrUrl(ticket.code)} alt={`Código QR ${ticket.code}`} width="190" height="190" />
          {stamp}
        </div>
      </div>
    </article>
  );
}
