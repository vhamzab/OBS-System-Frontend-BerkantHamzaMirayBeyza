import axios from 'axios';

// Dinamik API URL - farklı cihazlardan erişim için
const getApiUrl = () => {
  // Eğer env'de belirtilmişse onu kullan (production için önemli!)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Development modunda Vite proxy kullan (vite.config.js'de tanımlı)
  // Bu sayede CORS sorunları olmaz ve aynı origin'den istek atılır
  if (import.meta.env.DEV) {
    // Vite proxy kullanarak istekleri backend'e yönlendir
    return '/api/v1';
  }
  
  // Production'da VITE_API_URL yoksa, Cloud Run backend URL'ini kullan
  // Frontend: obs-frontend-*.run.app -> Backend: obs-api-*.run.app
  if (typeof window !== 'undefined') {
    const { hostname } = window.location;
    
    // Cloud Run domain pattern'i kontrol et
    if (hostname.includes('.run.app')) {
      // Frontend domain'inden backend domain'ini türet
      // obs-frontend-214391529742.europe-west1.run.app -> obs-api-214391529742.europe-west1.run.app
      const backendHostname = hostname.replace('obs-frontend', 'obs-api');
      return `https://${backendHostname}/api/v1`;
    }
    
    // Local production veya diğer durumlar için
    const { protocol } = window.location;
    return `${protocol}//${hostname}:5000/api/v1`;
  }
  
  // Fallback
  return 'http://localhost:5000/api/v1';
};

const API_URL = getApiUrl();

// Debug: API URL'yi console'a yazdır (hem development hem production'da)
console.log('🔗 API URL:', API_URL);
console.log('🌍 Environment:', import.meta.env.MODE);
console.log('📦 VITE_API_URL:', import.meta.env.VITE_API_URL);

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 saniye timeout
});

// Request interceptor - Add auth token and log requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Debug: Request log (hem dev hem production'da)
    console.log('📤 Request:', config.method?.toUpperCase(), config.baseURL + config.url);
    
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token refresh and log responses
api.interceptors.response.use(
  (response) => {
    // Debug: Response log (hem dev hem production'da)
    console.log('📥 Response:', response.status, response.config.url);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Debug: Error log (hem dev hem production'da)
    console.error('❌ API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      data: error.response?.data,
      fullError: error,
    });

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (!refreshToken) {
          // No refresh token, logout user
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return Promise.reject(error);
        }

        // Try to refresh the token
        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken } = response.data.data;
        
        // Save new access token
        localStorage.setItem('accessToken', accessToken);
        
        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Helper function to get full URL for uploaded files
export const getFileUrl = (relativePath) => {
  if (!relativePath) return null;
  
  // If already a full URL, return as is
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    return relativePath;
  }
  
  // Get base URL (remove /api/v1 from API_URL)
  const baseUrl = API_URL.replace('/api/v1', '');
  
  // Ensure relative path starts with /
  const path = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
  
  return `${baseUrl}${path}`;
};

export default api;
