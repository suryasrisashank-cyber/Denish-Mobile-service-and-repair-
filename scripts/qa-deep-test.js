const http = require("http");

async function fetchUrl(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    });

    req.on("error", (e) => reject(e));

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function runDeepQa() {
  console.log("================================================================================");
  console.log("   SENIOR QA AUDIT: BUTTONS, LINKS, INTEGRATIONS & INTERACTIVE ELEMENTS");
  console.log("   DENISH MOBILE REPAIRING AND SERVICE");
  console.log("================================================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  // 1. Fetch Homepage HTML
  const home = await fetchUrl({
    hostname: "localhost",
    port: 3000,
    path: "/",
    method: "GET",
  });

  assert(home.statusCode === 200, "Homepage returns HTTP 200 OK");
  const html = home.body;

  // ---------------------------------------------------------------------------
  // TEST GROUP 1: Phone Call Functionality (tel: links)
  // ---------------------------------------------------------------------------
  console.log("\n--- TEST GROUP 1: PHONE CALL FUNCTIONALITY ---");
  const telRegex = /href="(tel:[^"]+)"/g;
  const telMatches = [...html.matchAll(telRegex)].map((m) => m[1]);

  assert(telMatches.length >= 8, `Found ${telMatches.length} phone links across website sections (expected >= 8)`);

  let allTelValid = true;
  for (const tel of telMatches) {
    if (tel !== "tel:+918511668848" && tel !== "tel:8511668848") {
      allTelValid = false;
      console.error(`Unexpected tel format: ${tel}`);
    }
  }
  assert(allTelValid, "All tel: links point to verified number +91 8511668848");
  assert(html.includes("8511668848"), "Verified phone number 8511668848 visible in textual copy");

  // ---------------------------------------------------------------------------
  // TEST GROUP 2: WhatsApp Functionality (wa.me links)
  // ---------------------------------------------------------------------------
  console.log("\n--- TEST GROUP 2: WHATSAPP FUNCTIONALITY ---");
  const waRegex = /href="(https:\/\/wa\.me\/[^"]+)"/g;
  const waMatches = [...html.matchAll(waRegex)].map((m) => m[1]);

  assert(waMatches.length >= 10, `Found ${waMatches.length} WhatsApp action links (expected >= 10)`);

  let allWaValid = true;
  let hasMalformedUrl = false;
  for (const wa of waMatches) {
    if (!wa.startsWith("https://wa.me/918511668848")) {
      allWaValid = false;
      console.error(`Invalid WhatsApp recipient: ${wa}`);
    }
    // Check for malformed query parameters like duplicate ?text or &text
    const textOccurrences = (wa.match(/text=/g) || []).length;
    if (textOccurrences > 1) {
      hasMalformedUrl = true;
      console.error(`Malformed duplicate query parameters in WhatsApp URL: ${wa}`);
    }
  }
  assert(allWaValid, "All WhatsApp links target official account +91 85116 68848");
  assert(!hasMalformedUrl, "All WhatsApp links have clean, valid query parameter syntax");

  // ---------------------------------------------------------------------------
  // TEST GROUP 3: Navigation Links & Section Anchor Integrity
  // ---------------------------------------------------------------------------
  console.log("\n--- TEST GROUP 3: NAVIGATION LINKS & ANCHOR INTEGRITY ---");
  const requiredNavItems = [
    { name: "Services", id: "services" },
    { name: "About Us", id: "about" },
    { name: "Why Us", id: "why-us" },
    { name: "Process", id: "process" },
    { name: "Reviews", id: "reviews" },
    { name: "FAQ", id: "faq" },
    { name: "Contact", id: "contact" },
  ];

  for (const item of requiredNavItems) {
    const idTag = `id="${item.id}"`;
    const hrefTag = `href="#${item.id}"`;
    assert(html.includes(idTag), `Section anchor target exists: ${idTag}`);
    assert(html.includes(hrefTag), `Navigation link exists pointing to: ${hrefTag}`);
  }

  // Check additional anchor targets
  assert(html.includes('id="location"'), 'Location section anchor exists: id="location"');
  assert(html.includes('href="#location"'), 'Link to location exists: href="#location"');
  assert(html.includes('id="footer"'), 'Footer container anchor exists: id="footer"');

  // ---------------------------------------------------------------------------
  // TEST GROUP 4: Enquiry Form Client & Server Validation
  // ---------------------------------------------------------------------------
  console.log("\n--- TEST GROUP 4: ENQUIRY FORM VALIDATION ---");

  // 4a. Empty Submission
  const resEmpty = await fetchUrl(
    { hostname: "localhost", port: 3000, path: "/api/enquire", method: "POST", headers: { "Content-Type": "application/json" } },
    JSON.stringify({})
  );
  assert(resEmpty.statusCode === 400, "Validation: Rejects empty payload with HTTP 400");
  assert(JSON.parse(resEmpty.body).success === false, "Validation: Empty payload response success is false");

  // 4b. Name too short (< 2 characters)
  const resShortName = await fetchUrl(
    { hostname: "localhost", port: 3000, path: "/api/enquire", method: "POST", headers: { "Content-Type": "application/json" } },
    JSON.stringify({ name: "A", phone: "8511668848", deviceBrand: "Apple", deviceModel: "iPhone 13", issue: "Screen" })
  );
  assert(resShortName.statusCode === 400, "Validation: Rejects name shorter than 2 chars with HTTP 400");

  // 4c. Phone invalid (< 10 digits)
  const resBadPhone = await fetchUrl(
    { hostname: "localhost", port: 3000, path: "/api/enquire", method: "POST", headers: { "Content-Type": "application/json" } },
    JSON.stringify({ name: "Rahul", phone: "98765", deviceBrand: "Apple", deviceModel: "iPhone 13", issue: "Screen" })
  );
  assert(resBadPhone.statusCode === 400, "Validation: Rejects phone shorter than 10 digits with HTTP 400");

  // 4d. Missing Device Brand
  const resNoBrand = await fetchUrl(
    { hostname: "localhost", port: 3000, path: "/api/enquire", method: "POST", headers: { "Content-Type": "application/json" } },
    JSON.stringify({ name: "Rahul", phone: "8511668848", deviceBrand: "", deviceModel: "iPhone 13", issue: "Screen" })
  );
  assert(resNoBrand.statusCode === 400, "Validation: Rejects missing device brand with HTTP 400");

  // 4e. Missing Device Model
  const resNoModel = await fetchUrl(
    { hostname: "localhost", port: 3000, path: "/api/enquire", method: "POST", headers: { "Content-Type": "application/json" } },
    JSON.stringify({ name: "Rahul", phone: "8511668848", deviceBrand: "Apple", deviceModel: "", issue: "Screen" })
  );
  assert(resNoModel.statusCode === 400, "Validation: Rejects missing device model with HTTP 400");

  // 4f. Missing Issue Category
  const resNoIssue = await fetchUrl(
    { hostname: "localhost", port: 3000, path: "/api/enquire", method: "POST", headers: { "Content-Type": "application/json" } },
    JSON.stringify({ name: "Rahul", phone: "8511668848", deviceBrand: "Apple", deviceModel: "iPhone 13", issue: "" })
  );
  assert(resNoIssue.statusCode === 400, "Validation: Rejects missing issue category with HTTP 400");

  // ---------------------------------------------------------------------------
  // TEST GROUP 5: Form Submission & Ticket Generation
  // ---------------------------------------------------------------------------
  console.log("\n--- TEST GROUP 5: FORM SUBMISSION & TICKET GENERATION ---");
  const testPayload = {
    name: "Vikram Mehta",
    phone: "8511668848",
    deviceBrand: "OnePlus",
    deviceModel: "OnePlus 11",
    issue: "Battery Replacement",
    description: "Rapid battery draining and slight heating during charging",
    preferredContact: "whatsapp",
  };

  const resValid = await fetchUrl(
    { hostname: "localhost", port: 3000, path: "/api/enquire", method: "POST", headers: { "Content-Type": "application/json" } },
    JSON.stringify(testPayload)
  );

  assert(resValid.statusCode === 200, "Submission: Valid inquiry returns HTTP 200 OK");
  const bodyValid = JSON.parse(resValid.body);
  assert(bodyValid.success === true, "Submission: Returns success: true");
  assert(/^DMR-\d{6}-\d{4}$/.test(bodyValid.referenceId), `Submission: Generated valid ticket ID format (${bodyValid.referenceId})`);
  assert(bodyValid.directWhatsAppUrl.includes("918511668848"), "Submission: WhatsApp dispatch includes shop phone number");
  assert(bodyValid.directWhatsAppUrl.includes(encodeURIComponent(testPayload.name)), "Submission: Pre-fills customer name in WhatsApp ticket");
  assert(bodyValid.directWhatsAppUrl.includes(encodeURIComponent(testPayload.deviceModel)), "Submission: Pre-fills device model in WhatsApp ticket");
  assert(bodyValid.directWhatsAppUrl.includes(encodeURIComponent(testPayload.issue)), "Submission: Pre-fills repair issue in WhatsApp ticket");

  // Clean up QA test submission immediately
  try {
    const Database = require("better-sqlite3");
    const path = require("path");
    const cleanupDb = new Database(path.join(__dirname, "..", "data", "denish.sqlite"));
    if (bodyValid.referenceId) {
      const order = cleanupDb.prepare("SELECT id FROM repair_orders WHERE tracking_id = ?").get(bodyValid.referenceId);
      if (order) {
        cleanupDb.prepare("DELETE FROM repair_status_history WHERE order_id = ?").run(order.id);
        cleanupDb.prepare("DELETE FROM customer_notifications WHERE order_id = ?").run(order.id);
        cleanupDb.prepare("DELETE FROM admin_notifications WHERE order_id = ?").run(order.id);
        cleanupDb.prepare("DELETE FROM repair_orders WHERE id = ?").run(order.id);
      }
    }
    cleanupDb.prepare("DELETE FROM customer_records WHERE name = 'Vikram Mehta'").run();
    cleanupDb.close();
  } catch (err) {}

  // ---------------------------------------------------------------------------
  // TEST GROUP 6: Google Maps Link & Embed Verification
  // ---------------------------------------------------------------------------
  console.log("\n--- TEST GROUP 6: GOOGLE MAPS LINK & EMBED VERIFICATION ---");
  assert(html.includes("iframe") && html.includes("google.com/maps/embed"), "Google Maps iframe embed is active on page");
  assert(html.includes("google.com/maps/search"), "Direct external link to Google Maps application is present");
  assert(html.includes("target=\"_blank\"") && html.includes("rel=\"noopener noreferrer\""), "External links have secure target='_blank' and rel='noopener noreferrer'");

  // ---------------------------------------------------------------------------
  // TEST GROUP 7: Mobile Menu & Responsive Layout
  // ---------------------------------------------------------------------------
  console.log("\n--- TEST GROUP 7: MOBILE MENU & RESPONSIVE LAYOUT ---");
  assert(html.includes("aria-label=\"Toggle navigation menu\""), "Mobile menu button has accessible aria-label");
  assert(html.includes("lg:hidden"), "Mobile drawer styling configured with responsive visibility");
  assert(html.includes("fixed bottom-0 left-0 right-0 z-40 sm:hidden"), "Mobile persistent sticky contact bar exists for handheld devices");

  // ---------------------------------------------------------------------------
  // TEST GROUP 8: Footer Links & Content Integrity
  // ---------------------------------------------------------------------------
  console.log("\n--- TEST GROUP 8: FOOTER LINKS & INTEGRITY ---");
  assert(html.includes("id=\"footer\""), "Footer element exists with dedicated anchor id='footer'");
  assert(html.includes("href=\"#services\""), "Footer contains functional link to Services");
  assert(html.includes("href=\"#location\""), "Footer contains functional link to Location");
  assert(html.includes("href=\"#contact\""), "Footer contains functional link to Contact/Enquiry");
  assert(html.includes("All rights reserved"), "Footer contains copyright declaration");

  // ---------------------------------------------------------------------------
  // SUMMARY
  // ---------------------------------------------------------------------------
  console.log("\n================================================================================");
  console.log(`   DEEP QA AUDIT SUMMARY: ${passed} PASSED | ${failed} FAILED (Total Tests: ${passed + failed})`);
  console.log("================================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runDeepQa().catch((err) => {
  console.error("Test runner threw unhandled exception:", err);
  process.exit(1);
});
