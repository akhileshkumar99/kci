const Staff = require('../models/Staff');

exports.getStaff = async (req, res) => {
  try {
    const staff = await Staff.find().sort({ order: 1 });
    res.json({ success: true, staff });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createStaff = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) data.photo = `/uploads/${req.file.filename}`;
    const staff = await Staff.create(data);
    res.status(201).json({ success: true, staff });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateStaff = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) data.photo = `/uploads/${req.file.filename}`;
    const staff = await Staff.findByIdAndUpdate(req.params.id, data, { new: true });
    res.json({ success: true, staff });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteStaff = async (req, res) => {
  try {
    await Staff.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Staff deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
