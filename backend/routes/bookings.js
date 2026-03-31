const express = require('express');
const router = express.Router();
const {
  getBookings,
  getBooking,
  createBooking,
  updateBooking,
  deleteBooking,
  approveBooking,
  rejectBooking,
  confirmBooking,
  acceptBooking,
  deleteBookingPermanent,
  extendBooking,
  approveExtension,
  rejectExtension
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, getBookings)
  .post(protect, authorize('customer'), createBooking);

router.route('/:id')
  .get(protect, getBooking)
  .put(protect, updateBooking)
  .delete(protect, deleteBooking);

router.put('/:id/approve', protect, authorize('owner', 'admin'), approveBooking);
router.put('/:id/reject', protect, authorize('owner', 'admin'), rejectBooking);
router.put('/:id/confirm', protect, authorize('customer'), confirmBooking);
router.put('/:id/accept', protect, authorize('customer'), acceptBooking);
router.put('/:id/extend', protect, authorize('customer'), extendBooking);
router.put('/notifications/:id/approve-extension', protect, authorize('owner', 'admin'), approveExtension);
router.put('/notifications/:id/reject-extension', protect, authorize('owner', 'admin'), rejectExtension);
router.delete('/:id/delete', protect, authorize('customer'), deleteBookingPermanent);

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ message: 'Bookings routes are working', timestamp: new Date() });
});

module.exports = router;
