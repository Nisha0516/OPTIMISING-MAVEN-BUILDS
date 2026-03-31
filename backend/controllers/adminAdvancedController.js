const User = require('../models/User');
const Car = require('../models/Car');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Review = require('../models/Review');

// @desc    Toggle user active status
// @route   PUT /api/admin/users/:id/toggle-status
// @access  Private (Admin)
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Don't allow deleting other admins
    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete admin users'
      });
    }

    await user.deleteOne();

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Reject car listing
// @route   PUT /api/admin/cars/:id/reject
// @access  Private (Admin)
exports.rejectCar = async (req, res) => {
  try {
    const { reason } = req.body;

    const car = await Car.findByIdAndUpdate(
      req.params.id,
      { approved: false },
      { new: true }
    ).populate('owner', 'name email');

    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found'
      });
    }

    // TODO: Send notification to owner with rejection reason

    res.json({
      success: true,
      message: 'Car listing rejected',
      car,
      reason
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get platform analytics
// @route   GET /api/admin/analytics
// @access  Private (Admin)
exports.getPlatformAnalytics = async (req, res) => {
  try {
    // User growth over time
    const userGrowth = await User.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Booking trends
    const bookingTrends = await Booking.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            status: '$status'
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } }
    ]);

    // Revenue by payment method
    const revenueByMethod = await Payment.aggregate([
      { $match: { status: 'Completed' } },
      {
        $group: {
          _id: '$paymentMethod',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Top performing cars
    const topCars = await Booking.aggregate([
      { $match: { status: { $in: ['Confirmed', 'Completed'] } } },
      {
        $group: {
          _id: '$car',
          bookings: { $sum: 1 },
          revenue: { $sum: '$totalPrice' }
        }
      },
      {
        $lookup: {
          from: 'cars',
          localField: '_id',
          foreignField: '_id',
          as: 'carDetails'
        }
      },
      { $unwind: '$carDetails' },
      { $sort: { revenue: -1 } },
      { $limit: 10 }
    ]);

    // Average ratings
    const avgRatings = await Review.aggregate([
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      analytics: {
        userGrowth,
        bookingTrends,
        revenueByMethod,
        topCars,
        platformRating: avgRatings[0]?.averageRating || 0,
        totalReviews: avgRatings[0]?.totalReviews || 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get revenue analytics
// @route   GET /api/admin/revenue
// @access  Private (Admin)
exports.getRevenueAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let match = { status: 'Completed' };
    if (startDate && endDate) {
      match.paymentDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Total revenue
    const totalRevenue = await Payment.aggregate([
      { $match: match },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Daily revenue
    const dailyRevenue = await Payment.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            year: { $year: '$paymentDate' },
            month: { $month: '$paymentDate' },
            day: { $dayOfMonth: '$paymentDate' }
          },
          revenue: { $sum: '$amount' },
          transactions: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1, '_id.day': -1 } },
      { $limit: 30 }
    ]);

    // Revenue by owner
    const revenueByOwner = await Booking.aggregate([
      { $match: { status: { $in: ['Confirmed', 'Completed'] } } },
      {
        $group: {
          _id: '$owner',
          totalRevenue: { $sum: '$totalPrice' },
          bookings: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'ownerDetails'
        }
      },
      { $unwind: '$ownerDetails' },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      revenue: {
        total: totalRevenue[0]?.total || 0,
        daily: dailyRevenue,
        byOwner: revenueByOwner
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Manage reviews (delete inappropriate ones)
// @route   DELETE /api/admin/reviews/:id
// @access  Private (Admin)
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Recalculate car rating
    const reviews = await Review.find({ car: review.car });
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    await Car.findByIdAndUpdate(review.car, { rating: avgRating });

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get system health stats
// @route   GET /api/admin/system-health
// @access  Private (Admin)
exports.getSystemHealth = async (req, res) => {
  try {
    const users = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const cars = await Car.countDocuments();
    const approvedCars = await Car.countDocuments({ approved: true });
    const pendingCars = await Car.countDocuments({ approved: false });
    const bookings = await Booking.countDocuments();
    const activeBookings = await Booking.countDocuments({ 
      status: { $in: ['Pending', 'Confirmed'] } 
    });
    const payments = await Payment.countDocuments();
    const reviews = await Review.countDocuments();

    res.json({
      success: true,
      health: {
        users: { total: users, active: activeUsers },
        cars: { total: cars, approved: approvedCars, pending: pendingCars },
        bookings: { total: bookings, active: activeBookings },
        payments,
        reviews,
        timestamp: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
