const express = require('express');
const {
  getCurrentPod,
  confirmPod,
  rejectPod,
  getPodHistory,
  ratePlayer,
  getPlayerRatings
} = require('../controllers/podController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

router.get('/current', getCurrentPod);
router.put('/:id/confirm', confirmPod);
router.put('/:id/reject', rejectPod);
router.get('/history', getPodHistory);
router.post('/:podId/rate/:playerId', ratePlayer);
router.get('/ratings/:playerId', getPlayerRatings);

module.exports = router;