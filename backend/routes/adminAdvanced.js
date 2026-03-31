const express = require('express');
const router = express.Router();
const {
  toggleUserStatus,
  deleteUser,
  rejectCar,
  getPlatformAnalytics,
  getRevenueAnalytics,
  deleteReview,
  getSystemHealth
} = require('../controllers/adminAdvancedController');
const { protect, authorize } = require('../middleware/auth');

// All routes require admin authentication
router.use(protect);
router.use(authorize('admin'));

router.put('/users/:id/toggle-status', toggleUserStatus);
router.delete('/users/:id', deleteUser);
router.put('/cars/:id/reject', rejectCar);
router.get('/analytics', getPlatformAnalytics);
router.get('/revenue', getRevenueAnalytics);
router.delete('/reviews/:id', deleteReview);
router.get('/system-health', getSystemHealth);

module.exports = router;
