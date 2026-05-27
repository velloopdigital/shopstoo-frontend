import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL
});

// Add token to every request
API.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const auth = {
  register: (data) => API.post('/api/auth/register', data),
  login: (data) => API.post('/api/auth/login', data),
};

export const products = {
  getAll: (params) => API.get('/api/products', { params }),
  getOne: (id) => API.get(`/api/products/${id}`),
  getCategories: () => API.get('/api/products/meta/categories'),
};

export const stores = {
  getAll: (params) => API.get('/api/stores', { params }),
  getOne: (id) => API.get(`/api/stores/${id}`),
  getInventory: (id) => API.get(`/api/stores/${id}/inventory`),
};

export const orders = {
  create: (data) => API.post('/api/orders', data),
  getByBuyer: (id) => API.get(`/api/orders/buyer/${id}`),
  getOne: (id) => API.get(`/api/orders/${id}`),
  updateStatus: (id, status) => API.patch(`/api/orders/${id}/status`, { status }),
  cancel: (id) => API.patch(`/api/orders/${id}/cancel`),
};

export const inventory = {
  check: (params) => API.get('/api/inventory/check', { params }),
};

export default API;
