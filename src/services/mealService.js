import api from './api';

/**
 * Meal API Service
 */
const mealService = {
  /**
   * Get menus with filters
   */
  getMenus: async (params = {}) => {
    const response = await api.get('/meals/menus', { params });
    return response.data;
  },

  /**
   * Get menu by ID
   */
  getMenuById: async (id) => {
    const response = await api.get(`/meals/menus/${id}`);
    return response.data;
  },

  /**
   * Create menu (admin/cafeteria staff)
   */
  createMenu: async (menuData) => {
    const response = await api.post('/meals/menus', menuData);
    return response.data;
  },

  /**
   * Update menu
   */
  updateMenu: async (id, menuData) => {
    const response = await api.put(`/meals/menus/${id}`, menuData);
    return response.data;
  },

  /**
   * Delete menu
   */
  deleteMenu: async (id) => {
    const response = await api.delete(`/meals/menus/${id}`);
    return response.data;
  },

  /**
   * Create meal reservation
   */
  createReservation: async (reservationData) => {
    const response = await api.post('/meals/reservations', reservationData);
    return response.data;
  },

  /**
   * Cancel reservation
   */
  cancelReservation: async (id) => {
    const response = await api.delete(`/meals/reservations/${id}`);
    return response.data;
  },

  /**
   * Get user's reservations
   */
  getMyReservations: async (params = {}) => {
    const response = await api.get('/meals/reservations/my-reservations', { params });
    return response.data;
  },

  /**
   * Get reservation by QR code (for scanning)
   */
  getReservationByQR: async (qrCode) => {
    const response = await api.get(`/meals/reservations/qr/${qrCode}`);
    return response.data;
  },

  /**
   * Use reservation (cafeteria staff)
   */
  useReservation: async (id, qrCode) => {
    const response = await api.post(`/meals/reservations/${id}/use`, { qr_code: qrCode });
    return response.data;
  },

  /**
   * Transfer reservation to another student
   */
  transferReservation: async (id, studentNumber) => {
    const response = await api.post(`/meals/reservations/${id}/transfer`, { student_number: studentNumber });
    return response.data;
  },

  /**
   * Accept transferred reservation
   */
  acceptTransfer: async (id) => {
    const response = await api.post(`/meals/reservations/${id}/accept-transfer`);
    return response.data;
  },

  /**
   * Get pending transfers for current user
   */
  getPendingTransfers: async () => {
    const response = await api.get('/meals/reservations/pending-transfers');
    return response.data;
  },

  /**
   * Get cafeterias
   */
  getCafeterias: async () => {
    const response = await api.get('/meals/cafeterias');
    return response.data;
  },
};

export default mealService;

