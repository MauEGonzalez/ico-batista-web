import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, fmtUYU } from '../../api/entradas.js';
import PagoTarjeta from '../PagoTarjeta/PagoTarjeta.jsx';
import styles from './CompraForm.module.css';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function CompraForm({ config }) {
  const { venta, maxPorCompra, puerta } = config;
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '', cantidad: 1, web: '' });
  const [invitados, setInvitados] = useState([]); // nombres de las entradas 2..N
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [paso, setPaso] = useState('datos'); // datos | tarjeta
  const navigate = useNavigate();

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const max = venta.quedan == null ? maxPorCompra : Math.min(maxPorCompra, venta.quedan);
  const total = venta.precioUYU * form.cantidad;

  function checkDatos() {
    if (form.nombre.trim().length < 3) return 'Ingresá tu nombre y apellido.';
    if (!EMAIL_RE.test(form.email.trim())) return 'El email no es válido.';
    for (let i = 0; i < form.cantidad - 1; i++) {
      if ((invitados[i] || '').trim().length < 3) return `Ingresá el nombre y apellido del invitado ${i + 2}.`;
    }
    return '';
  }

  function irATarjeta() {
    const msg = checkDatos();
    setError(msg);
    if (!msg) setPaso('tarjeta');
  }

  // Lo llama el formulario de tarjeta de Mercado Pago. Si rechazamos la promesa, deja reintentar.
  async function pagarConTarjeta(tarjeta) {
    setError('');
    try {
      const r = await api.pagarTarjeta({ ...form, cantidad: Number(form.cantidad), invitados: invitados.slice(0, form.cantidad - 1), tarjeta });
      if (r.status === 'rejected') {
        setError(r.mensaje);
        throw new Error('rechazado');
      }
      navigate(`/entradas/pago?orden=${r.orden}&r=${r.status === 'approved' ? 'ok' : 'pending'}`);
    } catch (err) {
      if (err.message !== 'rechazado') setError(err.message);
      throw err;
    }
  }

  async function submit() {
    const msg = checkDatos();
    if (msg) return setError(msg);
    setError('');
    setLoading(true);
    try {
      const r = await api.checkout({ ...form, cantidad: Number(form.cantidad), invitados: invitados.slice(0, form.cantidad - 1) });
      window.location.assign(r.url); // → Mercado Pago
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  if (!venta.abierta && venta.motivo === 'pronto') {
    return (
      <div className={styles.card}>
        <p className="eyebrow">Entradas</p>
        <h2 className={styles.title}>La venta abre muy pronto</h2>
        <p className={styles.note}>
          Estamos preparando la venta online de entradas. Seguí a @byicobatista en Instagram para enterarte apenas se
          habilite, o escribinos por WhatsApp si querés reservar tu lugar.
        </p>
      </div>
    );
  }

  if (!venta.abierta) {
    return (
      <div className={styles.card}>
        <p className="eyebrow">Entradas</p>
        <h2 className={styles.title}>Venta online cerrada</h2>
        <p className={styles.note}>
          Las entradas online ya no están disponibles. Podés conseguirlas en la puerta el día del evento: USD{' '}
          {puerta.precioUSD}
          {puerta.precioUYU ? ` (${fmtUYU(puerta.precioUYU)})` : ' o su equivalente en pesos uruguayos'} por persona.
        </p>
        {puerta.grupo?.length > 2 && (
          <p className={styles.note}>
            Si vienen en grupo, cada uno paga menos: {puerta.grupo[1].cantidad} personas {fmtUYU(puerta.grupo[1].unitUYU)} c/u,{' '}
            {puerta.grupo[2].cantidad} personas {fmtUYU(puerta.grupo[2].unitUYU)} c/u, y así.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <p className="eyebrow">{venta.tandaNombre}</p>
      <div className={styles.priceRow}>
        {venta.precioUSD ? (
          <>
            <span className={styles.price}>USD {venta.precioUSD}</span>
            <span className={styles.usd}>{fmtUYU(venta.precioUYU)}</span>
          </>
        ) : (
          <span className={styles.price}>{fmtUYU(venta.precioUYU)}</span>
        )}
      </div>
      {venta.quedan != null && venta.quedan <= 30 && (
        <p className={styles.scarce}>
          {venta.quedan === 1 ? 'Queda 1 entrada' : `Quedan ${venta.quedan} entradas`} de esta tanda
        </p>
      )}

      <fieldset className={styles.fields} disabled={paso === 'tarjeta'}>
      <label className={styles.field}>
        <span>Nombre y apellido</span>
        <input value={form.nombre} onChange={set('nombre')} autoComplete="name" required minLength={3} maxLength={80} />
      </label>
      <label className={styles.field}>
        <span>Email (acá te enviamos la entrada)</span>
        <input type="email" value={form.email} onChange={set('email')} autoComplete="email" required maxLength={120} />
      </label>
      <label className={styles.field}>
        <span>Celular (opcional)</span>
        <input type="tel" value={form.telefono} onChange={set('telefono')} autoComplete="tel" maxLength={30} />
      </label>

      <div className={styles.field}>
        <span id="cant">Cantidad de entradas</span>
        <div className={styles.stepper} role="group" aria-labelledby="cant">
          <button type="button" onClick={() => setForm((f) => ({ ...f, cantidad: Math.max(1, f.cantidad - 1) }))} aria-label="Menos">
            −
          </button>
          <output aria-live="polite">{form.cantidad}</output>
          <button type="button" onClick={() => setForm((f) => ({ ...f, cantidad: Math.min(max, f.cantidad + 1) }))} aria-label="Más">
            +
          </button>
        </div>
      </div>

      {form.cantidad > 1 && (
        <div className={styles.invitados}>
          <p className={styles.invHelp}>
            Cada entrada es nominal: la primera va a tu nombre. Completá el nombre de quienes te acompañan.
          </p>
          {Array.from({ length: form.cantidad - 1 }, (_, i) => (
            <label key={i} className={styles.field}>
              <span>Invitado {i + 2} · nombre y apellido</span>
              <input
                value={invitados[i] || ''}
                onChange={(e) =>
                  setInvitados((arr) => {
                    const next = [...arr];
                    next[i] = e.target.value;
                    return next;
                  })
                }
                autoComplete="off"
                required
                minLength={3}
                maxLength={80}
              />
            </label>
          ))}
        </div>
      )}

      </fieldset>

      {/* campo trampa para bots */}
      <input className={styles.trap} tabIndex={-1} autoComplete="off" aria-hidden="true" value={form.web} onChange={set('web')} name="web" />

      <div className={styles.total}>
        <span>Total</span>
        {venta.precioUSD ? (
          <span className={styles.totalValue}>
            <strong>USD {venta.precioUSD * form.cantidad}</strong>
            <small>{fmtUYU(total)} · se cobra en pesos uruguayos</small>
          </span>
        ) : (
          <strong>{fmtUYU(total)}</strong>
        )}
      </div>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      {paso === 'tarjeta' ? (
        <>
          <div className={styles.cardHead}>
            <span>Pago con tarjeta de crédito o débito</span>
            <button type="button" className={styles.link} onClick={() => setPaso('datos')}>
              Cambiar datos
            </button>
          </div>
          <PagoTarjeta tarjeta={config.tarjeta} amount={total} email={form.email.trim()} onPay={pagarConTarjeta} />
          <p className={styles.note}>
            Los datos de tu tarjeta los procesa Mercado Pago de forma segura; nosotros no los vemos ni los guardamos. Funciona con
            tarjetas de cualquier país.
          </p>
        </>
      ) : (
        <>
          {config.tarjeta && (
            <button type="button" className={styles.pay} onClick={irATarjeta}>
              Pagar con tarjeta
            </button>
          )}
          <button type="button" onClick={submit} className={config.tarjeta ? styles.payAlt : styles.pay} disabled={loading}>
            {loading ? 'Redirigiendo a Mercado Pago…' : 'Pagar con Mercado Pago'}
          </button>
          <p className={styles.note}>
            {config.tarjeta
              ? 'Con tarjeta pagás acá mismo, con tarjetas de Uruguay o de cualquier país. Con Mercado Pago podés usar tu cuenta uruguaya, Abitab o Redpagos.'
              : 'Pagás de forma segura en Mercado Pago (tarjetas, débito, saldo en cuenta y más).'}{' '}
            Apenas se acredita el pago te llega la entrada con su QR por email. En puerta: USD {puerta.precioUSD}.
          </p>
        </>
      )}
    </div>
  );
}
