import QRCode from 'qrcode';

export function ticketUrl(config, code) {
  return `${config.publicUrl}/entrada/${code}`;
}

export function qrPng(config, code, width = 480) {
  return QRCode.toBuffer(ticketUrl(config, code), {
    type: 'png',
    errorCorrectionLevel: 'M',
    margin: 1,
    width,
    color: { dark: '#2B2D31', light: '#FFFFFF' },
  });
}
