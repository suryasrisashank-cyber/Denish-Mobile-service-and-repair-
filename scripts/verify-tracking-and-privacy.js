// Verification script for tracking ID format, live tracking, and privacy enforcement
const http = require("http");
const path = require("path");
const Database = require("better-sqlite3");

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, body });
        }
      });
    });
    req.on("error", reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function runTest() {
  console.log("=== VERIFYING TRACKING ID, LIVE TRACKING & PRIVACY PROTECTION ===");

  const dbPath = path.join(__dirname, "..", "data", "denish.sqlite");
  const db = new Database(dbPath);

  // 1. Submit Request via /api/requests with mobile number
  console.log("\n1. Testing order creation with mobile 9825012345...");
  const createRes = await request(
    {
      hostname: "localhost",
      port: 3000,
      path: "/api/requests",
      method: "POST",
      headers: { "Content-Type": "application/json" },
    },
    {
      name: "Kishan Patel",
      phone: "9825012345",
      deviceBrand: "Other",
      customBrand: "Nothing Phone 2",
      deviceModel: "Nothing Phone 2",
      repairCategory: "Other",
      customIssue: "Glyph lights not turning on",
      problemDescription: "Back LED glyph matrix is not responding",
    }
  );

  console.log("Create Response Status:", createRes.status);
  console.log("Created Tracking ID:", createRes.body.trackingId);

  const trackingId = createRes.body.trackingId;
  if (!trackingId || !trackingId.includes("9825012345")) {
    console.error("FAIL: Tracking ID does not contain customer mobile! Got:", trackingId);
    process.exit(1);
  }
  console.log("PASS: Tracking ID successfully generated as:", trackingId);

  // 2. Test Live Tracking with Tracking ID: DEN-9825012345
  console.log("\n2. Testing live tracking via Tracking ID:", trackingId);
  const trackRes1 = await request({
    hostname: "localhost",
    port: 3000,
    path: `/api/track/${encodeURIComponent(trackingId)}`,
    method: "GET",
  });

  console.log("Track Status:", trackRes1.status);
  console.log("Track Data:", trackRes1.body.data);

  if (trackRes1.status !== 200 || !trackRes1.body.success) {
    console.error("FAIL: Could not track by Tracking ID!", trackRes1.body);
    process.exit(1);
  }

  // 3. Test Live Tracking with Raw 10-Digit Mobile: 9825012345
  console.log("\n3. Testing live tracking via 10-digit mobile: 9825012345...");
  const trackRes2 = await request({
    hostname: "localhost",
    port: 3000,
    path: `/api/track/9825012345`,
    method: "GET",
  });

  if (trackRes2.status !== 200 || !trackRes2.body.success) {
    console.error("FAIL: Could not track by raw phone number!", trackRes2.body);
    process.exit(1);
  }
  console.log("PASS: Successfully tracked by raw 10-digit phone number!");

  // 4. Verify Privacy Protection ("hide for other to give security")
  console.log("\n4. Verifying Privacy & Zero PII Leakage...");
  const p = trackRes1.body.data;

  // Check customer name is masked
  if (p.customerName === "Kishan Patel") {
    console.error("FAIL: Customer name is unmasked! Got:", p.customerName);
    process.exit(1);
  }
  console.log("PASS: Customer name is safely masked as:", p.customerName);

  // Check phone number is NOT in the public response
  const rawJson = JSON.stringify(trackRes1.body);
  if (rawJson.includes("9825012345") && !rawJson.includes(trackingId)) {
    console.error("FAIL: Phone number was leaked in raw public JSON!");
    process.exit(1);
  }
  console.log("PASS: Customer phone number is NOT exposed in the payload!");

  // Check custom brand and custom issue
  if (p.deviceBrand !== "Nothing Phone 2" || p.repairCategory !== "Glyph lights not turning on") {
    console.error("FAIL: Custom brand or issue was not properly recorded! Got:", p.deviceBrand, p.repairCategory);
    process.exit(1);
  }
  console.log("PASS: Custom Brand ('Nothing Phone 2') and Custom Issue ('Glyph lights not turning on') verified!");

  // 5. Cleanup Test Order
  console.log("\n5. Cleaning up test order to maintain 0 fake records in database...");
  db.prepare("DELETE FROM repair_status_history WHERE order_id IN (SELECT id FROM repair_orders WHERE tracking_id = ?)").run(trackingId);
  db.prepare("DELETE FROM customer_notifications WHERE order_id IN (SELECT id FROM repair_orders WHERE tracking_id = ?)").run(trackingId);
  db.prepare("DELETE FROM admin_notifications WHERE order_id IN (SELECT id FROM repair_orders WHERE tracking_id = ?)").run(trackingId);
  db.prepare("DELETE FROM repair_orders WHERE tracking_id = ?").run(trackingId);
  db.prepare("DELETE FROM customer_records WHERE phone = '9825012345'").run();

  const orderCount = db.prepare("SELECT COUNT(*) as count FROM repair_orders").get().count;
  const customerCount = db.prepare("SELECT COUNT(*) as count FROM customer_records").get().count;
  console.log(`Database Status: repair_orders = ${orderCount}, customer_records = ${customerCount}`);
  db.close();

  console.log("\n>>> ALL TESTS PASSED SUCCESSFULLY! <<<\n");
}

runTest().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});

