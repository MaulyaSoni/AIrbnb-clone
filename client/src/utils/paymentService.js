import axios from './axios';

const paymentService = {
  processPayment: async (paymentMethodId, amount, bookingDetails) => {
    try {
      const response = await axios.post('/api/payments/process', {
        paymentMethodId,
        amount,
        bookingDetails
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getPaymentHistory: async () => {
    try {
      const response = await axios.get('/api/payments/history');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getTransactionDetails: async (transactionId) => {
    try {
      const response = await axios.get(`/api/payments/transaction/${transactionId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default paymentService;