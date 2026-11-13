const fs = require("fs");
const path = require("path");
const { neon } = require("@neondatabase/serverless");

const envContent = fs.readFileSync(path.join(__dirname, "..", ".env.local"), "utf-8");
let dbUrl = "";
for (const line of envContent.split("\n")) {
  if (line.trim().startsWith("DATABASE_URL=")) {
    dbUrl = line.split("=").slice(1).join("=").trim().replace(/^["']|["']$/g, "");
  }
}

const sql = neon(dbUrl, { fullResults: true });

async function check() {
  const orders = await sql.query(`
    SELECT ro.id, ro.tracking_id, ro.device_brand, ro.device_model, ro.current_status, cr.id as customer_id, cr.name as customer_name, cr.phone 
    FROM repair_orders ro 
    JOIN customer_records cr ON ro.customer_id = cr.id
    ORDER BY ro.id ASC
  `);
  console.log("Orders count:", orders.rows.length);
  console.log("Orders:", JSON.stringify(orders.rows, null, 2));

  const custs = await sql.query("SELECT id, name, phone, location FROM customer_records ORDER BY id ASC");
  console.log("Customers count:", custs.rows.length);
  console.log("Customers:", JSON.stringify(custs.rows, null, 2));
}

check().catch(console.error);

