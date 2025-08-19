const mongoose = require('mongoose');

const MatchSchema = new mongoose.Schema({
  pod: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pod',
    required: true
  },
  players: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index to find matches by player
MatchSchema.index({ players: 1 });

// Static method to find matches for a player
MatchSchema.statics.findMatchesForPlayer = async function(playerId, limit = 10) {
  return this.find({ players: playerId })
    .sort({ date: -1 })
    .limit(limit)
    .populate('players', 'firstName lastName')
    .populate('pod');
};

// Static method to find common matches between players
MatchSchema.statics.findCommonMatches = async function(playerIds) {
  return this.find({ players: { $all: playerIds } })
    .sort({ date: -1 })
    .populate('players', 'firstName lastName')
    .populate('pod');
};

// Static method to count how many times players have played together
MatchSchema.statics.countMatchesBetweenPlayers = async function(player1Id, player2Id) {
  return this.countDocuments({
    players: { $all: [player1Id, player2Id] }
  });
};

const Match = mongoose.model('Match', MatchSchema);

module.exports = Match;