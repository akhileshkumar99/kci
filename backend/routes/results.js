const router = require('express').Router();
const Result = require('../models/Result');
const User = require('../models/User');
const { protect, admin } = require('../middleware/auth');
const { uploadDocument } = require('../middleware/cloudinary');

const branchAuth = (req, res, next) => {
  if (req.user && (req.user.role === 'branch' || req.user.role === 'admin')) return next();
  res.status(403).json({ success: false, message: 'Access denied' });
};

// GET all results (admin: all, branch: own students)
router.get('/', protect, branchAuth, async (req, res) => {
  try {
    let results;
    if (req.user.role === 'admin') {
      results = await Result.find().sort('-createdAt');
    } else {
      const students = await User.find({ role: 'student', branchId: req.user._id }).select('_id');
      const ids = students.map(s => s._id);
      results = await Result.find({ studentId: { $in: ids } }).sort('-createdAt');
    }
    res.json({ success: true, results });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET students list for auto-selector (branch's own students)
router.get('/students', protect, branchAuth, async (req, res) => {
  try {
    const filter = req.user.role === 'admin'
      ? { role: 'student' }
      : { role: 'student', branchId: req.user._id };
    const students = await User.find(filter)
      .select('name fatherName courseName batch branchName rollNumber enrollmentNumber formNo _id')
      .sort('name');
    res.json({ success: true, students });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// POST add result with file
router.post('/', protect, branchAuth, uploadDocument.single('resultFile'), async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) data.resultFile = req.file.path;
    // Auto-link student
    if (data.studentId) {
      const s = await User.findById(data.studentId).select('branchId branchName rollNumber enrollmentNumber formNo');
      if (s) {
        data.branchId = s.branchId || req.user._id;
        if (!data.rollNumber) data.rollNumber = s.rollNumber;
        if (!data.enrollmentNumber) data.enrollmentNumber = s.enrollmentNumber;
        if (!data.formNo) data.formNo = s.formNo;
      }
    }
    if (!data.branchId) data.branchId = req.user._id;
    const result = await Result.create(data);
    res.status(201).json({ success: true, result });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// PUT update result
router.put('/:id', protect, branchAuth, uploadDocument.single('resultFile'), async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) data.resultFile = req.file.path;
    const result = await Result.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!result) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, result });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// PUT approve/hide result
router.put('/:id/approve', protect, branchAuth, async (req, res) => {
  try {
    const result = await Result.findByIdAndUpdate(req.params.id, { isApproved: req.body.isApproved }, { new: true });
    if (!result) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, result });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// DELETE result
router.delete('/:id', protect, branchAuth, async (req, res) => {
  try {
    await Result.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Student: get own results
router.get('/my', protect, async (req, res) => {
  try {
    if (req.user.role !== 'student') return res.status(403).json({ success: false, message: 'Students only' });
    const results = await Result.find({
      $or: [
        { studentId: req.user._id },
        { rollNumber: req.user.rollNumber },
        { enrollmentNumber: req.user.enrollmentNumber },
        { formNo: req.user.formNo },
      ],
      isApproved: true,
    }).sort('-createdAt');
    res.json({ success: true, results });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
