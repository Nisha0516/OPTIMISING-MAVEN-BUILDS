const Booking = require('../models/Booking');
const Car = require('../models/Car');
const Notification = require('../models/Notification');

// @desc    Get all bookings for logged in user
// @route   GET /api/bookings
// @access  Private
exports.getBookings = async (req, res) => {
  try {
    let query;

    if (req.user.role === 'customer') {
      query = { customer: req.user.id };
    } else if (req.user.role === 'owner') {
      query = { owner: req.user.id };
    } else if (req.user.role === 'admin') {
      query = {};
    }

    const bookings = await Booking.find(query)
      .populate('customer', 'name email phone')
      .populate('car', 'name type price images plateNumber')
      .populate('owner', 'name email phone')
      .sort('-createdAt');

    res.json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
exports.getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('customer', 'name email phone')
      .populate('car')
      .populate('owner', 'name email phone');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check authorization
    if (
      booking.customer._id.toString() !== req.user.id &&
      booking.owner._id.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking'
      });
    }

    res.json({
      success: true,
      booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private (Customer)
exports.createBooking = async (req, res) => {
  try {
    const { carId, startDate, endDate, paymentMethod, notes } = req.body;

    // Get car details
    const car = await Car.findById(carId);

    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found'
      });
    }

    if (!car.available) {
      return res.status(400).json({
        success: false,
        message: 'Car is not available for booking'
      });
    }

    // Calculate total price
    const days = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
    const totalPrice = days * car.price;

    // Create booking
    const booking = await Booking.create({
      customer: req.user.id,
      car: carId,
      owner: car.owner,
      startDate,
      endDate,
      totalPrice,
      paymentMethod,
      notes
    });

    // Populate fields
    await booking.populate('car', 'name type price images plateNumber');
    await booking.populate('owner', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update booking
// @route   PUT /api/bookings/:id
// @access  Private
exports.updateBooking = async (req, res) => {
  try {
    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check authorization
    if (
      booking.customer.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this booking'
      });
    }

    booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      message: 'Booking updated successfully',
      booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Cancel/Delete booking
// @route   DELETE /api/bookings/:id
// @access  Private
exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check authorization (customer, owner, or admin)
    if (
      booking.customer.toString() !== req.user.id &&
      booking.owner.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      });
    }

    booking.status = 'Cancelled';
    await booking.save();

    res.json({
      success: true,
      message: 'Booking cancelled successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Approve booking
// @route   PUT /api/bookings/:id/approve
// @access  Private (Owner/Admin)
exports.approveBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    booking.status = 'Confirmed';
    await booking.save();

    res.json({
      success: true,
      message: 'Booking approved successfully',
      booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Reject booking
// @route   PUT /api/bookings/:id/reject
// @access  Private (Owner/Admin)
exports.rejectBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    booking.status = 'Rejected';
    await booking.save();

    res.json({
      success: true,
      message: 'Booking rejected',
      booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Confirm booking
// @route   PUT /api/bookings/:id/confirm
// @access  Private (Customer)
exports.confirmBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check authorization (customer can only confirm their own bookings)
    if (booking.customer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to confirm this booking'
      });
    }

    // Check if booking is in pending status
    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending bookings can be confirmed'
      });
    }

    booking.status = 'Confirmed';
    await booking.save();

    res.json({
      success: true,
      message: 'Booking confirmed successfully',
      booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Accept booking
// @route   PUT /api/bookings/:id/accept
// @access  Private (Customer)
exports.acceptBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check authorization (customer can only accept their own bookings)
    if (booking.customer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to accept this booking'
      });
    }

    // Mark booking as accepted by customer
    booking.customerAccepted = true;
    await booking.save();

    res.json({
      success: true,
      message: 'Booking accepted successfully',
      booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Request booking extension (creates notification for owner)
// @route   PUT /api/bookings/:id/extend
// @access  Private (Customer)
exports.extendBooking = async (req, res) => {
  try {
    const { extraDays } = req.body;

    const daysToAdd = parseInt(extraDays, 10);
    if (!daysToAdd || Number.isNaN(daysToAdd) || daysToAdd <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Extra days must be a positive number'
      });
    }

    if (daysToAdd > 7) {
      return res.status(400).json({
        success: false,
        message: 'You can request up to 7 extra days online.'
      });
    }

    const booking = await Booking.findById(req.params.id).populate('car', 'price owner');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.customer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to extend this booking'
      });
    }

    if (booking.status.toLowerCase() !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'Only confirmed bookings can be extended'
      });
    }

    const currentEndDate = new Date(booking.endDate);
    if (Number.isNaN(currentEndDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid current end date for booking'
      });
    }

    const pricePerDay = booking.car && typeof booking.car.price === 'number' ? booking.car.price : null;
    if (pricePerDay === null) {
      return res.status(400).json({
        success: false,
        message: 'Car price is not available for this booking'
      });
    }

    const newEndDate = new Date(currentEndDate);
    newEndDate.setDate(newEndDate.getDate() + daysToAdd);

    // Create notification for owner
    console.log('Creating extension notification...');
    console.log('Booking owner:', booking.owner);
    console.log('Booking ID:', booking._id);
    console.log('Car ID:', booking.car._id);
    
    const notification = await Notification.create({
      user: booking.owner,
      type: 'booking_extension_requested',
      title: 'Booking Extension Request',
      message: `Customer wants to extend booking #${booking._id} by ${daysToAdd} day(s) until ${newEndDate.toLocaleDateString()}.`,
      relatedBooking: booking._id,
      relatedCar: booking.car._id,
      extraDays: daysToAdd,
      newEndDate,
      extensionStatus: 'pending'
    });
    
    console.log('Extension notification created with ID:', notification._id);

    res.json({
      success: true,
      message: `Extension request sent to owner for ${daysToAdd} extra day(s). Awaiting approval.`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Approve a booking extension request
// @route   PUT /api/bookings/:id/approve-extension
// @access  Private (Owner/Admin)
exports.approveExtension = async (req, res) => {
  try {
    console.log('=== APPROVE EXTENSION START ===');
    console.log('Params:', req.params);
    console.log('User ID:', req.user?.id);
    console.log('User role:', req.user?.role);

    const notificationId = req.params.id;
    if (!notificationId) {
      console.log('No notification ID provided');
      return res.status(400).json({ success: false, message: 'Notification ID required' });
    }

    const notification = await Notification.findById(notificationId)
      .populate({
        path: 'relatedBooking',
        populate: { path: 'car' }
      })
      .populate('relatedCar');

    console.log('Notification found:', !!notification);
    if (notification) {
      console.log('Notification details:', {
        id: notification._id,
        type: notification.type,
        user: notification.user,
        extensionStatus: notification.extensionStatus,
        relatedBooking: notification.relatedBooking?._id,
        relatedCar: notification.relatedCar?._id
      });
    }

    if (!notification) {
      console.log('Notification not found');
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    if (notification.type !== 'booking_extension_requested') {
      console.log('Wrong notification type:', notification.type);
      return res.status(400).json({ success: false, message: 'Invalid notification type' });
    }

    if (notification.user.toString() !== req.user.id && req.user.role !== 'admin') {
      console.log('Authorization failed. Notification user:', notification.user, 'Request user:', req.user.id);
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (notification.extensionStatus !== 'pending') {
      console.log('Already processed:', notification.extensionStatus);
      return res.status(400).json({ success: false, message: 'Request already processed' });
    }

    const booking = notification.relatedBooking;
    console.log('Booking found:', !!booking);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Related booking not found' });
    }

    console.log('Booking details:', {
      id: booking._id,
      currentEndDate: booking.endDate,
      currentTotalPrice: booking.totalPrice,
      carPrice: booking.car?.price
    });

    const pricePerDay = booking.car.price;
    booking.endDate = notification.newEndDate;
    booking.totalPrice = booking.totalPrice + (pricePerDay * notification.extraDays);
    await booking.save();
    console.log('Booking updated successfully');

    notification.extensionStatus = 'approved';
    await notification.save();
    console.log('Notification updated to approved');

    // Notify customer
    try {
      const customerNotification = await Notification.create({
        user: booking.customer,
        type: 'booking_extension_approved',
        title: 'Car Rental Extension Approved! 🎉',
        message: `Great news! Your request to extend ${booking.car.name} rental has been approved. Your booking is now extended until ${new Date(notification.newEndDate).toLocaleDateString()}. The additional cost is ₹${pricePerDay * notification.extraDays}.`,
        relatedBooking: booking._id,
        relatedCar: booking.car._id
      });
      console.log('✅ Customer notification created:', customerNotification._id);
    } catch (notifError) {
      console.error('Failed to create customer notification:', notifError);
    }

    console.log('=== APPROVE EXTENSION SUCCESS ===');
    res.json({ success: true, message: 'Extension approved and booking updated.' });
  } catch (error) {
    console.error('=== APPROVE EXTENSION ERROR ===', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reject a booking extension request
// @route   PUT /api/bookings/:id/reject-extension
// @access  Private (Owner/Admin)
exports.rejectExtension = async (req, res) => {
  try {
    console.log('=== REJECT EXTENSION START ===');
    console.log('Params:', req.params);
    console.log('User ID:', req.user?.id);
    console.log('User role:', req.user?.role);

    const notificationId = req.params.id;
    if (!notificationId) {
      console.log('No notification ID provided');
      return res.status(400).json({ success: false, message: 'Notification ID required' });
    }

    const notification = await Notification.findById(notificationId)
      .populate({
        path: 'relatedBooking',
        populate: { path: 'car' }
      })
      .populate('relatedCar');

    console.log('Notification found:', !!notification);
    if (notification) {
      console.log('Notification details:', {
        id: notification._id,
        type: notification.type,
        user: notification.user,
        extensionStatus: notification.extensionStatus,
        relatedBooking: notification.relatedBooking?._id,
        relatedCar: notification.relatedCar?._id
      });
    }

    if (!notification) {
      console.log('Notification not found');
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    if (notification.type !== 'booking_extension_requested') {
      console.log('Wrong notification type:', notification.type);
      return res.status(400).json({ success: false, message: 'Invalid notification type' });
    }

    if (notification.user.toString() !== req.user.id && req.user.role !== 'admin') {
      console.log('Authorization failed. Notification user:', notification.user, 'Request user:', req.user.id);
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (notification.extensionStatus !== 'pending') {
      console.log('Already processed:', notification.extensionStatus);
      return res.status(400).json({ success: false, message: 'Request already processed' });
    }

    notification.extensionStatus = 'rejected';
    await notification.save();
    console.log('Notification updated to rejected');

    // Notify customer
    try {
      const customerNotification = await Notification.create({
        user: notification.relatedBooking.customer,
        type: 'booking_extension_rejected',
        title: 'Car Rental Extension Request Declined ❌',
        message: `Your request to extend ${notification.relatedCar.name} rental has been declined. Your current booking remains unchanged and will end on ${notification.relatedBooking.endDate.toLocaleDateString()}. Please contact the owner if you need to make alternative arrangements.`,
        relatedBooking: notification.relatedBooking._id,
        relatedCar: notification.relatedCar._id
      });
      console.log('✅ Customer rejection notification created:', customerNotification._id);
    } catch (notifError) {
      console.error('Failed to create customer rejection notification:', notifError);
    }

    console.log('=== REJECT EXTENSION SUCCESS ===');
    res.json({ success: true, message: 'Extension rejected.' });
  } catch (error) {
    console.error('=== REJECT EXTENSION ERROR ===', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Permanently delete booking
// @route   DELETE /api/bookings/:id/delete
// @access  Private (Customer)
exports.deleteBookingPermanent = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check authorization (customer can only delete their own bookings)
    if (booking.customer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this booking'
      });
    }

    // Only allow deletion of cancelled, rejected, or completed bookings
    if (!['cancelled', 'rejected', 'completed'].includes(booking.status.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Only cancelled, rejected, or completed bookings can be permanently deleted'
      });
    }

    await Booking.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Booking deleted permanently'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
