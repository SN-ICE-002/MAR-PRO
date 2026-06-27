const axios = require('axios');

/**
 * Protected Planet Service (WDPA)
 * Fetches Marine Protected Area boundaries
 */

const PP_API_BASE = 'https://api.protectedplanet.net/v3';
const TOKEN = process.env.PROTECTED_PLANET_TOKEN;

/**
 * Fetch MPAs for a country
 * @param {string} iso3 - ISO 3-letter code (e.g., 'VUT' for Vanuatu)
 */
const fetchMPAs = async (iso3 = 'VUT') => {
  if (!TOKEN) {
    console.log('⚠️ PROTECTED_PLANET_TOKEN not set. Skipping MPA boundary fetch.');
    return [];
  }

  try {
    console.log(`🛡️ Fetching Marine Protected Areas for ${iso3}...`);
    
    // We filter by marine=true
    const response = await axios.get(`${PP_API_BASE}/protected_areas/search`, {
      params: {
        token: TOKEN,
        filters: {
          country: iso3,
          marine: true
        }
      }
    });

    return response.data.protected_areas.map(pa => ({
      wdpa_id: pa.wdpa_id,
      name: pa.name,
      designation: pa.designation?.name,
      iucn_category: pa.iucn_category?.name,
      geojson: pa.geojson, // Note: Some results might require a secondary fetch for full geometry
    }));
  } catch (error) {
    console.error('❌ Protected Planet Error:', error.message);
    return [];
  }
};

module.exports = { fetchMPAs };
