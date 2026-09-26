/**
 * Fleuria Handmade Admin API Client
 */

const API_BASE = '/api';

export const LIVE_STORE_URL = 'https://fleuria-handmade-lac.vercel.app/';

export function getProductImage(img) {
  if (!img) return '/assets/images/pipe-cleaner-tulips.jpg';
  const trimmed = String(img).trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
    return trimmed;
  }
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}

export function getAuthToken() {
  return localStorage.getItem('fleuria_token') || '';
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem('fleuria_token', token);
  } else {
    localStorage.removeItem('fleuria_token');
  }
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem('fleuria_user');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function setStoredUser(user) {
  if (user) {
    localStorage.setItem('fleuria_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('fleuria_user');
  }
}

async function request(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Accept': 'application/json',
    ...(options.headers || {})
  };

  // If not FormData, attach Content-Type application/json
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  if (res.status === 401) {
    // If unauthorized, clear token and notify
    setAuthToken(null);
    setStoredUser(null);
    window.dispatchEvent(new CustomEvent('fleuria_unauthorized'));
  }

  let data;
  try {
    data = await res.json();
  } catch (err) {
    data = { success: false, error: 'Invalid response from server' };
  }

  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }

  return data;
}

export const api = {
  // Auth
  async login(login, password) {
    const res = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ login, password })
    });
    if (res.success && res.token) {
      setAuthToken(res.token);
      setStoredUser(res.user);
    }
    return res;
  },

  async getMe() {
    return request('/auth/me');
  },

  logout() {
    setAuthToken(null);
    setStoredUser(null);
  },

  // Stats
  async getStats() {
    return request('/stats');
  },

  // Products
  async getProducts(params = {}) {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'all') query.set('category', params.category);
    if (params.search) query.set('search', params.search);
    if (params.status && params.status !== 'all') query.set('status', params.status);
    
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request(`/products${qs}`);
  },

  async getProductById(id) {
    return request(`/products/${id}`);
  },

  async createProduct(productData) {
    return request('/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    });
  },

  async updateProduct(id, productData) {
    return request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData)
    });
  },

  async deleteProduct(id) {
    return request(`/products/${id}`, {
      method: 'DELETE'
    });
  },

  // File Upload
  async uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);
    return request('/upload', {
      method: 'POST',
      body: formData
    });
  }
};
