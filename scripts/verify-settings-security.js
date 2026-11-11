const fs = require("fs");
const path = require("path");

const pagePath = path.join(__dirname, "..", "src", "app", "admin", "page.tsx");
const content = fs.readFileSync(pagePath, "utf8");

console.log("=== VERIFYING ADMIN PAGE SECURITY DISCLOSURES ===");
console.log("Includes 'Database Engine':", content.includes("Database Engine"));
console.log("Includes 'Storage File':", content.includes("Storage File"));
console.log("Includes 'denish.sqlite':", content.includes("denish.sqlite"));
console.log("Includes 'better-sqlite3':", content.includes("better-sqlite3"));
console.log("Includes 'SQLite':", content.includes("SQLite"));
console.log("Includes 'Security & Operations Overview':", content.includes("Security & Operations Overview") || content.includes("Security &amp; Operations Overview"));
console.log("================================================");

