const mongoose = require('mongoose');

const PodSchema = new mongoose.Schema({
  players: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    confirmed: {
      type: Boolean,
      default: false
    },
    rejected: {
      type: Boolean,
      default: false
    }
  }],
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'rejected', 'timeout', 'completed'],
    default: 'pending'
  },
  confirmationDeadline: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index to find pods by player
PodSchema.index({ 'players.user': 1 });

// Static method to find recent pods for a user
PodSchema.statics.findRecentPodsForUser = async function(userId, limit = 10) {
  return this.find({
    'players.user': userId,
    status: 'confirmed'
  })
  .sort({ createdAt: -1 })
  .limit(limit)
  .populate('players.user', 'firstName lastName email');
};

// Static method to find the last pod a user was in
PodSchema.statics.findLastPodForUser = async function(userId) {
  return this.findOne({
    'players.user': userId,
    status: 'confirmed'
  })
  .sort({ createdAt: -1 })
  .populate('players.user', 'firstName lastName email');
};

const Pod = mongoose.model('Pod', PodSchema);

module.exports = Pod;