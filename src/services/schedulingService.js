import api from './api';

/**
 * Scheduling API Service
 */
const schedulingService = {
  /**
   * Generate automatic schedule
   */
  generateSchedule: async (constraints) => {
    const response = await api.post('/scheduling/generate', constraints);
    return response.data;
  },

  /**
   * Get schedule by ID
   */
  getSchedule: async (scheduleId = null) => {
    const url = scheduleId ? `/scheduling/${scheduleId}` : '/scheduling';
    const response = await api.get(url);
    return response.data;
  },

  /**
   * Get user's schedule
   */
  getMySchedule: async () => {
    const response = await api.get('/scheduling/my-schedule');
    return response.data;
  },

  /**
   * Get iCal export
   */
  getICalExport: async () => {
    const response = await api.get('/scheduling/my-schedule/ical', {
      responseType: 'blob',
    });
    return response.data;
  },
};

export default schedulingService;

