const { User } = require('../models');

// @desc    Join the queue
// @route   PUT /api/queue/join
// @access  Private
exports.joinQueue = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { 
        inQueue: true,
        readyForNextGame: false
      },
      { new: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Joined the queue successfully',
      data: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        inQueue: user.inQueue,
        readyForNextGame: user.readyForNextGame
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Leave the queue
// @route   PUT /api/queue/leave
// @access  Private
exports.leaveQueue = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { 
        inQueue: false,
        readyForNextGame: false
      },
      { new: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Left the queue successfully',
      data: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        inQueue: user.inQueue,
        readyForNextGame: user.readyForNextGame
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Ready for next game
// @route   PUT /api/queue/ready
// @access  Private
exports.readyForNextGame = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { 
        inQueue: true,
        readyForNextGame: true
      },
      { new: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Ready for next game',
      data: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        inQueue: user.inQueue,
        readyForNextGame: user.readyForNextGame
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Finish playing
// @route   PUT /api/queue/finish
// @access  Private
exports.finishPlaying = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { 
        inQueue: false,
        readyForNextGame: false
      },
      { new: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Finished playing',
      data: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        inQueue: user.inQueue,
        readyForNextGame: user.readyForNextGame
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get queue status
// @route   GET /api/queue/status
// @access  Private
exports.getQueueStatus = async (req, res, next) => {
  try {
    const queueCount = await User.countDocuments({ inQueue: true });
    
    res.status(200).json({
      success: true,
      data: {
        queueCount,
        userStatus: {
          inQueue: req.user.inQueue,
          readyForNextGame: req.user.readyForNextGame
        }
      }
    });
  } catch (error) {
    next(error);
  }
};