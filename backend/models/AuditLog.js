const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    enum: [
      'ADMISSION_APPROVED', 'ADMISSION_REJECTED', 'ADMISSION_VERIFIED', 'ADMISSION_CREATED',
      'RESULT_UPLOADED', 'RESULT_UPDATED', 'RESULT_DELETED', 'RESULT_PUBLISHED',
      'STUDENT_UPDATED', 'STUDENT_CREATED', 'STUDENT_DELETED',
      'CERTIFICATE_GENERATED', 'CERTIFICATE_UPDATED', 'CERTIFICATE_DELETED', 'CERTIFICATE_PUBLISHED',
      'LOGIN',
    ],
    required: true,
  },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  performedByName: { type: String },
  performedByRole: { type: String },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  targetId: { type: mongoose.Schema.Types.ObjectId },
  targetModel: { type: String },
  details: { type: Object },
  ip: { type: String, default: 'unknown' },
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);
