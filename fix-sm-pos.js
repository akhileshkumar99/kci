const fs = require('fs');
const file = 'frontend/src/pages/BranchDashboard.jsx';
let content = fs.readFileSync(file, 'utf8');

// Find the study material block
const smStart = content.indexOf('\n        {/* Study Material Tab */}');
const smEnd = content.indexOf('\n        {/* Modals */}');

if (smStart === -1 || smEnd === -1) {
  console.error('Markers not found', smStart, smEnd);
  process.exit(1);
}

// Extract the study material block
const smBlock = content.slice(smStart, smEnd);

// Remove it from current location
content = content.slice(0, smStart) + content.slice(smEnd);

// Find the correct insertion point: just before the closing of the scroll area
// Which is: Monthly Tests closing )} then </div>\n      </div>
const insertMarker = '        {/* Monthly Tests */}';
const monthlyIdx = content.indexOf(insertMarker);

// Find the end of the monthly tests block: look for )}\n\n      </div>\n      </div>
let insertAt = -1;
for (let i = monthlyIdx; i < content.length - 20; i++) {
  if (content.slice(i, i + 8) === '\n      )}\n' &&
      content.slice(i + 8, i + 16).includes('</div>')) {
    insertAt = i + 8; // after the )}
    break;
  }
}

if (insertAt === -1) {
  // fallback: find )\n}\n\n      </div>\n      </div> near end of tests
  const testsEnd = content.lastIndexOf("        )}\n\n      </div>\n      </div>");
  if (testsEnd !== -1) {
    insertAt = testsEnd + "        )}\n".length;
  }
}

if (insertAt === -1) {
  console.error('Insert point not found');
  process.exit(1);
}

content = content.slice(0, insertAt) + '\n' + smBlock + content.slice(insertAt);
fs.writeFileSync(file, content, 'utf8');
console.log('Done, insertAt:', insertAt);
