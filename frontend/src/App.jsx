import { useState, useEffect, useCallback } from 'react';
import Map from './components/Map';
import StatsChart from './components/StatsChart';
import AlertPanel from './components/AlertPanel';
import ZonePanel from './components/ZonePanel';
import SightingForm from './components/SightingForm';
import { getEcosystems, getSpecies, getRecentEvents, getAlerts, getSightings, getEcosystem, getCountries } from './api';
import './App.css';

export default function App() {
  const [countries,      setCountries]     = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [ecosystems,    setEcosystems]    = useState([]);
  const [species,       setSpecies]       = useState([]);
  const [events,        setEvents]        = useState([]);
  const [alerts,        setAlerts]        = useState([]);
  const [sightings,     setSightings]     = useState([]);
  const [selectedZone,  setSelectedZone]  = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [sidebarView,   setSidebarView]   = useState('dashboard'); // 'dashboard' | 'zone' | 'report'

  // Fetch countries once on mount
  useEffect(() => {
    getCountries()
      .then(data => {
        setCountries(data);
        const vut = data.find(c => c.code === 'VUT') || data[0];
        setSelectedCountry(vut);
      })
      .catch(err => {
        console.error('Countries fetch error:', err);
        setError('Connection error: backend not reachable.');
        setLoading(false);
      });
  }, []);

  const fetchAll = useCallback(async (countryId) => {
    if (!countryId) return;
    try {
      setError(null);
      const [eco, sp, ev, al, sg] = await Promise.all([
        getEcosystems(countryId),
        getSpecies(),
        getRecentEvents(countryId),
        getAlerts(countryId),
        getSightings(countryId),
      ]);
      setEcosystems(eco);
      setSpecies(sp);
      setEvents(ev);
      setAlerts(al);
      setSightings(sg);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    if (selectedCountry) {
      fetchAll(selectedCountry.id); 
    }
  }, [fetchAll, selectedCountry]);

  const handleZoneClick = useCallback(async (ecosystem) => {
    try {
      const full = await getEcosystem(ecosystem.id);
      setSelectedZone(full);
      setSidebarView('zone');
    } catch (err) {
      console.error('Zone fetch error:', err);
    }
  }, []);

  const handleAlertResolved = useCallback(() => {
    getAlerts().then(setAlerts);
  }, []);

  const handleSightingSubmitted = useCallback(() => {
    getSightings().then(setSightings);
    setSidebarView('dashboard');
  }, []);

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-wave">
          <span /><span /><span /><span /><span />
        </div>
        <p>Initialising Ocean Guardian…</p>
      </div>
    );
  }

  return (
    <div className="app-shell">
      {/* ── Header ── */}
      <header className="app-header">
        <div className="app-logo">
          <span className="logo-icon">🌊</span>
          <div>
            <h1>Ocean Guardian</h1>
            <span className="logo-sub">{selectedCountry?.name || 'Pacific'} Marine Monitor</span>
          </div>
        </div>

        <div className="header-search">
          <div className="country-dropdown">
            <select 
              value={selectedCountry?.code || ''} 
              onChange={(e) => {
                const country = countries.find(c => c.code === e.target.value);
                setSelectedCountry(country);
              }}
            >
              {countries.map(c => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <nav className="header-nav">
          <button
            id="nav-dashboard"
            className={`nav-btn ${sidebarView === 'dashboard' ? 'active' : ''}`}
            onClick={() => setSidebarView('dashboard')}
          >
            Dashboard
          </button>
          <button
            id="nav-alerts"
            className={`nav-btn ${sidebarView === 'alerts' ? 'active' : ''}`}
            onClick={() => setSidebarView('alerts')}
          >
            Alerts
            {alerts.length > 0 && (
              <span className="alert-badge">{alerts.length}</span>
            )}
          </button>
          <button
            id="nav-report"
            className={`nav-btn ${sidebarView === 'report' ? 'active' : ''}`}
            onClick={() => setSidebarView('report')}
          >
            Report Sighting
          </button>
        </nav>

        <div className="header-status">
          <span className="status-dot live" />
          <span>{ecosystems.length} Zones · {events.length} Events (7d)</span>
        </div>
      </header>

      {error && (
        <div className="error-banner">
          ⚠️ {error}
        </div>
      )}

      {/* ── Main layout ── */}
      <main className="app-main">
        {/* Map — takes remaining space */}
        <div className="map-container">
          <Map
            center={[selectedCountry?.center_lat || -15.3767, selectedCountry?.center_lng || 166.9592]}
            zoom={selectedCountry?.zoom_level || 6}
            ecosystems={ecosystems}
            events={events}
            sightings={sightings}
            onZoneClick={handleZoneClick}
            selectedZoneId={selectedZone?.id}
          />
        </div>

        {/* Sidebar */}
        <aside className="app-sidebar">
          {sidebarView === 'dashboard' && (
            <div className="fade-slide-in">
              <StatsChart alerts={alerts} species={species} />
              <AlertPanel
                alerts={alerts}
                onResolved={handleAlertResolved}
                onViewAll={() => setSidebarView('alerts')}
                compact
              />
            </div>
          )}

          {sidebarView === 'alerts' && (
            <div className="fade-slide-in">
              <div className="sidebar-section-header">
                <button className="back-btn" onClick={() => setSidebarView('dashboard')}>← Back</button>
                <h2>All Active Alerts</h2>
              </div>
              <AlertPanel alerts={alerts} onResolved={handleAlertResolved} />
            </div>
          )}

          {sidebarView === 'zone' && selectedZone && (
            <div className="fade-slide-in">
              <ZonePanel
                zone={selectedZone}
                onClose={() => setSidebarView('dashboard')}
              />
            </div>
          )}

          {sidebarView === 'report' && (
            <div className="fade-slide-in">
              <div className="sidebar-section-header">
                <button className="back-btn" onClick={() => setSidebarView('dashboard')}>← Back</button>
                <h2>Report a Sighting</h2>
              </div>
              <SightingForm
                species={species}
                onSubmitted={handleSightingSubmitted}
                selectedCountry={selectedCountry}
              />
            </div>
          )}
        </aside>
      </main>
    </div>
  );
}
