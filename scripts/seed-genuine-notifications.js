const path = require("path");
const Database = require("better-sqlite3");
const db = new Database(path.join(__dirname, "..", "data", "denish.sqlite"));

// Ensure table exists
db.exec(`
  CREATE TABLE IF NOT EXISTS admin_notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL CHECK(type IN ('SERVICE_REQUEST', 'INCOMING_WHATSAPP', 'STATUS_UPDATE', 'OUTGOING_MESSAGE', 'SYSTEM_ALERT')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    order_id INTEGER REFERENCES repair_orders(id) ON DELETE CASCADE,
    conversation_id INTEGER REFERENCES whatsapp_conversations(id) ON DELETE CASCADE,
    tracking_id TEXT,
    customer_name TEXT,
    customer_phone TEXT,
    is_read INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

// Seed for existing genuine orders
const orders = db.prepare(`
  SELECT ro.id, ro.tracking_id, ro.device_brand, ro.device_model, ro.repair_category, ro.created_at,
         cr.name as customer_name, cr.phone as customer_phone
  FROM repair_orders ro
  JOIN customer_records cr ON ro.customer_id = cr.id
  ORDER BY ro.id ASC
`).all();

db.prepare("DELETE FROM admin_notifications").run();

const insert = db.prepare(`
  INSERT INTO admin_notifications (
    type, title, message, order_id, tracking_id, customer_name, customer_phone, is_read, created_at
  ) VALUES (
    'SERVICE_REQUEST',
    'New Service Request',
    ?,
    ?,
    ?,
    ?,
    ?,
    0,
    ?
  )
`);

orders.forEach(o => {
  insert.run(
    `Customer ${o.customer_name} registered ${o.device_brand} ${o.device_model} for ${o.repair_category}.`,
    o.id,
    o.tracking_id,
    o.customer_name,
    o.customer_phone,
    o.created_at
  );
});

console.log("Seeded genuine admin notifications:", orders.length);
db.close();

