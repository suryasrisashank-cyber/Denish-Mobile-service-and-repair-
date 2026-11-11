const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

const dbPath = path.join(__dirname, "..", "data", "denish.sqlite");
const backupPath = path.join(__dirname, "..", "data", `denish.sqlite.pre-bugfix-backup-${Date.now()}`);

fs.copyFileSync(dbPath, backupPath);
console.log("Database backup created at:", backupPath);

const db = new Database(dbPath);

console.log("\n==================== 1. ALL REPAIR ORDERS ====================");
const orders = db.prepare(`
  SELECT ro.id, ro.tracking_id, ro.device_brand, ro.device_model, ro.repair_category, 
         ro.reported_issue, ro.source, ro.current_status, ro.is_archived, ro.created_at,
         cr.id as customer_id, cr.name as customer_name, cr.phone as customer_phone
  FROM repair_orders ro
  JOIN customer_records cr ON ro.customer_id = cr.id
  ORDER BY ro.id ASC
`).all();

console.log(`Total orders found: ${orders.length}`);
orders.forEach(o => {
  console.log(`[Order #${o.id}] Tracking: ${o.tracking_id} | Status: ${o.current_status} | Archived: ${o.is_archived} | Source: ${o.source}`);
  console.log(`   Customer: ${o.customer_name} | Phone: ${o.customer_phone}`);
  console.log(`   Device: ${o.device_brand} ${o.device_model} | Category: ${o.repair_category}`);
  console.log(`   Issue: ${JSON.stringify(o.reported_issue)}`);
  console.log(`   Created: ${o.created_at}\n`);
});

console.log("\n==================== 2. ALL CUSTOMER RECORDS ====================");
const customers = db.prepare("SELECT * FROM customer_records ORDER BY id ASC").all();
console.log(`Total customer records: ${customers.length}`);
customers.forEach(c => {
  console.log(`[Cust #${c.id}] Name: ${c.name} | Phone: ${c.phone} | Loc: ${c.location} | Created: ${c.created_at}`);
});

console.log("\n==================== 3. ALL NOTIFICATIONS ====================");
const notifs = db.prepare("SELECT * FROM customer_notifications ORDER BY id ASC").all();
console.log(`Total notifications: ${notifs.length}`);
notifs.forEach(n => {
  console.log(`[Notif #${n.id}] OrderID: ${n.order_id} | Channel: ${n.channel} | Status: ${n.status} | Template: ${n.message_template} | Phone: ${n.recipient_phone} | Date: ${n.created_at}`);
});

console.log("\n==================== 4. ALL WHATSAPP CONVERSATIONS ====================");
const convs = db.prepare("SELECT * FROM whatsapp_conversations ORDER BY id ASC").all();
console.log(`Total WhatsApp conversations: ${convs.length}`);
convs.forEach(c => {
  console.log(`[Conv #${c.id}] Phone: ${c.customer_phone} | Name: ${c.customer_name} | Enquiry: ${c.is_enquiry} | Converted: ${c.converted_order_id}`);
});

