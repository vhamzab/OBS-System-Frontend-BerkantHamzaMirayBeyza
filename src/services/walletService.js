import api from './api';

/**
 * Wallet API Service
 */
const walletService = {
  /**
   * Get wallet balance
   */
  getBalance: async () => {
    const response = await api.get('/wallet/balance');
    return response.data;
  },

  /**
   * Create top-up session
   */
  createTopup: async (amount) => {
    const response = await api.post('/wallet/topup', { amount });
    return response.data;
  },

  /**
   * Get transaction history
   */
  getTransactions: async (params = {}) => {
    const response = await api.get('/wallet/transactions', { params });
    return response.data;
  },
};

export default walletService;

