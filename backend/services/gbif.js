const axios = require('axios');

/**
 * GBIF Service to fetch marine species occurrences
 * Documentation: https://www.gbif.org/developer/occurrence
 */

const GBIF_API_BASE = 'https://api.gbif.org/v1';

/**
 * Fetch sightings for a specific country and marine taxon
 * @param {string} countryCode - ISO 2-letter code (e.g., 'VU' for Vanuatu)
 * @param {number} limit - Number of records to fetch
 */
const fetchMarineSightings = async (countryCode = 'VU', limit = 20) => {
  try {
    console.log(`🔍 Fetching GBIF sightings for ${countryCode}...`);
    
    // We filter by:
    // - country: code (e.g. VU)
    // - basisOfRecord: HUMAN_OBSERVATION (actual sightings)
    // - taxonKey: 212 (Chordata - covers most big marine animals)
    // - hasCoordinate: true
    const response = await axios.get(`${GBIF_API_BASE}/occurrence/search`, {
      params: {
        country: countryCode,
        basisOfRecord: 'HUMAN_OBSERVATION',
        taxonKey: 212, // Chordata
        hasCoordinate: true,
        limit: limit,
      }
    });

    return response.data.results.map(record => ({
      scientific_name: record.scientificName,
      common_name: record.vernacularName || record.scientificName.split(' ')[0], // fallback
      lat: record.decimalLatitude,
      lng: record.decimalLongitude,
      sighted_at: record.eventDate || record.eventTime || new Date().toISOString(),
      source: 'GBIF',
      external_id: record.key,
      description: `Observed via GBIF: ${record.occurrenceRemarks || 'No additional details'}`
    }));
  } catch (error) {
    console.error('❌ GBIF Fetch Error:', error.message);
    return [];
  }
};

module.exports = {
  fetchMarineSightings
};
