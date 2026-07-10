const fs = require('fs');
const path = 'c:/Users/DELL/OneDrive/Desktop/kci/frontend/src/pages/StudentDashboard.jsx';
let c = fs.readFileSync(path, 'utf8');

// Fix broken unicode/mojibake
c = c.replace(/â€"/g, '-');
c = c.replace(/â€¢/g, '|');
c = c.replace(/â€˜/g, "'");
c = c.replace(/â€™/g, "'");
c = c.replace(/âœ" PASS/g, 'PASS');
c = c.replace(/âœ— FAIL/g, 'FAIL');
c = c.replace(/âœ" Done/g, 'Done');
c = c.replace(/â³ Pending/g, 'Pending');
c = c.replace(/✅ Approved/g, 'Approved');
c = c.replace(/✅/g, '');
c = c.replace(/âŒ/g, '');
c = c.replace(/Submit Test â†'/g, 'Submit Test');
c = c.replace(/â† Back to Tests/g, 'Back to Tests');
c = c.replace(/'â€"'/g, "'-'");

fs.writeFileSync(path, c, 'utf8');
console.log('Done');
