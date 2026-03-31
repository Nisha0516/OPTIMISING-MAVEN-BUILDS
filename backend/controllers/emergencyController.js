const Emergency = require('../models/Emergency');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Car = require('../models/Car');
const Notification = require('../models/Notification');
const { createNotification } = require('./notificationController');
const { io } = require('../server');

// @desc    Create emergency alert
// @route   POST /api/emergency
// @access  Private (Customer)
exports.createEmergency = async (req, res) => {
  try {
    const { bookingId, type, description, location } = req.body;

    // Verify booking exists and belongs to customer
    const booking = await Booking.findById(bookingId)
      .populate('car')
      .populate('owner');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.customer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to create emergency for this booking'
      });
    }

    // Create emergency
    const emergency = await Emergency.create({
      booking: bookingId,
      car: booking.car._id,
      customer: req.user.id,
      owner: booking.owner._id,
      type,
      description,
      location: {
        latitude: location?.latitude,
        longitude: location?.longitude,
        accuracy: location?.accuracy,
        timestamp: location?.timestamp || new Date(),
        address: location?.address || '',
        error: location?.error
      },
      notificationsSent: {
        owner: true,
        admin: true,
        customer: true
      }
    });

    // Populate emergency details
    const populatedEmergency = await Emergency.findById(emergency._id)
      .populate('customer', 'name email phone')
      .populate('owner', 'name email phone')
      .populate('car', 'name type registrationNumber')
      .populate('booking');

    // Send notifications to all admins
    const admins = await User.find({ role: 'admin' }).select('-password');
    
    console.log(`📢 Sending emergency notifications to ${admins.length} admin(s)...`);
    
    // Create notification for each admin
    const notificationPromises = admins.map(async (admin) => {
      try {
        await createNotification(
        admin._id,
        'emergency',
        '🚨 New Emergency Alert',
          `Emergency: ${type} reported by ${req.user.name} for ${booking.car.name}. Location: ${location && !location.error ? `${location.latitude}, ${location.longitude}` : 'Not available'}`,
        { 
            relatedEmergency: emergency._id,
            relatedBooking: booking._id,
            relatedCar: booking.car._id
          }
        );
        console.log(`✅ Notification sent to admin: ${admin.name} (${admin.email})`);
      } catch (error) {
        console.error(`❌ Failed to send notification to admin ${admin.name}:`, error);
      }
    });
    
    await Promise.all(notificationPromises);
    console.log(`✅ All emergency notifications sent successfully!`);
    
    // Emit socket event for real-time update
    if (io) {
      io.emit('new_emergency', {
        emergency: populatedEmergency,
        message: `New emergency alert: ${type}`
      });
    }
    
    // Log the emergency
    console.log('🚨 EMERGENCY ALERT CREATED:', {
      type,
      customer: `${req.user.name} (${req.user.phone})`,
      car: booking.car.name,
      owner: `${booking.owner.name} (${booking.owner.phone})`,
      location: location && !location.error 
        ? `${location.latitude}, ${location.longitude} (Accuracy: ${location.accuracy}m)`
        : 'No location data',
      googleMaps: location && !location.error 
        ? `https://www.google.com/maps?q=${location.latitude},${location.longitude}` 
        : null,
      timestamp: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Emergency alert sent successfully! Support will contact you shortly.',
      emergency: populatedEmergency
    });

  } catch (error) {
    console.error('Create emergency error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create emergency alert',
      error: error.message
    });
  }
};

// @desc    Get customer's emergencies
// @route   GET /api/emergency/my-emergencies
// @access  Private (Customer)
exports.getCustomerEmergencies = async (req, res) => {
  try {
    const emergencies = await Emergency.find({ customer: req.user.id })
      .populate('car', 'name type registrationNumber')
      .populate('owner', 'name phone')
      .populate('booking')
      .sort('-createdAt');

    res.json({
      success: true,
      count: emergencies.length,
      emergencies
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get owner's emergencies
// @route   GET /api/emergency/owner
// @access  Private (Owner)
exports.getOwnerEmergencies = async (req, res) => {
  try {
    const emergencies = await Emergency.find({ owner: req.user.id })
      .populate('customer', 'name email phone')
      .populate('car', 'name type registrationNumber')
      .populate('booking')
      .sort('-createdAt');

    res.json({
      success: true,
      count: emergencies.length,
      emergencies
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all emergencies
// @route   GET /api/emergency/all
// @access  Private (Admin)
exports.getAllEmergencies = async (req, res) => {
  try {
    const { status, priority } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;

    const emergencies = await Emergency.find(query)
      .populate('customer', 'name email phone')
      .populate('owner', 'name email phone')
      .populate('car', 'name type registrationNumber')
      .populate('booking')
      .sort('-createdAt');

    res.json({
      success: true,
      count: emergencies.length,
      emergencies
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update emergency status
// @route   PUT /api/emergency/:id/status
// @access  Private (Admin/Owner)
exports.updateEmergencyStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    
    const emergency = await Emergency.findById(req.params.id);

    if (!emergency) {
      return res.status(404).json({
        success: false,
        message: 'Emergency not found'
      });
    }

    // Check authorization
    if (req.user.role === 'owner' && emergency.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this emergency'
      });
    }

    emergency.status = status;
    if (notes) emergency.notes = notes;
    
    if (status === 'resolved') {
      emergency.resolvedAt = Date.now();
      emergency.resolvedBy = req.user.id;
    }

    await emergency.save();

    const updatedEmergency = await Emergency.findById(emergency._id)
      .populate('customer', 'name email phone')
      .populate('owner', 'name email phone')
      .populate('car', 'name type registrationNumber')
      .populate('resolvedBy', 'name');

    res.json({
      success: true,
      message: 'Emergency status updated successfully',
      emergency: updatedEmergency
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Resolve emergency
// @route   PUT /api/emergency/:id/resolve
// @access  Private (Admin/Owner)
exports.resolveEmergency = async (req, res) => {
  try {
    const { notes } = req.body;
    
    const emergency = await Emergency.findById(req.params.id);

    if (!emergency) {
      return res.status(404).json({
        success: false,
        message: 'Emergency not found'
      });
    }

    // Check authorization
    if (req.user.role === 'owner' && emergency.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to resolve this emergency'
      });
    }

    emergency.status = 'resolved';
    emergency.resolvedAt = Date.now();
    emergency.resolvedBy = req.user.id;
    if (notes) emergency.notes = notes;

    await emergency.save();

    const resolvedEmergency = await Emergency.findById(emergency._id)
      .populate('customer', 'name email phone')
      .populate('owner', 'name email phone')
      .populate('car', 'name type registrationNumber')
      .populate('resolvedBy', 'name');

    res.json({
      success: true,
      message: 'Emergency resolved successfully',
      emergency: resolvedEmergency
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
