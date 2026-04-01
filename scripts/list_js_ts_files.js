const fs = require('fs');
const path = require('path');

function countJsTsFiles(dir) {
  let jsCount = 0;
  let tsCount = 0;
  let tsxCount = 0;

  function walk(currentDir) {
    const files = fs.readdirSync(currentDir);
    for (const file of files) {
      const fullPath = path.join(currentDir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        // Skip node_modules and .next directories
        if (file === 'node_modules' || file === '.next') {
          continue;
        }
        walk(fullPath);
      } else {
        if (file.endsWith('.js')) {
          jsCount++;
        } else if (file.endsWith('.ts')) {
          tsCount++;
        } else if (file.endsWith('.tsx')) {
          tsxCount++;
        }
      }
    }
  }

  walk(dir);
  return { jsCount, tsCount, tsxCount };
}

const { jsCount, tsCount, tsxCount } = countJsTsFiles(process.cwd());
console.log(`JavaScript files: ${jsCount}`);
console.log(`TypeScript files: ${tsCount}`);
console.log(`TypeScript JSX files: ${tsxCount}`);
console.log(`Total JS/TS/TSX files: ${jsCount + tsCount + tsxCount}`);