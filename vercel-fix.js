// This script fixes syntax errors in the ladderService.ts file for Vercel deployment
const fs = require('fs');
const path = require('path');

// Path to the file with potential syntax errors
const filePath = path.join(__dirname, 'src', 'lib', 'services', 'ladderService.ts');

// Read the content
console.log(`Reading file ${filePath}...`);
let content = fs.readFileSync(filePath, 'utf8');

// Replace specific syntax errors
console.log('Checking for syntax errors...');

// Replace occurrences of "|| (index + 1));" with "|| (index + 1);"
const pattern1 = /\|\| \(index \+ 1\)\);/g;
content = content.replace(pattern1, '|| (index + 1);');

// Replace occurrences of "|| 0);" with "|| 0;"
const pattern2 = /\|\| 0\);/g;
content = content.replace(pattern2, '|| 0;');

// Write the fixed content back
console.log('Writing fixed file...');
fs.writeFileSync(filePath, content, 'utf8');

console.log('Fixes applied!');