const router = require('express').Router();
const {
  getAdmitCardSetting, toggleAdmitCard,
  getAdmitCard, getMyAdmitCard,
  getExamSchedule, saveExamSchedule,
  getScheduleOptions, sendExamNotification,
} = require('../controllers/admitCardController');
const { protect, admin } = require('../middleware/auth');

router.get('/setting',          getAdmitCardSetting);
router.get('/schedule',         getExamSchedule);
router.get('/schedule/options', protect, admin, getScheduleOptions);
router.get('/my',               protect, getMyAdmitCard);
router.post('/toggle',          protect, admin, toggleAdmitCard);
router.post('/schedule',        protect, admin, saveExamSchedule);
router.post('/notify',          protect, admin, sendExamNotification);
router.get('/:enrollmentNumber', getAdmitCard);

module.exports = router;
