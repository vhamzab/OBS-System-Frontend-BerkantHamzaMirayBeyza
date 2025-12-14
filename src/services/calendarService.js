import api from './api';

/**
 * Academic Calendar API Service
 */
const calendarService = {
    /**
     * Get calendar events
     */
    getEvents: async (params = {}) => {
        const response = await api.get('/calendar', { params });
        return response.data;
    },

    /**
     * Create calendar event (admin only)
     */
    createEvent: async (data) => {
        const response = await api.post('/calendar', data);
        return response.data;
    },

    /**
     * Update calendar event (admin only)
     */
    updateEvent: async (id, data) => {
        const response = await api.put(`/calendar/${id}`, data);
        return response.data;
    },

    /**
     * Delete calendar event (admin only)
     */
    deleteEvent: async (id) => {
        const response = await api.delete(`/calendar/${id}`);
        return response.data;
    },
};

export default calendarService;
