// Live Vercel Production Verification Script for Denish Mobile Repair
const fs = require("fs");
const path = require("path");
const { neon } = require("@neondatabase/serverless");

// Load .env.local for local db verification
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
        if (!process.env[key]) process.env[key] = val;
      }
    }
  }
}

const PROD_URL = "https://denish-mobile-service-and-repair-pu.vercel.app";

async function main() {
  console.log(`=== TESTING LIVE VERCEL PRODUCTION DEPLOYMENT AT: ${PROD_URL} ===\n`);

  // 1. Homepage & Static Pages
  console.log("[1/9] Testing Live Homepage & Static Pages...");
  const homeRes = await fetch(`${PROD_URL}/`);
  console.log(`Homepage Status: ${homeRes.status}`);
  if (homeRes.status !== 200) throw new Error(`Homepage failed with status ${homeRes.status}`);
  console.log("✓ Homepage is live and responsive!");

  // 2. Info / Config API
  console.log("\n[2/9] Testing Live API Info...");
  const infoRes = await fetch(`${PROD_URL}/api/info`);
  console.log(`Info Status: ${infoRes.status}`);
  const infoData = await infoRes.json();
  console.log(`Business Name: ${infoData.businessName}, Hotline: ${infoData.hotline}`);
  console.log("✓ Live API Info verified!");

  // 3. Customer Booking Submission
  console.log("\n[3/9] Testing Live Customer Booking Submission (POST /api/orders)...");
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const testPhone = `982540${randomSuffix}`;
  const testPayload = {
    customerName: "Pooja Sharma",
    customerPhone: testPhone,
    customerEmail: `pooja.${randomSuffix}@example.com`,
    deviceBrand: "Apple",
    deviceModel: "iPhone 14 Pro Max",
    repairCategory: "Screen & Glass",
    issueDescription: "Green lines on OLED after drop, touch working normally",
    preferredContactMethod: "whatsapp",
    preferredBookingDate: "2026-11-16",
    customerLocation: "Sector 11, Gandhinagar",
  };

  const bookingRes = await fetch(`${PROD_URL}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(testPayload),
  });

  console.log(`Live Booking HTTP Status: ${bookingRes.status}`);
  const bookingData = await bookingRes.json();
  console.log("Live Booking Response:", JSON.stringify(bookingData, null, 2));

  if (!bookingRes.ok || !bookingData.success || !bookingData.data?.trackingId) {
    throw new Error(`Live Booking submission failed! Response: ${JSON.stringify(bookingData)}`);
  }

  const trackingId = bookingData.data.trackingId;
  const orderId = bookingData.data.orderId;
  console.log(`✓ Booking successfully saved on live Vercel! Reference: ${trackingId}, Order ID: ${orderId}`);

  // 4. Persistence in Neon PostgreSQL
  console.log("\n[4/9] Verifying direct persistence in Neon PostgreSQL from Vercel invocation...");
  const rawDbUrl = (process.env.DATABASE_URL || "").trim().replace(/^["']|["']$/g, "");
  const sql = neon(rawDbUrl, { fullResults: true });
  const dbRows = await sql.query("SELECT id, tracking_id, device_brand, device_model, current_status FROM repair_orders WHERE tracking_id = $1", [trackingId]);
  console.log("Direct Neon PostgreSQL query:", dbRows.rows);
  if (!dbRows.rows || dbRows.rows.length === 0) {
    throw new Error("Order was not found in Neon PostgreSQL database!");
  }
  console.log("✓ Neon PostgreSQL persistence confirmed across serverless invocations!");

  // 5. Customer Public Tracking
  console.log(`\n[5/9] Testing Live Customer Tracking via GET /api/track/${trackingId}...`);
  const trackRes = await fetch(`${PROD_URL}/api/track/${encodeURIComponent(trackingId)}`);
  console.log(`Tracking Status: ${trackRes.status}`);
  const trackData = await trackRes.json();
  console.log(`Tracked Customer Masked: ${trackData.data?.customerName}`);
  console.log(`Tracked Device: ${trackData.data?.deviceBrand} ${trackData.data?.deviceModel}`);
  console.log(`Current Status: ${trackData.data?.currentStatus} (${trackData.data?.statusLabel})`);
  if (!trackRes.ok || !trackData.success) {
    throw new Error(`Live tracking lookup failed: ${JSON.stringify(trackData)}`);
  }
  console.log("✓ Live public tracking verified!");

  // 6. Security & Invalid Login Test
  console.log("\n[6/9] Security Test: Invalid Admin Credentials...");
  const badLoginRes = await fetch(`${PROD_URL}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: "denish_admin",
      password: "WrongPassword!999",
    }),
  });
  console.log(`Invalid Login Status: ${badLoginRes.status}`);
  if (badLoginRes.status !== 401) {
    throw new Error("Security check failed: Invalid login did not return 401!");
  }
  console.log("✓ Security check passed: Unauthorized access properly blocked!");

  // 7. Admin Login
  console.log("\n[7/9] Testing Live Admin Login via POST /api/admin/login...");
  const loginRes = await fetch(`${PROD_URL}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: "denish_admin",
      password: "Denish@Lab2026!",
    }),
  });
  console.log(`Admin Login Status: ${loginRes.status}`);
  const loginData = await loginRes.json();
  console.log("Login Admin User:", loginData.data?.username, "Role:", loginData.data?.role);
  if (!loginRes.ok || !loginData.success) {
    throw new Error(`Admin login failed: ${JSON.stringify(loginData)}`);
  }
  const cookies = loginRes.headers.get("set-cookie") || "";
  console.log("✓ Admin login successful on live production!");

  // 8. Admin Status Update
  console.log(`\n[8/9] Testing Admin Order Status Update to 'REPAIRING' on order ${orderId}...`);
  const updateRes = await fetch(`${PROD_URL}/api/admin/orders/${orderId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookies,
    },
    body: JSON.stringify({
      newStatus: "REPAIRING",
      customerNote: "Cleanroom OLED delamination and genuine display assembly in progress.",
      internalNote: "Intake photos stored, vacuum laminator primed.",
    }),
  });
  console.log(`Update Status HTTP: ${updateRes.status}`);
  const updateData = await updateRes.json();
  console.log("Update Result:", updateData.data?.currentStatus, updateData.data?.statusLabel);
  if (!updateRes.ok || !updateData.success || updateData.data?.currentStatus !== "REPAIRING") {
    throw new Error(`Status update failed: ${JSON.stringify(updateData)}`);
  }
  console.log("✓ Admin status update verified on live production!");

  // 9. Customer Re-Check Tracking
  console.log("\n[9/9] Verifying Customer sees updated status on live tracking page...");
  const reTrackRes = await fetch(`${PROD_URL}/api/track/${encodeURIComponent(trackingId)}`);
  const reTrackData = await reTrackRes.json();
  console.log(`Updated Status: ${reTrackData.data?.currentStatus}`);
  console.log(`Technician Customer Note: ${reTrackData.data?.statusHistory?.[0]?.customerNote}`);
  if (reTrackData.data?.currentStatus !== "REPAIRING") {
    throw new Error("Customer tracking did not reflect updated status!");
  }
  console.log("✓ Customer tracking confirmed updated!");

  console.log("\n===============================================================================");
  console.log("✓✓✓ LIVE VERCEL PRODUCTION VERIFICATION COMPLETE AND 100% SUCCESSFUL! ✓✓✓");
  console.log(`URL: ${PROD_URL}`);
  console.log("===============================================================================");
}

main().catch((err) => {
  console.error("Live Verification Failed:", err);
  process.exit(1);
});
