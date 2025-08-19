const express = require('express');
const {
  register,
  login,
  logout,
  getMe,
  updateDetails,
  updatePin
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepin', protect, updatePin);

module.exports = router;