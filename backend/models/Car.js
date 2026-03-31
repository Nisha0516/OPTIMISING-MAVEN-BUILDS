const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please provide car name'],
    trim: true
  },
  plateNumber: {
    type: String,
    required: [true, 'Please provide car plate number'],
    unique: true,
    trim: true,
    uppercase: true
  },
  type: {
    type: String,
    required: [true, 'Please provide car type'],
    enum: ['Sedan', 'SUV', 'Hatchback', 'Luxury', 'Sports']
  },
  transmission: {
    type: String,
    required: true,
    enum: ['Automatic', 'Manual']
  },
  fuel: {
    type: String,
    required: true,
    enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid']
  },
  seats: {
    type: Number,
    required: true,
    min: 2,
    max: 8
  },
  price: {
    type: Number,
    required: [true, 'Please provide daily rental price'],
    min: 0
  },
  location: {
    type: String,
    required: [true, 'Please provide location']
  },
  available: {
    type: Boolean,
    default: true
  },
  features: [{
    type: String
  }],
  description: {
    type: String,
    required: [true, 'Please provide description']
  },
  images: [{
    type: String
  }],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  approved: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Car', carSchema);
