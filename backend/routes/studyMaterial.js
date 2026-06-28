const express = require('express');
const router = express.Router();
const StudyMaterial = require('../models/StudyMaterial');
const { protect, admin } = require('../middleware/auth');
const { uploadDocument, uploadGeneral, cloudinary } = require('../middleware/cloudinary');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Combined upload: file (image) + thumbnail (image)
const combinedUpload = multer({
  storage: new (require('multer-storage-cloudinary').CloudinaryStorage)({
    cloudinary,
    params: (req, file) => ({
      folder: 'kci/documents',
      resource_type: 'image',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    }),
  }),
  limits: { fileSize: 20 * 1024 * 1024 },
});

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

// Add fl_attachment to Cloudinary raw URL so browser downloads with correct filename
const makeDownloadUrl = (url, originalName) => {
  if (!url || !url.includes('cloudinary')) return url;
  // Insert fl_attachment:filename transformation
  const name = (originalName || 'file').replace(/[^a-zA-Z0-9._-]/g, '_');
  return url.replace('/upload/', `/upload/fl_attachment:${name}/`);
};

router.post('/', protect, combinedUpload.fields([{ name: 'file', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), async (req, res) => {
  try {
    const data = { ...req.body, uploadedBy: req.user._id, isActive: true };
    if (req.files?.file?.[0]) data.thumbnailUrl = req.files.file[0].path;
    if (req.files?.thumbnail?.[0]) data.thumbnailUrl = req.files.thumbnail[0].path;
    const material = await StudyMaterial.create(data);
    res.status(201).json({ success: true, material });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/:id', protect, combinedUpload.fields([{ name: 'file', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.files?.file?.[0]) {
      const f = req.files.file[0];
      data.fileName = f.originalname;
      data.fileUrl = makeDownloadUrl(f.path, f.originalname);
    }
    if (req.files?.thumbnail?.[0]) data.thumbnailUrl = req.files.thumbnail[0].path;
    const material = await StudyMaterial.findByIdAndUpdate(req.params.id, data, { new: true });
    res.json({ success: true, material });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    await StudyMaterial.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
