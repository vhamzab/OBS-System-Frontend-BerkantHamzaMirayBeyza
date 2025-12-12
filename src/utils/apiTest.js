import api from '../services/api';

/**
 * Test API connection
 * @returns {Promise<Object>} Test result
 */
export const testApiConnection = async () => {
  try {
    console.log('🧪 Testing API connection...');
    const response = await api.get('/health');
    console.log('✅ API connection test successful:', response.data);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error('❌ API connection test failed:', error);
    return {
      success: false,
      error: {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          baseURL: error.config?.baseURL,
          method: error.config?.method,
        },
      },
    };
  }
};

/**
 * Test courses endpoint
 * @returns {Promise<Object>} Test result
 */
export const testCoursesEndpoint = async () => {
  try {
    console.log('🧪 Testing courses endpoint...');
    const response = await api.get('/courses', { params: { limit: 1 } });
    console.log('✅ Courses endpoint test successful:', response.data);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error('❌ Courses endpoint test failed:', error);
    return {
      success: false,
      error: {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          baseURL: error.config?.baseURL,
          method: error.config?.method,
        },
      },
    };
  }
};

