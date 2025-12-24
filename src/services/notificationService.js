import api from './api';

/**
 * Notification Service - API calls for notifications
 */

// Get notifications with pagination
export const getNotifications = async (page = 1, limit = 20, filters = {}) => {
    const params = new URLSearchParams({ page, limit, ...filters });
    const response = await api.get(`/notifications?${params}`);
    return response.data;
};

// Get recent notifications (for bell dropdown)
export const getRecentNotifications = async (limit = 5) => {
    const response = await api.get(`/notifications/recent?limit=${limit}`);
    return response.data;
};

// Mark notification as read
export const markAsRead = async (notificationId) => {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response.data;
};

// Mark all notifications as read
export const markAllAsRead = async () => {
    const response = await api.put('/notifications/mark-all-read');
    return response.data;
};

// Delete notification
export const deleteNotification = async (notificationId) => {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
};

// Get notification preferences
export const getPreferences = async () => {
    const response = await api.get('/notifications/preferences');
    return response.data;
};

// Update notification preferences
export const updatePreferences = async (preferences) => {
    const response = await api.put('/notifications/preferences', preferences);
    return response.data;
};

export default {
    getNotifications,
    getRecentNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getPreferences,
    updatePreferences
};
