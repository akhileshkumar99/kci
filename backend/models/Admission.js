const mongoose = require('mongoose');

const admissionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    qualification: { type: String, required: true },
    dob: { type: Date },
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    franchise: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: { type: String },
    enrollmentId: { type: String, unique: true, sparse: true },
    studentUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Admission', admissionSchema);
