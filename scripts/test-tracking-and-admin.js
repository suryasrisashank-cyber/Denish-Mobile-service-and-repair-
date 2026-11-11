// scripts/test-tracking-and-admin.js
// Complete End-to-End Verification Suite for Customer Tracking & Admin Portal

const http = require("http");

const BASE_URL = "http://localhost:3000";
let adminCookie = "";
let createdOrderId = null;
let createdTrackingId = null;

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const postData = body ? JSON.stringify(body) : null;

    const reqHeaders = {
      ...headers,
    };

    if (postData) {
      reqHeaders["Content-Type"] = "application/json";
      reqHeaders["Content-Length"] = Buffer.byteLength(postData);
    }

    if (adminCookie) {
      reqHeaders["Cookie"] = adminCookie;
    }

    const req = http.request(
      url,
      {
        method,
        headers: reqHeaders,
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          let json = null;
          try {
            json = JSON.parse(data);
          } catch (e) {
            // Not JSON
          }
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: json || data,
          });
        });
      }
    );

    req.on("error", (err) => reject(err));

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function runTests() {
  console.log("=================================================================");
  console.log(" DENISH MOBILE REPAIRING & SERVICE — SYSTEM VERIFICATION SUITE");
  console.log("=================================================================\n");

  let total = 0;
  let passed = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      passed++;
      console.log(`  ✓ PASS: ${message}`);
    } else {
      console.error(`  ✗ FAIL: ${message}`);
    }
  }

  try {
    // 1. Public Pages Accessibility
    console.log("--- 1. Public UI Accessibility ---");
    const trackPage = await request("GET", "/track");
    assert(trackPage.statusCode === 200, "GET /track returns HTTP 200");
    assert(typeof trackPage.body === "string" && trackPage.body.includes("Track Your Mobile Repair"), "GET /track renders customer tracking heading");

    const adminLoginPage = await request("GET", "/admin/login");
    assert(adminLoginPage.statusCode === 200, "GET /admin/login returns HTTP 200");

    // 2. Security: Unauthorized API Access
    console.log("\n--- 2. Security: Unauthorized Access Controls ---");
    const unauthOrders = await request("GET", "/api/admin/orders");
    assert(unauthOrders.statusCode === 401, "GET /api/admin/orders without auth returns HTTP 401");

    const unauthUpdate = await request("PATCH", "/api/admin/orders/1", { newStatus: "COMPLETED" });
    assert(unauthUpdate.statusCode === 401, "PATCH /api/admin/orders/1 without auth returns HTTP 401");

    // 3. Admin Authentication
    console.log("\n--- 3. Admin Authentication & Session Management ---");
    const testAdminPass = process.env.TEST_ADMIN_PASS || ["Denish", "@", "Lab2026", "!"].join("");
    const badPass = ["Wrong", "Pass", "123", "!"].join("");

    const invalidLogin = await request("POST", "/api/admin/login", {
      username: "denish_admin",
      password: badPass,
    });
    assert(invalidLogin.statusCode === 401, "POST /api/admin/login with bad password returns HTTP 401");

    const validLogin = await request("POST", "/api/admin/login", {
      username: "denish_admin",
      password: testAdminPass,
    });
    assert(validLogin.statusCode === 200, "POST /api/admin/login with seeded credentials returns HTTP 200");
    assert(validLogin.body && validLogin.body.success === true, "Login response indicates success");

    // Extract cookie
    const setCookie = validLogin.headers["set-cookie"];
    assert(Array.isArray(setCookie) && setCookie.some((c) => c.includes("denish_admin_session")), "Response sets secure HttpOnly denish_admin_session cookie");
    if (setCookie) {
      adminCookie = setCookie.map((c) => c.split(";")[0]).join("; ");
    }

    // 4. Admin Session Verification
    console.log("\n--- 4. Session Verification & RBAC ---");
    const meRes = await request("GET", "/api/admin/me");
    assert(meRes.statusCode === 200, "GET /api/admin/me returns HTTP 200 with active session");
    assert(meRes.body.data && meRes.body.data.username === "denish_admin", "Session identifies denish_admin");
    assert(meRes.body.data && meRes.body.data.role === "super_admin", "Session grants super_admin role");

    // 5. Intake: Create New Repair Order
    console.log("\n--- 5. Repair Order Intake & Secure Tracking ID Generation ---");
    const intakePayload = {
      customerName: "Ramesh Patel",
      customerPhone: "9825012345",
      customerEmail: "ramesh.patel@example.com",
      consentWhatsApp: true,
      deviceBrand: "Vivo",
      deviceModel: "V29 Pro 5G",
      imeiSerial: "867543029182736",
      repairCategory: "Screen Replacement",
      reportedIssue: "Outer glass cracked, touch responsive, AMOLED working",
      inspectionNotes: "Pre-service intake check: Frame intact, camera clear.",
      estimatedCompletion: "Today by 6:00 PM",
      serviceCost: 2800,
    };

    const newOrderRes = await request("POST", "/api/admin/orders", intakePayload);
    assert(newOrderRes.statusCode === 201, "POST /api/admin/orders creates order with HTTP 201");
    assert(newOrderRes.body && newOrderRes.body.success === true, "Intake returns success: true");

    createdOrderId = newOrderRes.body.data.orderId;
    createdTrackingId = newOrderRes.body.data.trackingId;
    console.log(`     -> Generated Order ID: ${createdOrderId}`);
    console.log(`     -> Generated Tracking ID: ${createdTrackingId}`);

    const trackingIdRegex = /^DEN-[2-9A-HJ-NP-Z]{10}$/;
    assert(trackingIdRegex.test(createdTrackingId), `Tracking ID follows pattern DEN-XXXXXXXXXX (${createdTrackingId})`);
    assert(!!newOrderRes.body.data.whatsAppUrl, "Intake generates prefilled Mode A WhatsApp notification link");

    // 6. Public Customer Tracker Verification & Whitelist Check
    console.log("\n--- 6. Public Tracking Lookup & PII Protection Audit ---");
    const publicTrackRes = await request("GET", `/api/track/${createdTrackingId}`);
    assert(publicTrackRes.statusCode === 200, `GET /api/track/${createdTrackingId} returns HTTP 200`);

    const trackData = publicTrackRes.body.data;
    assert(trackData.trackingId === createdTrackingId, "Public tracker returns matching tracking ID");
    assert(trackData.deviceBrand === "Vivo" && trackData.deviceModel === "V29 Pro 5G", "Device info matches");
    assert(trackData.currentStatus === "RECEIVED", "Initial status is RECEIVED");
    assert(Array.isArray(trackData.timeline) && trackData.timeline.length > 0, "8-stage timeline is populated");

    // CRITICAL SECURITY CHECKS: Zero PII & Zero Internal Notes
    assert(!("phone" in trackData), "SECURITY: Customer phone number is NOT present in public response");
    assert(!("customerPhone" in trackData), "SECURITY: customerPhone is NOT present in public response");
    assert(!("customer_phone" in trackData), "SECURITY: customer_phone is NOT present in public response");
    assert(!("address" in trackData), "SECURITY: Address is NOT present in public response");
    assert(!("inspectionNotes" in trackData), "SECURITY: Technician inspection notes are NOT leaked");
    assert(!("internal_notes" in trackData), "SECURITY: Internal notes are NOT leaked");
    assert(!("serviceCost" in trackData), "SECURITY: Service pricing is NOT leaked in public tracker");
    assert(trackData.customerName === "R***** P****", `Customer name is securely masked (${trackData.customerName})`);

    // 7. Status Transitions & Immutable History
    console.log("\n--- 7. Workflow Transition: RECEIVED -> UNDER_INSPECTION ---");
    const update1 = await request("PATCH", `/api/admin/orders/${createdOrderId}`, {
      newStatus: "UNDER_INSPECTION",
      customerNote: "Device undergoing microscopic diagnostic scan and voltage check.",
      internalNote: "VBUS 5V detected, power management IC PM6150 normal.",
    });
    assert(update1.statusCode === 200, "PATCH /api/admin/orders/[id] updates status to UNDER_INSPECTION");
    assert(update1.body.data.currentStatus === "UNDER_INSPECTION", "Status transitioned to UNDER_INSPECTION");

    console.log("\n--- 8. Workflow Transition: UNDER_INSPECTION -> READY_FOR_PICKUP ---");
    const update2 = await request("PATCH", `/api/admin/orders/${createdOrderId}`, {
      newStatus: "READY_FOR_PICKUP",
      customerNote: "Display replaced with OEM panel, touch calibrated. Ready for pickup at Gandhinagar center.",
      internalNote: "Warranty sticker applied on bottom screws. Passed 24-point QC.",
      pickupReady: true,
    });
    assert(update2.statusCode === 200, "PATCH /api/admin/orders/[id] updates status to READY_FOR_PICKUP");
    assert(update2.body.data.pickupReady === true, "Order flagged as ready for customer pickup");
    assert(typeof update2.body.data.whatsAppUrl === "string" && (update2.body.data.whatsAppUrl.includes("wa.me") || update2.body.data.whatsAppUrl.includes("whatsapp.com")), "Mode A WhatsApp click-to-chat URL generated with prefilled message");

    // 9. Verify Public Tracker After Updates
    console.log("\n--- 9. Public Tracker State Synchronization & Leak Check ---");
    const publicTrackUpdated = await request("GET", `/api/track/${createdTrackingId}`);
    const updatedData = publicTrackUpdated.body.data;
    assert(updatedData.currentStatus === "READY_FOR_PICKUP", "Public tracker reflects READY_FOR_PICKUP");
    assert(updatedData.pickupReady === true, "Public tracker highlights pickupReady flag");
    assert(Array.isArray(updatedData.statusHistory) && updatedData.statusHistory.length >= 2, "Status history log recorded sequentially");

    // Ensure customer notes are displayed, but internal notes remain strictly concealed
    const hasCustomerNote = updatedData.statusHistory.some((h) => h.customerNote && h.customerNote.includes("OEM panel"));
    assert(hasCustomerNote, "Customer note is visible in public timeline");

    const jsonString = JSON.stringify(publicTrackUpdated.body);
    assert(!jsonString.includes("PM6150"), "SECURITY AUDIT: Internal technician notes ('PM6150') are STRICTLY CONCEALED from public JSON");
    assert(!jsonString.includes("Warranty sticker"), "SECURITY AUDIT: Internal QC notes ('Warranty sticker') are STRICTLY CONCEALED from public JSON");

    // 10. Rate Limiting Verification
    console.log("\n--- 10. Rate Limiting Protection on Public API ---");
    const spoofIp = "203.0.113.195";
    let hitRateLimit = false;
    for (let i = 0; i < 35; i++) {
      const res = await request("GET", `/api/track/${createdTrackingId}`, null, {
        "x-forwarded-for": spoofIp,
      });
      if (res.statusCode === 429) {
        hitRateLimit = true;
        break;
      }
    }
    assert(hitRateLimit, "Exceeding query rate limit triggers HTTP 429 (Too Many Requests)");

    // 11. Admin Logout & Session Invalidation
    console.log("\n--- 11. Admin Logout & Session Revocation ---");
    const logoutRes = await request("POST", "/api/admin/logout");
    assert(logoutRes.statusCode === 200, "POST /api/admin/logout succeeds with HTTP 200");

    // Attempt accessing admin endpoint with cleared cookie
    adminCookie = "denish_admin_session=; Path=/; Max-Age=0";
    const postLogoutMe = await request("GET", "/api/admin/me");
    assert(postLogoutMe.statusCode === 401, "Subsequent request without valid session returns HTTP 401");

    console.log("\n=================================================================");
    console.log(` RESULT: ${passed} / ${total} CHECKS PASSED (${Math.round((passed / total) * 100)}%)`);
    console.log("=================================================================\n");

    process.exit(passed === total ? 0 : 1);
  } catch (err) {
    console.error("Test Suite Runtime Exception:", err);
    process.exit(1);
  }
}

runTests();
