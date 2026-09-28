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

  getUploadSignature: () => request('/admin/uploads/signature', { method: 'POST' }),
};
