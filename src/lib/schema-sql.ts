// Embedded fallback copy of src/data/schema.sql for serverless bundles where process.cwd() may omit src/data/schema.sql.
export const SCHEMA_SQL = `
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL COLLATE NOCASE,
  email TEXT UNIQUE NOT NULL COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'technician' CHECK(role IN ('super_admin', 'technician')),
  name TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS customer_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  location TEXT,
  consent_whatsapp INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS repair_orders (
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
  source TEXT NOT NULL DEFAULT 'CUSTOMER_WEBSITE' CHECK(source IN ('CUSTOMER_WEBSITE', 'ADMIN_CREATED')),
  customer_type TEXT NOT NULL DEFAULT 'Customer',
  paid INTEGER NOT NULL DEFAULT 0,
  is_archived INTEGER NOT NULL DEFAULT 0,
  archived_at TEXT,
  archived_by_admin_id INTEGER REFERENCES admin_users(id),
  archive_reason TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS repair_status_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL REFERENCES repair_orders(id) ON DELETE CASCADE,
  previous_status TEXT,
  new_status TEXT NOT NULL,
  customer_note TEXT,
  internal_note TEXT,
  updated_by_admin_id INTEGER REFERENCES admin_users(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

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

CREATE TABLE IF NOT EXISTS customer_notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER REFERENCES repair_orders(id) ON DELETE SET NULL,
  channel TEXT NOT NULL DEFAULT 'whatsapp' CHECK(channel IN ('whatsapp', 'sms', 'manual_whatsapp')),
  recipient_phone TEXT NOT NULL,
  message_template TEXT NOT NULL,
  message_body TEXT NOT NULL,
  provider_message_id TEXT,
  status TEXT NOT NULL DEFAULT 'queued' CHECK(status IN ('queued', 'sent', 'delivered', 'failed', 'manual_click')),
  error_details TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  admin_id INTEGER REFERENCES admin_users(id),
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT,
  details TEXT,
  ip_address TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

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

CREATE INDEX IF NOT EXISTS idx_repair_orders_tracking_id ON repair_orders(tracking_id);
CREATE INDEX IF NOT EXISTS idx_repair_orders_customer_id ON repair_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_repair_orders_status ON repair_orders(current_status);
CREATE INDEX IF NOT EXISTS idx_repair_orders_archived ON repair_orders(is_archived);
CREATE INDEX IF NOT EXISTS idx_repair_orders_created ON repair_orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_status_history_order ON repair_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_customer_phone ON customer_records(phone);
CREATE INDEX IF NOT EXISTS idx_notifications_order ON customer_notifications(order_id);
CREATE INDEX IF NOT EXISTS idx_audit_admin ON admin_audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_wa_conv_phone ON whatsapp_conversations(customer_phone);
CREATE INDEX IF NOT EXISTS idx_wa_msg_conv ON whatsapp_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_wa_msg_wam_id ON whatsapp_messages(whatsapp_message_id);
CREATE INDEX IF NOT EXISTS idx_admin_notif_read ON admin_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_admin_notif_type ON admin_notifications(type);
CREATE INDEX IF NOT EXISTS idx_admin_notif_created ON admin_notifications(created_at DESC);
`;

