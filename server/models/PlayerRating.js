const mongoose = require('mongoose');

const PlayerRatingSchema = new mongoose.Schema({
  rater: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rated: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  pod: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pod',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index to ensure a user can only rate another user once per pod
PlayerRatingSchema.index({ rater: 1, rated: 1, pod: 1 }, { unique: true });

// Static method to get average rating for a user
PlayerRatingSchema.statics.getAverageRatingForUser = async function(userId) {
  const result = await this.aggregate([
    { $match: { rated: mongoose.Types.ObjectId(userId) } },
    { $group: { _id: null, averageRating: { $avg: '$rating' } } }
  ]);
  
  return result.length > 0 ? result[0].averageRating : null;
};

// Static method to get rating between two users
PlayerRatingSchema.statics.getRatingBetweenUsers = async function(raterId, ratedId) {
  return this.findOne({ rater: raterId, rated: ratedId })
    .sort({ createdAt: -1 });
};

const PlayerRating = mongoose.model('PlayerRating', PlayerRatingSchema);

module.exports = PlayerRating;