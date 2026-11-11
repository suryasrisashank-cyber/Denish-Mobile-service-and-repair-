const fs = require('fs');
const path = require('path');

const publicDir = path.resolve(__dirname, '../public');
const src = path.join(publicDir, 'hero-isometric-diagnostics.png');
const dest = path.join(publicDir, 'hero-video-poster.png');

if (fs.existsSync(src)) {
  fs.copyFileSync(src, dest);
  console.log('Created hero-video-poster.png, size:', (fs.statSync(dest).size / 1024).toFixed(1), 'KB');
} else {
  console.error('Source hero-isometric-diagnostics.png not found');
}
