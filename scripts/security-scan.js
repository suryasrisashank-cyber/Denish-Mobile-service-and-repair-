const fs = require('fs');
const path = require('path');
const http = require('http');

async function runSecurityAudit() {
  console.log("================================================================================");
  console.log("       COMPREHENSIVE APPLICATION SECURITY AUDIT");
  console.log("       DENISH MOBILE REPAIRING AND SERVICE");
  console.log("================================================================================\n");

  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    warnings: 0,
    findings: [],
  };

  function assert(category, checkName, condition, detail = "") {
    results.total++;
    if (condition) {
      results.passed++;
      console.log(`[PASS] [${category}] ${checkName}${detail ? " -> " + detail : ""}`);
    } else {
      results.failed++;
      const msg = `[${category}] ${checkName}${detail ? " -> " + detail : ""}`;
      results.findings.push(msg);
      console.error(`[FAIL] ${msg}`);
    }
  }

  function warn(category, checkName, detail = "") {
    results.warnings++;
    console.warn(`[WARN] [${category}] ${checkName}${detail ? " -> " + detail : ""}`);
  }

  // 1. Scan codebase for hardcoded secrets
  console.log("--- 1. CREDENTIAL & SECRET EXPOSURE SCAN ---");
  const secretPatterns = [
    /(?:api[_-]?key|secret|password|auth_token|private[_-]?key)\s*[:=]\s*['"][^'"]{10,}['"]/i,
    /-----BEGIN (?:RSA )?PRIVATE KEY-----/,
    /AIza[0-9A-Za-z-_]{35}/, // Google API key pattern
    /ghp_[0-9A-Za-z]{36}/,   // GitHub personal token
    /sk_live_[0-9a-zA-Z]{24}/ // Stripe live secret key
  ];

  let potentialSecrets = [];
  function scanDir(dir) {
    const files = fs.readdirSync(dir);
    for (const f of files) {
      if (f === 'node_modules' || f === '.next' || f === '.git' || f === 'package-lock.json' || f === 'scripts') continue;
      const fullPath = path.join(dir, f);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        scanDir(fullPath);
      } else if (/\.(js|ts|tsx|jsx|json|mjs|env)$/.test(f)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        secretPatterns.forEach((pat) => {
          if (pat.test(content)) {
            potentialSecrets.push(fullPath);
          }
        });
      }
    }
  }
  scanDir(process.cwd());
  assert("SECRETS", "No hardcoded private keys or live API secrets found in source", potentialSecrets.length === 0, potentialSecrets.length ? `Found in: ${potentialSecrets.join(", ")}` : "Clean");

  // 2. Check .gitignore for .env protection
  console.log("\n--- 2. ENVIRONMENT & CONFIGURATION SECURITY ---");
  const gitignorePath = path.join(process.cwd(), ".gitignore");
  const gitignore = fs.existsSync(gitignorePath) ? fs.readFileSync(gitignorePath, "utf8") : "";
  const ignoresEnv = gitignore.includes(".env") && gitignore.includes(".env*.local");
  assert("CONFIG", ".gitignore explicitly ignores all .env and secret files", ignoresEnv);

  const envFilesOnDisk = fs.readdirSync(process.cwd()).filter(f => (f === ".env" || f === ".env.production"));
  assert("CONFIG", "No unignored production secret files present in root directory", envFilesOnDisk.length === 0, envFilesOnDisk.length ? `Found: ${envFilesOnDisk.join(", ")}` : "None found");

  // 3. Inspect next.config.mjs for Security Headers & Fingerprint Removal
  console.log("\n--- 3. HTTP SECURITY HEADERS & FINGERPRINTING ---");
  const nextConfigPath = path.join(process.cwd(), "next.config.mjs");
  const nextConfigContent = fs.readFileSync(nextConfigPath, "utf8");
  assert("HEADERS", "next.config.mjs disables X-Powered-By header (poweredByHeader: false)", nextConfigContent.includes("poweredByHeader: false"));
  assert("HEADERS", "next.config.mjs configures Content-Security-Policy (CSP)", nextConfigContent.includes("Content-Security-Policy"));
  assert("HEADERS", "next.config.mjs configures X-Frame-Options: DENY", nextConfigContent.includes("X-Frame-Options"));
  assert("HEADERS", "next.config.mjs configures X-Content-Type-Options: nosniff", nextConfigContent.includes("X-Content-Type-Options"));
  assert("HEADERS", "next.config.mjs configures Referrer-Policy", nextConfigContent.includes("Referrer-Policy"));
  assert("HEADERS", "next.config.mjs configures Strict-Transport-Security (HSTS)", nextConfigContent.includes("Strict-Transport-Security"));
  assert("HEADERS", "next.config.mjs configures Permissions-Policy", nextConfigContent.includes("Permissions-Policy"));

  // 4. API Security Inspection: /api/enquire
  console.log("\n--- 4. API SECURITY & INPUT VALIDATION (/api/enquire) ---");
  const apiRoutePath = path.join(process.cwd(), "src", "app", "api", "enquire", "route.ts");
  const apiRouteContent = fs.readFileSync(apiRoutePath, "utf8");

  assert("API_SEC", "API enforces server-side rate limiting to prevent spam/DoS", apiRouteContent.includes("rateLimit") || apiRouteContent.includes("RATE_LIMIT"));
  assert("API_SEC", "API enforces maximum string length limits to prevent payload exhaustion", apiRouteContent.includes(".length >") || apiRouteContent.includes("MAX_"));
  assert("API_SEC", "API sanitizes user-supplied strings against XSS / HTML injection", apiRouteContent.includes("sanitize") || apiRouteContent.includes("escape"));
  assert("API_SEC", "API does not expose internal stack traces in production error responses", !apiRouteContent.includes("error.stack") && apiRouteContent.includes("status: 500"));

  // 5. Test Live Server Security Headers
  console.log("\n--- 5. LIVE SERVER SECURITY HEADERS AUDIT (http://localhost:3000) ---");
  let liveHeaders = {};
  try {
    liveHeaders = await new Promise((resolve, reject) => {
      const req = http.request({ hostname: "localhost", port: 3000, path: "/", method: "HEAD" }, (res) => {
        resolve(res.headers);
      });
      req.on("error", reject);
      req.end();
    });
  } catch (err) {
    console.warn("Could not connect to localhost:3000 to test live headers (server may need restart).");
  }

  if (Object.keys(liveHeaders).length > 0) {
    assert("LIVE_HEADERS", "X-Powered-By is hidden or stripped", !liveHeaders["x-powered-by"]);
    assert("LIVE_HEADERS", "X-Frame-Options header present on root response", !!liveHeaders["x-frame-options"]);
    assert("LIVE_HEADERS", "X-Content-Type-Options is 'nosniff'", liveHeaders["x-content-type-options"] === "nosniff");
    assert("LIVE_HEADERS", "Referrer-Policy header present", !!liveHeaders["referrer-policy"]);
  }

  // 6. Test Rate Limiting on /api/enquire
  console.log("\n--- 6. LIVE API RATE-LIMITING VERIFICATION ---");
  let rateLimitWorked = false;
  try {
    for (let i = 0; i < 8; i++) {
      const res = await new Promise((resolve, reject) => {
        const req = http.request({
          hostname: "localhost",
          port: 3000,
          path: "/api/enquire",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-forwarded-for": "198.51.100.42" // Simulated IP
          }
        }, (r) => {
          let data = "";
          r.on("data", c => data += c);
          r.on("end", () => resolve({ status: r.statusCode, data }));
        });
        req.on("error", reject);
        req.write(JSON.stringify({
          name: "Security Tester",
          phone: "9876543210",
          deviceBrand: "Apple",
          deviceModel: "iPhone 13",
          issue: "Screen Replacement"
        }));
        req.end();
      });

      if (res.status === 429) {
        rateLimitWorked = true;
        break;
      }
    }
  } catch (err) {
    console.warn("Error running live rate limit test:", err.message);
  }
  assert("LIVE_API", "API rejects excessive consecutive requests with HTTP 429 Too Many Requests", rateLimitWorked);

  // Clean up any test records created by Security Tester
  try {
    const Database = require("better-sqlite3");
    const dbClean = new Database("data/denish.sqlite");
    const secCust = dbClean.prepare("SELECT id FROM customer_records WHERE name = 'Security Tester' OR phone = '9876543210'").all();
    if (secCust.length > 0) {
      const ids = secCust.map(c => c.id);
      const ph = ids.map(() => "?").join(",");
      const secOrds = dbClean.prepare(`SELECT id FROM repair_orders WHERE customer_id IN (${ph})`).all(...ids);
      if (secOrds.length > 0) {
        const oIds = secOrds.map(o => o.id);
        const oPh = oIds.map(() => "?").join(",");
        dbClean.prepare(`DELETE FROM repair_status_history WHERE order_id IN (${oPh})`).run(...oIds);
        dbClean.prepare(`DELETE FROM customer_notifications WHERE order_id IN (${oPh})`).run(...oIds);
        dbClean.prepare(`DELETE FROM repair_orders WHERE id IN (${oPh})`).run(...oIds);
      }
      dbClean.prepare(`DELETE FROM customer_records WHERE id IN (${ph})`).run(...ids);
    }
    dbClean.close();
  } catch (cleanErr) {
    // Ignore cleanup error
  }

  console.log("\n================================================================================");
  console.log(` SECURITY AUDIT SUMMARY: ${results.passed} PASSED | ${results.failed} FAILED | ${results.warnings} WARNINGS`);
  console.log("================================================================================\n");

  return results;
}

if (require.main === module) {
  runSecurityAudit().then(r => {
    process.exit(r.failed > 0 ? 1 : 0);
  }).catch(e => {
    console.error("Audit failure:", e);
    process.exit(1);
  });
}

module.exports = { runSecurityAudit };
