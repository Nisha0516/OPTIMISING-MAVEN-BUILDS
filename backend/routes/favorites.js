const express = require('express');
const router = express.Router();
const {
  getFavorites,
  addFavorite,
  removeFavorite,
  checkFavorite
} = require('../controllers/favoriteController');
const { protect, authorize } = require('../middleware/auth');

// All routes require customer authentication
router.use(protect);
router.use(authorize('customer'));

router.route('/')
  .get(getFavorites)
  .post(addFavorite);

router.delete('/:carId', removeFavorite);
router.get('/check/:carId', checkFavorite);

module.exports = router;
