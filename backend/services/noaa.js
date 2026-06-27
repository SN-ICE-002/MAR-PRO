const axios = require('axios');

/**
 * NOAA Coral Reef Watch Service
 * Fetches bleaching alerts and SST for Pacific regions
 * Docs: https://coralreefwatch.noaa.gov/product/vs/gauges/vanuatu.php
 */

const NOAA_URLS = {
  'VU': 'https://coralreefwatch.noaa.gov/product/vs/data/vanuatu.txt',
  // You can add more mapping here for other Pacific nations
};

/**
 * Fetch latest bleaching data for a country
 * Example parsing for NOAA's .txt format which is space-delimited
 */
const fetchBleachingData = async (countryCode = 'VU') => {
  try {
    const url = NOAA_URLS[countryCode];
    if (!url) {
      console.log(`⚠️ No NOAA regional station mapped for ${countryCode}`);
      return null;
    }

    console.log(`🌡️ Fetching NOAA Bleaching health data for ${countryCode}...`);
    const response = await axios.get(url);
    
    // NOAA .txt files are often time-series. The last line is the most recent.
    const lines = response.data.trim().split('\n');
    const lastLine = lines[lines.length - 1]; 
    const columns = lastLine.split(/\s+/);

    /**
     * Columns typically:
     * 0: Year, 1: Month, 2: Day, 
     * 3: SST, 4: SST_Anomaly, 
     * 5: HotSpot, 6: DHW (Degree Heating Weeks), 
     * 7: Bleaching_Alert_Level
     */
    const data = {
      date: `${columns[0]}-${columns[1]}-${columns[2]}`,
      sst: parseFloat(columns[3]),
      sst_anomaly: parseFloat(columns[4]),
      dhw: parseFloat(columns[6]),
      alert_level: parseInt(columns[7]), // 0=No Stress, 1=Bleaching Watch, 2=Warning, 3=Alert 1, 4=Alert 2
    };

    console.log(`✅ NOAA Data for ${countryCode}: Alert Level ${data.alert_level}, SST ${data.sst}°C`);
    return data;
  } catch (error) {
    console.error('❌ NOAA Fetch Error:', error.message);
    return null;
  }
};

module.exports = { fetchBleachingData };
