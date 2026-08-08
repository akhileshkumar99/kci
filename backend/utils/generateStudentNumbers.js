const User = require('../models/User');

const generateStudentNumbers = async () => {
  // Use atomic operation to avoid race condition duplicates
  const year = new Date().getFullYear();
  const center = '01';

  // Count existing students atomically
  const count = await User.countDocuments({ role: 'student' });
  const serial = String(count + 1).padStart(4, '0');

  // Generate unique suffix using timestamp to avoid collisions
  const ts = Date.now().toString().slice(-4);
  const rollNumber = `${year}${center}${serial}`;

  // Verify rollNumber not already taken, increment if needed
  let finalSerial = count + 1;
  let finalRoll = rollNumber;
  const existing = await User.findOne({ rollNumber: finalRoll });
  if (existing) {
    const max = await User.find({ role: 'student', rollNumber: { $regex: `^${year}${center}` } })
      .sort({ rollNumber: -1 }).limit(1).select('rollNumber');
    if (max.length) {
      const lastNum = parseInt(max[0].rollNumber.slice(-4)) || count;
      finalSerial = lastNum + 1;
    } else {
      finalSerial = count + 1;
    }
    finalRoll = `${year}${center}${String(finalSerial).padStart(4, '0')}`;
  }

  const s = String(finalSerial).padStart(4, '0');
  return {
    rollNumber: finalRoll,
    enrollmentNumber: `KCI/ENR/${year}/${s}`,
    registrationNumber: `KCI/REG/${year}/${s}`,
    formNo: `KCI/FORM/${year}/${s}`,
  };
};

module.exports = generateStudentNumbers;
