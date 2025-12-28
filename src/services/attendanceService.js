import api from './api';

/**
 * Attendance API Service
 */
const attendanceService = {
  // ========== Session Management (Faculty) ==========

  /**
   * Create attendance session (faculty)
   */
  createSession: async (sectionId, options = {}) => {
    const response = await api.post('/attendance/sessions', {
      section_id: sectionId,
      duration_minutes: options.durationMinutes || 30,
      geofence_radius: options.geofenceRadius || 15,
    });
    return response.data;
  },

  /**
   * Get session details
   */
  getSession: async (sessionId) => {
    const response = await api.get(`/attendance/sessions/${sessionId}`);
    return response.data;
  },

  /**
   * Close attendance session (faculty)
   */
  closeSession: async (sessionId) => {
    const response = await api.put(`/attendance/sessions/${sessionId}/close`);
    return response.data;
  },

  /**
   * Get instructor's sessions (faculty)
   */
  getInstructorSessions: async (params = {}) => {
    const response = await api.get('/attendance/sessions/my-sessions', { params });
    return response.data;
  },

  /**
   * Regenerate QR code for session (faculty) - 5 second refresh
   */
  regenerateQRCode: async (sessionId) => {
    const response = await api.post(`/attendance/sessions/${sessionId}/regenerate-qr`);
    return response.data;
  },

  /**
   * Get current QR code for session (student)
   */
  getCurrentQRCode: async (sessionId) => {
    const response = await api.get(`/attendance/sessions/${sessionId}/qr`);
    return response.data;
  },

  // ========== Student Attendance ==========

  /**
   * Check in to session (student)
   */
  checkIn: async (sessionId, location = {}, qrCode = null) => {
    const data = {};

    if (location && (location.latitude || location.longitude)) {
      data.latitude = location.latitude;
      data.longitude = location.longitude;
      data.accuracy = location.accuracy;
    }

    if (qrCode) {
      data.qr_code = qrCode;
    }

    const response = await api.post(`/attendance/sessions/${sessionId}/checkin`, data);
    return response.data;
  },

  /**
   * Get active sessions for student
   */
  getActiveSessions: async () => {
    const response = await api.get('/attendance/active-sessions');
    return response.data;
  },

  /**
   * Get my sessions for excuse request (student)
   */
  getMySessions: async () => {
    const response = await api.get('/attendance/my-sessions');
    return response.data;
  },

  /**
   * Get my attendance (student)
   */
  getMyAttendance: async () => {
    try {
      console.log('📊 AttendanceService: Fetching my attendance...');
      const response = await api.get('/attendance/my-attendance');
      console.log('✅ AttendanceService: Attendance fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ AttendanceService: Get attendance error:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config,
      });
      throw error;
    }
  },

  // ========== Reports (Faculty) ==========

  /**
   * Get attendance report for section (faculty)
   */
  getAttendanceReport: async (sectionId) => {
    const response = await api.get(`/attendance/report/${sectionId}`);
    return response.data;
  },

  // ========== Excuse Requests ==========

  /**
   * Create excuse request (student)
   */
  createExcuseRequest: async (sessionId, reason, excuseType, document = null) => {
    const formData = new FormData();
    formData.append('session_id', sessionId);
    formData.append('reason', reason);
    formData.append('excuse_type', excuseType);

    if (document) {
      formData.append('document', document);
    }

    const response = await api.post('/attendance/excuse-requests', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Get my excuse requests (student)
   */
  getMyExcuseRequests: async () => {
    const response = await api.get('/attendance/my-excuse-requests');
    return response.data;
  },

  /**
   * Get excuse requests (faculty)
   */
  getExcuseRequests: async (params = {}) => {
    const response = await api.get('/attendance/excuse-requests', { params });
    return response.data;
  },

  /**
   * Approve excuse request (faculty)
   */
  approveExcuseRequest: async (requestId, notes = '') => {
    const response = await api.put(`/attendance/excuse-requests/${requestId}/approve`, { notes });
    return response.data;
  },

  /**
   * Reject excuse request (faculty)
   */
  rejectExcuseRequest: async (requestId, notes = '') => {
    const response = await api.put(`/attendance/excuse-requests/${requestId}/reject`, { notes });
    return response.data;
  },
};

export default attendanceService;






