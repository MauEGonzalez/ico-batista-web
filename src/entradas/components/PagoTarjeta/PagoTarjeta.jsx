import { useEffect, useRef, useState } from 'react';
import styles from './PagoTarjeta.module.css';

const SDK_URL = 'https://sdk.mercadopago.com/js/v2';
let sdkPromise = null;

function loadSdk() {
  if (window.MercadoPago) return Promise.resolve(window.MercadoPago);
  if (!sdkPromise) {
    sdkPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = SDK_URL;
      s.async = true;
      s.onload = () => resolve(window.MercadoPago);
      s.onerror = () => {
        sdkPromise = null;
        reject(new Error('sdk'));
      };
      document.head.appendChild(s);
    });
  }
  return sdkPromise;
}

/**
 * Formulario de tarjeta de Mercado Pago (Card Payment Brick) dentro de la web.
 * Los datos de la tarjeta los procesa Mercado Pago; acá solo recibimos un token.
 * onPay(tarjeta) debe devolver una promesa: si se rechaza, el formulario queda listo para reintentar.
 */
export default function PagoTarjeta({ tarjeta, amount, email, onPay }) {
  const containerId = useRef(`mp-card-${Math.random().toString(36).slice(2)}`).current;
  const onPayRef = useRef(onPay);
  onPayRef.current = onPay;
  const [state, setState] = useState('loading'); // loading | ready | error

  useEffect(() => {
    if (tarjeta?.mock) return undefined;
    let controller = null;
    let cancelled = false;
    setState('loading');
    loadSdk()
      .then(async (MercadoPago) => {
        if (cancelled) return;
        const mp = new MercadoPago(tarjeta.publicKey, { locale: 'es-UY' });
        controller = await mp.bricks().create('cardPayment', containerId, {
          initialization: { amount, payer: { email } },
          customization: {
            visual: {
              hidePaymentButton: false,
              texts: { formSubmit: 'Pagar' },
              style: {
                theme: 'default',
                customVariables: {
                  baseColor: '#2b2d31',
                  borderRadiusSmall: '0px',
                  borderRadiusMedium: '0px',
                  borderRadiusLarge: '0px',
                  borderRadiusFull: '0px',
                },
              },
            },
            paymentMethods: { maxInstallments: 12 },
          },
          callbacks: {
            onReady: () => !cancelled && setState('ready'),
            onSubmit: (formData) => onPayRef.current(formData),
            onError: (err) => {
              console.error('[entradas] brick', err);
              if (err?.type === 'critical' && !cancelled) setState('error');
            },
          },
        });
        if (cancelled) controller?.unmount();
      })
      .catch(() => !cancelled && setState('error'));
    return () => {
      cancelled = true;
      try {
        controller?.unmount();
      } catch {
        /* ignore */
      }
    };
  }, [tarjeta, amount, email, containerId]);

  if (tarjeta?.mock) return <MockTarjeta email={email} onPay={onPay} />;

  return (
    <div className={styles.wrap}>
      {state === 'loading' && <p className={styles.state}>Cargando el formulario seguro de Mercado Pago…</p>}
      {state === 'error' && (
        <p className={styles.state} role="alert">
          No pudimos cargar el formulario de tarjeta. Recargá la página o pagá con Mercado Pago.
        </p>
      )}
      <div id={containerId} />
    </div>
  );
}

/** Solo desarrollo (MP_MODE=mock): simula la tarjeta sin cargar el SDK. */
function MockTarjeta({ email, onPay }) {
  const [busy, setBusy] = useState(false);
  const pay = (token) => async () => {
    setBusy(true);
    try {
      await onPay({ token, payment_method_id: 'visa', installments: 1, payer: { email } });
    } catch {
      /* el padre muestra el error */
    }
    setBusy(false);
  };
  return (
    <div className={styles.mock}>
      <p className={styles.state}>Tarjeta simulada (modo prueba)</p>
      <button type="button" disabled={busy} onClick={pay('mock-ok')}>
        Simular pago aprobado
      </button>
      <button type="button" disabled={busy} onClick={pay('mock-rechazar')}>
        Simular rechazo
      </button>
    </div>
  );
}
