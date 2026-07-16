const router = require('express').Router();
const { getResultByRoll, getMyResult, getAllResults, createResult, updateResult, deleteResult, lookupStudent } = require('../controllers/resultController');
const { protect, admin, branchOrAdmin } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

router.get('/my', protect, getMyResult);
router.get('/lookup-student', protect, branchOrAdmin, lookupStudent);
router.get('/roll/:rollNumber', getResultByRoll);
router.get('/', protect, branchOrAdmin, getAllResults);
router.post('/', protect, branchOrAdmin, createResult);
router.put('/:id', protect, branchOrAdmin, upload.single('resultFile'), updateResult);
router.delete('/:id', protect, admin, deleteResult);

module.exports = router;
