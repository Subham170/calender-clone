import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Event Types API
export const eventTypesApi = {
  getAll: () => api.get('/event-types'),
  getBySlug: (slug: string) => api.get(`/event-types/${slug}`),
  create: (data: { title: string; description?: string; duration: number; slug: string }) =>
    api.post('/event-types', data),
  update: (id: number, data: Partial<{ title: string; description: string; duration: number; slug: string; is_active: boolean }>) =>
    api.put(`/event-types/${id}`, data),
  delete: (id: number) => api.delete(`/event-types/${id}`),
};

// Availability API
export const availabilityApi = {
  get: () => api.get('/availability'),
  set: (data: { availability: Array<{ day_of_week: number; start_time: string; end_time: string }>; timezone: string }) =>
    api.post('/availability', data),
};

// Bookings API
export const bookingsApi = {
  getAll: (status?: 'upcoming' | 'past') => {
    const params = status ? { status } : {};
    return api.get('/bookings', { params });
  },
  getAvailableSlots: (slug: string, date: string) =>
    api.get(`/bookings/slots/${slug}`, { params: { date } }),
  create: (slug: string, data: { booker_name: string; booker_email: string; start_time: string }) =>
    api.post(`/bookings/${slug}`, data),
  cancel: (id: number) => api.put(`/bookings/${id}/cancel`),
};

// User API
export const userApi = {
  get: () => api.get('/user'),
  update: (data: { name?: string; email?: string; timezone?: string }) =>
    api.put('/user', data),
};

export default api;
