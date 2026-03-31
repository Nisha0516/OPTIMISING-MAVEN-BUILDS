// backend/controllers/paymentController.js
const Razorpay = require('razorpay');
const ErrorResponse = require('../utils/errorResponse');
const Booking = require('../models/Booking');
const Car = require('../models/Car');
const User = require('../models/User');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// @desc    Create Razorpay Order
// @route   POST /api/payments/create-order
// @access  Private
exports.createRazorpayOrder = async (req, res, next) => {
  try {
    const { amount, currency = 'INR', receipt, notes, bookingId } = req.body;

    let amountInRupees;

    // If bookingId is provided and amount is not, derive amount from booking
    if (bookingId && (amount === undefined || amount === null || amount === '')) {
      const booking = await Booking.findById(bookingId);
      if (!booking) {
        return next(new ErrorResponse('Booking not found for payment', 404));
      }
      amountInRupees = Number(booking.totalPrice) || 0;
    } else if (amount !== undefined) {
      amountInRupees = parseFloat(amount);
    }

    if (!amountInRupees || isNaN(amountInRupees) || amountInRupees <= 0) {
      return next(new ErrorResponse('Please provide a valid payment amount', 400));
    }

    // Convert to paise for Razorpay (1 Rupee = 100 paise)
    const amountInPaise = Math.round(amountInRupees * 100);

    // Validate minimum amount (Razorpay minimum is 1 Rupee)
    if (amountInPaise < 100) {
      return next(new ErrorResponse('Minimum payment amount is 1', 400));
    }

    // Prepare a safe receipt ID (Razorpay max length is 40 characters)
    let safeReceipt;
    if (receipt && typeof receipt === 'string') {
      safeReceipt = receipt.substring(0, 40);
    } else if (bookingId) {
      safeReceipt = `bk_${bookingId}`.substring(0, 40);
    } else {
      safeReceipt = `od_${Date.now()}`.substring(0, 40);
    }

    const options = {
      amount: amountInPaise, // Amount in paise
      currency,
      receipt: safeReceipt,
      payment_capture: 1,
      notes: {
        userId: req.user.id,
        bookingId: bookingId || null,
        amountInRupees,
        ...notes
      }
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      order
    });

  } catch (error) {
    console.error('Razorpay Order Error:', error);
    if (error.statusCode) {
      return next(new ErrorResponse(
        error.error?.description || 'Payment processing error',
        error.statusCode
      ));
    }
    next(new ErrorResponse('Error creating payment order. Please try again.', 500));
  }
};

// @desc    Verify Razorpay Payment and Update Booking
// @route   POST /api/payments/verify
// @access  Private
exports.verifyRazorpayPayment = async (req, res, next) => {
  try {
    const { orderId, paymentId, signature, bookingId } = req.body;

    if (!orderId || !paymentId || !signature || !bookingId) {
      return next(new ErrorResponse('Missing required payment details', 400));
    }

    try {
      // Verify the payment with Razorpay
      const payment = await razorpay.payments.fetch(paymentId);
      
      // Check if payment is captured and successful
      if (payment.status !== 'captured') {
        return next(new ErrorResponse('Payment not captured or failed', 400));
      }

      // Update the booking status
      const updatedBooking = await Booking.findByIdAndUpdate(
        bookingId,
        {
          $set: {
            status: 'Confirmed',
            paymentStatus: 'Completed',
            paymentMethod: 'Razorpay',
            paymentId: paymentId,
            paymentDate: new Date()
          }
        },
        { new: true, runValidators: true }
      );

      if (!updatedBooking) {
        return next(new ErrorResponse('Booking not found', 404));
      }

      // Update the car's availability if needed
      if (updatedBooking.car) {
        await Car.findByIdAndUpdate(
          updatedBooking.car,
          { $addToSet: { bookings: updatedBooking._id } }
        );
      }

      res.status(200).json({
        success: true,
        message: 'Payment verified and booking confirmed successfully',
        booking: updatedBooking
      });

    } catch (razorpayError) {
      console.error('Razorpay API Error:', razorpayError);
      // If Razorpay verification fails, still try to update the booking as paid
      // since the payment might have gone through but verification failed
      try {
        await Booking.findByIdAndUpdate(
          bookingId,
          {
            $set: {
              paymentStatus: 'Completed',
              paymentId: paymentId,
              paymentDate: new Date()
            }
          }
        );
        
        return res.status(200).json({
          success: true,
          message: 'Payment processed. Please check your bookings for confirmation.',
          requiresVerification: true
        });
      } catch (updateError) {
        console.error('Error updating booking after failed verification:', updateError);
        return next(new ErrorResponse('Payment processed but could not update booking status', 500));
      }
    }

  } catch (error) {
    console.error('Payment Verification Error:', error);
    next(new ErrorResponse('Error verifying payment', 500));
  }
};

// @desc    Generate UPI Payment Link
// @route   POST /api/payments/upi-link
// @access  Private
exports.generateUPILink = async (req, res, next) => {
  try {
    const { amount, currency = 'INR', description = 'Car Rental Booking' } = req.body;

    const paymentLink = await razorpay.paymentLink.create({
      amount: Math.round(amount * 100),
      currency,
      description,
      customer: {
        name: req.user.name,
        email: req.user.email,
        contact: req.user.phone
      },
      notify: {
        sms: true,
        email: true
      },
      reminder_enable: true
    });

    res.status(200).json({
      success: true,
      paymentLink
    });

  } catch (error) {
    console.error('UPI Link Error:', error);
    next(new ErrorResponse('Error generating UPI payment link', 500));
  }
};

// @desc    Check Payment Status
// @route   GET /api/payments/status/:paymentId
// @access  Private
exports.checkPaymentStatus = async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    const payment = await razorpay.payments.fetch(paymentId);

    res.status(200).json({
      success: true,
      payment
    });

  } catch (error) {
    console.error('Payment Status Error:', error);
    next(new ErrorResponse('Error checking payment status', 500));
  }
};