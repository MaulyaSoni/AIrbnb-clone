const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const paymentController = require('../controllers/paymentController');

// Process payment
router.post('/process', auth, paymentController.processPayment);

// Get payment history
router.get('/history', auth, paymentController.getPaymentHistory);

// Get transaction details
router.get('/transaction/:transactionId', auth, paymentController.getTransactionDetails);

module.exports = router;