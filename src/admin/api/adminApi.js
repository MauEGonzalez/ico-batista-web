// /src/admin/api/adminApi.js
// Llamadas del panel a la API. Las cookies de sesión viajan solas (mismo dominio).

const request = async (path, { method = 'GET', body } = {}) => {
  const response = await fetch(`/api${path}`, {
    method,
    credentials: 'same-origin',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || 'Ocurrió un error, probá de nuevo');
    error.status = response.status;
    throw error;
  }
  return data;
};

export const adminApi = {
  login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password } }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  me: () => request('/auth/me'),

  listProducts: () => request('/admin/products'),
  getProduct: (id) => request(`/admin/products/${id}`),
  createProduct: (data) => request('/admin/products', { method: 'POST', body: data }),
  updateProduct: (id, data) => request(`/admin/products/${id}`, { method: 'PUT', body: data }),
  deleteProduct: (id) => request(`/admin/products/${id}`, { method: 'DELETE' }),
  saveOrder: (ids) => request('/admin/products/order', { method: 'POST', body: { ids } }),
  bulkStatus: (ids, status) => request('/admin/products/bulk-status', { method: 'POST', body: { ids, status } }),

  // options: { kind: 'image' | 'video', target: 'products' | 'runways' } (sin options = fotos de prendas)
  getUploadSignature: (options) => request('/admin/uploads/signature', { method: 'POST', body: options }),

  listRunways: () => request('/admin/runways'),
  getRunway: (id) => request(`/admin/runways/${id}`),
  createRunway: (data) => request('/admin/runways', { method: 'POST', body: data }),
  updateRunway: (id, data) => request(`/admin/runways/${id}`, { method: 'PUT', body: data }),
  deleteRunway: (id) => request(`/admin/runways/${id}`, { method: 'DELETE' }),

  listSubscribers: () => request('/admin/subscribers'),
  deleteSubscriber: (id) => request(`/admin/subscribers/${id}`, { method: 'DELETE' }),

  listMessages: () => request('/admin/messages'),
  unreadMessages: () => request('/admin/messages/unread-count'),
  setMessageRead: (id, read) => request(`/admin/messages/${id}`, { method: 'PATCH', body: { read } }),
  deleteMessage: (id) => request(`/admin/messages/${id}`, { method: 'DELETE' }),
};
