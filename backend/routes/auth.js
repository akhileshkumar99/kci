const router = require('express').Router();
const { register, login, getMe, updateProfile, getStudentInfo } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/student-info/:rollNumber', getStudentInfo);
router.put('/profile', protect, upload.single('photo'), updateProfile);

module.exports = router;
