const express = require('express');
const {
  joinQueue,
  leaveQueue,
  readyForNextGame,
  finishPlaying,
  getQueueStatus
} = require('../controllers/queueController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

router.put('/join', joinQueue);
router.put('/leave', leaveQueue);
router.put('/ready', readyForNextGame);
router.put('/finish', finishPlaying);
router.get('/status', getQueueStatus);

module.exports = router;