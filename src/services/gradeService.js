import api from './api';

/**
 * Grade API Service
 */
const gradeService = {
  /**
   * Get my grades (student)
   */
  getMyGrades: async (params = {}) => {
    const response = await api.get('/grades/my-grades', { params });
    return response.data;
  },

  /**
   * Get transcript as JSON (student)
   */
  getTranscript: async () => {
    const response = await api.get('/grades/transcript');
    return response.data;
  },

  /**
   * Download transcript as PDF (student)
   */
  downloadTranscriptPDF: async () => {
    const response = await api.get('/grades/transcript/pdf', {
      responseType: 'blob',
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `transcript_${Date.now()}.html`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  /**
   * Enter grades for a student (faculty)
   */
  enterGrades: async (enrollmentId, grades) => {
    const response = await api.post('/grades', {
      enrollment_id: enrollmentId,
      ...grades,
    });
    return response.data;
  },

  /**
   * Bulk enter grades for a section (faculty)
   */
  bulkEnterGrades: async (sectionId, grades) => {
    const response = await api.post('/grades/bulk', {
      section_id: sectionId,
      grades,
    });
    return response.data;
  },
};

export default gradeService;

