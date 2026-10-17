import fs from 'node:fs';
import path from 'node:path';
import nodemailer from 'nodemailer';

/**
 * Envío de emails. Proveedores: resend | smtp | dev (guarda el HTML en .outbox).
 * message: { to, subject, html, text, attachments: [{ filename, content: Buffer, cid }] }
 */
export function createMailer(config) {
  const { provider, from } = config.mail;

  if (provider === 'resend') {
    return {
      provider,
      async send(m) {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${config.mail.resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from,
            to: Array.isArray(m.to) ? m.to : [m.to],
            subject: m.subject,
            html: m.html,
            text: m.text,
            attachments: (m.attachments || []).map((a) => ({
              filename: a.filename,
              content: a.content.toString('base64'),
              content_id: a.cid,
            })),
          }),
          signal: AbortSignal.timeout(15000),
        });
        if (!res.ok) throw new Error(`Resend ${res.status}: ${(await res.text()).slice(0, 300)}`);
      },
    };
  }

  if (provider === 'smtp') {
    const { host, port, user, pass, secure } = config.mail.smtp;
    const transport = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: user ? { user, pass } : undefined,
      connectionTimeout: 10000,
      socketTimeout: 15000,
    });
    return {
      provider,
      async send(m) {
        await transport.sendMail({
          from,
          to: m.to,
          subject: m.subject,
          html: m.html,
          text: m.text,
          attachments: (m.attachments || []).map((a) => ({
            filename: a.filename,
            content: a.content,
            cid: a.cid,
            contentDisposition: 'inline',
          })),
        });
      },
    };
  }

  // dev
  return {
    provider: 'dev',
    sent: [],
    async send(m) {
      fs.mkdirSync(config.mail.outboxDir, { recursive: true });
      const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      let html = m.html;
      for (const a of m.attachments || []) {
        if (a.cid) {
          html = html.replaceAll(
            `cid:${a.cid}`,
            `data:image/png;base64,${a.content.toString('base64')}`
          );
        }
      }
      fs.writeFileSync(path.join(config.mail.outboxDir, `${stamp}.html`), html);
      this.sent.push({ ...m, html });
    },
  };
}
