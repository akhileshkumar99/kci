const router = require('express').Router();
const { getResultByRoll, getMyResult, getAllResults, createResult, updateResult, deleteResult } = require('../controllers/resultController');
const { protect, admin } = require('../middleware/auth');
const franchiseMiddleware = (req, res, next) => {
  if (req.user && (req.user.role === 'franchise' || req.user.role === 'admin')) return next();
  res.status(403).json({ success: false, message: 'Access denied' });
};
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

router.get('/my', protect, getMyResult);
router.get('/roll/:rollNumber', getResultByRoll);
router.get('/', protect, admin, getAllResults);
router.post('/', protect, franchiseMiddleware, createResult);
router.put('/:id', protect, franchiseMiddleware, upload.single('resultFile'), updateResult);
router.delete('/:id', protect, admin, deleteResult);

module.exports = router;
