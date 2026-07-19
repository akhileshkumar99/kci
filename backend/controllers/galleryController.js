const Gallery = require('../models/Gallery');
const { uploadToCloudinary, deleteFromCloudinary } = require('../middleware/cloudinary');

exports.getGallery = async (req, res) => {
  try {
    const query = req.query.category ? { category: req.query.category } : {};
    const items = await Gallery.find(query).sort({ createdAt: -1 });
    res.json({ success: true, items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.addGalleryItem = async (req, res) => {
  try {
    const files = req.files?.length ? req.files : req.file ? [req.file] : [];
    if (!files.length) return res.status(400).json({ success: false, message: 'Image required' });
    // All images upload to Cloudinary in parallel
    const urls = await Promise.all(files.map(f => uploadToCloudinary(f.buffer, 'gallery')));
    const items = await Gallery.insertMany(urls.map(url => ({ ...req.body, image: url })));
    res.status(201).json({ success: true, items });
  } catch (err) {
    console.error('Gallery upload error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteGalleryItem = async (req, res) => {
  try {
    const item = await Gallery.findById(req.params.id);
    if (item?.image) await deleteFromCloudinary(item.image);
    await Gallery.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
