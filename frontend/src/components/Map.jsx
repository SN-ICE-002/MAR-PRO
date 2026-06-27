import { useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, GeoJSON, CircleMarker, Popup, useMap } from 'react-leaflet';
import './Map.css';

// Health score → teal gradient colour
function healthColour(score) {
  if (score >= 80) return '#22c55e';
  if (score >= 60) return '#14b8a6';
  if (score >= 40) return '#eab308';
  return '#ef4444';
}

// IUCN status colour for popup badge
const iucnColours = { CR: '#ef4444', EN: '#f97316', VU: '#eab308', NT: '#3b82f6', LC: '#22c55e' };

function ResetView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true, duration: 1.5 });
  }, [center, zoom, map]);
  return null;
}

export default function Map({ center, zoom, ecosystems, events, sightings, onZoneClick, selectedZoneId }) {
  const geoJsonRef = useRef({});

  // Style for GeoJSON ecosystem polygons
  const zoneStyle = useCallback((feature, ecoId) => {
    const eco = ecosystems.find(e => String(e.id) === String(ecoId));
    const score = eco?.health_score || 70;
    const isSelected = String(eco?.id) === String(selectedZoneId);
    
    // Territories (EEZ) get a subtle dashed border style
    if (eco?.zone_type === 'territory') {
      return {
        color: '#94a3b8',
        weight: 1.5,
        dashArray: '10, 10',
        fillOpacity: 0.02,
        fillColor: 'transparent',
        interactive: false // This prevents the EEZ from blocking clicks on reefs
      };
    }

    const colour = healthColour(score);
    return {
      color:       isSelected ? '#ffffff' : colour,
      weight:      isSelected ? 3 : 1.5,
      opacity:     0.9,
      fillColor:   colour,
      fillOpacity: isSelected ? 0.35 : 0.15,
    };
  }, [ecosystems, selectedZoneId]);

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className="leaflet-map"
      zoomControl={true}
      scrollWheelZoom={true}
    >
      <ResetView center={center} zoom={zoom} />

      {/* ─── Dark basemap ─── */}
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />

      {/* ─── Ecosystem zone polygons ─── */}
      {ecosystems.map((eco) => {
        if (!eco.geojson) return null;
        const style = zoneStyle(null, eco.id);
        return (
          <GeoJSON
            key={eco.id}
            data={eco.geojson}
            style={() => style}
            eventHandlers={{
              click: () => onZoneClick(eco),
              mouseover: (e) => {
                e.layer.setStyle({ fillOpacity: 0.4, weight: 2.5 });
              },
              mouseout: (e) => {
                e.layer.setStyle(style);
              },
            }}
          >
            <Popup>
              <div className="map-popup">
                <div className="popup-zone-header">
                  <span className="popup-zone-icon">🏝️</span>
                  <div>
                    <strong>{eco.name}</strong>
                    <span className="popup-zone-type">{eco.zone_type?.replace(/_/g, ' ')}</span>
                  </div>
                </div>
                <div className="popup-health">
                  <span>Health Score</span>
                  <div className="popup-health-row">
                    <div className="health-bar-track" style={{ flex: 1 }}>
                      <div
                        className="health-bar-fill"
                        style={{
                          width: `${eco.health_score}%`,
                          background: healthColour(eco.health_score),
                        }}
                      />
                    </div>
                    <strong style={{ color: healthColour(eco.health_score) }}>
                      {eco.health_score}/100
                    </strong>
                  </div>
                </div>
                <div className="popup-stats">
                  <span>🐟 {eco.species_count || '–'} species</span>
                  <span>🚨 {eco.active_alerts || 0} alerts</span>
                </div>
                <p className="popup-hint">Click zone to explore species →</p>
              </div>
            </Popup>
          </GeoJSON>
        );
      })}

      {/* ─── Fishing event dots ─── */}
      {events.map((ev) => (
        <CircleMarker
          key={ev.id}
          center={[parseFloat(ev.lat), parseFloat(ev.lng)]}
          radius={ev.inside_zone ? 7 : 5}
          pathOptions={{
            color:       ev.inside_zone ? '#ef4444' : '#3b82f6',
            fillColor:   ev.inside_zone ? '#ef4444' : '#3b82f6',
            fillOpacity: ev.inside_zone ? 0.85 : 0.55,
            weight:      ev.inside_zone ? 2 : 1,
          }}
        >
          <Popup>
            <div className="map-popup">
              <div className="popup-event-header" style={{ color: ev.inside_zone ? '#f87171' : '#60a5fa' }}>
                🎣 {ev.inside_zone ? '⚠️ INSIDE PROTECTED ZONE' : 'Open water'}
              </div>
              <table className="popup-table">
                <tbody>
                  <tr><td>Vessel</td><td><strong>{ev.vessel_id}</strong></td></tr>
                  <tr><td>Hours</td><td><strong>{parseFloat(ev.fishing_hours).toFixed(1)}h</strong></td></tr>
                  <tr><td>Date</td><td><strong>{ev.event_date}</strong></td></tr>
                  {ev.zone_name && <tr><td>Zone</td><td><strong>{ev.zone_name}</strong></td></tr>}
                </tbody>
              </table>
            </div>
          </Popup>
        </CircleMarker>
      ))}

      {/* ─── Species sighting dots ─── */}
      {sightings.map((sg) => {
        const isGBIF = String(sg.source).toUpperCase() === 'GBIF';
        return (
          <CircleMarker
            key={sg.id}
            center={[parseFloat(sg.lat), parseFloat(sg.lng)]}
            radius={isGBIF ? 7 : 9}
            pathOptions={{
              color:       isGBIF ? '#8b5cf6' : '#4ade80',
              fillColor:   isGBIF ? '#8b5cf6' : '#4ade80',
              fillOpacity: isGBIF ? 0.6 : 0.8,
              weight:      isGBIF ? 1.5 : 2,
            }}
          >
            <Popup>
              <div className="map-popup">
                <div className="popup-sighting-header">
                  {isGBIF ? '🧬 Scientific Record' : '👁️ Community Sighting'}
                  {iucnColours[sg.iucn_status] && (
                    <span
                      className="badge"
                      style={{
                        background: `${iucnColours[sg.iucn_status]}22`,
                        color: iucnColours[sg.iucn_status],
                        border: `1px solid ${iucnColours[sg.iucn_status]}55`,
                        marginLeft: 8,
                      }}
                    >
                      {sg.iucn_status}
                    </span>
                  )}
                </div>
                <strong style={{ fontSize: 14 }}>{sg.species_name}</strong>
                <em style={{ display: 'block', fontSize: 11, color: '#94a3b8', marginBottom: 6 }}>
                  {sg.scientific_name}
                </em>
                <p style={{ fontSize: 12 }}>{sg.description}</p>
                <div className="popup-reporter">
                  Source: <strong>{isGBIF ? 'GBIF Registry' : sg.reported_by}</strong>
                  {' · '}
                  {new Date(sg.sighted_at).toLocaleDateString()}
                </div>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
      {/* ─── Map Legend ─── */}
      <div className="map-legend">
        <h4>Status Legend</h4>
        <div className="legend-row">
          <div className="legend-dot" style={{ backgroundColor: '#ef4444' }} />
          <span>Fishing Pressure</span>
        </div>
        <div className="legend-row">
          <div className="legend-dot" style={{ backgroundColor: '#14b8a6' }} />
          <span>Coral Health</span>
        </div>
        <div className="legend-row">
          <div className="legend-dot" style={{ backgroundColor: '#4ade80' }} />
          <span>Community Sightings</span>
        </div>
        <div className="legend-row">
          <div className="legend-dot" style={{ backgroundColor: '#8b5cf6' }} />
          <span>GBIF Records</span>
        </div>
        <div className="legend-row">
          <div className="legend-dot dash" />
          <span>National EEZ</span>
        </div>
      </div>
    </MapContainer>
  );
}
