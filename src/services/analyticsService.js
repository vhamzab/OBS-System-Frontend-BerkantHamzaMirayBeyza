import api from './api';

/**
 * Analytics Service - API calls for admin analytics
 */

// Get admin dashboard statistics
export const getDashboardStats = async () => {
    const response = await api.get('/analytics/dashboard');
    return response.data;
};

// Get academic performance analytics
export const getAcademicPerformance = async () => {
    const response = await api.get('/analytics/academic-performance');
    return response.data;
};

// Get attendance analytics
export const getAttendanceAnalytics = async (days = 30) => {
    const response = await api.get(`/analytics/attendance?days=${days}`);
    return response.data;
};

// Get meal usage analytics
export const getMealUsageAnalytics = async (days = 30) => {
    const response = await api.get(`/analytics/meal-usage?days=${days}`);
    return response.data;
};

// Get event analytics
export const getEventAnalytics = async (days = 90) => {
    const response = await api.get(`/analytics/events?days=${days}`);
    return response.data;
};

// Export report
export const exportReport = async (type, format = 'csv') => {
    const response = await api.get(`/analytics/export/${type}?format=${format}`, {
        responseType: format === 'csv' ? 'blob' : 'json'
    });

    if (format === 'csv') {
        // Create download link for CSV
        const blob = new Blob([response.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${type}_report_${Date.now()}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        return { success: true };
    }

    return response.data;
};

export default {
    getDashboardStats,
    getAcademicPerformance,
    getAttendanceAnalytics,
    getMealUsageAnalytics,
    getEventAnalytics,
    exportReport
};
