// DENISH MOBILE REPAIRING AND SERVICE
// Database Connection & Management Layer

import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";

let dbInstance: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (dbInstance) {
    return dbInstance;
  }

  const isServerless = Boolean(
    process.env.NETLIFY ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.VERCEL ||
    process.env.LAMBDA_TASK_ROOT
  );

  let dbPath = process.env.DATABASE_PATH;
  if (!dbPath) {
    if (isServerless) {
      // In serverless environments (Netlify, AWS Lambda, Vercel),
      // /var/task is read-only. Only /tmp is writable.
      const tmpDb = path.join("/tmp", "denish.sqlite");
      const repoDb = path.join(process.cwd(), "data", "denish.sqlite");
      if (fs.existsSync(repoDb) && !fs.existsSync(tmpDb)) {
        try {
          fs.copyFileSync(repoDb, tmpDb);
        } catch {
          // ignore copy error
        }
      }
      dbPath = tmpDb;
    } else {
      let dbDir = path.join(process.cwd(), "data");
      try {
        if (!fs.existsSync(dbDir)) {
          fs.mkdirSync(dbDir, { recursive: true });
        }
      } catch (err) {
        console.warn("[DATABASE] process.cwd() not writable, using /tmp fallback:", err);
        dbDir = "/tmp";
      }
      dbPath = path.join(dbDir, "denish.sqlite");
    }
  }

  dbInstance = new Database(dbPath);

  // Performance & Integrity Pragmas
  try {
    dbInstance.pragma("journal_mode = WAL");
  } catch {
    dbInstance.pragma("journal_mode = DELETE");
  }
  dbInstance.pragma("foreign_keys = ON");
  dbInstance.pragma("synchronous = NORMAL");

  // Run schema migration
  const schemaPath = path.join(process.cwd(), "src", "data", "schema.sql");
  if (fs.existsSync(schemaPath)) {
    const schemaSql = fs.readFileSync(schemaPath, "utf8");
    dbInstance.exec(schemaSql);
  }

  // Ensure column and constraint migrations
  runSchemaMigrations(dbInstance);

  // Check if any admin exists. If not, seed initial admin via env vars or default setup
  seedInitialAdmin(dbInstance);

  return dbInstance;
}

function runSchemaMigrations(db: Database.Database) {
  try {
    // 1. Ensure location column exists in customer_records
    const cols = db.prepare("PRAGMA table_info(customer_records)").all() as Array<{ name: string }>;
    if (cols.length > 0 && !cols.some((c) => c.name === "location")) {
      db.prepare("ALTER TABLE customer_records ADD COLUMN location TEXT").run();
      console.log("[MIGRATION] Added location column to customer_records table.");
    }

    // 2. Ensure repair_orders table supports NEW_REQUEST in check constraint
    const orderSql = db.prepare("SELECT sql FROM sqlite_master WHERE name='repair_orders'").get() as { sql: string } | undefined;
    if (orderSql && !orderSql.sql.includes("NEW_REQUEST")) {
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
      console.log("[MIGRATION] Updated repair_orders constraint to include NEW_REQUEST.");
    }

    // 3. Ensure source, customer_type, and paid columns exist in repair_orders table
    const orderCols = db.prepare("PRAGMA table_info(repair_orders)").all() as Array<{ name: string }>;
    if (orderCols.length > 0 && !orderCols.some((c) => c.name === "source")) {
      db.prepare("ALTER TABLE repair_orders ADD COLUMN source TEXT NOT NULL DEFAULT 'CUSTOMER_WEBSITE'").run();
      console.log("[MIGRATION] Added source column to repair_orders table.");
    }
    if (orderCols.length > 0 && !orderCols.some((c) => c.name === "customer_type")) {
      db.prepare("ALTER TABLE repair_orders ADD COLUMN customer_type TEXT NOT NULL DEFAULT 'Customer'").run();
      console.log("[MIGRATION] Added customer_type column to repair_orders table.");
    }
    if (orderCols.length > 0 && !orderCols.some((c) => c.name === "paid")) {
      db.prepare("ALTER TABLE repair_orders ADD COLUMN paid INTEGER NOT NULL DEFAULT 0").run();
      console.log("[MIGRATION] Added paid column to repair_orders table.");
    }

    // 4. Soft-delete / Archive columns in repair_orders table
    if (orderCols.length > 0 && !orderCols.some((c) => c.name === "is_archived")) {
      db.prepare("ALTER TABLE repair_orders ADD COLUMN is_archived INTEGER NOT NULL DEFAULT 0").run();
      console.log("[MIGRATION] Added is_archived column to repair_orders table.");
    }
    if (orderCols.length > 0 && !orderCols.some((c) => c.name === "archived_at")) {
      db.prepare("ALTER TABLE repair_orders ADD COLUMN archived_at TEXT").run();
      console.log("[MIGRATION] Added archived_at column to repair_orders table.");
    }
    if (orderCols.length > 0 && !orderCols.some((c) => c.name === "archived_by_admin_id")) {
      db.prepare("ALTER TABLE repair_orders ADD COLUMN archived_by_admin_id INTEGER REFERENCES admin_users(id)").run();
      console.log("[MIGRATION] Added archived_by_admin_id column to repair_orders table.");
    }
    if (orderCols.length > 0 && !orderCols.some((c) => c.name === "archive_reason")) {
      db.prepare("ALTER TABLE repair_orders ADD COLUMN archive_reason TEXT").run();
      console.log("[MIGRATION] Added archive_reason column to repair_orders table.");
    }
    if (orderCols.length > 0 && !orderCols.some((c) => c.name === "preferred_booking_date")) {
      db.prepare("ALTER TABLE repair_orders ADD COLUMN preferred_booking_date TEXT").run();
      console.log("[MIGRATION] Added preferred_booking_date column to repair_orders table.");
    }
    if (orderCols.length > 0 && !orderCols.some((c) => c.name === "preferred_contact_method")) {
      db.prepare("ALTER TABLE repair_orders ADD COLUMN preferred_contact_method TEXT NOT NULL DEFAULT 'whatsapp'").run();
      console.log("[MIGRATION] Added preferred_contact_method column to repair_orders table.");
    }

    // 5. Normalize legacy 'CUSTOMER_REQUEST' source values to 'CUSTOMER_WEBSITE'
    db.prepare("UPDATE repair_orders SET source = 'CUSTOMER_WEBSITE' WHERE source = 'CUSTOMER_REQUEST'").run();

    // 6. Ensure WhatsApp tables exist
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

      -- 7. Ensure admin_notifications table exists for genuine operational alerts
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

      CREATE INDEX IF NOT EXISTS idx_admin_notif_read ON admin_notifications(is_read);
      CREATE INDEX IF NOT EXISTS idx_admin_notif_type ON admin_notifications(type);
      CREATE INDEX IF NOT EXISTS idx_admin_notif_created ON admin_notifications(created_at DESC);
    `);
  } catch (err) {
    console.error("[MIGRATION_ERROR]", err);
  }
}

function seedInitialAdmin(db: Database.Database) {
  try {
    const countRow = db.prepare("SELECT COUNT(*) as c FROM admin_users").get() as { c: number } | undefined;
    if (countRow && countRow.c > 0) {
      return;
    }

    const initialPassword = process.env.ADMIN_INITIAL_PASSWORD?.trim();
    const initialUsername = (process.env.ADMIN_INITIAL_USERNAME || "denish_admin").trim().toLowerCase();
    const initialEmail = (process.env.ADMIN_INITIAL_EMAIL || "admin@denishmobile.com").trim().toLowerCase();

    if (!initialPassword || initialPassword.length < 10) {
      console.warn(
        "[AUTH_SETUP_REQUIRED] No admin_users found. Set ADMIN_INITIAL_PASSWORD (>= 10 chars) or run `node scripts/create-admin.js <username> <email> <password> super_admin` to provision the owner account."
      );
      return;
    }

    const passwordHash = bcrypt.hashSync(initialPassword, 12);
    db.prepare(`
      INSERT INTO admin_users (username, email, password_hash, role, name, is_active, created_at, updated_at)
      VALUES (?, ?, ?, 'super_admin', 'Denish Workshop Admin', 1, datetime('now'), datetime('now'))
    `).run(initialUsername, initialEmail, passwordHash);
    console.log(`[DATABASE] Initial super_admin provisioned: ${initialUsername}`);
  } catch (err) {
    console.error("[DATABASE_SEED_ERROR]", err);
  }
}

/**
 * Executes a function within an atomic transaction.
 */
export function runInTransaction<T>(fn: (db: Database.Database) => T): T {
  const db = getDatabase();
  const tx = db.transaction(() => fn(db));
  return tx();
}
