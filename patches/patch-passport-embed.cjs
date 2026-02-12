// patches/patch-passport-embed.cjs
// Patches @human.tech/passport-embed to always show the stamp verification UI
// instead of the "Congrats" success screen when the user has a passing score.
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'node_modules', '@human.tech', 'passport-embed', 'dist', 'esm', 'index.js');

if (!fs.existsSync(filePath)) {
  console.log('passport-embed not found, skipping patch');
  process.exit(0);
}

let content = fs.readFileSync(filePath, 'utf8');

const target = 'l.passingScore?(0,src_jsx_runtime_namespaceObject.jsx)(src_CongratsBody,';
const replacement = 'false?(0,src_jsx_runtime_namespaceObject.jsx)(src_CongratsBody,';

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(filePath, content);
  console.log('Patched passport-embed: widget will always show stamp verification UI');
} else if (content.includes(replacement)) {
  console.log('passport-embed already patched');
} else {
  console.log('Warning: could not find expected code in passport-embed, patch skipped');
}