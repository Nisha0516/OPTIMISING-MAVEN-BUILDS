const mongoose = require('mongoose');
require('dotenv').config();

// Models
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');

const updatePaymentStatus = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected...');

    // Payment ID to update
    const paymentId = '691f467334cbdf42e1913d04';
    
    // Update payment status
    const updatedPayment = await Payment.findByIdAndUpdate(
      paymentId,
      {
        $set: {
          status: 'Completed',
          paymentDate: new Date()
        }
      },
      { new: true }
    );

    if (!updatedPayment) {
      console.log('Payment not found');
      process.exit(1);
    }

    console.log('Payment updated:', updatedPayment);

    // Update booking status
    if (updatedPayment.booking) {
      const updatedBooking = await Booking.findByIdAndUpdate(
        updatedPayment.booking,
        {
          $set: {
            status: 'Confirmed',
            paymentStatus: 'Completed',
            paymentMethod: 'Razorpay',
            paymentDate: new Date()
          }
        },
        { new: true }
      );
      console.log('Booking updated:', updatedBooking);
    }

    console.log('Update completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error updating payment status:', error);
    process.exit(1);
  }
};

updatePaymentStatus();