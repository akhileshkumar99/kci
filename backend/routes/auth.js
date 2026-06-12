const router = require('express').Router();
const { register, login, getMe, updateProfile, getStudentInfo } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/ping', (req, res) => res.json({ status: 'ok' }));
router.get('/student-info/:rollNumber', getStudentInfo);
router.put('/profile', protect, upload.single('photo'), updateProfile);
router.put('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const User = require('../models/User');
    const user = await User.findById(req.user.id);
    if (!(await user.matchPassword(currentPassword)))
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
