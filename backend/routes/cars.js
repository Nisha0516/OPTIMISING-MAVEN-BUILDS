const express = require('express');
const router = express.Router();
const {
  getCars,
  getCar,
  createCar,
  updateCar,
  deleteCar
} = require('../controllers/carController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(getCars)
  .post(protect, authorize('owner', 'admin'), createCar);

router.route('/:id')
  .get(getCar)
  .put(protect, authorize('owner', 'admin'), updateCar)
  .delete(protect, authorize('owner', 'admin'), deleteCar);

module.exports = router;
