const router = require('express').Router();
const { getDashboardStats, getStudents, createStudent, updateStudent, deleteStudent } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

router.get('/stats', protect, admin, getDashboardStats);
router.get('/students', protect, admin, getStudents);
router.post('/students', protect, admin, upload.single('photo'), createStudent);
router.put('/students/:id', protect, admin, upload.single('photo'), updateStudent);
router.delete('/students/:id', protect, admin, deleteStudent);

module.exports = router;
