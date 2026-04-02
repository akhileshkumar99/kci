const mongoose = require('mongoose');

const studyMaterialSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  category: { type: String, enum: ['notes', 'assignment', 'previous_paper', 'video', 'other'], default: 'notes' },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  fileUrl: { type: String },
  videoUrl: { type: String },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive: { type: Boolean, default: true },
  downloads: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('StudyMaterial', studyMaterialSchema);
