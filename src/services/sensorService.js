import api from './api';

/**
 * Sensor Service - API calls for IoT sensors
 */

// Get all sensors
export const getAllSensors = async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/sensors?${params}`);
    return response.data;
};

// Get sensor by ID
export const getSensorById = async (sensorId) => {
    const response = await api.get(`/sensors/${sensorId}`);
    return response.data;
};

// Get sensor data with optional aggregation
export const getSensorData = async (sensorId, options = {}) => {
    const { startDate, endDate, aggregation = 'raw', limit = 100 } = options;
    const params = new URLSearchParams({ aggregation, limit });
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await api.get(`/sensors/${sensorId}/data?${params}`);
    return response.data;
};

// Get latest readings for all sensors
export const getLatestReadings = async () => {
    const response = await api.get('/sensors/latest');
    return response.data;
};

// Simulate sensor data (admin only)
export const simulateSensorData = async () => {
    const response = await api.post('/sensors/simulate');
    return response.data;
};

// Create new sensor (admin only)
export const createSensor = async (sensorData) => {
    const response = await api.post('/sensors', sensorData);
    return response.data;
};

export default {
    getAllSensors,
    getSensorById,
    getSensorData,
    getLatestReadings,
    simulateSensorData,
    createSensor
};
