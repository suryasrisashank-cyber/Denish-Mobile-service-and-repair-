const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'denish.sqlite');
const db = new Database(dbPath);

console.log('Migrating database at:', dbPath);

const orderCols = db.prepare('PRAGMA table_info(repair_orders)').all().map(c => c.name);
console.log('Current repair_orders columns:', orderCols);

if (!orderCols.includes('is_archived')) {
  db.prepare('ALTER TABLE repair_orders ADD COLUMN is_archived INTEGER NOT NULL DEFAULT 0').run();
  console.log('Added column: is_archived');
}
if (!orderCols.includes('archived_at')) {
  db.prepare('ALTER TABLE repair_orders ADD COLUMN archived_at TEXT').run();
  console.log('Added column: archived_at');
}
if (!orderCols.includes('archived_by_admin_id')) {
  db.prepare('ALTER TABLE repair_orders ADD COLUMN archived_by_admin_id INTEGER REFERENCES admin_users(id)').run();
  console.log('Added column: archived_by_admin_id');
}
if (!orderCols.includes('archive_reason')) {
  db.prepare('ALTER TABLE repair_orders ADD COLUMN archive_reason TEXT').run();
  console.log('Added column: archive_reason');
}

// Normalize sources
db.prepare("UPDATE repair_orders SET source = 'CUSTOMER_WEBSITE' WHERE source = 'CUSTOMER_REQUEST'").run();

// WhatsApp tables
db.exec(`
  CREATE TABLE IF NOT EXISTS whatsapp_conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER REFERENCES customer_records(id),
    customer_phone TEXT UNIQUE NOT NULL,
    customer_name TEXT,
    last_message TEXT,
    last_message_at TEXT,
    unread_count INTEGER DEFAULT 0,
    is_enquiry INTEGER DEFAULT 1,
    converted_order_id INTEGER REFERENCES repair_orders(id) ON DELETE SET NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS whatsapp_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation_id INTEGER NOT NULL REFERENCES whatsapp_conversations(id) ON DELETE CASCADE,
    whatsapp_message_id TEXT UNIQUE,
    direction TEXT NOT NULL CHECK(direction IN ('inbound', 'outbound')),
    sender_phone TEXT NOT NULL,
    recipient_phone TEXT NOT NULL,
    message_type TEXT NOT NULL DEFAULT 'text',
    message_text TEXT,
    media_url TEXT,
    media_mime_type TEXT,
    status TEXT NOT NULL DEFAULT 'received' CHECK(status IN ('received', 'sent', 'delivered', 'read', 'failed')),
    error_details TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_repair_orders_archived ON repair_orders(is_archived);
  CREATE INDEX IF NOT EXISTS idx_wa_conv_phone ON whatsapp_conversations(customer_phone);
  CREATE INDEX IF NOT EXISTS idx_wa_msg_conv ON whatsapp_messages(conversation_id);
  CREATE INDEX IF NOT EXISTS idx_wa_msg_wam_id ON whatsapp_messages(whatsapp_message_id);
`);

console.log('Migration complete!');
const orders = db.prepare('SELECT id, tracking_id, source, is_archived, current_status FROM repair_orders').all();
console.log('Verified repair_orders in database:', orders);

