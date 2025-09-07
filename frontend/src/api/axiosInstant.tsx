import axios from 'axios';
import { getToken } from '../utils/authHelpers';

const instance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
});

instance.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

instance.interceptors.response.use((response) => {
  const wrapped = response?.data;
  if (
    wrapped &&
    typeof wrapped === 'object' &&
    'data' in wrapped &&
    ('success' in wrapped || 'timestamp' in wrapped || 'message' in wrapped)
  ) {
    return { ...response, data: (wrapped as any).data };
  }
  return response;
});

export default instance;
