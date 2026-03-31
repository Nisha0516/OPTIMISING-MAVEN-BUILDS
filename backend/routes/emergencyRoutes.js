const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createEmergency,
  getCustomerEmergencies,
  getOwnerEmergencies,
  getAllEmergencies,
  updateEmergencyStatus,
  resolveEmergency
} = require('../controllers/emergencyController');

// Customer routes
router.post('/', protect, authorize('customer'), createEmergency);
router.get('/my-emergencies', protect, authorize('customer'), getCustomerEmergencies);

// Owner routes
router.get('/owner', protect, authorize('owner'), getOwnerEmergencies);

// Admin routes
router.get('/all', protect, authorize('admin'), getAllEmergencies);

// Admin/Owner routes
router.put('/:id/status', protect, authorize('admin', 'owner'), updateEmergencyStatus);
router.put('/:id/resolve', protect, authorize('admin', 'owner'), resolveEmergency);

module.exports = router;
