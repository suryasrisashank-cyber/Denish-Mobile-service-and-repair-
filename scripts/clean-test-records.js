const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

const dbPath = path.join(__dirname, "..", "data", "denish.sqlite");
const db = new Database(dbPath);

console.log("Cleaning confirmed test and duplicate records from database...");

// 1. Target order IDs to remove
const testOrderIds = [2, 3, 258, 265, 295, 296, 301, 313, 314];

db.pragma("foreign_keys = OFF");

const deleteTx = db.transaction(() => {
  // Delete status history for test orders
  const delHistory = db.prepare(`DELETE FROM repair_status_history WHERE order_id IN (${testOrderIds.join(",")})`);
  const histRes = delHistory.run();
  console.log(`Deleted ${histRes.changes} status history entries for test orders.`);

  // Delete notifications for test orders
  const delNotifs = db.prepare(`DELETE FROM customer_notifications WHERE order_id IN (${testOrderIds.join(",")})`);
  const notifRes = delNotifs.run();
  console.log(`Deleted ${notifRes.changes} notifications for test orders.`);

  // Delete remaining manual_click / queued fake test notifications
  const delFakeNotifs = db.prepare("DELETE FROM customer_notifications WHERE status IN ('manual_click', 'queued') OR recipient_phone = '919825011223'");
  const fakeRes = delFakeNotifs.run();
  console.log(`Deleted ${fakeRes.changes} fake/manual_click notification entries.`);

  // Delete test repair orders
  const delOrders = db.prepare(`DELETE FROM repair_orders WHERE id IN (${testOrderIds.join(",")})`);
  const orderRes = delOrders.run();
  console.log(`Deleted ${orderRes.changes} confirmed test/duplicate repair orders.`);

  // Delete confirmed test customer records
  const testCustomerIds = [118, 119, 126]; // Ffff, Rttt, Test User
  const delCustomers = db.prepare(`DELETE FROM customer_records WHERE id IN (${testCustomerIds.join(",")})`);
  const custRes = delCustomers.run();
  console.log(`Deleted ${custRes.changes} confirmed test customer records.`);
});

deleteTx();
db.pragma("foreign_keys = ON");

// Verify remaining orders
const remainingOrders = db.prepare(`
  SELECT ro.id, ro.tracking_id, ro.current_status, ro.device_brand, ro.device_model,
         cr.name as customer_name, cr.phone as customer_phone
  FROM repair_orders ro
  JOIN customer_records cr ON ro.customer_id = cr.id
  ORDER BY ro.id ASC
`).all();

console.log(`\nRemaining genuine orders (${remainingOrders.length}):`);
remainingOrders.forEach(o => {
  console.log(` - Order #${o.id}: ${o.customer_name} (${o.customer_phone}) | ${o.tracking_id} | ${o.device_brand} ${o.device_model} | ${o.current_status}`);
});

const remainingCustomers = db.prepare("SELECT id, name, phone FROM customer_records ORDER BY id ASC").all();
console.log(`\nRemaining genuine customers (${remainingCustomers.length}):`);
remainingCustomers.forEach(c => {
  console.log(` - Cust #${c.id}: ${c.name} (${c.phone})`);
});

db.close();

