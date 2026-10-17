import { ticketUrl } from './qr.js';

export const esc = (s) =>
  String(s ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const INK = '#2B2D31';
const ACCENT = '#7A664C';
const BG = '#EFEEE7';
const LINE = '#B9B6AA';
const serif = "'Playfair Display', Georgia, 'Times New Roman', serif";
const sans = "'Public Sans', Arial, Helvetica, sans-serif";

export const fmtUYU = (n) => `$ ${Number(n).toLocaleString('es-UY')}`;

/** Invitación de cortesía: la pieza gráfica de Ico arriba y, debajo, una tarjeta por invitado con su QR. */
export function invitationEmail({ config, order, tickets }) {
  const ev = config.event;
  const img = `${config.publicUrl}/assets/images/eventos/invitacion-cortesia.jpg`;
  const blocks = tickets
    .map(
      (t) => `
    <tr><td style="padding:0 0 20px 0">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${LINE};background:#fff">
        <tr>
          <td style="padding:22px;vertical-align:middle">
            <div style="font-family:${sans};font-size:11px;letter-spacing:3px;color:${ACCENT}">INVITACIÓN${tickets.length > 1 ? ` ${t.seq} DE ${tickets.length}` : ''}</div>
            <div style="font-family:${serif};font-size:22px;color:${INK};margin:8px 0 12px">${esc(t.nombre)}</div>
            <div style="font-family:${sans};font-size:11px;letter-spacing:3px;color:${ACCENT}">CÓDIGO</div>
            <div style="font-family:${serif};font-size:19px;color:${INK};margin:4px 0 12px;letter-spacing:1px">${esc(t.code)}</div>
            <a href="${esc(ticketUrl(config, t.code))}?asistencia=si" style="display:inline-block;font-family:${sans};font-size:13px;letter-spacing:1px;color:#fff;background:${INK};padding:10px 16px;text-decoration:none;margin:2px 6px 6px 0">Confirmar asistencia</a>
            <a href="${esc(ticketUrl(config, t.code))}?asistencia=no" style="display:inline-block;font-family:${sans};font-size:13px;color:${INK};padding:10px 4px;margin:2px 0 6px 0">No podré asistir</a>
          </td>
          <td width="160" style="padding:14px;text-align:center;vertical-align:middle">
            <img src="cid:qr-${esc(t.code)}" width="140" height="140" alt="QR ${esc(t.code)}" style="display:block;margin:0 auto">
          </td>
        </tr>
      </table>
    </td></tr>`
    )
    .join('');

  const html = `<!doctype html><html lang="es"><body style="margin:0;background:${BG}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BG}"><tr><td align="center" style="padding:28px 16px">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%">
  <tr><td style="padding-bottom:22px">
    <img src="${esc(img)}" width="560" alt="Invitación privada — Ico Batista · ${esc(ev.nombre)} · ${esc(ev.fechaTexto)}, ${esc(ev.horario)} · ${esc(ev.lugar)}, ${esc(ev.ciudad)}" style="display:block;width:100%;height:auto;border:0">
  </td></tr>
  <tr><td style="font-family:${sans};font-size:15px;line-height:1.6;color:${INK};padding-bottom:20px">
    ${esc(order.comprador.nombre)}, Ico te invita a vivir <b>${esc(ev.nombre)}</b>.
    Te pedimos que confirmes tu asistencia con el botón de abajo. El día del evento, presentá el código QR en el acceso, desde el celular o impreso. ${tickets.length === 1 ? 'La invitación es personal y válida para un ingreso.' : 'Cada invitación es válida para un ingreso.'}
  </td></tr>
  ${blocks}
  <tr><td style="border-top:1px solid ${LINE};padding-top:18px;font-family:${sans};font-size:14px;line-height:1.7;color:${INK}">
    <b>${esc(ev.fechaTexto)}</b> · ${esc(ev.horario)}<br>
    ${esc(ev.lugar)} · ${esc(ev.ciudad)}<br>
    Dress code: ${esc(ev.dressCode)}
  </td></tr>
</table></td></tr></table></body></html>`;

  const text = [
    `${order.comprador.nombre}, Ico te invita a ${ev.nombre}.`,
    `${ev.fechaTexto}, ${ev.horario}. ${ev.lugar}, ${ev.ciudad}.`,
    '',
    ...tickets.map((t) => `Invitación ${t.seq}/${tickets.length}: ${t.code}  Confirmá tu asistencia: ${ticketUrl(config, t.code)}?asistencia=si`),
  ].join('\n');

  return {
    subject: `Invitación privada — ${ev.nombre} · Ico Batista`,
    html,
    text,
    cids: tickets.map((t) => ({ cid: `qr-${t.code}`, code: t.code })),
  };
}

/** Email al comprador con una tarjeta por entrada (QR inline por cid). */
export function ticketsEmail({ config, order, tickets }) {
  if (order.tipo === 'cortesia') return invitationEmail({ config, order, tickets });
  const ev = config.event;
  const blocks = tickets
    .map(
      (t) => `
    <tr><td style="padding:0 0 24px 0">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${LINE};background:#fff">
        <tr>
          <td style="padding:24px;vertical-align:top">
            <div style="font-family:${sans};font-size:11px;letter-spacing:3px;color:${ACCENT}">ENTRADA ${t.seq} DE ${tickets.length}</div>
            <div style="font-family:${serif};font-size:22px;color:${INK};margin:8px 0 14px">${esc(t.nombre)}</div>
            <div style="font-family:${sans};font-size:11px;letter-spacing:3px;color:${ACCENT}">CÓDIGO</div>
            <div style="font-family:${serif};font-size:20px;color:${INK};margin:4px 0 14px;letter-spacing:1px">${esc(t.code)}</div>
            <a href="${esc(ticketUrl(config, t.code))}" style="font-family:${sans};font-size:13px;color:${INK}">Ver entrada online</a>
          </td>
          <td width="170" style="padding:16px;text-align:center;vertical-align:middle">
            <img src="cid:qr-${esc(t.code)}" width="150" height="150" alt="QR ${esc(t.code)}" style="display:block;margin:0 auto">
          </td>
        </tr>
      </table>
    </td></tr>`
    )
    .join('');

  const html = `<!doctype html><html lang="es"><body style="margin:0;background:${BG}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BG}"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%">
  <tr><td style="text-align:center;padding-bottom:24px">
    <div style="font-family:${sans};font-size:13px;letter-spacing:6px;color:${INK}">ICO BATISTA</div>
    <div style="font-family:${sans};font-size:11px;letter-spacing:4px;color:${ACCENT};margin-top:18px">${esc(ev.subtitulo.toUpperCase())}</div>
    <div style="font-family:${serif};font-size:34px;line-height:1.1;color:${INK};margin-top:8px">${esc(ev.nombre.toUpperCase())}</div>
  </td></tr>
  <tr><td style="font-family:${sans};font-size:15px;line-height:1.6;color:${INK};padding-bottom:20px">
    Hola ${esc(order.comprador.nombre)}, ¡gracias por tu compra! Acá están tus ${tickets.length === 1 ? 'entrada' : 'entradas'}.
    Presentá el QR en el acceso (desde el celular o impreso). Cada entrada es válida para una persona y se puede usar una sola vez.
  </td></tr>
  ${blocks}
  <tr><td style="border-top:1px solid ${LINE};padding-top:18px;font-family:${sans};font-size:14px;line-height:1.7;color:${INK}">
    <b>${esc(ev.fechaTexto)}</b> · ${esc(ev.horario)}<br>
    ${esc(ev.lugar)} · ${esc(ev.ciudad)}<br>
    Dress code: ${esc(ev.dressCode)}
  </td></tr>
  <tr><td style="padding-top:22px;font-family:${sans};font-size:12px;color:#5C5E62;line-height:1.6">
    Compra Nº ${esc(order.publicId.slice(0, 8).toUpperCase())} · Total ${esc(fmtUYU(order.totalUYU))}.
    Si tenés algún problema con tu entrada, respondé este correo o escribinos por Instagram @byicobatista.
  </td></tr>
</table></td></tr></table></body></html>`;

  const text = [
    `Hola ${order.comprador.nombre}, gracias por tu compra.`,
    `${ev.nombre} — ${ev.fechaTexto}, ${ev.horario}. ${ev.lugar}, ${ev.ciudad}.`,
    '',
    ...tickets.map((t) => `Entrada ${t.seq}/${tickets.length}: ${t.code}  ${ticketUrl(config, t.code)}`),
  ].join('\n');

  return {
    subject: `Tu entrada — ${ev.nombre} · Ico Batista`,
    html,
    text,
    cids: tickets.map((t) => ({ cid: `qr-${t.code}`, code: t.code })),
  };
}

/** Aviso interno a Ico por cada venta. */
export function saleNoticeEmail({ config, order, resumen }) {
  const rows = [
    ['Comprador', order.comprador.nombre],
    ['Email', order.comprador.email],
    ['Teléfono', order.comprador.telefono || '—'],
    ['Entradas', `${order.cantidad} (${order.tandaNombre})`],
    ['Total', fmtUYU(order.totalUYU)],
  ];
  const html = `<div style="font-family:${sans};color:${INK};max-width:520px">
    <h2 style="font-family:${serif};font-weight:400">Nueva venta de entradas</h2>
    <table cellpadding="6" style="border-collapse:collapse">${rows
      .map(([k, v]) => `<tr><td style="color:${ACCENT}">${esc(k)}</td><td>${esc(v)}</td></tr>`)
      .join('')}</table>
    <p>Vendidas hasta ahora: <b>${resumen.vendidas}</b></p>
    <p><a href="${esc(config.publicUrl)}/admin/entradas">Abrir lista de entradas</a></p></div>`;
  const text = `Nueva venta: ${order.cantidad} entrada(s) — ${order.comprador.nombre} (${order.comprador.email}) — ${fmtUYU(
    order.totalUYU
  )}. Vendidas: ${resumen.vendidas}.`;
  return { subject: `Nueva venta: ${order.cantidad} entrada(s) · ${order.comprador.nombre}`, html, text };
}

export function alertEmail({ title, detail }) {
  const html = `<div style="font-family:${sans};color:${INK}"><h3>⚠ ${esc(title)}</h3><pre style="white-space:pre-wrap">${esc(
    detail
  )}</pre></div>`;
  return { subject: `⚠ Entradas: ${title}`, html, text: `${title}\n${detail}` };
}
