const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    enum: ['ADMISSION_APPROVED', 'ADMISSION_REJECTED', 'ADMISSION_VERIFIED', 'RESULT_UPLOADED', 'RESULT_UPDATED', 'RESULT_DELETED', 'STUDENT_UPDATED', 'STUDENT_CREATED', 'STUDENT_DELETED', 'CERTIFICATE_GENERATED', 'LOGIN'],
    required: true,
  },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  performedByName: { type: String },
  performedByRole: { type: String },
  targetId: { type: mongoose.Schema.Types.ObjectId },
  targetModel: { type: String },
  details: { type: Object },
  ip: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);
