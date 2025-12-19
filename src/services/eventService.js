import api from './api';

/**
 * Event API Service
 */
const eventService = {
  /**
   * Get events with filters
   */
  getEvents: async (params = {}) => {
    const response = await api.get('/events', { params });
    return response.data;
  },

  /**
   * Get event by ID
   */
  getEventById: async (id) => {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },

  /**
   * Create event (admin/event manager)
   */
  createEvent: async (eventData) => {
    const response = await api.post('/events', eventData);
    return response.data;
  },

  /**
   * Update event
   */
  updateEvent: async (id, eventData) => {
    const response = await api.put(`/events/${id}`, eventData);
    return response.data;
  },

  /**
   * Delete event
   */
  deleteEvent: async (id) => {
    const response = await api.delete(`/events/${id}`);
    return response.data;
  },

  /**
   * Register for event
   */
  registerForEvent: async (eventId, customFields = {}) => {
    const response = await api.post(`/events/${eventId}/register`, { custom_fields: customFields });
    return response.data;
  },

  /**
   * Get user's event registrations
   */
  getMyEventRegistrations: async () => {
    const response = await api.get('/events/my-registrations');
    return response.data;
  },

  /**
   * Cancel event registration
   */
  cancelRegistration: async (eventId, registrationId) => {
    const response = await api.delete(`/events/${eventId}/registrations/${registrationId}`);
    return response.data;
  },

  /**
   * Get event registrations (event manager)
   */
  getEventRegistrations: async (eventId) => {
    const response = await api.get(`/events/${eventId}/registrations`);
    return response.data;
  },

  /**
   * Get registration by QR code (for scanning)
   */
  getRegistrationByQR: async (qrCode) => {
    const response = await api.get(`/events/registrations/qr/${qrCode}`);
    return response.data;
  },

  /**
   * Check-in to event
   */
  checkIn: async (eventId, registrationId, qrCode) => {
    const response = await api.post(`/events/${eventId}/registrations/${registrationId}/checkin`, {
      qr_code: qrCode,
    });
    return response.data;
  },
};

export default eventService;

