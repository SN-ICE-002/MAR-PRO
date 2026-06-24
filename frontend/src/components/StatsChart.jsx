import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from 'recharts';
import { getEventSummary } from '../api';
import './StatsChart.css';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <p className="tooltip-label">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: <strong>{parseFloat(p.value).toFixed(1)}h</strong>
        </p>
      ))}
    </div>
  );
};

export default function StatsChart({ alerts, species }) {
  const [chartData, setChartData] = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    getEventSummary()
      .then((rows) => {
        const data = rows.map((r) => ({
          date: new Date(r.event_date).toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric' }),
          'In Zone':  parseFloat(r.hours_in_zone   || 0).toFixed(1),
          'Outside':  parseFloat(r.hours_outside_zone || 0).toFixed(1),
          events:     parseInt(r.event_count),
        }));
        setChartData(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const criticalAlerts = alerts.filter(a => a.severity === 'critical').length;
  const highAlerts     = alerts.filter(a => a.severity === 'high').length;

  return (
    <div className="stats-chart-section">
      {/* ── Stat cards ── */}
      <div className="stat-cards">
        <div className="stat-card" id="stat-alerts">
          <div className="stat-icon" style={{ background: 'rgba(239,68,68,0.15)' }}>🚨</div>
          <div>
            <div className="stat-value" style={{ color: '#f87171' }}>{alerts.length}</div>
            <div className="stat-label">Active Alerts</div>
          </div>
          {criticalAlerts > 0 && (
            <span className="badge badge-critical" style={{ marginLeft: 'auto' }}>
              {criticalAlerts} CRITICAL
            </span>
          )}
        </div>

        <div className="stat-card" id="stat-species">
          <div className="stat-icon" style={{ background: 'rgba(45,212,191,0.12)' }}>🐠</div>
          <div>
            <div className="stat-value" style={{ color: '#2dd4bf' }}>{species.length}</div>
            <div className="stat-label">Species Tracked</div>
          </div>
          <span className="badge" style={{ marginLeft: 'auto', fontSize: 9 }}>
            {species.filter(s => s.iucn_status === 'CR').length} CR
          </span>
        </div>
      </div>

      {/* ── Fishing pressure chart ── */}
      <div className="chart-wrapper">
        <div className="chart-header">
          <h3>Fishing Pressure</h3>
          <span className="chart-sub">Last 7 days · hours</span>
        </div>
        {loading ? (
          <div className="chart-loading">
            <div className="loading-shimmer" style={{ height: 120, borderRadius: 8 }} />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={chartData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis
                dataKey="date"
                tick={{ fill: '#64748b', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#64748b', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 11, color: '#94a3b8', paddingTop: 4 }}
              />
              <Bar dataKey="In Zone"  stackId="a" fill="#ef4444" radius={[0,0,0,0]} />
              <Bar dataKey="Outside"  stackId="a" fill="#3b82f6" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        )}

        {/* Chart legend */}
        <div className="chart-legend">
          <span className="legend-item"><span className="dot" style={{background:'#ef4444'}} />Inside protected zone</span>
          <span className="legend-item"><span className="dot" style={{background:'#3b82f6'}} />Open water</span>
        </div>
      </div>
    </div>
  );
}
