import api from './api';

const dashboardService = {
    /**
     * Get dashboard stats based on user role
     */
    getStats: async () => {
        const response = await api.get('/dashboard/stats');
        return response.data;
    },

    /**
     * Get recent activities for dashboard
     */
    getActivities: async () => {
        const response = await api.get('/dashboard/activities');
        return response.data;
    },
};

export default dashboardService;
