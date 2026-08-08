const mongoose = require('mongoose');

const ResultSchema = new mongoose.Schema({
  studentName: { type: String, required: true },
  fatherName: String,
  courseName: String,
  branch: String,
  batch: String,
  rollNumber: String,
  enrollmentNumber: String,
  formNo: String,
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  examDate: Date,
  uploadDate: Date,
  resultFile: String, // PDF/PNG/JPEG path
  isApproved: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Result', ResultSchema);
