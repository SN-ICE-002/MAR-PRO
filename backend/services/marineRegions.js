const axios = require('axios');

/**
 * Marine Regions Service
 * Fetches EEZ and Marine Boundaries (No Token Required)
 * Docs: https://www.marineregions.org/gazetteer.php?p=rest
 */

const GAZZETEER_BASE = 'https://www.marineregions.org/rest';

// Hardcoded fallback IDs for high accuracy in the Pacific
const PACIFIC_MRGIDS = {
  'Vanuatu': 8493,
  'Fiji': 8482,
  'Solomon Islands': 8490,
  'Samoa': 8489,
  'Tonga': 8492,
  'Kiribati': 8324, // Kiribati has multiple EEZs, this is a main one
  'Cook Islands': 8440,
  'Palau': 8488,
  'Marshall Islands': 8485,
  'Nauru': 8486,
  'Papua New Guinea': 8487
};

/**
 * Fetch EEZ (Exclusive Economic Zone) boundary for a country
 * Example: Vanuatu EEZ MRGID is 8493
 */
const fetchEEZBoundary = async (mrgid) => {
  try {
    console.log(`🌐 Fetching maritime boundary for MRGID: ${mrgid}...`);
    
    // Fetch the GeoJSON geometry - removing trailing slash to avoid 404s
    const response = await axios.get(`${GAZZETEER_BASE}/getGazetteerGeometries.json/${mrgid}`);
    
    return response.data; // This is a GeoJSON Feature or Collection
  } catch (error) {
    console.error('❌ Marine Regions Error:', error.message);
    return null;
  }
};

/**
 * Find MRGID by country name or code
 */
const findMRGID = async (name) => {
    // 1. Check fallback map first
    if (PACIFIC_MRGIDS[name]) return PACIFIC_MRGIDS[name];

    try {
        // 2. Try searching specifically for "Name Exclusive Economic Zone"
        const searchTerm = `${name} Exclusive Economic Zone`;
        const response = await axios.get(`${GAZZETEER_BASE}/getGazetteerRecordsByName.json/${searchTerm}/`);
        
        if (response.data && response.data.length > 0) {
            return response.data[0].mrgid;
        }

        // 3. Last ditch search for just the name
        const broadSearch = await axios.get(`${GAZZETEER_BASE}/getGazetteerRecordsByName.json/${name}/`);
        const eez = broadSearch.data.find(r => r.placeType && r.placeType.includes('Exclusive Economic Zone'));
        return eez ? eez.mrgid : null;
    } catch (error) {
        return null;
    }
}

module.exports = { fetchEEZBoundary, findMRGID };
