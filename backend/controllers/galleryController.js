const Gallery = require('../models/Gallery');

exports.getGallery = async (req, res) => {
  try {
    const { category } = req.query;
    const query = category ? { category } : {};
    const items = await Gallery.find(query).sort({ createdAt: -1 });
    res.json({ success: true, items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.addGalleryItem = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Image required' });
    const item = await Gallery.create({ ...req.body, image: `/uploads/${req.file.filename}` });
    res.status(201).json({ success: true, item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteGalleryItem = async (req, res) => {
  try {
    await Gallery.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
