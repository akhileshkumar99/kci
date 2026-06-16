const router = require('express').Router();
const {
  getAdmitCardSetting,
  toggleAdmitCard,
  getAdmitCard,
  getMyAdmitCard,
  getExamSchedule,
  saveExamSchedule,
  sendExamNotification,
} = require('../controllers/admitCardController');
const { protect, admin } = require('../middleware/auth');

// Public
router.get('/setting',        getAdmitCardSetting);
router.get('/schedule',       getExamSchedule);

// Student — own admit card (authenticated)
router.get('/my',             protect, getMyAdmitCard);

// Admin
router.post('/toggle',        protect, admin, toggleAdmitCard);
router.post('/schedule',      protect, admin, saveExamSchedule);
router.post('/notify',        protect, admin, sendExamNotification);

// Public by enrollment/roll
router.get('/:enrollmentNumber', getAdmitCard);

module.exports = router;
