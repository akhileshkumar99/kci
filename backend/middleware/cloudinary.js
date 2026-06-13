const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const makeUpload = (folder, resourceType = 'image') => {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: `kci/${folder}`,
      resource_type: resourceType,
      allowed_formats: resourceType === 'image'
        ? ['jpg', 'jpeg', 'png', 'gif', 'webp']
        : ['pdf', 'jpg', 'jpeg', 'png'],
    },
  });
  return multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });
};

// Named uploaders per use-case
const uploadStudent  = makeUpload('students');
const uploadGallery  = makeUpload('gallery');
const uploadStaff    = makeUpload('staff');
const uploadDocument = makeUpload('documents', 'raw');
const uploadGeneral  = makeUpload('general');

// Helper to delete from Cloudinary by URL
const deleteFromCloudinary = async (url) => {
  if (!url || !url.includes('cloudinary')) return;
  try {
    const parts = url.split('/');
    const fileWithExt = parts[parts.length - 1];
    const folder = parts[parts.length - 2];
    const publicId = `kci/${folder}/${fileWithExt.split('.')[0]}`;
    await cloudinary.uploader.destroy(publicId);
  } catch (_) {}
};

module.exports = { uploadStudent, uploadGallery, uploadStaff, uploadDocument, uploadGeneral, deleteFromCloudinary, cloudinary };
