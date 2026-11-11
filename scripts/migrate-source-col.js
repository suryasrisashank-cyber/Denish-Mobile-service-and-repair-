const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'data', 'denish.sqlite');
const db = new Database(dbPath);

const cols = db.prepare("PRAGMA table_info(repair_orders)").all();
if (!cols.some(c => c.name === 'source')) {
  db.prepare("ALTER TABLE repair_orders ADD COLUMN source TEXT NOT NULL DEFAULT 'CUSTOMER_REQUEST'").run();
  console.log("Added source column to repair_orders.");
} else {
  console.log("source column already exists.");
}

// Mark admin created orders if any created by admin
const updated = db.prepare("UPDATE repair_orders SET source = 'ADMIN_CREATED' WHERE inspection_notes LIKE '%check in%' OR reported_issue LIKE '%walk-in%'").run();
console.log(`Updated ${updated.changes} orders to ADMIN_CREATED.`);
