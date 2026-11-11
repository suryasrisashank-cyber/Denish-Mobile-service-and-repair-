const Database = require('better-sqlite3');
const db = new Database('./data/denish.sqlite');

console.log("Running migration...");

// 1. Add location column to customer_records if missing
const cols = db.prepare("PRAGMA table_info(customer_records)").all();
if (!cols.some(c => c.name === 'location')) {
  console.log("Adding location column to customer_records...");
  db.prepare("ALTER TABLE customer_records ADD COLUMN location TEXT").run();
  console.log("location column added.");
}

// 2. Update repair_orders check constraint to include NEW_REQUEST
const orderSql = db.prepare("SELECT sql FROM sqlite_master WHERE name='repair_orders'").get();
if (orderSql && !orderSql.sql.includes('NEW_REQUEST')) {
  console.log("Migrating repair_orders to include NEW_REQUEST...");
  db.pragma("foreign_keys = OFF");
  db.exec(`
    BEGIN TRANSACTION;
    CREATE TABLE repair_orders_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tracking_id TEXT UNIQUE NOT NULL COLLATE NOCASE,
      customer_id INTEGER NOT NULL REFERENCES customer_records(id) ON DELETE RESTRICT,
      device_brand TEXT NOT NULL,
      device_model TEXT NOT NULL,
      imei_serial TEXT,
      repair_category TEXT NOT NULL,
      reported_issue TEXT NOT NULL,
      inspection_notes TEXT,
      estimated_completion TEXT,
      service_cost REAL,
      current_status TEXT NOT NULL DEFAULT 'NEW_REQUEST' CHECK(current_status IN (
        'NEW_REQUEST',
        'RECEIVED',
        'UNDER_INSPECTION',
        'WAITING_FOR_APPROVAL',
        'WAITING_FOR_PARTS',
        'REPAIRING',
        'QUALITY_CHECK',
        'COMPLETED',
        'READY_FOR_PICKUP',
        'DELIVERED',
        'CANCELLED'
      )),
      pickup_ready INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    INSERT INTO repair_orders_new SELECT * FROM repair_orders;
    DROP TABLE repair_orders;
    ALTER TABLE repair_orders_new RENAME TO repair_orders;
    CREATE INDEX IF NOT EXISTS idx_repair_orders_tracking_id ON repair_orders(tracking_id);
    COMMIT;
  `);
  db.pragma("foreign_keys = ON");
  console.log("repair_orders migrated successfully.");
}

console.log("Migration finished.");
