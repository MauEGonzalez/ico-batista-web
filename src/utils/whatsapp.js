// /src/utils/whatsapp.js
// Arma los links de WhatsApp con el mensaje ya escrito.
import { WHATSAPP_NUMBER } from '../config/contact.js';

export const buildWhatsAppUrl = (message) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

const productUrl = (id) => `${window.location.origin}/producto/${id}`;

// Talle especial para pedir la prenda a medida
export const MADE_TO_MEASURE = 'A medida';

const describeSize = (size) =>
  size === MADE_TO_MEASURE ? 'a medida' : size ? `talle ${size}` : null;

// Consulta por una sola prenda (desde la ficha del producto)
export const productInquiryMessage = (product, size) => {
  const sizeText = describeSize(size);
  const lines = [
    'Hola Ico! Me interesa esta prenda:',
    `• ${product.name}${sizeText ? ` (${sizeText})` : ''}`,
    productUrl(product.id),
    '',
    size === MADE_TO_MEASURE
      ? 'Me gustaría hacerla a medida. ¿Cómo seguimos?'
      : '¿Está disponible?',
  ];
  return lines.join('\n');
};

// Consulta por varias prendas (desde "Mi selección")
export const selectionInquiryMessage = (items) => {
  const lines = ['Hola Ico! Me interesan estas prendas:', ''];
  items.forEach((item) => {
    const sizeText = describeSize(item.size);
    const qty = item.quantity > 1 ? ` x${item.quantity}` : '';
    lines.push(`• ${item.name}${sizeText ? ` (${sizeText})` : ''}${qty}`);
    lines.push(`  ${productUrl(item.id)}`);
  });
  lines.push('', '¿Están disponibles?');
  return lines.join('\n');
};

// Texto para mostrar el talle en la web ("Talle M" / "A medida")
export const sizeLabel = (size) =>
  size === MADE_TO_MEASURE ? 'A medida' : size ? `Talle ${size}` : null;
