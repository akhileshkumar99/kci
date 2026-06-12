const User = require('../models/User');

const generateStudentNumbers = async () => {
  const count = await User.countDocuments({ role: 'student' });
  const year = new Date().getFullYear();
  const serial = String(count + 1).padStart(4, '0');
  return {
    rollNumber: `KCI${year}${serial}`,
    enrollmentNumber: `KCI/ENR/${year}/${serial}`,
    registrationNumber: `KCI/REG/${year}/${serial}`,
  };
};

module.exports = generateStudentNumbers;
