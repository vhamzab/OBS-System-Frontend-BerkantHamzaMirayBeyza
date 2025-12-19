import api from './api';

/**
 * Classroom Reservation API Service
 */
const reservationService = {
  /**
   * Create classroom reservation
   */
  createReservation: async (reservationData) => {
    const response = await api.post('/reservations', reservationData);
    return response.data;
  },

  /**
   * Get reservations with filters
   */
  getReservations: async (params = {}) => {
    const response = await api.get('/reservations', { params });
    return response.data;
  },

  /**
   * Approve reservation (admin)
   */
  approveReservation: async (id) => {
    const response = await api.put(`/reservations/${id}/approve`);
    return response.data;
  },

  /**
   * Reject reservation (admin)
   */
  rejectReservation: async (id, reason = '') => {
    const response = await api.put(`/reservations/${id}/reject`, { reason });
    return response.data;
  },
};

export default reservationService;

