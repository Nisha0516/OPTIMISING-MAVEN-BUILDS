const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  car: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Please provide a rating'],
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: [true, 'Please provide a comment'],
    maxlength: 500
  },
  cleanliness: {
    type: Number,
    min: 1,
    max: 5
  },
  comfort: {
    type: Number,
    min: 1,
    max: 5
  },
  performance: {
    type: Number,
    min: 1,
    max: 5
  },
  images: [{
    type: String
  }],
  helpful: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  reported: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate average rating for car after saving review
reviewSchema.post('save', async function() {
  const Car = mongoose.model('Car');
  const reviews = await mongoose.model('Review').find({ car: this.car });
  const avgRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  await Car.findByIdAndUpdate(this.car, { rating: avgRating });
});

module.exports = mongoose.model('Review', reviewSchema);
