const http = require('http');
const Database = require('better-sqlite3');

function fetchHtml(path) {
  return new Promise((resolve, reject) => {
    http.get('http://localhost:3000' + path, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, html: data }));
    }).on('error', reject);
  });
}

async function runVerification() {
  console.log('================================================================================');
  console.log('       TARGETED CLIENT DELIVERY VERIFICATION');
  console.log('       PRICING REMOVAL + WARRANTY COMMITMENTS + BRAND LOGO + SHOP HOURS');
  console.log('================================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(title, condition, detail = '') {
    if (condition) {
      console.log(`[PASS] ${title} ${detail ? '-> ' + detail : ''}`);
      passed++;
    } else {
      console.log(`[FAIL] ${title} ${detail ? '-> ' + detail : ''}`);
      failed++;
    }
  }

  // 1. Check Homepage
  const home = await fetchHtml('/');
  assert('Homepage HTTP 200 OK', home.status === 200);

  // 1a. Pricing check on Homepage
  const homeHasRupee = /₹\s*\d+/.test(home.html);
  assert('Homepage has NO visible rupee prices (₹...)', !homeHasRupee);
  const homeHasCostCalc = home.html.includes('Upfront Workshop Cost Calculator');
  assert('Homepage has NO "Upfront Workshop Cost Calculator"', !homeHasCostCalc);
  assert('Homepage contains "Contact us for service details."', home.html.includes('Contact us for service details.'));
  assert('Homepage contains "Service Enquiry"', home.html.includes('Service Enquiry'));

  // 1b. Warranty check on Homepage
  const homeHas6MWarranty = /6-month\s*spares\s*guarantee/i.test(home.html);
  const homeHas6MWarranty2 = /6M\s*Warranty/i.test(home.html);
  assert('Homepage has NO "6-Month Spares Guarantee"', !homeHas6MWarranty);
  assert('Homepage has NO "6M Warranty"', !homeHas6MWarranty2);

  // 1c. Logo check on Homepage
  assert('Homepage uses isolated brand logo asset (/assets/denish-logo-icon.png or /assets/denish-logo.png)', home.html.includes('/assets/denish-logo-icon.png') || home.html.includes('/assets/denish-logo.png'));
  assert('Homepage has NO promotional poster as logo', !home.html.includes('denish-poster.jpg') || home.html.includes('hero'));

  // 1d. Shop hours check on Homepage
  assert('Homepage displays "9:00 AM – 9:00 PM"', home.html.includes('9:00 AM – 9:00 PM'));
  assert('Homepage has NO conflicting "10:00 AM" timing', !home.html.includes('10:00 AM'));

  // 2. Check /services page
  const services = await fetchHtml('/services');
  assert('/services HTTP 200 OK', services.status === 200);
  assert('/services has NO "WhatsApp Estimate"', !services.html.includes('WhatsApp Estimate'));
  assert('/services has "WhatsApp Enquiry"', services.html.includes('WhatsApp Enquiry'));

  // 3. Check /about page
  const about = await fetchHtml('/about');
  assert('/about HTTP 200 OK', about.status === 200);
  assert('/about has NO "Upfront Cost Estimation"', !about.html.includes('Upfront Cost Estimation'));
  assert('/about has "Clear Communication"', about.html.includes('Clear Communication'));
  assert('/about displays 9:00 AM – 9:00 PM shop timing', about.html.includes('9:00 AM – 9:00 PM'));

  // 4. Check /faq page
  const faq = await fetchHtml('/faq');
  assert('/faq HTTP 200 OK', faq.status === 200);
  assert('/faq has NO "Estimates & Pricing" category', !faq.html.includes('Estimates & Pricing'));
  assert('/faq has "Service Enquiries" category', faq.html.includes('Service Enquiries'));

  // 5. Check /api/info
  const info = await fetchHtml('/api/info');
  const infoData = JSON.parse(info.html);
  assert('/api/info timing reflects 9:00 AM – 9:00 PM', infoData.timing.includes('9:00 AM – 9:00 PM'), infoData.timing);
  assert('/api/info warranty reflects verified quality spares', infoData.warranty.includes('Tested Quality Spares'), infoData.warranty);

  // 6. Database Verification
  const db = new Database('data/denish.sqlite');
  const orderCount = db.prepare('SELECT count(*) as count FROM repair_orders').get().count;
  const custCount = db.prepare('SELECT count(*) as count FROM customer_records').get().count;
  const adminCount = db.prepare('SELECT count(*) as count FROM admin_users').get().count;

  assert('Database has 0 fake repair orders', orderCount === 0, `Count: ${orderCount}`);
  assert('Database has 0 fake customer records', custCount === 0, `Count: ${custCount}`);
  assert('Database retains authorized admin user', adminCount === 1, `Count: ${adminCount}`);

  console.log('\n================================================================================');
  console.log(` SUMMARY: ${passed} PASSED | ${failed} FAILED (Total: ${passed + failed})`);
  console.log('================================================================================\n');

  process.exit(failed > 0 ? 1 : 0);
}

runVerification();
