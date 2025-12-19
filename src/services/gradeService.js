import api from './api';

/**
 * Grade API Service
 */
const gradeService = {
  /**
   * Get my grades (student)
   */
  getMyGrades: async (params = {}) => {
    try {
      console.log('📊 GradeService: Fetching grades with params:', params);
      const response = await api.get('/grades/my-grades', { params });
      console.log('✅ GradeService: Grades fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ GradeService: Get grades error:', error);
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
    try {
      console.log('📄 GradeService: Downloading transcript PDF...');
      const response = await api.get('/grades/transcript/pdf', {
        responseType: 'blob',
      });
      console.log('✅ GradeService: Transcript PDF received');
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `transcript_${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      console.log('✅ GradeService: Transcript downloaded');
    } catch (error) {
      console.error('❌ GradeService: Download transcript error:', error);
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




