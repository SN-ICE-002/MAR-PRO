import { resolveAlert } from '../api';
import { useState } from 'react';
import './AlertPanel.css';

const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };

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

const alertTypeLabels = {
  illegal_fishing:  '🎣 Illegal Fishing',
  species_at_risk:  '⚠️ Species at Risk',
  bleaching_risk:   '🌡️ Bleaching Risk',
  pollution:        '☠️ Pollution',
  other:            '📋 Alert',
};

function AlertCard({ alert, onResolved }) {
  const [resolving, setResolving] = useState(false);
  const [resolved,  setResolved]  = useState(false);

  const handleResolve = async () => {
    if (resolving) return;
    setResolving(true);
    try {
      await resolveAlert(alert.id);
      setResolved(true);
      setTimeout(() => onResolved(), 700);
    } catch (err) {
      console.error('Resolve error:', err);
      setResolving(false);
    }
  };

  if (resolved) {
    return (
      <div className="alert-card alert-resolved-anim">
        <span className="resolved-check">✓ Resolved</span>
      </div>
    );
  }

  return (
    <div className={`alert-card alert-${alert.severity}`} id={`alert-${alert.id}`}>
      {/* Header */}
      <div className="alert-card-header">
        <span className="alert-type-label">
          {alertTypeLabels[alert.alert_type] || '📋 Alert'}
        </span>
        <span className={`badge badge-${alert.severity}`}>{alert.severity.toUpperCase()}</span>
      </div>

      {/* Description */}
      <p className="alert-description">{alert.description}</p>

      {/* Zone + time */}
      <div className="alert-meta">
        {alert.zone_name && (
          <span className="alert-zone">📍 {alert.zone_name}</span>
        )}
        <span className="alert-time">🕐 {timeAgo(alert.detected_at)}</span>
      </div>

      {/* Species at risk */}
      {alert.species?.length > 0 && (
        <div className="alert-species">
          {alert.species.map((sp) => (
            <span key={sp.id} className={`badge badge-${sp.iucn_status}`}>
              {sp.common_name}
            </span>
          ))}
        </div>
      )}

      {/* Resolve button */}
      <button
        className="btn btn-ghost resolve-btn"
        onClick={handleResolve}
        disabled={resolving}
        id={`resolve-alert-${alert.id}`}
      >
        {resolving ? '…' : '✓ Mark resolved'}
      </button>
    </div>
  );
}

export default function AlertPanel({ alerts, onResolved, onViewAll, compact }) {
  const sorted = [...alerts].sort(
    (a, b) => (severityOrder[a.severity] || 9) - (severityOrder[b.severity] || 9)
  );

  const displayed = compact ? sorted.slice(0, 3) : sorted;

  return (
    <div className="alert-panel">
      <div className="alert-panel-header">
        <h3>
          {compact ? 'Recent Alerts' : 'All Alerts'}
          {alerts.length > 0 && (
            <span className="alert-count-badge">{alerts.length}</span>
          )}
        </h3>
        {compact && onViewAll && alerts.length > 3 && (
          <button className="btn btn-ghost view-all-btn" onClick={onViewAll}>
            View all →
          </button>
        )}
      </div>

      <div className="alert-list">
        {displayed.length === 0 ? (
          <div className="alert-empty">
            <span>✅</span>
            <p>All clear — no active alerts</p>
          </div>
        ) : (
          displayed.map((alert) => (
            <AlertCard key={alert.id} alert={alert} onResolved={onResolved} />
          ))
        )}
      </div>
    </div>
  );
}
