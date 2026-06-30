require('dotenv').config();
const pool = require('./db');

const conservationData = [
  {
    countryCode: 'COK',
    countryName: 'Cook Islands',
    name: 'Marae Moana',
    lat: -15.0,
    lng: -160.0,
    size: '1.98 million km²',
    description: 'Whole-EEZ multi-use park; 16% (≈324,000 km²) is fully protected no-take zone around islands. One of the largest marine parks in the world.'
  },
  {
    countryCode: 'FSM',
    countryName: 'Micronesia',
    name: 'State-level Protected Area Networks (Kosrae, Pohnpei, Yap, Chuuk)',
    lat: 6.9,
    lng: 158.2,
    size: '~261,000 ha combined',
    description: 'Coral reefs, mangroves; part of the Micronesia Challenge. Managed state-by-state with over 50 individual sites.'
  },
  {
    countryCode: 'FJI',
    countryName: 'Fiji',
    name: 'Vatu-i-Ra Seascape / Conservation Park',
    lat: -17.20,
    lng: 178.50,
    size: '~27,000 km²',
    description: 'Humpback whale calving ground, spinner dolphins, hawksbill/green turtles, seabird colony. Core park is 100 km².'
  },
  {
    countryCode: 'PYF',
    countryName: 'French Polynesia',
    name: 'Tainui Atea (entire EEZ MPA)',
    lat: -17.5,
    lng: -149.5,
    size: '4.8 million km²',
    description: 'Announced 2025; sharks (21 species), coral reefs, traditional rāhui zoning around Society and Gambier Islands.'
  },
  {
    countryCode: 'KIR',
    countryName: 'Kiribati',
    name: 'Phoenix Islands Protected Area (PIPA)',
    lat: -3.65,
    lng: -172.86,
    size: '408,250 km²',
    description: 'Coral seamounts, sea turtles, 18 marine mammal species. Note: reopened to commercial tuna fishing in 2023.'
  },
  {
    countryCode: 'NRU',
    countryName: 'Nauru',
    name: 'Parties to the Nauru Agreement (Regional Management)',
    lat: -0.53,
    lng: 166.93,
    size: 'N/A',
    description: 'Nauru currently has no major designated marine sanctuary; conservation is mostly through regional tuna-management agreements (PNA).'
  },
  {
    countryCode: 'NCL',
    countryName: 'New Caledonia',
    name: 'Natural Park of the Coral Sea',
    lat: -20.0,
    lng: 165.0,
    size: '1.3 million km²',
    description: 'Coral reefs, 48 shark species, 5 turtle species, 25 marine mammal species. Covers the entire EEZ.'
  },
  {
    countryCode: 'NIU',
    countryName: 'Niue',
    name: 'Niue Nukutuluea Multiple-Use Marine Park',
    lat: -19.05,
    lng: -169.92,
    size: '318,140 km²',
    description: 'Humpback whales, flat-tail sea snake (endemic), sharks, rays, pristine Beveridge Reef. 40% fully protected.'
  },
  {
    countryCode: 'PLW',
    countryName: 'Palau',
    name: 'Palau National Marine Sanctuary',
    lat: 7.50,
    lng: 134.50,
    size: '475,077 km²',
    description: '800 marine vertebrate species, hawksbill/leatherback turtles, blue whales, 60+ shark/ray species. 80% of EEZ.'
  },
  {
    countryCode: 'PNG',
    countryName: 'Papua New Guinea',
    name: 'Kimbe Bay MPA',
    lat: -5.45,
    lng: 150.15,
    size: 'Bay-scale',
    description: 'Community-led MPA in the Coral Triangle; 860 reef fish species, 400 coral species, sperm whales, orcas, dugongs.'
  },
  {
    countryCode: 'MHL',
    countryName: 'Marshall Islands',
    name: 'Bikar & Bokak Atolls Marine Sanctuary',
    lat: 12.25,
    lng: 170.10,
    size: '48,000 km²',
    description: 'Largest RMI green turtle nesting colony, deep-sea sharks, bumphead parrotfish. Part of a nationwide shark sanctuary.'
  },
  {
    countryCode: 'WSM',
    countryName: 'Samoa',
    name: 'Aleipata & Safata Marine Protected Areas',
    lat: -14.02,
    lng: -171.75,
    size: 'District-scale',
    description: 'Hawksbill turtle nesting, humpback whale foraging. Samoa declared its entire EEZ a shark/whale/turtle sanctuary in 2003.'
  },
  {
    countryCode: 'SLB',
    countryName: 'Solomon Islands',
    name: 'Arnavon Community Marine Park',
    lat: -7.45,
    lng: 157.20,
    size: '169 km²',
    description: "South Pacific's largest hawksbill turtle nesting site, bottlenose dolphins. Solomon Islands' first national park."
  },
  {
    countryCode: 'TON',
    countryName: 'Tonga',
    name: "Vava'u Special Management Area",
    lat: -18.65,
    lng: -173.98,
    size: 'District-scale',
    description: 'Humpback whale breeding/calving ground (major whale-swim destination) and marine management area.'
  },
  {
    countryCode: 'TUV',
    countryName: 'Tuvalu',
    name: 'Funafuti Conservation Area',
    lat: -8.517,
    lng: 179.050,
    size: '33 km²',
    description: 'Green sea turtle nesting, black noddy seabird colony, coral reef fish. Established in 1996.'
  },
  {
    countryCode: 'VUT',
    countryName: 'Vanuatu',
    name: 'Hideaway Island Marine Sanctuary (Efate)',
    lat: -17.76,
    lng: 168.30,
    size: 'Local reef sanctuary',
    description: 'Coral reef fish, giant clams; one of many village-managed MPAs (LMMAs) in Vanuatu.'
  }
];

function generateGeoJSONPolygon(lat, lng, radius = 0.05) {
  return {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [lng - radius, lat + radius],
          [lng + radius, lat + radius],
          [lng + radius, lat - radius],
          [lng - radius, lat - radius],
          [lng - radius, lat + radius]
        ]
      ]
    },
    properties: {}
  };
}

async function seedMPAs(closePool = true) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    console.log('🌱 Seeding Pacific Conservation Areas (MPAs)...');

    for (const data of conservationData) {
      // ... same logic ...
      // 1. Get Country ID
      const countryRes = await client.query(
        'SELECT id FROM countries WHERE code = $1 OR name = $2',
        [data.countryCode, data.countryName]
      );

      if (countryRes.rows.length === 0) {
        console.warn(`⚠️ Country not found skip: ${data.countryName} (${data.countryCode})`);
        continue;
      }

      const countryId = countryRes.rows[0].id;
      const geojson = generateGeoJSONPolygon(data.lat, data.lng);
      geojson.properties.name = data.name;
      geojson.properties.size = data.size;

      const fullDescription = `${data.description}\n\nArea Size: ${data.size}`;

      // 2. Check if it exists
      const existing = await client.query('SELECT id FROM ecosystems WHERE name = $1', [data.name]);

      if (existing.rows.length > 0) {
        // Update
        await client.query(
          `UPDATE ecosystems SET 
             description = $1, 
             geojson = $2, 
             country_id = $3, 
             is_mpa = $4,
             zone_type = $5
            WHERE id = $6`,
          [fullDescription, JSON.stringify(geojson), countryId, true, 'marine_protected_area', existing.rows[0].id]
        );
        console.log(` 🔄 Updated: ${data.name}`);
      } else {
        // Insert
        await client.query(
          `INSERT INTO ecosystems (name, zone_type, health_score, description, geojson, country_id, is_mpa)
            VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [data.name, 'marine_protected_area', 85, fullDescription, JSON.stringify(geojson), countryId, true]
        );
        console.log(` ✅ Inserted: ${data.name}`);
      }
    }

    await client.query('COMMIT');
    console.log('\n✨ Conservation areas seeded successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error seeding MPAs:', error.message);
  } finally {
    client.release();
    if (closePool) {
      await pool.end();
    }
  }
}

if (require.main === module) {
  seedMPAs(true);
}

module.exports = seedMPAs;

