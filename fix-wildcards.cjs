const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

const replacements = [
  { match: /\[class\*="bg-indigo-900\\\\\/"]/g, replace: '.bg-indigo-900\\\\/30, .bg-indigo-900\\\\/50, .bg-indigo-900\\\\/20' },
  { match: /\[class\*="bg-indigo-500\\\\\/"]/g, replace: '.bg-indigo-500\\\\/10, .bg-indigo-500\\\\/20, .bg-indigo-500\\\\/30' },
  { match: /\[class\*="bg-indigo-50\\\\\/"]/g, replace: '.bg-indigo-50\\\\/50' },
  { match: /\[class\*="border-indigo-"]/g, replace: '.border-indigo-500, .border-indigo-600, .border-indigo-400, .border-indigo-300, .border-indigo-200, .border-indigo-100, .border-indigo-50, .border-indigo-700, .border-indigo-800, .border-indigo-900' },
  { match: /\[class\*="border-indigo-200\\\\\/"]/g, replace: '.border-indigo-200\\\\/50' },
  { match: /\[class\*="border-indigo-100\\\\\/"]/g, replace: '.border-indigo-100\\\\/50' },
  { match: /\[class\*="border-indigo-800\\\\\/"]/g, replace: '.border-indigo-800\\\\/50' },
  { match: /\[class\*="border-indigo-900\\\\\/"]/g, replace: '.border-indigo-900\\\\/50' },
  { match: /\[class\*="shadow-indigo-"]/g, replace: '.shadow-indigo-500\\\\/20, .shadow-indigo-600\\\\/20, .shadow-indigo-600\\\\/30' },
  { match: /\[class\*="ring-indigo-"]/g, replace: '.ring-indigo-500\\\\/10, .ring-indigo-500\\\\/20' },
  { match: /\[class\*="from-indigo-"]/g, replace: '.from-indigo-600, .from-indigo-700, .from-indigo-400' },
  { match: /\[class\*="to-violet-"]/g, replace: '.to-violet-600, .to-violet-700, .to-violet-400' },
];

for (let r of replacements) {
  html = html.replace(r.match, r.replace);
}

fs.writeFileSync('index.html', html);
console.log('Fixed iOS overrides wildcards');
