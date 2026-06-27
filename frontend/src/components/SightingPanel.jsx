
import './SightingPanel.css';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days  = Math.floor(hours / 24);
  if (days  > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (mins  > 0) return `${mins}m ago`;
  return 'just now';
}

function SightingCard({ sighting }) {
  return (
    <div className="sighting-card">
      <div className="sighting-card-header">
        <span className="sighting-icon">👁️</span>
        <div className="sighting-main">
          <strong>{sighting.species_name || 'Unknown Species'}</strong>
          <span className="sighting-meta">🕐 {timeAgo(sighting.sighted_at)}</span>
        </div>
      </div>
      <p className="sighting-desc">{sighting.description || 'No description provided.'}</p>
      <div className="sighting-footer">
        <span className="sighting-reporter">By {sighting.reported_by}</span>
        {sighting.verified && <span className="verified-badge">✓ Verified</span>}
      </div>
    </div>
  );
}

export default function SightingPanel({ sightings, compact }) {
  const displayed = compact ? sightings.slice(0, 3) : sightings;

  return (
    <div className="sighting-panel">
      <div className="sighting-panel-header">
        <h3>Community Sightings</h3>
        {sightings.length > 0 && (
          <span className="sighting-count-badge">{sightings.length}</span>
        )}
      </div>

      <div className="sighting-list">
        {displayed.length === 0 ? (
          <div className="sighting-empty">
            <p>No sightings reported yet in this region.</p>
          </div>
        ) : (
          displayed.map((s) => (
            <SightingCard key={s.id} sighting={s} />
          ))
        )}
      </div>
    </div>
  );
}
