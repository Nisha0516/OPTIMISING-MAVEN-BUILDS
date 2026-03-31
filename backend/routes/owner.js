const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getOwnerCars,
  getOwnerBookings,
  getCarReviews,
  getEarnings,
  updateCarAvailability,
  getCarPerformance,
  addCar,
  getCar,
  updateCar,
  deleteCar,
  getProfile,
  updateProfile
} = require('../controllers/ownerController');
const { protect, authorize } = require('../middleware/auth');

// All routes require owner authentication
router.use(protect);
router.use(authorize('owner'));

router.get('/dashboard', getDashboardStats);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/cars', getOwnerCars);
router.post('/cars', addCar);
router.get('/cars/:id', getCar);
router.put('/cars/:id', updateCar);
router.delete('/cars/:id', deleteCar);
router.get('/bookings', getOwnerBookings);
router.get('/reviews/:carId', getCarReviews);
router.get('/earnings', getEarnings);
router.put('/cars/:id/availability', updateCarAvailability);
router.get('/cars/:id/performance', getCarPerformance);

module.exports = router;
