const mongoose = require('mongoose');
const Notification = require('./backend/models/Notification');
const Booking = require('./backend/models/Booking');

async function debugExtension() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/car-rental');
    console.log('Connected to MongoDB');

    // Check for any extension notifications
    const notifications = await Notification.find({ type: 'booking_extension_requested' })
      .populate('relatedBooking')
      .populate('relatedCar')
      .populate('user');

    console.log(`Found ${notifications.length} extension notifications:`);
    
    notifications.forEach((notif, index) => {
      console.log(`\n--- Notification ${index + 1} ---`);
      console.log('ID:', notif._id);
      console.log('Type:', notif.type);
      console.log('Status:', notif.extensionStatus);
      console.log('User:', notif.user?.email || notif.user);
      console.log('Related Booking:', notif.relatedBooking?._id);
      console.log('Extra Days:', notif.extraDays);
      console.log('New End Date:', notif.newEndDate);
      console.log('Created:', notif.createdAt);
    });

    // Check bookings
    const bookings = await Booking.find({ status: 'confirmed' })
      .populate('car')
      .populate('customer')
      .populate('owner');

    console.log(`\nFound ${bookings.length} confirmed bookings:`);
    
    bookings.forEach((booking, index) => {
      console.log(`\n--- Booking ${index + 1} ---`);
      console.log('ID:', booking._id);
      console.log('Status:', booking.status);
      console.log('Customer:', booking.customer?.email || booking.customer);
      console.log('Owner:', booking.owner?.email || booking.owner);
      console.log('Car:', booking.car?.name || booking.car);
      console.log('Start Date:', booking.startDate);
      console.log('End Date:', booking.endDate);
      console.log('Total Price:', booking.totalPrice);
    });

    process.exit(0);
  } catch (error) {
    console.error('Debug error:', error);
    process.exit(1);
  }
}

debugExtension();
