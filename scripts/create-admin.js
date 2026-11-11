// CLI Script: Create Admin User
// Usage: node scripts/create-admin.js <username> <email> <password> [role] [name]

const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");

const args = process.argv.slice(2);
if (args.length < 3) {
  console.log("Usage: node scripts/create-admin.js <username> <email> <password> [role] [name]");
  console.log("Roles: 'super_admin' or 'technician' (default: 'technician')");
  process.exit(1);
}

const [username, email, password, role = "technician", name = "Staff Member"] = args;

const dbDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = process.env.DATABASE_PATH || path.join(dbDir, "denish.sqlite");
const db = new Database(dbPath);

// Ensure schema
const schemaPath = path.join(process.cwd(), "src", "data", "schema.sql");
if (fs.existsSync(schemaPath)) {
  db.exec(fs.readFileSync(schemaPath, "utf8"));
}

const passwordHash = bcrypt.hashSync(password, 12);

try {
  const stmt = db.prepare(`
    INSERT INTO admin_users (username, email, password_hash, role, name, is_active, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, 1, datetime('now'), datetime('now'))
  `);
  stmt.run(username.trim().toLowerCase(), email.trim().toLowerCase(), passwordHash, role, name);
  console.log(`[SUCCESS] Admin user '${username}' (${role}) created successfully!`);
} catch (err) {
  if (err.message && err.message.includes("UNIQUE constraint failed")) {
    console.error(`[ERROR] User with this username or email already exists.`);
  } else {
    console.error("[ERROR]", err.message);
  }
  process.exit(1);
}
