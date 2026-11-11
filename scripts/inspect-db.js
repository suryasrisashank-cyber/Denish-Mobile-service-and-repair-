const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'data', 'denish.sqlite');
const db = new Database(dbPath);

console.log('--- DATABASE INSPECTION ---');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('Tables:', tables.map(t => t.name));

const customerCount = db.prepare('SELECT COUNT(*) as c FROM customer_records').get().c;
const ordersCount = db.prepare('SELECT COUNT(*) as c FROM repair_orders').get().c;
console.log('Customer records count:', customerCount);
console.log('Repair orders count:', ordersCount);

const orderColumns = db.prepare('PRAGMA table_info(repair_orders)').all();
console.log('repair_orders columns:', orderColumns.map(c => c.name));

const statusCounts = db.prepare(`
  SELECT current_status, COUNT(*) as count 
  FROM repair_orders 
  GROUP BY current_status
`).all();
console.log('Orders by status:', statusCounts);

const sampleOrders = db.prepare(`
  SELECT ro.id, ro.tracking_id, ro.current_status, ro.created_at, cr.name as customer_name, cr.phone
  FROM repair_orders ro
  JOIN customer_records cr ON ro.customer_id = cr.id
  ORDER BY ro.id DESC
  LIMIT 5
`).all();
console.log('Recent 5 orders:', sampleOrders);
