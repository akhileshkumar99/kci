const Admission = require('../models/Admission');

exports.submitAdmission = async (req, res) => {
  try {
    const admission = await Admission.create(req.body);
    res.status(201).json({ success: true, message: 'Admission form submitted successfully!', admission });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAdmissions = async (req, res) => {
  try {
    const admissions = await Admission.find().populate('course', 'title').sort({ createdAt: -1 });
    res.json({ success: true, admissions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateAdmissionStatus = async (req, res) => {
  try {
    const admission = await Admission.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json({ success: true, admission });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteAdmission = async (req, res) => {
  try {
    await Admission.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Admission deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
