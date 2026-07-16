const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return res.status(401).json({ success: false, message: 'Not authorized' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Token invalid' });
  }
};

exports.admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  res.status(403).json({ success: false, message: 'Admin access required' });
};

// Super Admin: only admin with isSuperAdmin flag OR the primary admin account
exports.superAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin' && (req.user.isSuperAdmin || req.user.email === process.env.SUPER_ADMIN_EMAIL)) return next();
  res.status(403).json({ success: false, message: 'Super Admin access required for this action' });
};

// Branch manager or admin
exports.branchOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'branch')) return next();
  res.status(403).json({ success: false, message: 'Branch Manager or Admin access required' });
};

// Staff, branch, franchise, or admin
exports.staffOrAbove = (req, res, next) => {
  const allowed = ['admin', 'branch', 'franchise', 'teacher'];
  if (req.user && allowed.includes(req.user.role)) return next();
  res.status(403).json({ success: false, message: 'Staff access required' });
};

// Counsellor = teacher role alias
exports.counsellor = (req, res, next) => {
  const allowed = ['admin', 'branch', 'franchise', 'teacher'];
  if (req.user && allowed.includes(req.user.role)) return next();
  res.status(403).json({ success: false, message: 'Counsellor access required' });
};
