const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllBookings,
  getAllUsers,
  getAllCars,
  approveCar,
  getReports
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All admin routes require admin role
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getDashboardStats);
router.get('/bookings', getAllBookings);
router.get('/users', getAllUsers);
router.get('/cars', getAllCars);
router.put('/cars/:id/approve', approveCar);
router.get('/reports', getReports);

module.exports = router;
