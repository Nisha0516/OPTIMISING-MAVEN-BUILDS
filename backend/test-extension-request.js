const mongoose = require('mongoose');
require('./models/User');
require('./models/Car');
require('./models/Booking');
require('./models/Notification');

const Booking = mongoose.model('Booking');
const Notification = mongoose.model('Notification');

async function testExtensionRequest() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/car-rental');
    console.log('Connected to MongoDB');

    // Get the confirmed booking
    const booking = await Booking.findOne({ status: 'Confirmed' }).populate('car');
    
    if (!booking) {
      console.log('No confirmed booking found');
      process.exit(0);
    }

    console.log('Found booking:', booking._id);
    console.log('Current end date:', booking.endDate.toLocaleDateString());
    console.log('Car price per day:', booking.car.price);

    // Create an extension request notification
    const daysToAdd = 2;
    const newEndDate = new Date(booking.endDate);
    newEndDate.setDate(newEndDate.getDate() + daysToAdd);

    console.log('Creating extension notification...');
    console.log('Extra days:', daysToAdd);
    console.log('New end date:', newEndDate.toLocaleDateString());

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

    console.log('✅ Extension notification created with ID:', notification._id);
    console.log('\n=== TEST COMPLETE ===');
    console.log('Now you can:');
    console.log('1. Start the backend server: npm run dev');
    console.log('2. Start the frontend: npm start');
    console.log('3. Login as owner@test.com / password123');
    console.log('4. Go to Bookings page');
    console.log('5. You should see the extension request with approve/reject buttons');
    console.log('6. Click approve/reject to test the functionality');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testExtensionRequest();
