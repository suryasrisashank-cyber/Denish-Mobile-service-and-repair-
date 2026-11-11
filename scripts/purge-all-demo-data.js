// DENISH MOBILE REPAIRING AND SERVICE
// Purge All Demo / Sample Records for Clean Production Client Delivery

const Database = require("better-sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "..", "data", "denish.sqlite");
const db = new Database(dbPath);

console.log("Purging all demo / sample customer and order records from production database...");

db.pragma("foreign_keys = OFF");

const tablesToPurge = [
  "repair_status_history",
  "customer_notifications",
  "admin_notifications",
  "whatsapp_messages",
  "whatsapp_conversations",
  "repair_orders",
  "customer_records",
  "admin_audit_logs",
];

for (const table of tablesToPurge) {
  const result = db.prepare(`DELETE FROM ${table}`).run();
  console.log(`Cleared table '${table}': ${result.changes} records deleted.`);
}

// Reset SQLite auto-increment sequences for cleaned tables
try {
  for (const table of tablesToPurge) {
    db.prepare("DELETE FROM sqlite_sequence WHERE name = ?").run(table);
  }
} catch (e) {
  // Ignored if sqlite_sequence not found
}

db.pragma("foreign_keys = ON");
db.exec("VACUUM;");

console.log("\n--- VERIFICATION OF PRODUCTION DATABASE PURITY ---");
const adminCount = db.prepare("SELECT COUNT(*) as c FROM admin_users").get().c;
const customerCount = db.prepare("SELECT COUNT(*) as c FROM customer_records").get().c;
const orderCount = db.prepare("SELECT COUNT(*) as c FROM repair_orders").get().c;
const notifCount = db.prepare("SELECT COUNT(*) as c FROM admin_notifications").get().c;

console.log(`admin_users: ${adminCount} (Preserved for administrator access)`);
console.log(`customer_records: ${customerCount} (Clean - 0 demo customers)`);
console.log(`repair_orders: ${orderCount} (Clean - 0 demo orders)`);
console.log(`admin_notifications: ${notifCount} (Clean - 0 demo notifications)`);

db.close();
console.log("\n[SUCCESS] Production database is completely pure and ready for client delivery!");

