const fs = require('fs');
const path = require('path');

const videoSrc = 'C:/Users/MAHADEV/.gemini/antigravity/brain/17eba2ea-39fa-41d8-a4c7-dd8ec0af23ed/.user_uploaded/media_1794288502630_1901e346.mp4';
const publicDir = path.resolve(__dirname, '../public');
const destVideo = path.join(publicDir, 'hero-3d-repair-animation.mp4');

console.log('Video exists:', fs.existsSync(videoSrc));
if (fs.existsSync(videoSrc)) {
  const stat = fs.statSync(videoSrc);
  console.log('Video size:', (stat.size / 1024 / 1024).toFixed(2), 'MB');
  fs.copyFileSync(videoSrc, destVideo);
  console.log('Copied to public/hero-3d-repair-animation.mp4');
}
