import api from './api';

const authService = {
  // Register new user
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Verify email
  verifyEmail: async (token) => {
    const response = await api.post('/auth/verify-email', { token });
    return response.data;
  },

  // Login user
  login: async (email, password) => {
    try {
      console.log('🔐 AuthService: Login attempt for:', email);
      console.log('🔗 AuthService: API URL:', api.defaults.baseURL);
      const response = await api.post('/auth/login', { email, password });
      console.log('✅ AuthService: Login response:', response.data);
      
      if (response.data.success) {
        const { accessToken, refreshToken, user } = response.data.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));
        console.log('✅ AuthService: Tokens saved to localStorage');
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ AuthService: Login error:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config,
      });
      
      // Axios error handling
      if (error.response) {
        // Server responded with error status
        const errorMessage = error.response.data?.message || 'Giriş yapılırken bir hata oluştu';
        throw new Error(errorMessage);
      } else if (error.request) {
        // Request was made but no response received (network error)
        console.error('❌ AuthService: No response from server. Request:', error.request);
        throw new Error('Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.');
      } else {
        // Something else happened
        throw new Error(error.message || 'Giriş yapılırken bir hata oluştu');
      }
    }
  },

  // Logout user
  logout: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  },

  // Request password reset
  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Reset password with token
  resetPassword: async (token, password, confirmPassword) => {
    const response = await api.post('/auth/reset-password', {
      token,
      password,
      confirmPassword,
    });
    return response.data;
  },

  // Get current user from localStorage
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('accessToken');
  },
};

export default authService;

