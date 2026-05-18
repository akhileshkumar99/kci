const router = require('express').Router();
const { getAdmitCardSetting, toggleAdmitCard, getAdmitCard } = require('../controllers/admitCardController');
const { protect, admin } = require('../middleware/auth');

router.get('/setting', getAdmitCardSetting);
router.post('/toggle', protect, admin, toggleAdmitCard);
router.get('/:enrollmentNumber', getAdmitCard);

module.exports = router;
