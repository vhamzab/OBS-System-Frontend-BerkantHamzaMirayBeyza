import api from './api';

/**
 * Enrollment API Service
 */
const enrollmentService = {
  /**
   * Enroll in a course section (student)
   */
  enrollInCourse: async (sectionId) => {
    const response = await api.post('/enrollments', { section_id: sectionId });
    return response.data;
  },

  /**
   * Drop a course (student)
   */
  dropCourse: async (enrollmentId) => {
    const response = await api.delete(`/enrollments/${enrollmentId}`);
    return response.data;
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

