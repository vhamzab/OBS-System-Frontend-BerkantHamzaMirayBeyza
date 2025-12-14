import api from './api';

/**
 * Announcement API Service
 */
const announcementService = {
    /**
     * Get all announcements
     */
    getAnnouncements: async (params = {}) => {
        const response = await api.get('/announcements', { params });
        return response.data;
    },

    /**
     * Create announcement (admin only)
     */
    createAnnouncement: async (data) => {
        const response = await api.post('/announcements', data);
        return response.data;
    },

    /**
     * Update announcement (admin only)
     */
    updateAnnouncement: async (id, data) => {
        const response = await api.put(`/announcements/${id}`, data);
        return response.data;
    },

    /**
     * Delete announcement (admin only)
     */
    deleteAnnouncement: async (id) => {
        const response = await api.delete(`/announcements/${id}`);
        return response.data;
    },
};

export default announcementService;
