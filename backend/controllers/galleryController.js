const Gallery = require('../models/Gallery');
const { uploadGallery, deleteFromCloudinary } = require('../middleware/cloudinary');

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
    const item = await Gallery.create({ ...req.body, image: req.file.path });
    res.status(201).json({ success: true, item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteGalleryItem = async (req, res) => {
  try {
    const item = await Gallery.findById(req.params.id);
    if (item?.image) await deleteFromCloudinary(item.image);
    await Gallery.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.uploadGallery = uploadGallery;
