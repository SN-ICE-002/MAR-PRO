require('dotenv').config();
const { syncGBIFData } = require('./services/syncGBIF');

const runTest = async () => {
  try {
    console.log('🌊 Starting GBIF Biodiversity Sync Test...');
    
    // Test for Vanuatu (VU)
    await syncGBIFData('VU');
    
    console.log('🏁 Test completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('💥 Test failed:', error);
    process.exit(1);
  }
};

runTest();
