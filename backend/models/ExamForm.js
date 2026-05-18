const mongoose = require('mongoose');

const examFormSchema = new mongoose.Schema({
  // Personal Info
  studentName:      { type: String, required: true },
  fatherName:       { type: String, required: true },
  motherName:       { type: String },
  dob:              { type: String, required: true },
  gender:           { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  category:         { type: String, enum: ['General', 'OBC', 'SC', 'ST'], default: 'General' },

  // Academic Info
  enrollmentNumber: { type: String, required: true },
  course:           { type: String, required: true },
  batch:            { type: String, required: true },
  session:          { type: String },
  qualification:    { type: String },
  subjects:         { type: String },

  // Contact Info
  phone:            { type: String, required: true },
  email:            { type: String, required: true },
  address:          { type: String },

  // Exam Info
  examCenter:       { type: String },
  examDate:         { type: String },
  examType:         { type: String, enum: ['Regular', 'Ex-Student', 'Improvement'], default: 'Regular' },

  // Status
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
}, { timestamps: true });

module.exports = mongoose.model('ExamForm', examFormSchema);
