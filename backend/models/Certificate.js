const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rollNumber: { type: String },
    enrollmentNumber: { type: String },
    formNo: { type: String },
    studentName: { type: String, required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    courseName: { type: String, required: true },
    certificateNumber: { type: String, required: true, unique: true },
    issueDate: { type: Date, required: true },
    grade: { type: String },
    certificateFile: { type: String },
    isValid: { type: Boolean, default: true },
    isApproved: { type: Boolean, default: true },
    uploadedByAdmin: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Certificate', certificateSchema);
