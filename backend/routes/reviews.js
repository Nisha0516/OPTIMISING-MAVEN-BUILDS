const express = require('express');
const router = express.Router();
const {
  getCarReviews,
  addReview,
  updateReview,
  deleteReview,
  markHelpful
} = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');

router.get('/car/:carId', getCarReviews);
router.post('/', protect, authorize('customer'), addReview);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);
router.put('/:id/helpful', protect, markHelpful);

module.exports = router;
