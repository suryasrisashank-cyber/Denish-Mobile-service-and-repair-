const http = require("http");

const routes = [
  "/",
  "/services",
  "/about",
  "/book-repair",
  "/contact",
  "/faq",
  "/track",
  "/track-repair",
  "/admin/login",
  "/mobile-preview",
  "/sitemap.xml",
  "/robots.txt",
];

function checkRoute(route) {
  return new Promise((resolve) => {
    http.get(`http://localhost:3000${route}`, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        resolve({
          route,
          status: res.statusCode,
          length: data.length,
          ok: res.statusCode === 200,
        });
      });
    }).on("error", (err) => {
      resolve({ route, error: err.message, ok: false });
    });
  });
}

function testApiEnquiry() {
  return new Promise((resolve) => {
    const payload = JSON.stringify({
      name: "Test User",
      phone: "9876543210",
      deviceBrand: "Apple iPhone",
      deviceModel: "iPhone 14 Pro",
      issue: "Screen Replacement",
      description: "Automated route test verification",
      preferredContact: "whatsapp",
    });

    const req = http.request(
      "http://localhost:3000/api/enquire",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
          "x-forwarded-for": "10.0.0.99",
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            const parsed = JSON.parse(data);
            resolve({
              route: "/api/enquire (POST)",
              status: res.statusCode,
              success: parsed.success,
              referenceId: parsed.referenceId,
              ok: res.statusCode === 200 && parsed.success && !!parsed.referenceId,
            });
          } catch (e) {
            resolve({ route: "/api/enquire (POST)", error: e.message, ok: false });
          }
        });
      }
    );
    req.on("error", (err) => {
      resolve({ route: "/api/enquire (POST)", error: err.message, ok: false });
    });
    req.write(payload);
    req.end();
  });
}

async function run() {
  console.log("=== Testing All App Router Routes & API ===");
  let allPassed = true;
  for (const r of routes) {
    const res = await checkRoute(r);
    console.log(`[ROUTE] ${res.route.padEnd(20)} Status: ${res.status} | Bytes: ${res.length} | ${res.ok ? "PASS" : "FAIL"}`);
    if (!res.ok) allPassed = false;
  }

  const apiRes = await testApiEnquiry();
  console.log(`[API]   ${apiRes.route.padEnd(20)} Status: ${apiRes.status} | Ref: ${apiRes.referenceId} | ${apiRes.ok ? "PASS" : "FAIL"}`);
  if (!apiRes.ok) allPassed = false;

  // Cleanup route test enquiry
  if (apiRes.referenceId) {
    try {
      const Database = require("better-sqlite3");
      const dbClean = new Database("data/denish.sqlite");
      const o = dbClean.prepare("SELECT id, customer_id FROM repair_orders WHERE tracking_id = ?").get(apiRes.referenceId);
      if (o) {
        dbClean.prepare("DELETE FROM repair_status_history WHERE order_id = ?").run(o.id);
        dbClean.prepare("DELETE FROM customer_notifications WHERE order_id = ?").run(o.id);
        dbClean.prepare("DELETE FROM repair_orders WHERE id = ?").run(o.id);
        dbClean.prepare("DELETE FROM customer_records WHERE id = ? AND name = 'Test User'").run(o.customer_id);
      }
      dbClean.close();
    } catch {}
  }

  console.log("\nResult:", allPassed ? "ALL 11 CHECKS PASSED (100%)" : "SOME CHECKS FAILED");
  process.exit(allPassed ? 0 : 1);
}

run();
