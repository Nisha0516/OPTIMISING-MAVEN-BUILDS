const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'booking_created',
      'booking_confirmed',
      'booking_rejected',
      'booking_cancelled',
      'payment_success',
      'payment_failed',
      'car_approved',
      'car_rejected',
      'review_added',
      'system_message',
      'emergency',
      'booking_extension_requested',
      'booking_extension_approved',
      'booking_extension_rejected'
    ]
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  relatedBooking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },
  relatedCar: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car'
  },
  relatedEmergency: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Emergency'
  },
  extraDays: {
    type: Number
  },
  newEndDate: {
    type: Date
  },
  extensionStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  read: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Notification', notificationSchema);
