const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'denish.sqlite');
const db = new Database(dbPath);

const defaultPassword = 'Denish@Lab2026!';
const passwordHash = bcrypt.hashSync(defaultPassword, 12);

// 1. Ensure denish_admin has known password hash
const denishUser = db.prepare('SELECT id FROM admin_users WHERE username = ?').get('denish_admin');
if (denishUser) {
  db.prepare('UPDATE admin_users SET password_hash = ? WHERE username = ?').run(passwordHash, 'denish_admin');
  console.log('Updated denish_admin password hash.');
} else {
  db.prepare(`
    INSERT INTO admin_users (username, email, password_hash, role, name, is_active, created_at, updated_at)
    VALUES ('denish_admin', 'admin@denishmobile.com', ?, 'super_admin', 'Denish Master Admin', 1, datetime('now'), datetime('now'))
  `).run(passwordHash);
  console.log('Created denish_admin user.');
}

// 2. Ensure admin alias exists
const adminUser = db.prepare('SELECT id FROM admin_users WHERE username = ?').get('admin');
if (adminUser) {
  db.prepare('UPDATE admin_users SET password_hash = ? WHERE username = ?').run(passwordHash, 'admin');
  console.log('Updated admin password hash.');
} else {
  db.prepare(`
    INSERT INTO admin_users (username, email, password_hash, role, name, is_active, created_at, updated_at)
    VALUES ('admin', 'master@denishmobile.com', ?, 'super_admin', 'Administrator', 1, datetime('now'), datetime('now'))
  `).run(passwordHash);
  console.log('Created admin alias user.');
}

console.log('Admin users in database:');
console.table(db.prepare('SELECT id, username, email, role, is_active FROM admin_users').all());

