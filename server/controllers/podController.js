const mongoose = require("mongoose");
const { User, Pod, Match, PlayerRating } = require("../models");

// @desc    Get current pod for user
// @route   GET /api/pods/current
// @access  Private
exports.getCurrentPod = async (req, res, next) => {
  try {
    // Find the most recent pod that the user is part of and is still pending
    const pod = await Pod.findOne({
      "players.user": req.user.id,
      status: "pending",
    })
      .sort({ createdAt: -1 })
      .populate("players.user", "firstName lastName email");

    if (!pod) {
      return res.status(404).json({
        success: false,
        message: "No active pod found",
      });
    }

    res.status(200).json({
      success: true,
      data: pod,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Confirm pod assignment
// @route   PUT /api/pods/:id/confirm
// @access  Private
exports.confirmPod = async (req, res, next) => {
  try {
    const pod = await Pod.findById(req.params.id);

    if (!pod) {
      return res.status(404).json({
        success: false,
        message: "Pod not found",
      });
    }

    // Check if pod is still pending
    if (pod.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Pod is already ${pod.status}`,
      });
    }

    // Check if user is part of this pod
    const playerIndex = pod.players.findIndex(
      (player) => player.user.toString() === req.user.id
    );

    if (playerIndex === -1) {
      return res.status(403).json({
        success: false,
        message: "User is not part of this pod",
      });
    }

    // Update player confirmation status
    pod.players[playerIndex].confirmed = true;

    // Check if all players have confirmed
    const allConfirmed = pod.players.every((player) => player.confirmed);

    if (allConfirmed) {
      pod.status = "confirmed";

      // Create a match record for this confirmed pod
      await Match.create({
        pod: pod._id,
        players: pod.players.map((player) => player.user),
      });

      // Update all players' lastPodTime
      const playerIds = pod.players.map((player) => player.user);
      await User.updateMany(
        { _id: { $in: playerIds } },
        {
          lastPodTime: new Date(),
          inQueue: false,
          readyForNextGame: false,
        }
      );
    }

    await pod.save();

    res.status(200).json({
      success: true,
      message: allConfirmed
        ? "Pod confirmed by all players"
        : "Pod confirmation acknowledged",
      data: pod,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject pod assignment
// @route   PUT /api/pods/:id/reject
// @access  Private
exports.rejectPod = async (req, res, next) => {
  try {
    const pod = await Pod.findById(req.params.id);

    if (!pod) {
      return res.status(404).json({
        success: false,
        message: "Pod not found",
      });
    }

    // Check if pod is still pending
    if (pod.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Pod is already ${pod.status}`,
      });
    }

    // Check if user is part of this pod
    const playerIndex = pod.players.findIndex(
      (player) => player.user.toString() === req.user.id
    );

    if (playerIndex === -1) {
      return res.status(403).json({
        success: false,
        message: "User is not part of this pod",
      });
    }

    // Update pod status to rejected
    pod.status = "rejected";
    pod.players[playerIndex].rejected = true;
    await pod.save();

    // Put all players back in queue
    const playerIds = pod.players.map((player) => player.user);
    await User.updateMany({ _id: { $in: playerIds } }, { inQueue: true });

    res.status(200).json({
      success: true,
      message: "Pod rejected successfully",
      data: pod,
    });
  } catch (error) {
    next(error);
  }
};

exports.deletePod = async (req, res, next) => {
  try {
    const pod = await Pod.findById(req.params.id);

    pod.deleteOne();

    res.status(200).json({
      success: true,
      message: "Pod deleted successfully",
      data: pod,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get pod history for user
// @route   GET /api/pods/history
// @access  Private
exports.getPodHistory = async (req, res, next) => {
  try {
    const matches = await Match.find({ players: req.user.id })
      .sort({ date: -1 })
      .populate({
        path: "pod",
        populate: {
          path: "players.user",
          select: "firstName lastName",
        },
      });

    res.status(200).json({
      success: true,
      count: matches.length,
      data: matches,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Rate a player
// @route   POST /api/pods/:podId/rate/:playerId
// @access  Private
exports.ratePlayer = async (req, res, next) => {
  try {
    const { podId, playerId } = req.params;
    const { rating } = req.body;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    // Check if pod exists and is confirmed
    const pod = await Pod.findOne({
      _id: podId,
      status: "confirmed",
    });

    if (!pod) {
      return res.status(404).json({
        success: false,
        message: "Confirmed pod not found",
      });
    }

    // Check if both users were part of this pod
    const userInPod = pod.players.some(
      (player) => player.user.toString() === req.user.id
    );

    const ratedInPod = pod.players.some(
      (player) => player.user.toString() === playerId
    );

    if (!userInPod || !ratedInPod) {
      return res.status(403).json({
        success: false,
        message: "Both users must be part of the pod",
      });
    }

    // Check if user is trying to rate themselves
    if (req.user.id === playerId) {
      return res.status(400).json({
        success: false,
        message: "Cannot rate yourself",
      });
    }

    // Create or update rating
    const playerRating = await PlayerRating.findOneAndUpdate(
      {
        rater: req.user.id,
        rated: playerId,
        pod: podId,
      },
      {
        rating,
        rater: req.user.id,
        rated: playerId,
        pod: podId,
      },
      {
        new: true,
        upsert: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Player rated successfully",
      data: playerRating,
    });
  } catch (error) {
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "You have already rated this player for this pod",
      });
    }
    next(error);
  }
};

// @desc    Get ratings for a player
// @route   GET /api/pods/ratings/:playerId
// @access  Private
exports.getPlayerRatings = async (req, res, next) => {
  try {
    const { playerId } = req.params;

    // Get average rating
    const averageRating = await PlayerRating.getAverageRatingForUser(playerId);

    // Get rating from current user if exists
    const userRating = await PlayerRating.findOne({
      rater: req.user.id,
      rated: playerId,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        averageRating: averageRating || 0,
        userRating: userRating ? userRating.rating : null,
        totalRatings: await PlayerRating.countDocuments({ rated: playerId }),
      },
    });
  } catch (error) {
    next(error);
  }
};
