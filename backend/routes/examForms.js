const router = require('express').Router();
const { submitExamForm, getExamForms, updateExamFormStatus, deleteExamForm } = require('../controllers/examFormController');
const { protect, admin } = require('../middleware/auth');

router.post('/', submitExamForm);
router.get('/', protect, admin, getExamForms);
router.put('/:id', protect, admin, updateExamFormStatus);
router.delete('/:id', protect, admin, deleteExamForm);

module.exports = router;
