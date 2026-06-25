require('dotenv').config();
const { fetchGFWEvents } = require('../services/gfw');

async function test() {
  console.log('Testing GFW API Connectivity...');
  console.log('API Key:', process.env.GFW_API_KEY ? 'Set' : 'NOT SET');
  
  if (!process.env.GFW_API_KEY) {
    process.exit(1);
  }

  const dateTo = new Date().toISOString().split('T')[0];
  const dateFrom = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  try {
    const events = await fetchGFWEvents(dateFrom, dateTo);
    console.log('✅ Connection Successful!');
    console.log(`Found ${events.length} events in the last 7 days for Vanuatu bounding box.`);
    if (events.length > 0) {
      console.log('Sample Event:', JSON.stringify(events[0], null, 2));
    } else {
      console.log('No events found in the specified range/region, but API responded correctly.');
    }
  } catch (err) {
    console.error('❌ API Test Failed');
    if (err.response) {
      console.error('Status:', err.response.status);
      console.error('Data:', JSON.stringify(err.response.data, null, 2));
    } else {
      console.error('Error:', err.message);
    }
  }
}

test();
