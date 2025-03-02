const fs = require('fs');
const path = require('path');

// Path to the file
const filePath = path.join(__dirname, 'src', 'lib', 'services', 'ladderService.ts');

// Read the file
let content = fs.readFileSync(filePath, 'utf8');

// Look for the pattern with extra parenthesis
// This regex looks for parseInt() followed by || (index + 1)) with possible whitespace
const regex = /parseInt\([^)]+\)\s*\|\|\s*\(index\s*\+\s*1\)\)/g;
const fixed = content.replace(regex, (match) => {
    // Fix by removing the last character (the extra closing parenthesis)
    return match.slice(0, -1);
});

// Write the fixed content back
fs.writeFileSync(filePath, fixed, 'utf8');

console.log('Fixed syntax error in ladderService.ts');