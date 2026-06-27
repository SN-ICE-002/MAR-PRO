require('dotenv').config();
const { syncMaritimeBoundaries } = require('./services/syncBoundaries');

const runTest = async () => {
    console.log('🚢 Starting Maritime Boundary Sync...');
    await syncMaritimeBoundaries();
    console.log('🏁 Done! Check your ecosystems table.');
    process.exit(0);
};

runTest();
