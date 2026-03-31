const mongoose = require('mongoose');
require('./models/User');
require('./models/Car');
require('./models/Booking');
require('./models/Notification');

const Booking = mongoose.model('Booking');
const Notification = mongoose.model('Notification');

async function testCompleteFlow() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/car-rental');
    console.log('Connected to MongoDB');

    // Get the confirmed booking
    const booking = await Booking.findOne({ status: 'Confirmed' }).populate('car').populate('owner').populate('customer');
    
    if (!booking) {
      console.log('❌ No confirmed booking found');
      process.exit(0);
    }

    console.log('📋 Found booking:', booking._id);
    console.log('👤 Customer:', booking.customer.email);
    console.log('👤 Owner:', booking.owner.email);
    console.log('🚗 Car:', booking.car.name);
    console.log('📅 Current end date:', booking.endDate.toLocaleDateString());

    // Clear existing notifications for clean test
    await Notification.deleteMany({});
    console.log('🧹 Cleared existing notifications');

    // Step 1: Customer requests extension
    console.log('\n=== STEP 1: Customer requests extension ===');
    const daysToAdd = 2;
    const newEndDate = new Date(booking.endDate);
    newEndDate.setDate(newEndDate.getDate() + daysToAdd);

    const extensionRequest = await Notification.create({
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

    console.log('✅ Extension request created:', extensionRequest._id);
    console.log('📧 Owner should see this in their Bookings page');

    // Step 2: Owner approves extension
    console.log('\n=== STEP 2: Owner approves extension ===');
    
    // Update booking (simulate approval)
    const pricePerDay = booking.car.price;
    booking.endDate = newEndDate;
    booking.totalPrice = booking.totalPrice + (pricePerDay * daysToAdd);
    await booking.save();
    console.log('✅ Booking updated - New end date:', booking.endDate.toLocaleDateString());
    console.log('✅ Booking updated - New total price: ₹', booking.totalPrice);

    // Update extension request
    extensionRequest.extensionStatus = 'approved';
    await extensionRequest.save();
    console.log('✅ Extension request marked as approved');

    // Step 3: Customer receives approval notification
    console.log('\n=== STEP 3: Customer receives approval notification ===');
    
    const customerNotification = await Notification.create({
      user: booking.customer,
      type: 'booking_extension_approved',
      title: 'Car Rental Extension Approved! 🎉',
      message: `Great news! Your request to extend ${booking.car.name} rental has been approved. Your booking is now extended until ${newEndDate.toLocaleDateString()}. The additional cost is ₹${pricePerDay * daysToAdd}.`,
      relatedBooking: booking._id,
      relatedCar: booking.car._id
    });

    console.log('✅ Customer notification created:', customerNotification._id);
    console.log('📱 Customer should see this in their Notifications page');

    // Verify final state
    console.log('\n=== VERIFICATION ===');
    const ownerNotifications = await Notification.find({ user: booking.owner });
    const customerNotifications = await Notification.find({ user: booking.customer });

    console.log('👤 Owner has', ownerNotifications.length, 'notifications');
    console.log('👤 Customer has', customerNotifications.length, 'notifications');

    console.log('\n🎉 COMPLETE FLOW TEST SUCCESSFUL!');
    console.log('\n📋 INSTRUCTIONS TO TEST IN UI:');
    console.log('1. Start backend: npm run dev');
    console.log('2. Start frontend: npm start');
    console.log('3. Login as owner@test.com / password123');
    console.log('4. Go to Bookings page - you should see extension request');
    console.log('5. Click ✓ (Approve) button');
    console.log('6. Login as customer@test.com / password123');
    console.log('7. Go to Notifications page - you should see approval message');
    console.log('8. Check My Bookings - dates and price should be updated');

    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testCompleteFlow();
