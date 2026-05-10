const fs = require('fs');
const htmlPath = './index.html';
let html = fs.readFileSync(htmlPath, 'utf-8');

const marker = '/* --- AUTOMATED THEME FIXES --- */';
const markerIndex = html.indexOf(marker);
if (markerIndex !== -1) {
  const styleCloseIndex = html.lastIndexOf('</style>');
  html = html.substring(0, markerIndex) + '\n    </style>' + html.substring(styleCloseIndex + 8);
  fs.writeFileSync(htmlPath, html, 'utf-8');
  console.log('Removed old automated block');
} else {
  console.log('No old block found');
}
