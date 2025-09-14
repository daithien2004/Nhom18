import axios, { AxiosError } from 'axios';
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

instance.interceptors.response.use(
  (response) => {
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
  },
  (error: AxiosError) => {
    // Xử lý lỗi validation từ backend
    if (error.response?.status === 400) {
      const errorData = error.response.data as any;
      
      // Nếu có validation errors từ Zod middleware
      if (errorData?.validationErrors && Array.isArray(errorData.validationErrors)) {
        const validationErrors = errorData.validationErrors.reduce((acc: any, err: any) => {
          acc[err.field] = err.message;
          return acc;
        }, {});
        
        // Tạo error object với validation errors
        const validationError = new Error('Validation failed');
        (validationError as any).validationErrors = validationErrors;
        (validationError as any).isValidationError = true;
        return Promise.reject(validationError);
      }
    }
    
    // Xử lý lỗi authentication
    if (error.response?.status === 401) {
      // Có thể thêm logic logout user ở đây
      console.warn('Unauthorized access - token may be expired');
    }
    
    // Xử lý lỗi server
    if (error.response && error.response.status >= 500) {
      console.error('Server error:', error.response.data);
    }
    
    return Promise.reject(error);
  }
);

export default instance;
