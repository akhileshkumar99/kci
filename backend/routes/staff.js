const router = require('express').Router();
const { getStaff, createStaff, updateStaff, deleteStaff } = require('../controllers/staffController');
const { protect, admin } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', getStaff);
router.post('/', protect, admin, upload.single('photo'), createStaff);
router.put('/:id', protect, admin, upload.single('photo'), updateStaff);
router.delete('/:id', protect, admin, deleteStaff);

module.exports = router;
