const http = require('http');
const { spawn } = require('child_process');

async function run() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  
  console.log('Launching headless Edge for deep browser verification...');
  const edge = spawn(edgePath, [
    '--headless=new',
    '--remote-debugging-port=9223',
    '--no-first-run',
    '--no-default-browser-check',
    '--user-data-dir=C:\\Users\\MAHADEV\\AppData\\Local\\Temp\\edge-test-profile',
    'http://localhost:3000'
  ], { detached: false });

  await new Promise(r => setTimeout(r, 2500));

  http.get('http://127.0.0.1:9223/json', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const targets = JSON.parse(data);
        const page = targets.find(t => t.type === 'page' && t.url.includes('3000')) || targets[0];
        if (!page || !page.webSocketDebuggerUrl) {
          console.error('Could not find debugger WebSocket URL.');
          edge.kill();
          process.exit(1);
        }
        testInteractions(page.webSocketDebuggerUrl, edge);
      } catch (err) {
        console.error('Error parsing /json:', err);
        edge.kill();
        process.exit(1);
      }
    });
  }).on('error', (e) => {
    console.error('Error connecting to port 9223:', e);
    edge.kill();
    process.exit(1);
  });
}

function testInteractions(wsUrl, edgeProcess) {
  const url = new URL(wsUrl);
  const req = http.request({
    hostname: url.hostname,
    port: url.port,
    path: url.pathname,
    headers: {
      'Connection': 'Upgrade',
      'Upgrade': 'websocket',
      'Sec-WebSocket-Key': 'dGhlIHNhbXBsZSBub25jZQ==',
      'Sec-WebSocket-Version': '13'
    }
  });

  req.on('upgrade', (res, socket) => {
    console.log('Connected to DevTools WebSocket!');
    
    let id = 1;
    function sendCommand(method, params = {}) {
      return new Promise((resolve) => {
        const cmdId = id++;
        pendingCommands.set(cmdId, resolve);
        const msg = JSON.stringify({ id: cmdId, method, params });
        const length = Buffer.byteLength(msg);
        let frame;
        if (length < 126) {
          frame = Buffer.alloc(2 + 4 + length);
          frame[0] = 0x81;
          frame[1] = 0x80 | length;
          frame.writeUInt32BE(0, 2);
          Buffer.from(msg).copy(frame, 6);
        } else {
          frame = Buffer.alloc(4 + 4 + length);
          frame[0] = 0x81;
          frame[1] = 0x80 | 126;
          frame.writeUInt16BE(length, 2);
          frame.writeUInt32BE(0, 4);
          Buffer.from(msg).copy(frame, 8);
        }
        socket.write(frame);
      });
    }

    const pendingCommands = new Map();
    const caughtExceptions = [];

    let buffer = Buffer.alloc(0);
    socket.on('data', (chunk) => {
      buffer = Buffer.concat([buffer, chunk]);
      while (buffer.length >= 2) {
        const secondByte = buffer[1];
        let payloadLen = secondByte & 0x7f;
        let offset = 2;
        if (payloadLen === 126) {
          if (buffer.length < 4) break;
          payloadLen = buffer.readUInt16BE(2);
          offset = 4;
        } else if (payloadLen === 127) {
          if (buffer.length < 10) break;
          payloadLen = Number(buffer.readBigUInt64BE(2));
          offset = 10;
        }

        if (buffer.length < offset + payloadLen) break;

        const payload = buffer.slice(offset, offset + payloadLen);
        buffer = buffer.slice(offset + payloadLen);

        try {
          const event = JSON.parse(payload.toString());
          if (event.id && pendingCommands.has(event.id)) {
            const cb = pendingCommands.get(event.id);
            pendingCommands.delete(event.id);
            cb(event.result);
          } else if (event.method === 'Runtime.exceptionThrown') {
            const exp = event.params.exceptionDetails;
            caughtExceptions.push(exp);
            console.error('\n******************************************************');
            console.error('>>> RUNTIME EXCEPTION DETECTED <<<');
            console.error('Text:', exp.text);
            console.error('Description:', exp.exception ? (exp.exception.description || exp.exception.value) : 'N/A');
            console.error('URL:', exp.url, 'Line:', exp.lineNumber, 'Col:', exp.columnNumber);
            if (exp.stackTrace) {
              console.error('Call Stack:');
              exp.stackTrace.callFrames.forEach(f => {
                console.error(`  at ${f.functionName || '(anonymous)'} (${f.url}:${f.lineNumber}:${f.columnNumber})`);
              });
            }
            console.error('******************************************************\n');
          }
        } catch (e) {}
      }
    });

    async function executeTestSequence() {
      await sendCommand('Runtime.enable');
      await sendCommand('Log.enable');
      await sendCommand('Page.enable');

      console.log('Navigating to http://localhost:3000 with fresh cache...');
      await sendCommand('Page.navigate', { url: 'http://localhost:3000' });
      await new Promise(r => setTimeout(r, 1500));

      // Simulate clean first-time visitor by clearing any prior stored theme
      await sendCommand('Runtime.evaluate', { expression: 'localStorage.clear();' });
      await sendCommand('Page.navigate', { url: 'http://localhost:3000' });
      await new Promise(r => setTimeout(r, 2000));

      console.log('1. Checking document title and initial error status...');
      const evalTitle = await sendCommand('Runtime.evaluate', { expression: 'document.title' });
      console.log('Document Title:', evalTitle.result ? evalTitle.result.value : 'N/A');

      const evalError = await sendCommand('Runtime.evaluate', { 
        expression: 'document.body.innerText.includes("Application error") ? "FOUND_APP_ERROR" : "NO_APP_ERROR"' 
      });
      console.log('App Error Status:', evalError.result ? evalError.result.value : 'N/A');

      // 1b. Verify Light Theme is Default for first-time visitors
      console.log('\n1b. Verifying Light Theme Default for First-Time Visitors (Priority 1)...');
      const defaultLightEval = await sendCommand('Runtime.evaluate', {
        expression: '!document.documentElement.classList.contains("dark") && document.documentElement.style.colorScheme === "light"'
      });
      console.log('Initial Theme is Light Mode (No dark class):', defaultLightEval.result?.value ? 'PASS (Light is default)' : 'FAIL');

      // 1c. Verify Brand Visibility & Service Names
      const brandVisibilityEval = await sendCommand('Runtime.evaluate', {
        expression: 'document.body.innerText.includes("DENISH") && document.body.innerText.includes("Screen Replacement") && document.body.innerText.includes("Battery Replacement")'
      });
      console.log('DENISH Brand & Core Services Visible in DOM:', brandVisibilityEval.result?.value ? 'PASS' : 'FAIL');

      // 2. Check phone privacy: Ensure raw phone is not visible in innerText
      console.log('\n2. Verifying Phone Number Privacy (Priority 6)...');
      const phonePrivacyEval = await sendCommand('Runtime.evaluate', {
        expression: 'document.body.innerText.includes("8511668848") || document.body.innerText.includes("85116 68848")'
      });
      console.log('Raw Phone Number Visible in Body Text:', phonePrivacyEval.result?.value ? 'YES (VIOLATION)' : 'NO (PASSED - Protected)');

      // 3. Check circular chat widget removal
      console.log('\n3. Verifying Circular Chat Widget Removal (Priority 4)...');
      const chatWidgetEval = await sendCommand('Runtime.evaluate', {
        expression: '!!document.querySelector(".fixed.bottom-6.right-6")'
      });
      console.log('Unattractive Circular Chat Widget Present:', chatWidgetEval.result?.value ? 'YES (VIOLATION)' : 'NO (PASSED - Removed)');

      // 4. Test Mobile Viewports (360px, 390px, 430px)
      console.log('\n4. Testing Mobile Viewports (Priority 1)...');
      for (const width of [360, 390, 430]) {
        await sendCommand('Emulation.setDeviceMetricsOverride', {
          width,
          height: 800,
          deviceScaleFactor: 2,
          mobile: true
        });
        await new Promise(r => setTimeout(r, 400));
        const overflowEval = await sendCommand('Runtime.evaluate', {
          expression: 'document.documentElement.scrollWidth > window.innerWidth'
        });
        console.log(`Viewport ${width}px horizontal overflow:`, overflowEval.result?.value ? 'YES (FAIL)' : 'NO (PASS)');
      }

      // Reset to standard viewport
      await sendCommand('Emulation.setDeviceMetricsOverride', {
        width: 1280,
        height: 800,
        deviceScaleFactor: 1,
        mobile: false
      });
      await new Promise(r => setTimeout(r, 300));

      // 5. Test Theme Switching (Priority 5)
      console.log('\n5. Testing Theme Switching & Persistence (Priority 5)...');
      // Click Dark mode
      await sendCommand('Runtime.evaluate', {
        expression: 'Array.from(document.querySelectorAll("button")).find(b => b.innerText.includes("Dark"))?.click()'
      });
      await new Promise(r => setTimeout(r, 400));
      const darkCheck = await sendCommand('Runtime.evaluate', {
        expression: 'document.documentElement.classList.contains("dark") && localStorage.getItem("denish_theme") === "dark"'
      });
      console.log('Dark mode selected and applied to <html>:', darkCheck.result?.value ? 'PASS' : 'FAIL');

      // Click Light mode
      await sendCommand('Runtime.evaluate', {
        expression: 'Array.from(document.querySelectorAll("button")).find(b => b.innerText.includes("Light"))?.click()'
      });
      await new Promise(r => setTimeout(r, 400));
      const lightCheck = await sendCommand('Runtime.evaluate', {
        expression: '!document.documentElement.classList.contains("dark") && localStorage.getItem("denish_theme") === "light"'
      });
      console.log('Light mode selected and applied to <html>:', lightCheck.result?.value ? 'PASS' : 'FAIL');

      // Click System mode
      await sendCommand('Runtime.evaluate', {
        expression: 'Array.from(document.querySelectorAll("button")).find(b => b.innerText.includes("System"))?.click()'
      });
      await new Promise(r => setTimeout(r, 400));
      const sysCheck = await sendCommand('Runtime.evaluate', {
        expression: 'localStorage.getItem("denish_theme") === "system"'
      });
      console.log('System mode selected and persisted:', sysCheck.result?.value ? 'PASS' : 'FAIL');

      // 6. Test Mobile Bottom Nav
      console.log('\n6. Testing Mobile Bottom Navigation Bar (Priority 7)...');
      const bottomNavEval = await sendCommand('Runtime.evaluate', {
        expression: '!!document.querySelector("nav[aria-label=\'Mobile Bottom Navigation\']");'
      });
      console.log('Mobile Bottom Navigation rendered:', bottomNavEval.result?.value ? 'PASS' : 'FAIL');

      // 7. Check final error status
      console.log('\n7. Final Runtime Error Check...');
      const finalError = await sendCommand('Runtime.evaluate', { 
        expression: 'document.body.innerText.includes("Application error") ? "FOUND_APP_ERROR" : "NO_APP_ERROR"' 
      });
      console.log('Final App Error Status:', finalError.result ? finalError.result.value : 'N/A');
      console.log(`=== Total Caught Exceptions: ${caughtExceptions.length} ===\n`);

      const allSuccess = 
        evalError.result?.value === 'NO_APP_ERROR' &&
        finalError.result?.value === 'NO_APP_ERROR' &&
        !phonePrivacyEval.result?.value &&
        !chatWidgetEval.result?.value &&
        caughtExceptions.length === 0;

      socket.end();
      edgeProcess.kill();
      process.exit(allSuccess ? 0 : 1);
    }

    executeTestSequence();
  });

  req.end();
}

run();
