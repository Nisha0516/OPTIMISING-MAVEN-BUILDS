const mongoose = require('mongoose');
const User = require('./models/User');
const Car = require('./models/Car');
const Booking = require('./models/Booking');

async function createTestData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/car-rental');
    console.log('Connected to MongoDB');

    // Check if test data already exists
    const existingUsers = await User.countDocuments();
    const existingCars = await Car.countDocuments();
    
    if (existingUsers > 0 || existingCars > 0) {
      console.log(`Test data already exists (${existingUsers} users, ${existingCars} cars)`);
      process.exit(0);
    }

    // Create test users
    console.log('Creating test users...');
    const customer = await User.create({
      name: 'Test Customer',
      email: 'customer@test.com',
      password: 'password123',
      phone: '1234567890',
      role: 'customer',
      drivingLicense: 'DL123456789',
      isActive: true
    });

    const owner = await User.create({
      name: 'Test Owner',
      email: 'owner@test.com',
      password: 'password123',
      phone: '0987654321',
      role: 'owner',
      drivingLicense: 'DL987654321',
      isActive: true
    });

    console.log('Created test users:', { customer: customer.email, owner: owner.email });

    // Create test car
    console.log('Creating test car...');
    const car = await Car.create({
      name: 'Test Car - Honda City',
      type: 'Sedan',
      plateNumber: 'TEST-1234',
      transmission: 'Manual',
      fuel: 'Petrol',
      seats: 5,
      price: 1500, // per day
      location: 'Test City',
      available: true,
      owner: owner._id,
      images: ['https://via.placeholder.com/300x200'],
      features: ['AC', 'Music System', 'GPS'],
      description: 'A comfortable sedan for city driving'
    });

    console.log('Created test car:', car.name);

    // Create confirmed booking
    console.log('Creating confirmed booking...');
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 2); // Started 2 days ago
    
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 3); // Ends in 3 days

    const booking = await Booking.create({
      customer: customer._id,
      car: car._id,
      owner: owner._id,
      startDate,
      endDate,
      totalPrice: 1500 * 5, // 5 days * 1500 per day
      paymentMethod: 'credit_card',
      paymentStatus: 'Completed',
      status: 'confirmed'
    });

    console.log('Created confirmed booking:', booking._id);
    console.log('\n=== TEST DATA CREATED ===');
    console.log('Customer Login: customer@test.com / password123');
    console.log('Owner Login: owner@test.com / password123');
    console.log('Car:', car.name);
    console.log('Booking:', booking._id);
    console.log('Booking dates:', startDate.toLocaleDateString(), 'to', endDate.toLocaleDateString());

    process.exit(0);
  } catch (error) {
    console.error('Error creating test data:', error);
    process.exit(1);
  }
}

createTestData();
