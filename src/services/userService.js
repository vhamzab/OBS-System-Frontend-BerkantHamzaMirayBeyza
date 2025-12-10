import api, { getFileUrl } from './api';

const userService = {
  // Get current user profile
  getProfile: async () => {
    const response = await api.get('/users/me');
    // Convert profile picture URL to full URL if exists
    if (response.data.data?.profile_picture_url) {
      response.data.data.profile_picture_url = getFileUrl(response.data.data.profile_picture_url);
    }
    return response.data;
  },

  // Update profile
  updateProfile: async (data) => {
    const response = await api.put('/users/me', data);
    
    // Update local storage
    if (response.data.success) {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = { ...currentUser, ...response.data.data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
    
    return response.data;
  },

  // Upload profile picture
  uploadProfilePicture: async (file) => {
    const formData = new FormData();
    formData.append('profilePicture', file);

    const response = await api.post('/users/me/profile-picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // Update local storage
    if (response.data.success) {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      // Convert to full URL
      const fullUrl = getFileUrl(response.data.data.profilePictureUrl);
      currentUser.profile_picture_url = fullUrl;
      localStorage.setItem('user', JSON.stringify(currentUser));
    }

    return response.data;
  },

  // Change password
  changePassword: async (currentPassword, newPassword, confirmPassword) => {
    const response = await api.put('/users/me/password', {
      currentPassword,
      newPassword,
      confirmPassword,
    });
    return response.data;
  },

  // Admin: Get all users
  getAllUsers: async (params = {}) => {
    const response = await api.get('/users', { params });
    return response.data;
  },

  // Admin: Get user by ID
  getUserById: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  // Admin: Update user status
  updateUserStatus: async (userId, isActive) => {
    const response = await api.patch(`/users/${userId}/status`, { isActive });
    return response.data;
  },

  // Admin: Delete user
  deleteUser: async (userId) => {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  },
};

export default userService;

