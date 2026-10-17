import { saleNoticeEmail, alertEmail } from './emailTemplates.js';

/** Avisos a Ico: email (siempre que haya ICO_NOTIFY_EMAIL) y Telegram (opcional). */
export function createNotifier({ config, mailer, log = console }) {
  async function telegram(text) {
    const { telegramToken, telegramChatId } = config.notify;
    if (!telegramToken || !telegramChatId) return;
    const res = await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: telegramChatId, text }),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(`Telegram ${res.status}`);
  }

  async function deliver(msg) {
    const errors = [];
    if (config.notify.email) {
      try {
        await mailer.send({ to: config.notify.email, ...msg });
      } catch (e) {
        errors.push(e);
      }
    }
    try {
      await telegram(msg.text);
    } catch (e) {
      errors.push(e);
    }
    const channels = (config.notify.email ? 1 : 0) + (config.notify.telegramToken ? 1 : 0);
    // Falla solo si no llegó por ningún canal
    if (channels > 0 && errors.length >= channels) throw errors[0];
  }

  return {
    sale: (order, resumen) => deliver(saleNoticeEmail({ config, order, resumen })),
    async alert(title, detail) {
      log.warn?.(`[entradas] ALERTA: ${title} — ${detail}`);
      try {
        await deliver(alertEmail({ title, detail }));
      } catch (e) {
        log.error?.('[entradas] no se pudo enviar la alerta', e.message);
      }
    },
  };
}
