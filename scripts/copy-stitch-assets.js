const fs = require('fs');
const path = require('path');

const srcDir = path.resolve(__dirname, '../stitch-export-2/stitch_denish_mobile_repair_website');
const publicDir = path.resolve(__dirname, '../public');

const copies = [
  {
    from: 'modern_clean_3d_smartphone_repair_and_diagnostics_isometric_hero_visual/screen.png',
    to: 'hero-isometric-diagnostics.png'
  },
  {
    from: 'macro_close_up_photography_of_a_smartphone_motherboard_repair_robotic_precision/screen.png',
    to: 'motherboard-macro-repair.png'
  },
  {
    from: 'hyper_realistic_flagship_smartphones_on_a_dark_sleek_obsidian_reflective/screen.png',
    to: 'flagship-smartphones-obsidian.png'
  },
  {
    from: 'photorealistic_modern_high_end_clean_room_smartphone_repair_workshop_laboratory/screen.png',
    to: 'clean-room-workshop.png'
  },
  {
    from: 'home_denish_mobile_repairing_service_2/screen.png',
    to: 'stitch-home-2-preview.png'
  },
  {
    from: 'book_diagnostic_appointment_denish_mobile_repairing/screen.png',
    to: 'stitch-book-preview.png'
  }
];

for (const c of copies) {
  const fromPath = path.join(srcDir, c.from);
  const toPath = path.join(publicDir, c.to);
  if (fs.existsSync(fromPath)) {
    fs.copyFileSync(fromPath, toPath);
    console.log(`Copied ${c.from} -> ${c.to} (${(fs.statSync(toPath).size / 1024).toFixed(1)} KB)`);
  } else {
    console.warn(`File not found: ${fromPath}`);
  }
}
