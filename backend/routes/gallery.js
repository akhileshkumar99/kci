const router = require('express').Router();
const { getGallery, addGalleryItem, deleteGalleryItem } = require('../controllers/galleryController');
const { protect, admin } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', getGallery);
router.post('/', protect, admin, upload.single('image'), addGalleryItem);
router.delete('/:id', protect, admin, deleteGalleryItem);

module.exports = router;
