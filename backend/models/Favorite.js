const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  car: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure user can only favorite a car once
favoriteSchema.index({ customer: 1, car: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', favoriteSchema);
