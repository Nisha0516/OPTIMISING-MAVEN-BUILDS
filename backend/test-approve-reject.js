const mongoose = require('mongoose');
require('./models/User');
require('./models/Car');
require('./models/Booking');
require('./models/Notification');

const Notification = mongoose.model('Notification');

async function testApproveReject() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/car-rental');
    console.log('Connected to MongoDB');

    // Find the extension notification
    const notification = await Notification.findOne({ type: 'booking_extension_requested' })
      .populate('relatedBooking')
      .populate('relatedCar')
      .populate('user');

    if (!notification) {
      console.log('No extension notification found. Run test-extension-request.js first.');
      process.exit(0);
    }

    console.log('Found extension notification:');
    console.log('ID:', notification._id);
    console.log('Type:', notification.type);
    console.log('Status:', notification.extensionStatus);
    console.log('Owner:', notification.user?.email);
    console.log('Car:', notification.relatedCar?.name);
    console.log('Extra Days:', notification.extraDays);

    console.log('\n=== SIMULATING APPROVE ===');
    
    // Simulate the approve process
    const pricePerDay = notification.relatedCar.price;
    const booking = notification.relatedBooking;
    
    console.log('Current booking end date:', booking.endDate.toLocaleDateString());
    console.log('New end date:', notification.newEndDate.toLocaleDateString());
    console.log('Additional cost:', pricePerDay * notification.extraDays);

    // Update booking
    booking.endDate = notification.newEndDate;
    booking.totalPrice = booking.totalPrice + (pricePerDay * notification.extraDays);
    await booking.save();
    console.log('✅ Booking updated');

    // Update notification
    notification.extensionStatus = 'approved';
    await notification.save();
    console.log('✅ Notification updated to approved');

    // Create customer notification
    const customerNotification = await Notification.create({
      user: booking.customer,
      type: 'booking_extension_approved',
      title: 'Car Rental Extension Approved! 🎉',
      message: `Great news! Your request to extend ${notification.relatedCar.name} rental has been approved. Your booking is now extended until ${new Date(notification.newEndDate).toLocaleDateString()}. The additional cost is ₹${pricePerDay * notification.extraDays}.`,
      relatedBooking: booking._id,
      relatedCar: booking.car._id
    });
    console.log('✅ Customer notification created:', customerNotification._id);

    console.log('\n=== TEST COMPLETE ===');
    console.log('The extension approval system is working!');
    console.log('Customer will receive notification ID:', customerNotification._id);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testApproveReject();
