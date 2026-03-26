const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rollNumber: { type: String, required: true },
    studentName: { type: String, required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    courseName: { type: String },
    batch: { type: String },
    subjects: [
      {
        name: { type: String },
        maxMarks: { type: Number },
        obtainedMarks: { type: Number },
      },
    ],
    totalMarks: { type: Number },
    obtainedMarks: { type: Number },
    percentage: { type: Number },
    grade: { type: String },
    status: { type: String, enum: ['Pass', 'Fail'], default: 'Pass' },
    examDate: { type: Date },
    resultFile: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Result', resultSchema);
