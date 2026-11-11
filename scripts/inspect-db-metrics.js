const Database = require('better-sqlite3');
const db = new Database('./data/denish.sqlite');

const total = db.prepare('SELECT COUNT(*) as c FROM repair_orders').get().c;
const statuses = db.prepare('SELECT current_status, COUNT(*) as c FROM repair_orders GROUP BY current_status').all();
const sources = db.prepare('SELECT source, COUNT(*) as c FROM repair_orders GROUP BY source').all();
const sumCost = db.prepare('SELECT SUM(service_cost) as s FROM repair_orders').get().s;

console.log('Total orders:', total);
console.log('Statuses:', statuses);
console.log('Sources:', sources);
console.log('Sum cost:', sumCost);
