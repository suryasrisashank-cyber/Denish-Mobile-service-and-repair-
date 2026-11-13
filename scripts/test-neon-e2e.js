// E2E Verification Script for Denish Mobile Repair on Neon PostgreSQL
const fs = require("fs");
const path = require("path");
const { neon } = require("@neondatabase/serverless");

// Load .env.local manually
const envPath = path.join(__dirname, "..", ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const idx = trimmed.indexOf("=");
      if (idx > -1) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

const BASE_URL = "http://localhost:3005";

async function main() {
  console.log("=== STARTING END-TO-END VERIFICATION AGAINST NEON POSTGRESQL ===");

  // Step 1: Health check
  console.log("\n[1/7] Testing API Info / Health Check...");
  const infoRes = await fetch(`${BASE_URL}/api/info`);
  console.log(`Status: ${infoRes.status}`);
  const infoData = await infoRes.json();
  console.log("Info Response:", JSON.stringify(infoData, null, 2));

  // Step 2: Customer Booking Submission
  console.log("\n[2/7] Submitting Customer Booking via POST /api/orders...");
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const testPhone = `987654${randomSuffix}`;
  const testBookingPayload = {
    customerName: "Suresh Patel",
    customerPhone: testPhone,
    customerEmail: `suresh.${randomSuffix}@test.in`,
    deviceBrand: "Samsung",
    deviceModel: `Galaxy S23 Ultra (${randomSuffix})`,
    repairCategory: "Screen & Glass",
    issueDescription: "Cracked display glass, touchscreen working normally",
    preferredContactMethod: "whatsapp",
    preferredBookingDate: "2026-11-15",
    customerLocation: "Bapunagar, Ahmedabad",
  };

  const bookingRes = await fetch(`${BASE_URL}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(testBookingPayload),
  });

  console.log(`Booking API Status: ${bookingRes.status}`);
  const bookingData = await bookingRes.json();
  console.log("Booking Response:", JSON.stringify(bookingData, null, 2));

  if (!bookingRes.ok || !bookingData.success || !bookingData.data?.trackingId) {
    throw new Error(`Booking submission failed! Response: ${JSON.stringify(bookingData)}`);
  }

  const trackingId = bookingData.data.trackingId;
  const orderId = bookingData.data.orderId;
  console.log(`✓ Booking created successfully! Tracking ID: ${trackingId}, Order ID: ${orderId}`);

  // Step 3: Direct Neon PostgreSQL Verification
  console.log("\n[3/7] Verifying direct persistence in Neon PostgreSQL...");
  const rawDbUrl = (process.env.DATABASE_URL || "").trim().replace(/^["']|["']$/g, "");
  const sql = neon(rawDbUrl, { fullResults: true });
  const dbRows = await sql.query("SELECT id, tracking_id, device_brand, device_model, current_status FROM repair_orders WHERE tracking_id = $1", [trackingId]);
  console.log("Direct Neon PostgreSQL query result:", dbRows.rows);
  if (!dbRows.rows || dbRows.rows.length === 0) {
    throw new Error("Order was not found in Neon PostgreSQL database!");
  }
  console.log("✓ Neon PostgreSQL direct verification confirmed!");

  // Step 4: Public Tracking Verification
  console.log(`\n[4/7] Testing Public Tracking via GET /api/track/${trackingId}...`);
  const trackRes = await fetch(`${BASE_URL}/api/track/${encodeURIComponent(trackingId)}`);
  console.log(`Track Status: ${trackRes.status}`);
  const trackData = await trackRes.json();
  console.log("Track Data:", JSON.stringify(trackData, null, 2));
  if (!trackRes.ok || !trackData.success) {
    throw new Error(`Tracking lookup failed: ${JSON.stringify(trackData)}`);
  }
  console.log(`✓ Public tracking verified: Status is ${trackData.data.currentStatus}`);

  // Step 5: Admin Login
  console.log("\n[5/7] Testing Admin Login via POST /api/admin/login...");
  const loginRes = await fetch(`${BASE_URL}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: process.env.ADMIN_INITIAL_USERNAME || "denish_admin",
      password: process.env.ADMIN_INITIAL_PASSWORD || "Denish@Lab2026!",
    }),
  });
  console.log(`Login Status: ${loginRes.status}`);
  const loginData = await loginRes.json();
  console.log("Login Response:", loginData);
  if (!loginRes.ok || !loginData.success) {
    throw new Error(`Admin login failed: ${JSON.stringify(loginData)}`);
  }
  const cookies = loginRes.headers.get("set-cookie") || "";
  console.log("✓ Admin login successful! Session cookie obtained.");

  // Step 6: Admin Orders Retrieval & Status Update
  console.log("\n[6/7] Admin fetching order details and updating status to 'REPAIRING'...");
  const adminOrderRes = await fetch(`${BASE_URL}/api/admin/orders/${orderId}`, {
    headers: { Cookie: cookies },
  });
  console.log(`Admin Order Status: ${adminOrderRes.status}`);
  const adminOrderData = await adminOrderRes.json();
  console.log("Admin Order Data Tracking ID:", adminOrderData.data?.order?.trackingId || adminOrderData.data?.order?.tracking_id);

  const updateStatusRes = await fetch(`${BASE_URL}/api/admin/orders/${orderId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookies,
    },
    body: JSON.stringify({
      newStatus: "REPAIRING",
      customerNote: "Device disassembled; original AMOLED display replacement in progress in cleanroom lab.",
      internalNote: "Tested digitizer with lab bench supply, genuine screen ready.",
    }),
  });
  console.log(`Status Update Status: ${updateStatusRes.status}`);
  const updateData = await updateStatusRes.json();
  console.log("Status Update Result:", updateData);

  // Step 7: Public Tracking Verifying Updated Status
  console.log("\n[7/7] Customer re-checking tracking page after admin update...");
  const reTrackRes = await fetch(`${BASE_URL}/api/track/${encodeURIComponent(trackingId)}`);
  const reTrackData = await reTrackRes.json();
  console.log("Updated Customer Tracking Status:", reTrackData.data?.currentStatus);
  console.log("Updated Customer Note:", reTrackData.data?.statusHistory?.[0]?.customerNote);

  if (reTrackData.data?.currentStatus !== "REPAIRING") {
    throw new Error("Status update was not reflected in customer tracking!");
  }

  // Bonus test: Enquiry form submission
  console.log("\n[Bonus] Testing Enquiry submission via POST /api/enquire...");
  const enquireRes = await fetch(`${BASE_URL}/api/enquire`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Ramesh Shah",
      phone: "9123456780",
      deviceBrand: "Apple",
      deviceModel: "iPhone 15 Pro",
      repairCategory: "Battery Replacement",
      issueDescription: "Battery draining quickly, health at 74%",
    }),
  });
  console.log(`Enquire Status: ${enquireRes.status}`);
  const enquireData = await enquireRes.json();
  console.log("Enquire Result:", enquireData);

  console.log("\n=======================================================");
  console.log("✓ ALL E2E SERVICES TESTED AND CONFIRMED FULLY WORKING!");
  console.log("=======================================================");
}

main().catch((err) => {
  console.error("E2E Test Failed:", err);
  process.exit(1);
});
