const Car = require('../models/Car');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Review = require('../models/Review');
const User = require('../models/User');

// @desc    Get owner dashboard stats
// @route   GET /api/owner/dashboard
// @access  Private (Owner)
exports.getDashboardStats = async (req, res) => {
  try {
    // Total cars
    const totalCars = await Car.countDocuments({ owner: req.user.id });
    
    // Available cars
    const availableCars = await Car.countDocuments({ 
      owner: req.user.id, 
      available: true 
    });
    
    // Total bookings
    const totalBookings = await Booking.countDocuments({ owner: req.user.id });
    
    // Active bookings
    const activeBookings = await Booking.countDocuments({ 
      owner: req.user.id, 
      status: 'Confirmed' 
    });
    
    // Pending bookings
    const pendingBookings = await Booking.countDocuments({ 
      owner: req.user.id, 
      status: 'Pending' 
    });
    
    // Total revenue
    const revenue = await Booking.aggregate([
      { 
        $match: { 
          owner: req.user._id, 
          status: { $in: ['Confirmed', 'Completed'] } 
        } 
      },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);
    
    // Recent bookings
    const recentBookings = await Booking.find({ owner: req.user.id })
      .populate('customer', 'name email phone')
      .populate('car', 'name type')
      .sort('-createdAt')
      .limit(5);

    res.json({
      success: true,
      stats: {
        totalCars,
        availableCars,
        totalBookings,
        activeBookings,
        pendingBookings,
        totalRevenue: revenue[0]?.total || 0,
        recentBookings
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get owner's cars
// @route   GET /api/owner/cars
// @access  Private (Owner)
exports.getOwnerCars = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    let query = { owner: req.user.id };
    
    if (status === 'available') {
      query.available = true;
    } else if (status === 'unavailable') {
      query.available = false;
    } else if (status === 'pending') {
      query.approved = false;
    } else if (status === 'approved') {
      query.approved = true;
    }

    const cars = await Car.find(query)
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Car.countDocuments(query);

    res.json({
      success: true,
      count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      cars
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get owner's bookings
// @route   GET /api/owner/bookings
// @access  Private (Owner)
exports.getOwnerBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    let query = { owner: req.user.id };
    if (status) query.status = status;

    const bookings = await Booking.find(query)
      .populate('customer', 'name email phone')
      .populate('car', 'name type price images')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Booking.countDocuments(query);

    res.json({
      success: true,
      count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get car reviews (for owner)
// @route   GET /api/owner/reviews/:carId
// @access  Private (Owner)
exports.getCarReviews = async (req, res) => {
  try {
    // Verify car belongs to owner
    const car = await Car.findOne({ 
      _id: req.params.carId, 
      owner: req.user.id 
    });

    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found or not authorized'
      });
    }

    const reviews = await Review.find({ car: req.params.carId })
      .populate('customer', 'name')
      .populate('booking', 'startDate endDate')
      .sort('-createdAt');

    res.json({
      success: true,
      count: reviews.length,
      averageRating: car.rating,
      reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get earnings report
// @route   GET /api/owner/earnings
// @access  Private (Owner)
exports.getEarnings = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let match = { 
      owner: req.user._id, 
      status: { $in: ['Confirmed', 'Completed'] } 
    };
    
    if (startDate && endDate) {
      match.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Total earnings
    const totalEarnings = await Booking.aggregate([
      { $match: match },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    // Earnings by car
    const earningsByCar = await Booking.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$car',
          totalEarnings: { $sum: '$totalPrice' },
          bookingCount: { $sum: 1 }
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
      { $sort: { totalEarnings: -1 } }
    ]);

    // Monthly earnings
    const monthlyEarnings = await Booking.aggregate([
      { $match: match },
      {
        $group: {
          _id: { 
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          earnings: { $sum: '$totalPrice' },
          bookings: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } }
    ]);

    res.json({
      success: true,
      totalEarnings: totalEarnings[0]?.total || 0,
      earningsByCar,
      monthlyEarnings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update car availability
// @route   PUT /api/owner/cars/:id/availability
// @access  Private (Owner)
exports.updateCarAvailability = async (req, res) => {
  try {
    const { available } = req.body;

    const car = await Car.findOne({ 
      _id: req.params.id, 
      owner: req.user.id 
    });

    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found or not authorized'
      });
    }

    car.available = available;
    await car.save();

    res.json({
      success: true,
      message: `Car ${available ? 'enabled' : 'disabled'} successfully`,
      car
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get car performance stats
// @route   GET /api/owner/cars/:id/performance
// @access  Private (Owner)
exports.getCarPerformance = async (req, res) => {
  try {
    const car = await Car.findOne({ _id: req.params.id, owner: req.user.id });

    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found'
      });
    }

    // Total bookings for this car
    const totalBookings = await Booking.countDocuments({ car: car._id });
    
    // Completed bookings
    const completedBookings = await Booking.countDocuments({ 
      car: car._id, 
      status: 'completed' 
    });

    // Total revenue
    const revenue = await Payment.aggregate([
      {
        $lookup: {
          from: 'bookings',
          localField: 'booking',
          foreignField: '_id',
          as: 'booking'
        }
      },
      { $unwind: '$booking' },
      {
        $match: {
          'booking.car': car._id,
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    // Average rating
    const reviews = await Review.find({ car: car._id });
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    res.json({
      success: true,
      data: {
        car,
        totalBookings,
        completedBookings,
        totalRevenue: revenue.length > 0 ? revenue[0].total : 0,
        averageRating: avgRating.toFixed(1),
        totalReviews: reviews.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Add a new car
// @route   POST /api/owner/cars
// @access  Private (Owner)
exports.addCar = async (req, res) => {
  try {
    // Add owner to req.body
    req.body.owner = req.user.id;
    
    const car = await Car.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Car added successfully',
      data: car
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single car
// @route   GET /api/owner/cars/:id
// @access  Private (Owner)
exports.getCar = async (req, res) => {
  try {
    const car = await Car.findOne({ _id: req.params.id, owner: req.user.id });

    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found'
      });
    }

    res.status(200).json({
      success: true,
      data: car
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update car
// @route   PUT /api/owner/cars/:id
// @access  Private (Owner)
exports.updateCar = async (req, res) => {
  try {
    let car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found'
      });
    }

    // Make sure user is car owner
    if (car.owner.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this car'
      });
    }

    car = await Car.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Car updated successfully',
      data: car
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete car
// @route   DELETE /api/owner/cars/:id
// @access  Private (Owner)
exports.deleteCar = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);

    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found'
      });
    }

    // Make sure user is car owner
    if (car.owner.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this car'
      });
    }

    await car.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Car deleted successfully',
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get owner profile
// @route   GET /api/owner/profile
// @access  Private (Owner)
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        address: user.address,
        companyName: user.companyName,
        aadharNumber: user.aadharNumber,
        licenseNumber: user.licenseNumber,
        bankAccount: user.bankAccount,
        ifscCode: user.ifscCode,
        profilePictureUrl: user.profilePictureUrl,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update owner profile
// @route   PUT /api/owner/profile
// @access  Private (Owner)
exports.updateProfile = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      address,
      companyName,
      aadharNumber,
      licenseNumber,
      bankAccount,
      ifscCode,
      profilePictureUrl
    } = req.body;

    // Find user
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (address !== undefined) user.address = address;
    if (companyName !== undefined) user.companyName = companyName;
    if (aadharNumber !== undefined) user.aadharNumber = aadharNumber;
    if (licenseNumber !== undefined) user.licenseNumber = licenseNumber;
    if (bankAccount !== undefined) user.bankAccount = bankAccount;
    if (ifscCode !== undefined) user.ifscCode = ifscCode;
    if (profilePictureUrl !== undefined) user.profilePictureUrl = profilePictureUrl;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        address: user.address,
        companyName: user.companyName,
        aadharNumber: user.aadharNumber,
        licenseNumber: user.licenseNumber,
        bankAccount: user.bankAccount,
        ifscCode: user.ifscCode,
        profilePictureUrl: user.profilePictureUrl
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
