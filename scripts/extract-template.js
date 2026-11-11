const fs = require('fs');
const path = require('path');

const transcriptPath = 'C:/Users/MAHADEV/.gemini/antigravity/brain/17eba2ea-39fa-41d8-a4c7-dd8ec0af23ed/.system_generated/logs/transcript.jsonl';
const lines = fs.readFileSync(transcriptPath, 'utf8').trim().split('\n');
const userInputs = lines
  .map(l => {
    try { return JSON.parse(l); } catch(e) { return null; }
  })
  .filter(j => j && j.type === 'USER_INPUT');

const lastUser = userInputs[userInputs.length - 1];
let rawContent = lastUser.content;
const marker = '<!DOCTYPE html>';
const idx = rawContent.indexOf(marker);
if (idx !== -1) {
  const html = rawContent.slice(idx);
  fs.writeFileSync('user_template.html', html, 'utf8');
  console.log('Successfully wrote user_template.html, length:', html.length);
} else {
  console.log('Marker not found in last user input. Total len:', rawContent.length);
  // check transcript_full.jsonl if truncated
  const fullPath = 'C:/Users/MAHADEV/.gemini/antigravity/brain/17eba2ea-39fa-41d8-a4c7-dd8ec0af23ed/.system_generated/logs/transcript_full.jsonl';
  if (fs.existsSync(fullPath)) {
    const fullLines = fs.readFileSync(fullPath, 'utf8').trim().split('\n');
    const fullUserInputs = fullLines.map(l => { try { return JSON.parse(l); } catch(e) { return null; } }).filter(j => j && j.type === 'USER_INPUT');
    const lastFull = fullUserInputs[fullUserInputs.length - 1];
    const fullIdx = lastFull.content.indexOf(marker);
    if (fullIdx !== -1) {
      fs.writeFileSync('user_template.html', lastFull.content.slice(fullIdx), 'utf8');
      console.log('Successfully wrote user_template.html from full transcript, length:', lastFull.content.slice(fullIdx).length);
    }
  }
}
