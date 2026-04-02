const express = require('express');
const router = express.Router();
const StudyMaterial = require('../models/StudyMaterial');
const { protect, admin } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', async (req, res) => {
  try {
    const { category, course } = req.query;
    const filter = { isActive: true };
    if (category) filter.category = category;
    if (course) filter.course = course;
    const materials = await StudyMaterial.find(filter).populate('course', 'title').populate('uploadedBy', 'name').sort('-createdAt');
    res.json({ success: true, materials });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/', protect, upload.single('file'), async (req, res) => {
  try {
    const data = { ...req.body, uploadedBy: req.user._id };
    if (req.file) data.fileUrl = req.file.filename;
    const material = await StudyMaterial.create(data);
    res.status(201).json({ success: true, material });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/:id', protect, admin, async (req, res) => {
  try {
    await StudyMaterial.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
