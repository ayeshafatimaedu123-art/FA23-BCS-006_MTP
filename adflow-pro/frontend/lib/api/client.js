/**
 * API Client for AdFlow Pro
 * Handles all HTTP requests
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

/**
 * Generic fetch wrapper
 */
export const apiCall = async (endpoint, options = {}) => {
  const token = typeof window !== 'undefined' 
    ? localStorage.getItem('accessToken')
    : null;

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

/**
 * Auth API
 */
export const authAPI = {
  register: (payload) => apiCall('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),

  login: (payload) => apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),

  getProfile: () => apiCall('/auth/profile'),

  updateProfile: (payload) => apiCall('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(payload)
  })
};

/**
 * Ads API
 */
export const adsAPI = {
  search: (filters) => {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.categoryId) params.append('categoryId', filters.categoryId);
    if (filters.cityId) params.append('cityId', filters.cityId);
    if (filters.minPrice) params.append('minPrice', filters.minPrice);
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
    params.append('page', filters.page || 1);
    params.append('limit', filters.limit || 10);
    params.append('sort', filters.sort || 'latest');

    return apiCall(`/ads?${params.toString()}`);
  },

  getBySlug: (slug) => apiCall(`/ads/${slug}`),

  create: (payload) => apiCall('/client/ads', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),

  update: (id, payload) => apiCall(`/client/ads/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  }),

  delete: (id) => apiCall(`/client/ads/${id}`, {
    method: 'DELETE'
  })
};

/**
 * Payments API
 */
export const paymentsAPI = {
  create: (payload) => apiCall('/client/payments', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),

  getUserPayments: (page = 1, limit = 10) => apiCall(
    `/client/payments?page=${page}&limit=${limit}`
  ),

  getQueue: (page = 1, limit = 10) => apiCall(
    `/admin/payment-queue?page=${page}&limit=${limit}`
  ),

  verify: (id, payload) => apiCall(`/admin/payments/${id}/verify`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  })
};

/**
 * Public API
 */
export const publicAPI = {
  getCategories: () => apiCall('/categories'),
  getCities: () => apiCall('/cities'),
  getPackages: () => apiCall('/packages')
};
