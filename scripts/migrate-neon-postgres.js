const fs = require('fs');
const path = require('path');
const { neon } = require('@neondatabase/serverless');

const envPath = path.join(__dirname, '..', '.env.local');
const env = fs.readFileSync(envPath, 'utf8');
const match = env.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
if (!match) {
  console.error('DATABASE_URL not found in .env.local');
  process.exit(1);
}

const connectionString = match[1].trim();
const sql = neon(connectionString);

async function migrate() {
  console.log('--- 1. Creating PostgreSQL Tables & Indexes ---');

  await sql`
    CREATE TABLE IF NOT EXISTS admin_users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(100) UNIQUE NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'technician' CHECK(role IN ('super_admin', 'technician')),
      name VARCHAR(150) NOT NULL,
      is_active SMALLINT NOT NULL DEFAULT 1,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS customer_records (
      id SERIAL PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      phone VARCHAR(50) NOT NULL,
      email VARCHAR(255),
      location VARCHAR(150),
      consent_whatsapp SMALLINT NOT NULL DEFAULT 1,
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS repair_orders (
      id SERIAL PRIMARY KEY,
      tracking_id VARCHAR(100) UNIQUE NOT NULL,
      customer_id INTEGER NOT NULL REFERENCES customer_records(id) ON DELETE RESTRICT,
      device_brand VARCHAR(100) NOT NULL,
      device_model VARCHAR(150) NOT NULL,
      imei_serial VARCHAR(100),
      repair_category VARCHAR(150) NOT NULL,
      reported_issue TEXT NOT NULL,
      inspection_notes TEXT,
      estimated_completion TIMESTAMPTZ,
      service_cost NUMERIC(10, 2),
      current_status VARCHAR(50) NOT NULL DEFAULT 'NEW_REQUEST' CHECK(current_status IN (
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
      pickup_ready SMALLINT NOT NULL DEFAULT 0,
      source VARCHAR(50) NOT NULL DEFAULT 'CUSTOMER_WEBSITE' CHECK(source IN ('CUSTOMER_WEBSITE', 'ADMIN_CREATED')),
      customer_type VARCHAR(50) NOT NULL DEFAULT 'Customer',
      paid SMALLINT NOT NULL DEFAULT 0,
      is_archived SMALLINT NOT NULL DEFAULT 0,
      archived_at TIMESTAMPTZ,
      archived_by_admin_id INTEGER REFERENCES admin_users(id),
      archive_reason TEXT,
      preferred_booking_date TIMESTAMPTZ,
      preferred_contact_method VARCHAR(50) DEFAULT 'whatsapp',
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS repair_status_history (
      id SERIAL PRIMARY KEY,
      order_id INTEGER NOT NULL REFERENCES repair_orders(id) ON DELETE CASCADE,
      previous_status VARCHAR(50),
      new_status VARCHAR(50) NOT NULL,
      customer_note TEXT,
      internal_note TEXT,
      updated_by_admin_id INTEGER REFERENCES admin_users(id),
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS whatsapp_conversations (
      id SERIAL PRIMARY KEY,
      customer_id INTEGER REFERENCES customer_records(id),
      customer_phone VARCHAR(50) UNIQUE NOT NULL,
      customer_name VARCHAR(150),
      last_message TEXT,
      last_message_at TIMESTAMPTZ,
      unread_count INTEGER DEFAULT 0,
      is_enquiry SMALLINT DEFAULT 1,
      converted_order_id INTEGER REFERENCES repair_orders(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS whatsapp_messages (
      id SERIAL PRIMARY KEY,
      conversation_id INTEGER NOT NULL REFERENCES whatsapp_conversations(id) ON DELETE CASCADE,
      whatsapp_message_id VARCHAR(255) UNIQUE,
      direction VARCHAR(20) NOT NULL CHECK(direction IN ('inbound', 'outbound')),
      sender_phone VARCHAR(50) NOT NULL,
      recipient_phone VARCHAR(50) NOT NULL,
      message_type VARCHAR(50) NOT NULL DEFAULT 'text',
      message_text TEXT,
      media_url TEXT,
      media_mime_type VARCHAR(100),
      status VARCHAR(50) NOT NULL DEFAULT 'received' CHECK(status IN ('received', 'sent', 'delivered', 'read', 'failed')),
      error_details TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS customer_notifications (
      id SERIAL PRIMARY KEY,
      order_id INTEGER REFERENCES repair_orders(id) ON DELETE SET NULL,
      channel VARCHAR(50) NOT NULL DEFAULT 'whatsapp' CHECK(channel IN ('whatsapp', 'sms', 'manual_whatsapp')),
      recipient_phone VARCHAR(50) NOT NULL,
      message_template VARCHAR(100) NOT NULL,
      message_body TEXT NOT NULL,
      provider_message_id VARCHAR(255),
      status VARCHAR(50) NOT NULL DEFAULT 'queued' CHECK(status IN ('queued', 'sent', 'delivered', 'failed', 'manual_click')),
      error_details TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS admin_audit_logs (
      id SERIAL PRIMARY KEY,
      admin_id INTEGER REFERENCES admin_users(id),
      action VARCHAR(100) NOT NULL,
      target_type VARCHAR(100) NOT NULL,
      target_id VARCHAR(100),
      details TEXT,
      ip_address VARCHAR(100),
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS admin_notifications (
      id SERIAL PRIMARY KEY,
      type VARCHAR(50) NOT NULL CHECK(type IN ('SERVICE_REQUEST', 'INCOMING_WHATSAPP', 'STATUS_UPDATE', 'OUTGOING_MESSAGE', 'SYSTEM_ALERT')),
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      order_id INTEGER REFERENCES repair_orders(id) ON DELETE CASCADE,
      conversation_id INTEGER REFERENCES whatsapp_conversations(id) ON DELETE CASCADE,
      tracking_id VARCHAR(100),
      customer_name VARCHAR(150),
      customer_phone VARCHAR(50),
      is_read SMALLINT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `;

  // Indexes
  await sql`CREATE INDEX IF NOT EXISTS idx_repair_orders_tracking_id ON repair_orders(LOWER(tracking_id));`;
  await sql`CREATE INDEX IF NOT EXISTS idx_repair_orders_customer_id ON repair_orders(customer_id);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_repair_orders_status ON repair_orders(current_status);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_repair_orders_archived ON repair_orders(is_archived);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_repair_orders_created ON repair_orders(created_at DESC);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_status_history_order ON repair_status_history(order_id);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_customer_phone ON customer_records(phone);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_notifications_order ON customer_notifications(order_id);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_audit_admin ON admin_audit_logs(admin_id);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_wa_conv_phone ON whatsapp_conversations(customer_phone);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_wa_msg_conv ON whatsapp_messages(conversation_id);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_admin_notif_read ON admin_notifications(is_read);`;

  console.log('✓ Tables & Indexes successfully created in PostgreSQL.');

  console.log('--- 2. Importing Preserved Production Data from SQLite Backup ---');
  const backupPath = path.join(__dirname, '..', 'data', 'sqlite-production-backup.json');
  if (fs.existsSync(backupPath)) {
    const backup = JSON.parse(fs.readFileSync(backupPath, 'utf8'));

    // 1. admin_users
    for (const u of backup.admin_users || []) {
      await sql`
        INSERT INTO admin_users (id, username, email, password_hash, role, name, is_active, created_at, updated_at)
        VALUES (${u.id}, ${u.username}, ${u.email}, ${u.password_hash}, ${u.role}, ${u.name}, ${u.is_active}, ${u.created_at}, ${u.updated_at})
        ON CONFLICT (id) DO UPDATE SET
          username = EXCLUDED.username,
          email = EXCLUDED.email,
          password_hash = EXCLUDED.password_hash,
          role = EXCLUDED.role,
          name = EXCLUDED.name,
          is_active = EXCLUDED.is_active;
      `;
    }
    await sql`SELECT setval('admin_users_id_seq', (SELECT COALESCE(MAX(id), 1) FROM admin_users));`;

    // 2. customer_records
    for (const c of backup.customer_records || []) {
      await sql`
        INSERT INTO customer_records (id, name, phone, email, location, consent_whatsapp, notes, created_at, updated_at)
        VALUES (${c.id}, ${c.name}, ${c.phone}, ${c.email}, ${c.location}, ${c.consent_whatsapp}, ${c.notes}, ${c.created_at}, ${c.updated_at})
        ON CONFLICT (id) DO NOTHING;
      `;
    }
    await sql`SELECT setval('customer_records_id_seq', (SELECT COALESCE(MAX(id), 1) FROM customer_records));`;

    // 3. repair_orders
    for (const o of backup.repair_orders || []) {
      await sql`
        INSERT INTO repair_orders (
          id, tracking_id, customer_id, device_brand, device_model, imei_serial,
          repair_category, reported_issue, inspection_notes, estimated_completion,
          service_cost, current_status, pickup_ready, source, customer_type,
          paid, is_archived, archived_at, archived_by_admin_id, archive_reason,
          preferred_booking_date, preferred_contact_method, created_at, updated_at
        ) VALUES (
          ${o.id}, ${o.tracking_id}, ${o.customer_id}, ${o.device_brand}, ${o.device_model}, ${o.imei_serial},
          ${o.repair_category}, ${o.reported_issue}, ${o.inspection_notes}, ${o.estimated_completion},
          ${o.service_cost}, ${o.current_status}, ${o.pickup_ready}, ${o.source}, ${o.customer_type},
          ${o.paid}, ${o.is_archived}, ${o.archived_at}, ${o.archived_by_admin_id}, ${o.archive_reason},
          ${o.preferred_booking_date}, ${o.preferred_contact_method}, ${o.created_at}, ${o.updated_at}
        ) ON CONFLICT (id) DO NOTHING;
      `;
    }
    await sql`SELECT setval('repair_orders_id_seq', (SELECT COALESCE(MAX(id), 1) FROM repair_orders));`;

    // 4. repair_status_history
    for (const h of backup.repair_status_history || []) {
      await sql`
        INSERT INTO repair_status_history (
          id, order_id, previous_status, new_status, customer_note, internal_note, updated_by_admin_id, created_at
        ) VALUES (
          ${h.id}, ${h.order_id}, ${h.previous_status}, ${h.new_status}, ${h.customer_note}, ${h.internal_note}, ${h.updated_by_admin_id}, ${h.created_at}
        ) ON CONFLICT (id) DO NOTHING;
      `;
    }
    await sql`SELECT setval('repair_status_history_id_seq', (SELECT COALESCE(MAX(id), 1) FROM repair_status_history));`;

    // 5. admin_audit_logs
    for (const a of backup.admin_audit_logs || []) {
      await sql`
        INSERT INTO admin_audit_logs (
          id, admin_id, action, target_type, target_id, details, ip_address, created_at
        ) VALUES (
          ${a.id}, ${a.admin_id}, ${a.action}, ${a.target_type}, ${a.target_id}, ${a.details}, ${a.ip_address}, ${a.created_at}
        ) ON CONFLICT (id) DO NOTHING;
      `;
    }
    await sql`SELECT setval('admin_audit_logs_id_seq', (SELECT COALESCE(MAX(id), 1) FROM admin_audit_logs));`;

    console.log('✓ Preserved production data migrated to PostgreSQL successfully!');
  }

  // Count verify
  const [adminCount] = await sql`SELECT COUNT(*)::int as c FROM admin_users`;
  const [customerCount] = await sql`SELECT COUNT(*)::int as c FROM customer_records`;
  const [orderCount] = await sql`SELECT COUNT(*)::int as c FROM repair_orders`;
  const [historyCount] = await sql`SELECT COUNT(*)::int as c FROM repair_status_history`;
  const [auditCount] = await sql`SELECT COUNT(*)::int as c FROM admin_audit_logs`;

  console.log('\n--- PostgreSQL Verification Row Counts ---');
  console.log({
    admin_users: adminCount.c,
    customer_records: customerCount.c,
    repair_orders: orderCount.c,
    repair_status_history: historyCount.c,
    admin_audit_logs: auditCount.c,
  });
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});

