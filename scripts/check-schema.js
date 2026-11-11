const Database = require('better-sqlite3');
const db = new Database('./data/denish.sqlite');

for (const t of ['repair_status_history', 'admin_notifications']) {
  const cols = db.prepare(`PRAGMA table_info(${t})`).all();
  console.log(`\nTable ${t}:`);
  for (const c of cols) {
    console.log(`  ${c.name} (${c.type}) notnull=${c.notnull} dflt=${c.dflt_value}`);
  }
}


