const https = require('https');

function testTrack(phone) {
  return new Promise((resolve) => {
    https.get('https://denish-mobile-service-and-repair-pu.vercel.app/api/track/' + phone, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`Status for ${phone}: ${res.statusCode}`);
        try {
          const json = JSON.parse(data);
          console.log(`Data for ${phone}:`, {
            success: json.success,
            trackingId: json.data?.trackingId,
            customerName: json.data?.customerName,
            deviceBrand: json.data?.deviceBrand,
            deviceModel: json.data?.deviceModel,
            currentStatus: json.data?.currentStatus,
          });
        } catch(e) {
          console.log(`Raw for ${phone}:`, data);
        }
        resolve();
      });
    }).on('error', err => {
      console.error(err);
      resolve();
    });
  });
}

async function run() {
  console.log('Testing Narendra Modi (9666200066)...');
  await testTrack('9666200066');
  console.log('Testing Pawan Kalyan (9502112525)...');
  await testTrack('9502112525');
}

run();
