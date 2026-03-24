import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || 'http://localhost:3000',
  timeout: 30000,
});

export const registerUser = (email) =>
  api.post('/api/auth/register', { email });

export const saveGeneralProfile = (data) =>
  api.post('/api/profile/general', data);

export const saveCategoryProfile = (data) =>
  api.post('/api/profile/category', data);

export const uploadDocument = (formData) =>
  api.post('/api/profile/documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const getCitizenData = (userId) =>
  api.get(`/api/citizen-data/${userId}`);

export default api;
