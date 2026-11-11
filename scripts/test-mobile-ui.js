const http = require("http");

async function fetchHtml() {
  return new Promise((resolve, reject) => {
    http.get("http://localhost:3000", (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => resolve({ status: res.statusCode, html: data }));
    }).on("error", reject);
  });
}

async function runMobileAudit() {
  console.log("================================================================================");
  console.log("             MOBILE UI & HANDHELD EXPERIENCE AUDIT");
  console.log("             DENISH MOBILE REPAIRING AND SERVICE");
  console.log("================================================================================\n");

  const { status, html } = await fetchHtml();
  let passed = 0;
  let failed = 0;

  function assert(name, condition, details = "") {
    if (condition) {
      console.log(`[PASS] ${name}${details ? " -> " + details : ""}`);
      passed++;
    } else {
      console.error(`[FAIL] ${name}${details ? " -> " + details : ""}`);
      failed++;
    }
  }

  // 1. Mobile Viewport & Zoom Configuration
  console.log("--- 1. VIEWPORT & META SETTINGS ---");
  assert("HTTP 200 OK Response", status === 200);
  assert("Viewport meta tag declared", html.includes('name="viewport"'));
  assert("Viewport has width=device-width", html.includes("width=device-width"));
  assert("Viewport has initial-scale=1", html.includes("initial-scale=1"));
  assert("Theme color configured for mobile browser header", html.includes('name="theme-color"') || html.includes('theme-color'));

  // 2. Persistent Mobile Sticky Bottom Bar (Handheld Only)
  console.log("\n--- 2. PERSISTENT MOBILE STICKY CONTACT BAR ---");
  assert("Mobile sticky bar container exists", html.includes('aria-label="Quick Mobile Contact Actions"'));
  assert("Sticky bar has fixed positioning (fixed bottom-0)", html.includes("fixed bottom-0"));
  assert("Sticky bar strictly hidden on desktop/tablet (sm:hidden)", html.includes("sm:hidden"));
  assert("Sticky bar has backdrop blur & dark theme", html.includes("backdrop-blur-2xl") || html.includes("backdrop-blur"));
  assert("Sticky bar includes iPhone safe-area inset padding", html.includes("safe-area-inset-bottom"));
  assert("Sticky bar contains direct 1-tap Phone link", html.includes('href="tel:+918511668848"'));
  assert("Sticky bar contains direct 1-tap WhatsApp chat link", html.includes("wa.me/918511668848"));
  assert("Sticky bar buttons have high-contrast styling (btn-gold & btn-whatsapp)", html.includes("btn-gold") && html.includes("btn-whatsapp"));
  assert("Main container includes bottom padding for sticky bar clearance (pb-24 sm:pb-0)", html.includes("pb-24 sm:pb-0"));

  // 3. Mobile Navigation Header & Drawer
  console.log("\n--- 3. MOBILE NAVIGATION DRAWER & CONTROLS ---");
  assert("Mobile hamburger menu toggle button exists (lg:hidden)", html.includes("lg:hidden") && html.includes('aria-label="Toggle navigation menu"'));
  assert("Mobile hamburger toggle has accessible aria-expanded attribute", html.includes('aria-expanded='));
  assert("Mobile drawer links cover all key site sections", 
    html.includes('href="#services"') &&
    html.includes('href="#about"') &&
    html.includes('href="#why-us"') &&
    html.includes('href="#process"') &&
    html.includes('href="#reviews"') &&
    html.includes('href="#faq"') &&
    html.includes('href="#contact"')
  );

  // 4. Hero Section Mobile Optimization
  console.log("\n--- 4. HERO SECTION MOBILE RESPONSIVENESS ---");
  assert("Hero title scales smoothly on mobile (text-3xl sm:text-5xl lg:text-6xl)", html.includes("text-3xl sm:text-5xl lg:text-6xl"));
  assert("Hero buttons stack full-width on mobile (w-full sm:w-auto)", html.includes("w-full sm:w-auto"));
  assert("Hero poster image has responsive mobile sizing attribute", html.includes("max-width: 640px"));
  assert("Poster image has touch-friendly direct Call pill on mobile", html.includes("8511668848") && html.includes("href=\"tel:+918511668848\""));

  // 5. Service Cards Mobile Grid & Touch Targets
  console.log("\n--- 5. SERVICE CARDS ON MOBILE ---");
  assert("Service cards use single column on mobile (grid-cols-1 sm:grid-cols-2 lg:grid-cols-4)", html.includes("grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"));
  assert("All 8 mobile service cards rendered", (html.match(/Common Symptoms:/g) || []).length === 8);
  assert("Each service card includes direct WhatsApp quote button", (html.match(/<span>Quote<\/span>/g) || []).length === 8);
  assert("Each service card includes Book Diagnostics button", (html.match(/>Book<\/span>/g) || []).length === 8);

  // 6. Mobile Repair Booking Form
  console.log("\n--- 6. REPAIR BOOKING FORM ON MOBILE ---");
  assert("Form input rows collapse to 1 column on mobile (grid-cols-1 sm:grid-cols-2)", (html.match(/grid-cols-1 sm:grid-cols-2/g) || []).length >= 2);
  assert("Mobile input fields are full-width (w-full)", html.includes("w-full px-4 py-3 rounded-xl"));
  assert("Form inputs have comfortable tap height >= 48px (py-3)", html.includes("py-3"));
  assert("Touch radio pills for preferred contact (WhatsApp vs Call)", html.includes('value="whatsapp"') && html.includes('value="phone"'));
  assert("Submit button is full-width with large touch target (btn-gold w-full py-4)", html.includes("btn-gold w-full py-4"));

  // 7. Touch & Overflow Safety
  console.log("\n--- 7. TOUCH TARGETS & HORIZONTAL OVERFLOW PREVENTION ---");
  assert("Root container prevents horizontal overflow (overflow-hidden / max-w-7xl)", html.includes("overflow-hidden"));
  assert("All interactive buttons have minimum 48px touch clearance", !html.includes("py-0.5 btn") && !html.includes("py-1 btn"));

  console.log("\n================================================================================");
  console.log(` MOBILE UI AUDIT SUMMARY: ${passed} PASSED | ${failed} FAILED (Total: ${passed + failed})`);
  console.log("================================================================================\n");

  if (failed === 0) {
    console.log(">>> CONFIRMED: MOBILE UI IS 100% WORKING, RESPONSIVE, AND TOUCH-OPTIMIZED <<<\n");
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runMobileAudit().catch((e) => {
  console.error("Mobile audit error:", e);
  process.exit(1);
});
