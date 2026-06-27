import { useState, useEffect } from 'react';
import { getProjections } from '../api';
import './ZonePanel.css';

function healthColour(score) {
  if (score >= 80) return '#22c55e';
  if (score >= 60) return '#14b8a6';
  if (score >= 40) return '#eab308';
  return '#ef4444';
}

function riskColour(score) {
  if (score > 70) return '#ef4444';
  if (score > 40) return '#f97316';
  return '#22c55e';
}

function riskBg(score) {
  if (score > 70) return 'rgba(239, 68, 68, 0.12)';
  if (score > 40) return 'rgba(249, 115, 22, 0.10)';
  return 'rgba(34, 197, 94, 0.07)';
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

  // ── Self-contained projection fetch ──────────────────────────
  const [projection, setProjection] = useState(null);
  const [projLoading, setProjLoading] = useState(true);

  useEffect(() => {
    setProjLoading(true);
    setProjection(null);
    getProjections()
      .then(data => {
        const match = data.find(p => Number(p.id) === Number(zone.id));
        setProjection(match || null);
      })
      .catch(err => console.warn('Projection fetch failed:', err.message))
      .finally(() => setProjLoading(false));
  }, [zone.id]);
  // ─────────────────────────────────────────────────────────────

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

      {/* ── 6-Month Risk Outlook ── */}
      <div className="zone-projection-block" style={{
        background: projection ? riskBg(projection.riskScore) : 'rgba(100,116,139,0.08)',
        border: `1px solid ${projection ? riskColour(projection.riskScore) + '40' : '#334155'}`,
      }}>
        <div className="projection-header">
          <span className="projection-icon">🔮</span>
          <span className="projection-label">6-Month Risk Outlook</span>
        </div>

        {projLoading && (
          <p style={{ color: '#64748b', fontSize: 12, margin: 0 }}>Calculating…</p>
        )}

        {!projLoading && projection && (
          <>
            <div className="projection-status">
              <h4 style={{ color: riskColour(projection.riskScore), margin: '4px 0 2px' }}>
                {projection.projection}
              </h4>
              <div className="risk-bar-track">
                <div
                  className="risk-bar-fill"
                  style={{
                    width: `${projection.riskScore}%`,
                    background: riskColour(projection.riskScore),
                  }}
                />
              </div>
              <div className="risk-score-display">
                Risk Score: <strong>{projection.riskScore} / 100</strong>
              </div>
            </div>
            <p className="projection-hint">
              Based on habitat health, fishing pressure &amp; climate alerts.
            </p>
          </>
        )}

        {!projLoading && !projection && (
          <p style={{ color: '#64748b', fontSize: 12, margin: 0 }}>
            No projection data available for this zone.
          </p>
        )}
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

      {/* Health history mini-chart */}
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
