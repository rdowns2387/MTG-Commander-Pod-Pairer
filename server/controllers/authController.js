const { User } = require("../models");
const { sendTokenResponse } = require("../middleware/auth");

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, pin, isGuest } = req.body;

    // Validate PIN format (4 digits)
    if (!/^\d{4}$/.test(pin)) {
      return res.status(400).json({
        success: false,
        message: "PIN must be exactly 4 digits",
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      pin,
      isGuest,
    });

    // Send token response
    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, pin } = req.body;

    // Validate email & pin
    if (!email || !pin) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and PIN",
      });
    }

    // Check for user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if PIN matches
    const isMatch = await user.matchPin(pin);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Send token response
    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user / clear cookie
// @route   GET /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  try {
    res.cookie("token", "none", {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });

    res.status(200).json({
      success: true,
      message: "User logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        inQueue: user.inQueue,
        readyForNextGame: user.readyForNextGame,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
exports.updateDetails = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
    };

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        inQueue: user.inQueue,
        readyForNextGame: user.readyForNextGame,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update PIN
// @route   PUT /api/auth/updatepin
// @access  Private
exports.updatePin = async (req, res, next) => {
  try {
    const { currentPin, newPin } = req.body;

    // Validate PIN format (4 digits)
    if (!/^\d{4}$/.test(newPin)) {
      return res.status(400).json({
        success: false,
        message: "PIN must be exactly 4 digits",
      });
    }

    const user = await User.findById(req.user.id);

    // Check current PIN
    const isMatch = await user.matchPin(currentPin);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current PIN is incorrect",
      });
    }

    user.pin = newPin;
    await user.save();

    res.status(200).json({
      success: true,
      message: "PIN updated successfully",
    });
  } catch (error) {
    next(error);
  }
};
