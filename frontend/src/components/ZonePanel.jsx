import './ZonePanel.css';

function healthColour(score) {
  if (score >= 80) return '#22c55e';
  if (score >= 60) return '#14b8a6';
  if (score >= 40) return '#eab308';
  return '#ef4444';
}

const zoneTypeIcons = {
  coral_reef:    '🪸',
  seagrass:      '🌿',
  open_water:    '🌊',
  marine_reserve:'🏞️',
};

const iucnFull = {
  CR: 'Critically Endangered',
  EN: 'Endangered',
  VU: 'Vulnerable',
  NT: 'Near Threatened',
  LC: 'Least Concern',
};

export default function ZonePanel({ zone, onClose }) {
  const colour  = healthColour(zone.health_score);
  const icon    = zoneTypeIcons[zone.zone_type] || '🌊';
  const dateStr = (d) => new Date(d).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });

  return (
    <div className="zone-panel">
      {/* Header */}
      <div className="zone-header" style={{ borderBottomColor: `${colour}40` }}>
        <div className="zone-header-top">
          <span className="zone-big-icon">{icon}</span>
          <button className="close-btn" onClick={onClose} aria-label="Close zone panel">✕</button>
        </div>
        <h2 className="zone-name">{zone.name}</h2>
        <span className="zone-type-tag">{zone.zone_type?.replace(/_/g, ' ')}</span>
      </div>

      {/* Health score */}
      <div className="zone-health-block">
        <div className="zone-health-row">
          <span className="zone-health-label">Ecosystem Health</span>
          <span className="zone-health-value" style={{ color: colour }}>
            {zone.health_score} / 100
          </span>
        </div>
        <div className="health-bar-track">
          <div
            className="health-bar-fill"
            style={{ width: `${zone.health_score}%`, background: colour }}
          />
        </div>
        <div className="zone-health-meta">
          {zone.active_alerts > 0 ? (
            <span style={{ color: '#f87171' }}>⚠️ {zone.active_alerts} active alert{zone.active_alerts !== 1 ? 's' : ''}</span>
          ) : (
            <span style={{ color: '#4ade80' }}>✅ No active alerts</span>
          )}
          <span>{zone.species?.length || 0} species present</span>
        </div>
      </div>

      {/* Description */}
      {zone.description && (
        <div className="zone-description">
          <p>{zone.description}</p>
        </div>
      )}

      {/* Species list */}
      <div className="zone-species-section">
        <h3>Species in this Zone</h3>
        {(!zone.species || zone.species.length === 0) ? (
          <p className="no-species">No species records found for this zone.</p>
        ) : (
          <div className="species-list">
            {zone.species.map((sp) => (
              <div key={sp.id} className="species-card" id={`zone-species-${sp.id}`}>
                <div className="species-card-header">
                  <span className="species-common">{sp.common_name}</span>
                  <span className={`badge badge-${sp.iucn_status}`} title={iucnFull[sp.iucn_status]}>
                    {sp.iucn_status}
                  </span>
                </div>
                <em className="species-sci">{sp.scientific_name}</em>
                {sp.why_it_matters && (
                  <p className="species-why">{sp.why_it_matters}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Health history mini-chart (text-based sparkline) */}
      {zone.health_history?.length > 0 && (
        <div className="zone-history-section">
          <h3>Health Trend (14 days)</h3>
          <div className="history-sparkline">
            {zone.health_history.map((h, i) => (
              <div key={i} className="spark-bar-wrap" title={`${dateStr(h.recorded_at)}: ${h.health_score}`}>
                <div
                  className="spark-bar"
                  style={{
                    height: `${h.health_score}%`,
                    background: healthColour(h.health_score),
                  }}
                />
              </div>
            ))}
          </div>
          <div className="spark-labels">
            <span>{dateStr(zone.health_history[0]?.recorded_at)}</span>
            <span>Today</span>
          </div>
        </div>
      )}
    </div>
  );
}
