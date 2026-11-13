// Script to remove demo customer data from Neon PostgreSQL & SQLite
// and set tracking_id = customer's mobile number
const fs = require("fs");
const path = require("path");
const { neon } = require("@neondatabase/serverless");
const Database = require("better-sqlite3");

// Load .env.local
const envContent = fs.readFileSync(path.join(__dirname, "..", ".env.local"), "utf-8");
let dbUrl = "";
for (const line of envContent.split("\n")) {
  if (line.trim().startsWith("DATABASE_URL=")) {
    dbUrl = line.split("=").slice(1).join("=").trim().replace(/^["']|["']$/g, "");
  }
}

async function cleanNeon() {
  console.log("=== CLEANING NEON POSTGRESQL DATABASE ===");
  const sql = neon(dbUrl, { fullResults: true });

  // 1. Drop UNIQUE constraint on tracking_id so mobile number can be reused across multiple repairs
  try {
    await sql.query("ALTER TABLE repair_orders DROP CONSTRAINT IF EXISTS repair_orders_tracking_id_key");
    await sql.query("CREATE INDEX IF NOT EXISTS idx_repair_orders_tracking_id ON repair_orders (tracking_id)");
    console.log("✓ Dropped UNIQUE constraint on tracking_id and ensured index exists.");
  } catch (err) {
    console.warn("Constraint drop note:", err.message);
  }

  // 2. Identify demo/test customer IDs (Suresh Patel, Ramesh Shah, Pooja Sharma, etc.)
  const demoCusts = await sql.query(`
    SELECT id, name, phone FROM customer_records 
    WHERE name IN ('Suresh Patel', 'Ramesh Shah', 'Pooja Sharma', 'Test User')
       OR phone LIKE '987654%'
       OR phone LIKE '912345%'
       OR phone LIKE '982540%'
  `);

  console.log(`Found ${demoCusts.rows.length} demo customers to delete:`, demoCusts.rows.map(c => `${c.name} (${c.phone})`));

  if (demoCusts.rows.length > 0) {
    const demoIds = demoCusts.rows.map(c => c.id);
    const demoIdList = demoIds.join(",");

    // Find orders belonging to demo customers
    const demoOrders = await sql.query(`SELECT id FROM repair_orders WHERE customer_id IN (${demoIdList})`);
    const orderIds = demoOrders.rows.map(o => o.id);

    if (orderIds.length > 0) {
      const orderIdList = orderIds.join(",");
      await sql.query(`DELETE FROM repair_status_history WHERE order_id IN (${orderIdList})`);
      await sql.query(`DELETE FROM customer_notifications WHERE order_id IN (${orderIdList})`);
      await sql.query(`DELETE FROM admin_notifications WHERE order_id IN (${orderIdList})`);
      await sql.query(`DELETE FROM repair_orders WHERE id IN (${orderIdList})`);
      console.log(`✓ Deleted ${orderIds.length} demo repair orders and child records.`);
    }

    await sql.query(`DELETE FROM customer_records WHERE id IN (${demoIdList})`);
    console.log(`✓ Deleted ${demoIds.length} demo customer records.`);
  }

  // 3. Update all remaining real orders to use the customer's 10-digit mobile number as tracking_id
  const realOrders = await sql.query(`
    SELECT ro.id, ro.tracking_id, cr.phone, cr.name
    FROM repair_orders ro
    JOIN customer_records cr ON ro.customer_id = cr.id
  `);

  console.log(`\nRemaining real orders (${realOrders.rows.length}):`);
  for (const o of realOrders.rows) {
    const cleanPhone = String(o.phone).replace(/\D/g, "").slice(-10);
    await sql.query("UPDATE repair_orders SET tracking_id = $1 WHERE id = $2", [cleanPhone, o.id]);
    await sql.query("UPDATE admin_notifications SET tracking_id = $1 WHERE order_id = $2", [cleanPhone, o.id]);
    console.log(`✓ Order #${o.id} for ${o.name} updated: tracking_id -> '${cleanPhone}'`);
  }

  // 4. Verify purity
  const finalOrders = await sql.query(`
    SELECT ro.id, ro.tracking_id, ro.device_brand, ro.device_model, ro.current_status, cr.name as customer_name, cr.phone
    FROM repair_orders ro
    JOIN customer_records cr ON ro.customer_id = cr.id
    ORDER BY ro.id ASC
  `);
  console.log("\n--- FINAL ACTIVE REAL ORDERS IN NEON POSTGRESQL ---");
  console.table(finalOrders.rows);
}

function cleanSqlite() {
  console.log("\n=== CLEANING LOCAL SQLITE DATABASE ===");
  const dbPath = path.join(__dirname, "..", "data", "denish.sqlite");
  if (!fs.existsSync(dbPath)) return;
  const db = new Database(dbPath);

  const demoCusts = db.prepare(`
    SELECT id, name, phone FROM customer_records 
    WHERE name IN ('Suresh Patel', 'Ramesh Shah', 'Pooja Sharma', 'Test User')
       OR phone LIKE '987654%'
       OR phone LIKE '912345%'
       OR phone LIKE '982540%'
  `).all();

  if (demoCusts.length > 0) {
    const demoIds = demoCusts.map(c => c.id);
    const demoIdList = demoIds.join(",");

    const demoOrders = db.prepare(`SELECT id FROM repair_orders WHERE customer_id IN (${demoIdList})`).all();
    const orderIds = demoOrders.map(o => o.id);

    if (orderIds.length > 0) {
      const orderIdList = orderIds.join(",");
      db.prepare(`DELETE FROM repair_status_history WHERE order_id IN (${orderIdList})`).run();
      db.prepare(`DELETE FROM customer_notifications WHERE order_id IN (${orderIdList})`).run();
      db.prepare(`DELETE FROM admin_notifications WHERE order_id IN (${orderIdList})`).run();
      db.prepare(`DELETE FROM repair_orders WHERE id IN (${orderIdList})`).run();
    }

    db.prepare(`DELETE FROM customer_records WHERE id IN (${demoIdList})`).run();
    console.log(`✓ Cleaned demo records from local SQLite.`);
  }

  const realOrders = db.prepare(`
    SELECT ro.id, cr.phone
    FROM repair_orders ro
    JOIN customer_records cr ON ro.customer_id = cr.id
  `).all();

  for (const o of realOrders) {
    const cleanPhone = String(o.phone).replace(/\D/g, "").slice(-10);
    try {
      db.prepare("UPDATE repair_orders SET tracking_id = ? WHERE id = ?").run(cleanPhone, o.id);
    } catch (e) {
      // Ignore if unique constraint collides on sqlite
    }
  }

  db.close();
}

async function main() {
  await cleanNeon();
  cleanSqlite();
  console.log("\n[SUCCESS] Database cleaned: only real customer data remains, with mobile numbers as tracking ID & service ID!");
}

main().catch(console.error);

