// Mock api before importing
jest.mock('../api', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    get: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    patch: jest.fn(),
  },
}));

import authService from '../authService';
import api from '../api';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const userData = {
        email: 'test@test.com',
        password: 'Password123',
        firstName: 'Test',
        lastName: 'User',
      };
      const mockResponse = {
        data: {
          success: true,
          message: 'Registration successful',
        },
      };

      api.post.mockResolvedValue(mockResponse);

      const result = await authService.register(userData);

      expect(api.post).toHaveBeenCalledWith('/auth/register', userData);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('verifyEmail', () => {
    it('should verify email with token', async () => {
      const token = 'verification-token';
      const mockResponse = {
        data: {
          success: true,
          message: 'Email verified',
        },
      };

      api.post.mockResolvedValue(mockResponse);

      const result = await authService.verifyEmail(token);

      expect(api.post).toHaveBeenCalledWith('/auth/verify-email', { token });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('login', () => {
    it('should login and store tokens in localStorage', async () => {
      const email = 'test@test.com';
      const password = 'Password123';
      const mockResponse = {
        data: {
          success: true,
          data: {
            accessToken: 'access-token',
            refreshToken: 'refresh-token',
            user: { id: '1', email: 'test@test.com' },
          },
        },
      };

      api.post.mockResolvedValue(mockResponse);

      const result = await authService.login(email, password);

      expect(api.post).toHaveBeenCalledWith('/auth/login', { email, password });
      expect(localStorage.setItem).toHaveBeenCalledWith('accessToken', 'access-token');
      expect(localStorage.setItem).toHaveBeenCalledWith('refreshToken', 'refresh-token');
      expect(localStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockResponse.data.data.user));
      expect(result).toEqual(mockResponse.data);
    });

    it('should not store tokens if login fails', async () => {
      const mockResponse = {
        data: {
          success: false,
          message: 'Login failed',
        },
      };

      api.post.mockResolvedValue(mockResponse);

      await authService.login('test@test.com', 'wrong');

      expect(localStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should logout and clear localStorage', async () => {
      localStorage.setItem('refreshToken', 'refresh-token');
      const mockResponse = { data: { success: true } };

      api.post.mockResolvedValue(mockResponse);

      await authService.logout();

      expect(api.post).toHaveBeenCalledWith('/auth/logout', { refreshToken: 'refresh-token' });
      expect(localStorage.removeItem).toHaveBeenCalledWith('accessToken');
      expect(localStorage.removeItem).toHaveBeenCalledWith('refreshToken');
      expect(localStorage.removeItem).toHaveBeenCalledWith('user');
    });

    it('should clear localStorage even if API call fails', async () => {
      api.post.mockRejectedValue(new Error('Network error'));

      await authService.logout();

      expect(localStorage.removeItem).toHaveBeenCalledWith('accessToken');
      expect(localStorage.removeItem).toHaveBeenCalledWith('refreshToken');
      expect(localStorage.removeItem).toHaveBeenCalledWith('user');
    });

    it('should clear localStorage even without refresh token', async () => {
      await authService.logout();

      expect(localStorage.removeItem).toHaveBeenCalledWith('accessToken');
      expect(localStorage.removeItem).toHaveBeenCalledWith('refreshToken');
      expect(localStorage.removeItem).toHaveBeenCalledWith('user');
    });
  });

  describe('forgotPassword', () => {
    it('should request password reset', async () => {
      const email = 'test@test.com';
      const mockResponse = {
        data: {
          success: true,
          message: 'Reset email sent',
        },
      };

      api.post.mockResolvedValue(mockResponse);

      const result = await authService.forgotPassword(email);

      expect(api.post).toHaveBeenCalledWith('/auth/forgot-password', { email });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('resetPassword', () => {
    it('should reset password with token', async () => {
      const token = 'reset-token';
      const password = 'NewPassword123';
      const confirmPassword = 'NewPassword123';
      const mockResponse = {
        data: {
          success: true,
          message: 'Password reset successful',
        },
      };

      api.post.mockResolvedValue(mockResponse);

      const result = await authService.resetPassword(token, password, confirmPassword);

      expect(api.post).toHaveBeenCalledWith('/auth/reset-password', {
        token,
        password,
        confirmPassword,
      });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getCurrentUser', () => {
    it('should return user from localStorage', () => {
      const user = { id: '1', email: 'test@test.com' };
      localStorage.setItem('user', JSON.stringify(user));

      const result = authService.getCurrentUser();

      expect(result).toEqual(user);
    });

    it('should return null if no user in localStorage', () => {
      const result = authService.getCurrentUser();

      expect(result).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true if access token exists', () => {
      localStorage.setItem('accessToken', 'token');

      const result = authService.isAuthenticated();

      expect(result).toBe(true);
    });

    it('should return false if no access token', () => {
      const result = authService.isAuthenticated();

      expect(result).toBe(false);
    });
  });
});

