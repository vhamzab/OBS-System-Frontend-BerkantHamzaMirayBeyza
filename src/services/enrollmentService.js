import api from './api';

/**
 * Enrollment API Service
 */
const enrollmentService = {
  /**
   * Enroll in a course section (student)
   */
  enrollInCourse: async (sectionId) => {
    try {
      console.log('📝 EnrollmentService: Enrolling in section:', sectionId);
      const response = await api.post('/enrollments', { section_id: sectionId });
      console.log('✅ EnrollmentService: Enrollment successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ EnrollmentService: Enrollment error:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config,
      });
      throw error;
    }
  },

  /**
   * Drop a course (student)
   */
  dropCourse: async (enrollmentId) => {
    try {
      console.log('🗑️ EnrollmentService: Dropping course - Enrollment ID:', enrollmentId);
      const response = await api.delete(`/enrollments/${enrollmentId}`);
      console.log('✅ EnrollmentService: Course dropped successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ EnrollmentService: Drop course error:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config,
      });
      throw error;
    }
  },

  /**
   * Get my enrolled courses (student)
   */
  getMyCourses: async (params = {}) => {
    const response = await api.get('/enrollments/my-courses', { params });
    return response.data;
  },

  /**
   * Get my weekly schedule (student)
   */
  getMySchedule: async (params = {}) => {
    const response = await api.get('/enrollments/schedule', { params });
    return response.data;
  },

  /**
   * Check enrollment eligibility for a section (student)
   */
  checkEligibility: async (sectionId) => {
    const response = await api.get(`/enrollments/check/${sectionId}`);
    return response.data;
  },

  /**
   * Get students in a section (faculty)
   */
  getSectionStudents: async (sectionId) => {
    const response = await api.get(`/enrollments/students/${sectionId}`);
    return response.data;
  },

  // ==================== FACULTY APPROVAL METHODS ====================

  /**
   * Get pending enrollments for faculty's sections
   */
  getPendingEnrollments: async () => {
    try {
      console.log('📋 EnrollmentService: Fetching pending enrollments...');
      const response = await api.get('/enrollments/pending');
      console.log('✅ EnrollmentService: Pending enrollments fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ EnrollmentService: Get pending enrollments error:', error);
      throw error;
    }
  },

  /**
   * Approve a pending enrollment (faculty)
   */
  approveEnrollment: async (enrollmentId) => {
    try {
      console.log('✅ EnrollmentService: Approving enrollment:', enrollmentId);
      const response = await api.put(`/enrollments/${enrollmentId}/approve`);
      console.log('✅ EnrollmentService: Enrollment approved:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ EnrollmentService: Approve enrollment error:', error);
      throw error;
    }
  },

  /**
   * Reject a pending enrollment (faculty)
   */
  rejectEnrollment: async (enrollmentId, reason = '') => {
    try {
      console.log('❌ EnrollmentService: Rejecting enrollment:', enrollmentId);
      const response = await api.put(`/enrollments/${enrollmentId}/reject`, { reason });
      console.log('✅ EnrollmentService: Enrollment rejected:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ EnrollmentService: Reject enrollment error:', error);
      throw error;
    }
  },

  /**
   * Bulk approve enrollments (faculty)
   */
  approveAllEnrollments: async (enrollmentIds) => {
    try {
      console.log('✅ EnrollmentService: Bulk approving enrollments:', enrollmentIds);
      const response = await api.put('/enrollments/approve-all', { enrollmentIds });
      console.log('✅ EnrollmentService: Bulk approval completed:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ EnrollmentService: Bulk approve error:', error);
      throw error;
    }
  },
};

export default enrollmentService;



