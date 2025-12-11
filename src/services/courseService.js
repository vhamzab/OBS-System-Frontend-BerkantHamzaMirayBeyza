import api from './api';

/**
 * Course API Service
 */
const courseService = {
  /**
   * Get all courses with pagination and filtering
   */
  getCourses: async (params = {}) => {
    const response = await api.get('/courses', { params });
    return response.data;
  },

  /**
   * Get course by ID with prerequisites and sections
   */
  getCourseById: async (id) => {
    const response = await api.get(`/courses/${id}`);
    return response.data;
  },

  /**
   * Create a new course (admin only)
   */
  createCourse: async (courseData) => {
    const response = await api.post('/courses', courseData);
    return response.data;
  },

  /**
   * Update a course (admin only)
   */
  updateCourse: async (id, courseData) => {
    const response = await api.put(`/courses/${id}`, courseData);
    return response.data;
  },

  /**
   * Delete a course (admin only)
   */
  deleteCourse: async (id) => {
    const response = await api.delete(`/courses/${id}`);
    return response.data;
  },

  /**
   * Get all sections
   */
  getSections: async (params = {}) => {
    const response = await api.get('/sections', { params });
    return response.data;
  },

  /**
   * Get section by ID
   */
  getSectionById: async (id) => {
    const response = await api.get(`/sections/${id}`);
    return response.data;
  },

  /**
   * Get instructor's sections (faculty)
   */
  getInstructorSections: async (params = {}) => {
    const response = await api.get('/sections/my-sections', { params });
    return response.data;
  },

  /**
   * Create a new section (admin only)
   */
  createSection: async (sectionData) => {
    const response = await api.post('/sections', sectionData);
    return response.data;
  },

  /**
   * Update a section (admin only)
   */
  updateSection: async (id, sectionData) => {
    const response = await api.put(`/sections/${id}`, sectionData);
    return response.data;
  },

  /**
   * Get all classrooms
   */
  getClassrooms: async (params = {}) => {
    const response = await api.get('/classrooms', { params });
    return response.data;
  },

  /**
   * Create a classroom (admin only)
   */
  createClassroom: async (classroomData) => {
    const response = await api.post('/classrooms', classroomData);
    return response.data;
  },
};

export default courseService;

