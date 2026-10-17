// /server/utils/notify.js
// Avisos cuando llega algo nuevo a la web.
//
// PUNTO DE EXTENSIÓN: todavía no hay proveedor de email configurado. Cuando lo haya
// (Resend, Brevo, SendGrid, etc.), alcanza con mandar el mail acá adentro, por ejemplo:
//
//   await resend.emails.send({
//     from: 'Web Ico Batista <web@icobatista.com>',
//     to: process.env.CONTACT_NOTIFY_TO,
//     replyTo: message.email,
//     subject: `Nuevo mensaje de ${message.name}`,
//     text: message.message,
//   });
//
// Nunca debe cortar el guardado del mensaje: los errores se registran y listo.
export const notifyNewMessage = async (message) => {
  try {
    console.log(`[contacto] Nuevo mensaje de ${message.name} <${message.email}> (${message._id})`);
  } catch (error) {
    console.error('No se pudo avisar del nuevo mensaje:', error.message);
  }
};
