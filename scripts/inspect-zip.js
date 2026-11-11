const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const zipPath = 'C:/Users/MAHADEV/.gemini/antigravity/brain/17eba2ea-39fa-41d8-a4c7-dd8ec0af23ed/.user_uploaded/media_1794286617071_c0c12bfd.zip';
console.log('Zip exists:', fs.existsSync(zipPath));

const outDir = path.resolve(__dirname, '../stitch-export-2');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

try {
  // Use tar or powershell Expand-Archive via cmd
  execSync(`tar -xf "${zipPath}" -C "${outDir}"`);
  console.log('Successfully extracted using tar');
} catch (e) {
  console.log('tar failed, trying powershell Expand-Archive:', e.message);
  execSync(`powershell -NoProfile -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${outDir}' -Force"`);
}

function listFiles(dir, prefix = '') {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const full = path.join(dir, item);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      listFiles(full, prefix + item + '/');
    } else {
      console.log(prefix + item, `(${stat.size} bytes)`);
    }
  }
}

console.log('Extracted files:');
listFiles(outDir);
