const express = require('express');
const { createPods, handlePodTimeouts } = require('../services/podAssignmentService');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

// Admin route to manually trigger pod creation
router.post('/create-pods', async (req, res, next) => {
  try {
    const result = await createPods();
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

// Admin route to manually handle pod timeouts
router.post('/handle-timeouts', async (req, res, next) => {
  try {
    const result = await handlePodTimeouts();
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;