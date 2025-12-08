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

import userService from '../userService';
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

describe('User Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    if (localStorage.clear) {
      localStorage.clear();
    }
    // Manually clear the store
    Object.keys(localStorage).forEach(key => {
      if (key !== 'getItem' && key !== 'setItem' && key !== 'removeItem' && key !== 'clear') {
        delete localStorage[key];
      }
    });
  });

  describe('getProfile', () => {
    it('should get current user profile', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { id: '1', email: 'test@test.com' },
        },
      };

      api.get.mockResolvedValue(mockResponse);

      const result = await userService.getProfile();

      expect(api.get).toHaveBeenCalledWith('/users/me');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('updateProfile', () => {
    it('should update profile and localStorage', async () => {
      const updateData = { firstName: 'Updated', lastName: 'Name' };
      const currentUser = { id: '1', email: 'test@test.com' };
      localStorage.setItem('user', JSON.stringify(currentUser));

      const mockResponse = {
        data: {
          success: true,
          data: { ...currentUser, ...updateData },
        },
      };

      api.put.mockResolvedValue(mockResponse);

      const result = await userService.updateProfile(updateData);

      expect(api.put).toHaveBeenCalledWith('/users/me', updateData);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'user',
        JSON.stringify(mockResponse.data.data)
      );
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('uploadProfilePicture', () => {
    it('should upload profile picture and update localStorage', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const currentUser = { id: '1', email: 'test@test.com' };
      localStorage.setItem('user', JSON.stringify(currentUser));

      const mockResponse = {
        data: {
          success: true,
          data: {
            profilePictureUrl: '/uploads/test.jpg',
          },
        },
      };

      api.post.mockResolvedValue(mockResponse);

      const result = await userService.uploadProfilePicture(file);

      expect(api.post).toHaveBeenCalledWith(
        '/users/me/profile-picture',
        expect.any(FormData),
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('changePassword', () => {
    it('should change password', async () => {
      const currentPassword = 'OldPassword123';
      const newPassword = 'NewPassword123';
      const confirmPassword = 'NewPassword123';

      const mockResponse = {
        data: {
          success: true,
          message: 'Password changed',
        },
      };

      api.put.mockResolvedValue(mockResponse);

      const result = await userService.changePassword(currentPassword, newPassword, confirmPassword);

      expect(api.put).toHaveBeenCalledWith('/users/me/password', {
        currentPassword,
        newPassword,
        confirmPassword,
      });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getAllUsers', () => {
    it('should get all users with params', async () => {
      const params = { page: 1, limit: 10 };
      const mockResponse = {
        data: {
          success: true,
          data: [],
        },
      };

      api.get.mockResolvedValue(mockResponse);

      const result = await userService.getAllUsers(params);

      expect(api.get).toHaveBeenCalledWith('/users', { params });
      expect(result).toEqual(mockResponse.data);
    });

    it('should get all users without params', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: [],
        },
      };

      api.get.mockResolvedValue(mockResponse);

      const result = await userService.getAllUsers();

      expect(api.get).toHaveBeenCalledWith('/users', { params: {} });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getUserById', () => {
    it('should get user by ID', async () => {
      const userId = 'user-123';
      const mockResponse = {
        data: {
          success: true,
          data: { id: userId, email: 'test@test.com' },
        },
      };

      api.get.mockResolvedValue(mockResponse);

      const result = await userService.getUserById(userId);

      expect(api.get).toHaveBeenCalledWith(`/users/${userId}`);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('updateUserStatus', () => {
    it('should update user status', async () => {
      const userId = 'user-123';
      const isActive = true;

      const mockResponse = {
        data: {
          success: true,
          message: 'Status updated',
        },
      };

      api.patch.mockResolvedValue(mockResponse);

      const result = await userService.updateUserStatus(userId, isActive);

      expect(api.patch).toHaveBeenCalledWith(`/users/${userId}/status`, { isActive });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('deleteUser', () => {
    it('should delete user', async () => {
      const userId = 'user-123';
      const mockResponse = {
        data: {
          success: true,
          message: 'User deleted',
        },
      };

      api.delete.mockResolvedValue(mockResponse);

      const result = await userService.deleteUser(userId);

      expect(api.delete).toHaveBeenCalledWith(`/users/${userId}`);
      expect(result).toEqual(mockResponse.data);
    });
  });
});

