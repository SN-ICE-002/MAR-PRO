/**
 * Ocean Guardian — Seed Script
 * Run: node seed.js
 * Seeds: 4 ecosystems, 6 species, species_zones, 30 fishing events,
 *        3 alerts, 5 sightings, health log entries
 */

require('dotenv').config();
const pool = require('./db');

// ─── 1. ECOSYSTEMS ────────────────────────────────────────────────────────────
const ecosystems = [
  {
    name: 'Espiritu Santo Coral Reef',
    zone_type: 'coral_reef',
    health_score: 72,
    description:
      'Vanuatu\'s largest fringing coral reef system surrounding Espiritu Santo island, home to over 450 coral species and critical nursery habitat.',
    geojson: {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [166.8, -15.3],
            [167.3, -15.3],
            [167.3, -15.8],
            [166.8, -15.8],
            [166.8, -15.3],
          ],
        ],
      },
      properties: { name: 'Espiritu Santo Coral Reef' },
    },
  },
  {
    name: 'Efate Seagrass Meadows',
    zone_type: 'seagrass',
    health_score: 58,
    description:
      'Extensive seagrass beds around Efate island providing feeding grounds for dugongs, sea turtles and juvenile fish populations.',
    geojson: {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [168.1, -17.5],
            [168.5, -17.5],
            [168.5, -17.9],
            [168.1, -17.9],
            [168.1, -17.5],
          ],
        ],
      },
      properties: { name: 'Efate Seagrass Meadows' },
    },
  },
  {
    name: 'Tanna Deep Water Channel',
    zone_type: 'open_water',
    health_score: 85,
    description:
      'Deep oceanic channel south of Tanna island, a migration corridor for humpback whales, whale sharks and pelagic species.',
    geojson: {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [169.2, -19.2],
            [169.7, -19.2],
            [169.7, -19.7],
            [169.2, -19.7],
            [169.2, -19.2],
          ],
        ],
      },
      properties: { name: 'Tanna Deep Water Channel' },
    },
  },
  {
    name: 'Banks Island Marine Reserve',
    zone_type: 'marine_reserve',
    health_score: 91,
    description:
      'Remote protected marine reserve around the Banks Island group, one of the Pacific\'s least disturbed reef systems with exceptional biodiversity.',
    geojson: {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [167.3, -13.5],
            [167.9, -13.5],
            [167.9, -14.1],
            [167.3, -14.1],
            [167.3, -13.5],
          ],
        ],
      },
      properties: { name: 'Banks Island Marine Reserve' },
    },
  },
];

// ─── 2. SPECIES ─────────────────────────────────────────────────────────────
const species = [
  {
    common_name: 'Hawksbill Turtle',
    scientific_name: 'Eretmochelys imbricata',
    iucn_status: 'CR',
    description:
      'The hawksbill turtle is critically endangered, prized for its distinctive patterned shell. It feeds primarily on sponges and plays a vital role in maintaining reef health.',
    why_it_matters:
      'By consuming sponges, hawksbills prevent them from overgrowing corals, keeping reef ecosystems balanced. Their nesting beaches in Vanuatu are among the Pacific\'s most important.',
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Hawksbill_turtle_Coral_Sea.jpg/640px-Hawksbill_turtle_Coral_Sea.jpg',
  },
  {
    common_name: 'Humphead Wrasse',
    scientific_name: 'Cheilinus undulatus',
    iucn_status: 'EN',
    description:
      'The largest member of the wrasse family, reaching up to 2 metres. This iconic reef fish is critically impacted by the live reef food fish trade.',
    why_it_matters:
      'Humphead wrasse are one of the few predators of crown-of-thorns starfish, which destroy coral. Their decline directly contributes to coral reef degradation across Vanuatu.',
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Humphead_wrasse.jpg/640px-Humphead_wrasse.jpg',
  },
  {
    common_name: 'Whale Shark',
    scientific_name: 'Rhincodon typus',
    iucn_status: 'EN',
    description:
      'The world\'s largest fish, whale sharks filter-feed on plankton and small fish. Seasonal aggregations occur in Vanuatu\'s deeper channels.',
    why_it_matters:
      'As ocean filter feeders, whale sharks indicate healthy open-water ecosystems. They are a critical ecotourism asset for Vanuatu and their presence signals abundant marine life.',
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Whale_shark_Georgia_aquarium.jpg/640px-Whale_shark_Georgia_aquarium.jpg',
  },
  {
    common_name: 'Dugong',
    scientific_name: 'Dugong dugon',
    iucn_status: 'VU',
    description:
      'Marine mammals closely related to manatees, dugongs are the only strictly marine herbivorous mammals and depend entirely on seagrass meadows.',
    why_it_matters:
      'Dugongs are the primary "gardeners" of seagrass beds — their grazing promotes healthy seagrass growth, which supports juvenile fish, carbon storage and coastal protection.',
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Dugongo.jpg/640px-Dugongo.jpg',
  },
  {
    common_name: 'Bumphead Parrotfish',
    scientific_name: 'Bolbometopon muricatum',
    iucn_status: 'VU',
    description:
      'The world\'s largest parrotfish species, capable of consuming dead coral and excreting it as fine white sand — literally building island beaches.',
    why_it_matters:
      'Bumphead parrotfish produce up to 90kg of sand per year per fish. Their coral-cleaning activity is essential for reef recovery and beach formation across the Pacific islands.',
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Bumphead_parrotfish.jpg/640px-Bumphead_parrotfish.jpg',
  },
  {
    common_name: 'Humpback Whale',
    scientific_name: 'Megaptera novaeangliae',
    iucn_status: 'LC',
    description:
      'Humpback whales migrate through Vanuatu\'s waters between June and October to breed and calve, singing complex songs audible for hundreds of kilometres.',
    why_it_matters:
      'Whale faeces fertilise surface waters with iron and nitrogen, triggering phytoplankton blooms that form the base of the ocean food chain and absorb massive amounts of CO₂.',
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Humpback_Whale_underwater_shot.jpg/640px-Humpback_Whale_underwater_shot.jpg',
  },
];

// ─── 3. SPECIES → ZONES MAPPING ─────────────────────────────────────────────
// [speciesIndex, ecosystemIndex]  (0-based, resolved after inserts)
const speciesZoneMap = [
  [0, 0], // Hawksbill → Espiritu Santo (coral reef)
  [0, 1], // Hawksbill → Efate Seagrass
  [1, 0], // Humphead Wrasse → Espiritu Santo
  [1, 3], // Humphead Wrasse → Banks Island
  [2, 2], // Whale Shark → Tanna Deep Water
  [2, 3], // Whale Shark → Banks Island
  [3, 1], // Dugong → Efate Seagrass
  [4, 0], // Bumphead Parrotfish → Espiritu Santo
  [4, 3], // Bumphead Parrotfish → Banks Island
  [5, 2], // Humpback Whale → Tanna Deep Water
];

// ─── 4. FISHING EVENTS (30 events over last 7 days) ─────────────────────────
function randomBetween(min, max) {
  return +(Math.random() * (max - min) + min).toFixed(6);
}
function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

const fishingEvents = [];
const vesselPrefixes = ['VU-', 'SB-', 'FJ-', 'PG-', 'AU-'];

// Events INSIDE zones (higher risk)
const insideZoneConfigs = [
  { ecosystemIdx: 0, latRange: [-15.8, -15.3], lngRange: [166.8, 167.3] },
  { ecosystemIdx: 1, latRange: [-17.9, -17.5], lngRange: [168.1, 168.5] },
  { ecosystemIdx: 2, latRange: [-19.7, -19.2], lngRange: [169.2, 169.7] },
  { ecosystemIdx: 3, latRange: [-14.1, -13.5], lngRange: [167.3, 167.9] },
];

for (let i = 0; i < 18; i++) {
  const zoneConf = insideZoneConfigs[i % insideZoneConfigs.length];
  fishingEvents.push({
    vessel_id: vesselPrefixes[i % vesselPrefixes.length] + String(1000 + i).padStart(4, '0'),
    lat: randomBetween(zoneConf.latRange[0], zoneConf.latRange[1]),
    lng: randomBetween(zoneConf.lngRange[0], zoneConf.lngRange[1]),
    fishing_hours: +(Math.random() * 8 + 0.5).toFixed(2),
    event_date: daysAgo(i % 7),
    inside_zone: true,
    ecosystemIdx: zoneConf.ecosystemIdx,
    source: 'seed',
  });
}

// Events OUTSIDE zones
for (let i = 0; i < 12; i++) {
  fishingEvents.push({
    vessel_id: vesselPrefixes[i % vesselPrefixes.length] + String(2000 + i).padStart(4, '0'),
    lat: randomBetween(-20, -13),
    lng: randomBetween(166, 170),
    fishing_hours: +(Math.random() * 5 + 0.2).toFixed(2),
    event_date: daysAgo(i % 7),
    inside_zone: false,
    ecosystemIdx: null,
    source: 'seed',
  });
}

// ─── 5. ALERTS ──────────────────────────────────────────────────────────────
const alertsData = [
  {
    alert_type: 'illegal_fishing',
    severity: 'critical',
    description:
      'Unregistered foreign vessel detected fishing inside the Espiritu Santo Coral Reef protected zone for over 6 consecutive hours. Vessel ID: FJ-2041.',
    ecosystemIdx: 0,
    resolved: false,
    detected_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3h ago
    speciesIdxs: [0, 1], // Hawksbill, Humphead Wrasse
  },
  {
    alert_type: 'species_at_risk',
    severity: 'high',
    description:
      'Dugong population in Efate Seagrass Meadows has declined by an estimated 40% over the past season based on sighting data. Immediate seagrass protection required.',
    ecosystemIdx: 1,
    resolved: false,
    detected_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1d ago
    speciesIdxs: [3], // Dugong
  },
  {
    alert_type: 'bleaching_risk',
    severity: 'medium',
    description:
      'Sea surface temperature in Banks Island Marine Reserve is 1.8°C above seasonal average. Coral bleaching risk elevated. Monitoring increased.',
    ecosystemIdx: 3,
    resolved: false,
    detected_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), // 2d ago
    speciesIdxs: [1, 4], // Humphead Wrasse, Bumphead Parrotfish
  },
];

// ─── 6. SIGHTINGS ────────────────────────────────────────────────────────────
const sightingsData = [
  {
    speciesIdx: 0,
    lat: -15.55,
    lng: 167.05,
    reported_by: 'James Ravutia',
    description: 'Large hawksbill turtle nesting on beach, approx 90cm carapace. Photographed and released.',
    verified: true,
    sighted_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    speciesIdx: 2,
    lat: -19.45,
    lng: 169.5,
    reported_by: 'Santo Dive Centre',
    description: 'Whale shark approximately 7m sighted at 20m depth near the channel entrance, feeding on baitball.',
    verified: true,
    sighted_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    speciesIdx: 5,
    lat: -19.3,
    lng: 169.6,
    reported_by: 'Marie Tari',
    description: 'Pod of 3 humpback whales, mother and calf visible. Spectacular breaching behaviour for 20 minutes.',
    verified: true,
    sighted_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    speciesIdx: 3,
    lat: -17.72,
    lng: 168.35,
    reported_by: 'Efate Fisherman Cooperative',
    description: 'Single dugong grazing in seagrass bed near Pango village, healthy appearance.',
    verified: true,
    sighted_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    speciesIdx: 1,
    lat: -13.8,
    lng: 167.6,
    reported_by: 'Banks Island Ranger Station',
    description:
      'School of 12 humphead wrasse observed at 15m depth. First confirmed sighting in this zone in 6 months. Very encouraging.',
    verified: true,
    sighted_at: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
  },
];

// ─── MAIN SEED FUNCTION ───────────────────────────────────────────────────────
async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // --- Ecosystems ---
    console.log('🌊 Seeding ecosystems...');
    const ecoIds = [];
    for (const eco of ecosystems) {
      const { rows } = await client.query(
        `INSERT INTO ecosystems (name, zone_type, health_score, description, geojson)
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [eco.name, eco.zone_type, eco.health_score, eco.description, JSON.stringify(eco.geojson)]
      );
      ecoIds.push(rows[0].id);
    }
    console.log(`   ✓ ${ecoIds.length} ecosystems inserted`);

    // --- Species ---
    console.log('🐠 Seeding species...');
    const speciesIds = [];
    for (const sp of species) {
      const { rows } = await client.query(
        `INSERT INTO species (common_name, scientific_name, iucn_status, description, why_it_matters, image_url)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [sp.common_name, sp.scientific_name, sp.iucn_status, sp.description, sp.why_it_matters, sp.image_url]
      );
      speciesIds.push(rows[0].id);
    }
    console.log(`   ✓ ${speciesIds.length} species inserted`);

    // --- Species Zones ---
    console.log('🗺️  Seeding species_zones...');
    for (const [spIdx, ecoIdx] of speciesZoneMap) {
      await client.query(
        `INSERT INTO species_zones (species_id, ecosystem_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [speciesIds[spIdx], ecoIds[ecoIdx]]
      );
    }
    console.log(`   ✓ ${speciesZoneMap.length} species_zone links inserted`);

    // --- Fishing Events ---
    console.log('🎣 Seeding fishing events...');
    for (const ev of fishingEvents) {
      await client.query(
        `INSERT INTO fishing_events (vessel_id, lat, lng, fishing_hours, event_date, inside_zone, ecosystem_id, source)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          ev.vessel_id,
          ev.lat,
          ev.lng,
          ev.fishing_hours,
          ev.event_date,
          ev.inside_zone,
          ev.ecosystemIdx !== null ? ecoIds[ev.ecosystemIdx] : null,
          ev.source,
        ]
      );
    }
    console.log(`   ✓ ${fishingEvents.length} fishing events inserted`);

    // --- Alerts ---
    console.log('🚨 Seeding alerts...');
    const alertIds = [];
    for (const al of alertsData) {
      const { rows } = await client.query(
        `INSERT INTO alerts (alert_type, severity, description, ecosystem_id, resolved, detected_at)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [al.alert_type, al.severity, al.description, ecoIds[al.ecosystemIdx], al.resolved, al.detected_at]
      );
      const alertId = rows[0].id;
      alertIds.push(alertId);
      for (const spIdx of al.speciesIdxs) {
        await client.query(
          `INSERT INTO alert_species (alert_id, species_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [alertId, speciesIds[spIdx]]
        );
      }
    }
    console.log(`   ✓ ${alertIds.length} alerts inserted`);

    // --- Sightings ---
    console.log('👁️  Seeding sightings...');
    for (const s of sightingsData) {
      await client.query(
        `INSERT INTO sightings (species_id, lat, lng, reported_by, description, verified, sighted_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [speciesIds[s.speciesIdx], s.lat, s.lng, s.reported_by, s.description, s.verified, s.sighted_at]
      );
    }
    console.log(`   ✓ ${sightingsData.length} sightings inserted`);

    // --- Health Log (14 days of history) ---
    console.log('📊 Seeding health log...');
    let hlCount = 0;
    for (let ecoIdx = 0; ecoIdx < ecoIds.length; ecoIdx++) {
      const baseScore = ecosystems[ecoIdx].health_score;
      for (let d = 14; d >= 0; d--) {
        const score = Math.min(100, Math.max(0, baseScore + Math.round((Math.random() - 0.5) * 10)));
        const recordedAt = new Date();
        recordedAt.setDate(recordedAt.getDate() - d);
        await client.query(
          `INSERT INTO health_log (ecosystem_id, health_score, recorded_at) VALUES ($1, $2, $3)`,
          [ecoIds[ecoIdx], score, recordedAt.toISOString()]
        );
        hlCount++;
      }
    }
    console.log(`   ✓ ${hlCount} health log entries inserted`);

    await client.query('COMMIT');
    console.log('\n🌊 Ocean Guardian database seeded successfully!\n');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seed failed — transaction rolled back:', err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
