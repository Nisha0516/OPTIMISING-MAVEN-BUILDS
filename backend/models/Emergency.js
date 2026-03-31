const mongoose = require('mongoose');

const emergencySchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
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
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['breakdown', 'puncture', 'fuel', 'locked', 'accident', 'medical', 'key_lost', 'other'],
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  location: {
    latitude: Number,
    longitude: Number,
    accuracy: Number,
    timestamp: Date,
    address: String,
    error: String
  },
  status: {
    type: String,
    enum: ['pending', 'acknowledged', 'in_progress', 'resolved', 'cancelled'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'high'
  },
  resolvedAt: Date,
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: String,
  notificationsSent: {
    owner: { type: Boolean, default: false },
    admin: { type: Boolean, default: false },
    customer: { type: Boolean, default: false }
  }
}, {
  timestamps: true
});

// Set priority based on emergency type
emergencySchema.pre('save', function(next) {
  if (this.type === 'accident' || this.type === 'medical') {
    this.priority = 'critical';
  } else if (this.type === 'breakdown' || this.type === 'puncture' || this.type === 'key_lost') {
    this.priority = 'high';
  } else {
    this.priority = 'medium';
  }
  next();
});

module.exports = mongoose.model('Emergency', emergencySchema);
