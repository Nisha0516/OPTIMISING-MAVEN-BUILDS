const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema({
  car: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Service', 'Repair', 'Inspection', 'Cleaning', 'Tire Change', 'Other']
  },
  description: {
    type: String,
    required: true
  },
  cost: {
    type: Number,
    required: true,
    min: 0
  },
  serviceProvider: String,
  date: {
    type: Date,
    required: true
  },
  nextServiceDate: Date,
  mileage: Number,
  receipts: [{
    type: String
  }],
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Maintenance', maintenanceSchema);
