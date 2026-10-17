/**
 * Cliente de la API de entradas.
 * Para montarlo en el panel existente de Ico: createEntradasApi({ base: 'https://api.../api/entradas', getHeaders: () => ({ Authorization: `Bearer ${tokenDelPanel}` }) })
 */
export const API_BASE = (import.meta.env.VITE_API_URL || '') + '/api/entradas';

export function createEntradasApi({ base = API_BASE, getHeaders = () => ({}) } = {}) {
  async function request(path, { method = 'GET', body, auth = false } = {}) {
    const res = await fetch(base + path, {
      method,
      headers: {
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(auth ? getHeaders() : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(data.error || 'Ocurrió un error. Probá de nuevo.');
      err.status = res.status;
      err.code = data.code;
      err.data = data.data;
      throw err;
    }
    return data;
  }
  return {
    base,
    config: () => request('/config'),
    checkout: (payload) => request('/checkout', { method: 'POST', body: payload }),
    orden: (id) => request(`/orden/${id}`),
    syncOrden: (id) => request(`/orden/${id}/sync`, { method: 'POST' }),
    ticket: (code) => request(`/ticket/${code}`),
    qrUrl: (code) => `${base}/ticket/${code}/qr.png`,
    admin: {
      me: () => request('/admin/me', { auth: true }),
      resumen: () => request('/admin/resumen', { auth: true }),
      lista: (params = {}) => request('/admin/lista?' + new URLSearchParams(params), { auth: true }),
      ordenes: (status) => request('/admin/ordenes' + (status ? `?status=${status}` : ''), { auth: true }),
      ingreso: (code) => request('/admin/ingreso', { method: 'POST', body: { code }, auth: true }),
      deshacer: (code) => request('/admin/ingreso/deshacer', { method: 'POST', body: { code }, auth: true }),
      anular: (code) => request('/admin/anular', { method: 'POST', body: { code }, auth: true }),
      cortesia: (payload) => request('/admin/cortesia', { method: 'POST', body: payload, auth: true }),
      reenviar: (orden) => request(`/admin/ordenes/${orden}/reenviar`, { method: 'POST', auth: true }),
      async exportCsv() {
        const res = await fetch(base + '/admin/export.csv', { headers: getHeaders() });
        if (!res.ok) throw new Error('No se pudo exportar');
        return res.blob();
      },
    },
    mock: {
      pref: (id) => request(`/_mock/pref/${id}`),
      pagar: (pref, status) => request('/_mock/pagar', { method: 'POST', body: { pref, status } }),
    },
  };
}

export const api = createEntradasApi();

export const fmtUYU = (n) => `$ ${Number(n).toLocaleString('es-UY')}`;
