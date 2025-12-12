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
};

export default enrollmentService;

