// backend/routes/payments.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createRazorpayOrder,
  verifyRazorpayPayment,
  generateUPILink,
  checkPaymentStatus
} = require('../controllers/paymentController');

// Test route
router.get('/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Payments API is working!',
    timestamp: new Date().toISOString()
  });
});

// Apply auth middleware to all routes below
router.use(protect);

// Create Razorpay order
router.post('/create-order', createRazorpayOrder);

// Verify payment
router.post('/verify', verifyRazorpayPayment);

// Generate UPI payment link
router.post('/upi-link', generateUPILink);

// Check payment status
router.get('/status/:paymentId', checkPaymentStatus);

module.exports = router;