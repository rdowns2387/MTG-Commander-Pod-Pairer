const mongoose = require("mongoose");
const { User, Pod, Match, PlayerRating } = require("../models");

// Helper function to check if players have played together recently
const havePlayedTogether = async (player1Id, player2Id) => {
  const recentMatches = await Match.find({
    players: { $all: [player1Id, player2Id] },
    date: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // Last 24 hours
  });

  return recentMatches.length > 0;
};

// Helper function to count how many players from a group played together in their last pod
const countPlayersFromLastPod = async (playerIds) => {
  // Get the most recent pod for each player
  const lastPods = await Promise.all(
    playerIds.map((playerId) => Pod.findLastPodForUser(playerId))
  );

  // Count players who were in the same last pod
  const lastPodPlayers = new Map();

  lastPods.forEach((pod) => {
    if (!pod) return;

    pod.players.forEach((player) => {
      const playerId = player.user._id.toString();
      if (lastPodPlayers.has(playerId)) {
        lastPodPlayers.set(playerId, lastPodPlayers.get(playerId) + 1);
      } else {
        lastPodPlayers.set(playerId, 1);
      }
    });
  });

  // Count how many players from the current group were in the same last pod
  let sameLastPodCount = 0;
  playerIds.forEach((playerId) => {
    if (lastPodPlayers.get(playerId) > 1) {
      sameLastPodCount++;
    }
  });

  return sameLastPodCount;
};

// Helper function to calculate compatibility score between players
const calculateCompatibilityScore = async (player1Id, player2Id) => {
  let score = 0;

  // Check if they've played together recently (negative factor)
  const playedRecently = await havePlayedTogether(player1Id, player2Id);
  if (playedRecently) {
    score -= 0; //10; //changed from 10 to 0 to limit rejections
  }

  // Check ratings between players (positive factor)
  const rating1to2 = await PlayerRating.findOne({
    rater: player1Id,
    rated: player2Id,
  }).sort({ createdAt: -1 });

  const rating2to1 = await PlayerRating.findOne({
    rater: player2Id,
    rated: player1Id,
  }).sort({ createdAt: -1 });

  // If they've rated each other highly, increase score
  if (rating1to2) {
    score += (rating1to2.rating - 3) * 2; // -4 to +4 points based on rating
  } else {
    score += 2; // Bonus for never having played together
  }

  if (rating2to1) {
    score += (rating2to1.rating - 3) * 2; // -4 to +4 points based on rating
  } else {
    score += 2; // Bonus for never having played together
  }

  // Count how many times they've played together (negative factor)
  const playCount = await Match.countMatchesBetweenPlayers(
    player1Id,
    player2Id
  );
  score -= 0; //playCount; // -1 point per previous match -- changed to 0 to limit rejections

  return score;
};

// Helper function to evaluate a potential pod
const evaluatePodScore = async (playerIds) => {
  // Check if more than 3 players were in the same last pod (disqualifying factor)
  const sameLastPodCount = await countPlayersFromLastPod(playerIds);
  if (sameLastPodCount > 3) {
    return 0; // Heavily penalize this combination -- changed from 1000 to 0 to limit rejections
  }

  // Calculate compatibility scores between all pairs
  let totalScore = 0;
  for (let i = 0; i < playerIds.length; i++) {
    for (let j = i + 1; j < playerIds.length; j++) {
      const score = await calculateCompatibilityScore(
        playerIds[i],
        playerIds[j]
      );
      totalScore += score;
    }
  }

  return totalScore;
};

// Main function to create pods from available players
exports.createPods = async () => {
  try {
    // Get all players in queue
    const queuedPlayers = await User.find({ inQueue: true });

    // If less than 4 players, can't form a pod
    if (queuedPlayers.length < 4) {
      return {
        success: false,
        message: "Not enough players in queue to form a pod",
        podsCreated: 0,
      };
    }

    // Get players who are already in a pending pod
    const playersInPendingPods = await Pod.find({ status: "pending" }).distinct(
      "players.user"
    );

    // Filter out players who are already in a pending pod
    const availablePlayers = queuedPlayers.filter(
      (player) => !playersInPendingPods.some((id) => id.equals(player._id))
    );

    // If less than 4 available players, can't form a pod
    if (availablePlayers.length < 4) {
      return {
        success: false,
        message: "Not enough available players to form a pod",
        podsCreated: 0,
      };
    }

    const podsCreated = [];
    let remainingPlayers = [...availablePlayers];

    // While we have enough players to form pods
    while (remainingPlayers.length >= 4) {
      // If exactly 4 players left, form a pod with them
      if (remainingPlayers.length === 4) {
        const playerIds = remainingPlayers.map((player) => player._id);

        // Create the pod
        const pod = await Pod.create({
          players: playerIds.map((id) => ({ user: id })),
          status: "pending",
          confirmationDeadline: new Date(Date.now() + 2 * 60 * 1000), // 2 minutes from now
        });

        podsCreated.push(pod);
        remainingPlayers = [];
      } else {
        // Try to find the best pod of 4 players
        let bestPod = null;
        let bestScore = -Infinity;

        // Limit the number of combinations to try (for performance)
        const maxCombinations = 10; //changed from 100 to 10
        let combinationsTried = 0;

        // Try random combinations of 4 players
        for (
          let i = 0;
          i < maxCombinations && combinationsTried < maxCombinations;
          i++
        ) {
          // Randomly select 4 players
          const shuffled = [...remainingPlayers].sort(
            () => 0.5 - Math.random()
          );
          const selectedPlayers = shuffled.slice(0, 4);
          const playerIds = selectedPlayers.map((player) => player._id);

          combinationsTried++;

          // Evaluate this pod
          const score = await evaluatePodScore(playerIds);

          if (score > bestScore) {
            bestScore = score;
            bestPod = selectedPlayers;
          }
        }

        // Create the best pod we found
        if (bestPod) {
          const playerIds = bestPod.map((player) => player._id);

          // Create the pod
          const pod = await Pod.create({
            players: playerIds.map((id) => ({ user: id })),
            status: "pending",
            confirmationDeadline: new Date(Date.now() + 2 * 60 * 1000), // 2 minutes from now
          });

          podsCreated.push(pod);

          // Remove these players from the remaining pool
          remainingPlayers = remainingPlayers.filter(
            (player) =>
              !bestPod.some((selectedPlayer) =>
                selectedPlayer._id.equals(player._id)
              )
          );
        }
      }
    }

    return {
      success: true,
      message: `Created ${podsCreated.length} pods`,
      podsCreated: podsCreated.length,
      pods: podsCreated,
    };
  } catch (error) {
    console.error("Pod assignment error:", error);
    return {
      success: false,
      message: "Error creating pods",
      error: error.message,
    };
  }
};

// Function to handle pod timeout
exports.handlePodTimeouts = async () => {
  try {
    // Find pods that have timed out
    const timedOutPods = await Pod.find({
      status: "pending",
      confirmationDeadline: { $lt: new Date() },
    });

    if (timedOutPods.length === 0) {
      return {
        success: true,
        message: "No pods have timed out",
        podsUpdated: 0,
      };
    }

    // Delete timed out pod kick players out of queue
    for (const pod of timedOutPods) {
      // Kick all players out of the queue
      const playerIds = pod.players.map((player) => player.user);
      await User.updateMany({ _id: { $in: playerIds } }, { inQueue: false });
      // Delete the pod
      await pod.deleteOne();
    }

    return {
      success: true,
      message: `Deleted timed out pod and removed players from the queue`,
      podsUpdated: timedOutPods.length,
    };
  } catch (error) {
    console.error("Pod timeout handling error:", error);
    return {
      success: false,
      message: "Error handling pod timeouts",
      error: error.message,
    };
  }
};
