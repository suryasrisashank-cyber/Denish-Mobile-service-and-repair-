const http = require("http");
const { spawn } = require("child_process");
const WebSocket = require("ws");

const routesToTest = [
  { url: "http://localhost:3000/", name: "Home" },
  { url: "http://localhost:3000/services", name: "Services" },
  { url: "http://localhost:3000/about", name: "About" },
  { url: "http://localhost:3000/book-repair", name: "Book Repair" },
  { url: "http://localhost:3000/contact", name: "Contact" },
  { url: "http://localhost:3000/faq", name: "FAQ" },
  { url: "http://localhost:3000/track-repair", name: "Track Repair" },
];

function getEdgePath() {
  const paths = [
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  ];
  for (const p of paths) {
    if (require("fs").existsSync(p)) return p;
  }
  return "msedge.exe";
}

async function run() {
  const edgePath = getEdgePath();
  const remoteDebuggingPort = 9225;

  console.log("Launching headless Edge for multi-page route verification...");
  const edgeProcess = spawn(edgePath, [
    `--remote-debugging-port=${remoteDebuggingPort}`,
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    "--user-data-dir=" + require("os").tmpdir() + "\\edge-qa-test-" + Date.now(),
    "about:blank",
  ]);

  await new Promise((r) => setTimeout(r, 2000));

  const versionJson = await new Promise((resolve, reject) => {
    http.get(`http://127.0.0.1:${remoteDebuggingPort}/json/version`, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => resolve(JSON.parse(data)));
    }).on("error", reject);
  });

  const ws = new WebSocket(versionJson.webSocketDebuggerUrl);
  await new Promise((resolve) => ws.on("open", resolve));

  let idCounter = 1;
  const caughtErrors = [];

  ws.on("message", (raw) => {
    const msg = JSON.parse(raw);
    if (msg.method === "Runtime.exceptionThrown") {
      const details = msg.params.exceptionDetails;
      caughtErrors.push({
        text: details.text,
        desc: details.exception?.description || details.text,
      });
    }
  });

  function sendCmd(method, params = {}) {
    return new Promise((resolve) => {
      const id = idCounter++;
      const handler = (raw) => {
        const res = JSON.parse(raw);
        if (res.id === id) {
          ws.removeListener("message", handler);
          resolve(res.result);
        }
      };
      ws.on("message", handler);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await sendCmd("Page.enable");
  await sendCmd("Runtime.enable");

  console.log("\n=== Testing Real Browser Page Execution for All 7 Routes ===");

  let allOk = true;

  for (const page of routesToTest) {
    caughtErrors.length = 0;
    await sendCmd("Page.navigate", { url: page.url });
    await new Promise((r) => setTimeout(r, 1800));

    // Evaluate for Application Error
    const appErrorEval = await sendCmd("Runtime.evaluate", {
      expression: 'document.body.innerText.includes("Application error: a client-side exception has occurred")',
      returnByValue: true,
    });
    const hasAppError = appErrorEval?.result?.value;

    const titleEval = await sendCmd("Runtime.evaluate", {
      expression: "document.title",
      returnByValue: true,
    });

    const isPageOk = !hasAppError && caughtErrors.length === 0;
    console.log(
      `[PAGE] ${page.name.padEnd(15)} | ${page.url.padEnd(35)} | Title: "${titleEval?.result?.value?.slice(0, 30)}..." | ${
        isPageOk ? "PASS (No Errors)" : "FAIL"
      }`
    );

    if (!isPageOk) {
      allOk = false;
      if (hasAppError) console.error(`  -> Application Error Screen detected!`);
      if (caughtErrors.length > 0) console.error(`  -> Caught exceptions:`, caughtErrors);
    }
  }

  ws.close();
  edgeProcess.kill();

  console.log("\nResult:", allOk ? "ALL 7 ROUTES PASS BROWSER TEST (0 Exceptions)" : "SOME ROUTES FAILED");
  process.exit(allOk ? 0 : 1);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
