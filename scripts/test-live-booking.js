const https = require('https');

function postBooking(data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    const options = {
      hostname: 'denish-mobile-service-and-repair-pu.vercel.app',
      port: 443,
      path: '/api/enquire',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, body });
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function getTrack(trackingId) {
  return new Promise((resolve, reject) => {
    https.get('https://denish-mobile-service-and-repair-pu.vercel.app/api/track/' + trackingId, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, body });
      });
    }).on('error', reject);
  });
}

async function run() {
  const testPhone = '9848022338';
  console.log(`Submitting new customer booking with phone ${testPhone}...`);
  const res = await postBooking({
    name: 'Venkat Rao',
    phone: testPhone,
    deviceBrand: 'OnePlus',
    deviceModel: 'Nord CE 3',
    repairCategory: 'Battery Replacement',
    problemDescription: 'Battery draining quickly within 3 hours',
    preferredContact: 'whatsapp'
  });

  console.log('Booking response status:', res.statusCode);
  console.log('Booking response body:', res.body);

  const parsed = JSON.parse(res.body);
  if (parsed.success) {
    console.log(`\nNow tracking the newly created booking by mobile number: ${testPhone}...`);
    const trackRes = await getTrack(testPhone);
    console.log('Track status:', trackRes.statusCode);
    console.log('Track body:', trackRes.body);
  }
}

run().catch(console.error);
