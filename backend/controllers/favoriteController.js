const Favorite = require('../models/Favorite');

// @desc    Get user's favorites
// @route   GET /api/favorites
// @access  Private (Customer)
exports.getFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({ customer: req.user.id })
      .populate({
        path: 'car',
        populate: { path: 'owner', select: 'name phone' }
      })
      .sort('-createdAt');

    res.json({
      success: true,
      count: favorites.length,
      favorites
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Add car to favorites
// @route   POST /api/favorites
// @access  Private (Customer)
exports.addFavorite = async (req, res) => {
  try {
    const { carId } = req.body;

    // Check if already favorited
    const existingFavorite = await Favorite.findOne({
      customer: req.user.id,
      car: carId
    });

    if (existingFavorite) {
      return res.status(400).json({
        success: false,
        message: 'Car already in favorites'
      });
    }

    const favorite = await Favorite.create({
      customer: req.user.id,
      car: carId
    });

    await favorite.populate('car');

    res.status(201).json({
      success: true,
      message: 'Added to favorites',
      favorite
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Remove car from favorites
// @route   DELETE /api/favorites/:carId
// @access  Private (Customer)
exports.removeFavorite = async (req, res) => {
  try {
    const favorite = await Favorite.findOneAndDelete({
      customer: req.user.id,
      car: req.params.carId
    });

    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: 'Favorite not found'
      });
    }

    res.json({
      success: true,
      message: 'Removed from favorites'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Check if car is favorited
// @route   GET /api/favorites/check/:carId
// @access  Private (Customer)
exports.checkFavorite = async (req, res) => {
  try {
    const favorite = await Favorite.findOne({
      customer: req.user.id,
      car: req.params.carId
    });

    res.json({
      success: true,
      isFavorite: !!favorite
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
