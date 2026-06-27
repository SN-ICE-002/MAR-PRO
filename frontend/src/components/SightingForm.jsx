import { useState } from 'react';
import { postSighting } from '../api';
import './SightingForm.css';

const DEFAULT_FORM = {
  species_id:  '',
  lat:         '',
  lng:         '',
  reported_by: '',
  description: '',
};

export default function SightingForm({ species, onSubmitted, selectedCountry }) {
  const [form,       setForm]       = useState(DEFAULT_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [success,    setSuccess]    = useState(false);
  const [error,      setError]      = useState('');

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.lat || !form.lng) {
      setError('Latitude and longitude are required.');
      return;
    }
    const latN = parseFloat(form.lat);
    const lngN = parseFloat(form.lng);
    if (isNaN(latN) || isNaN(lngN)) {
      setError('Please enter valid numeric coordinates.');
      return;
    }

    // Dynamic bbox validation based on selected country
    if (selectedCountry?.bbox) {
       const { minLat, maxLat, minLng, maxLng } = selectedCountry.bbox;
       // Allow a small buffer (0.5 degrees) for reports near boundaries
       if (latN < minLat - 0.5 || latN > maxLat + 0.5 || lngN < minLng - 0.5 || lngN > maxLng + 0.5) {
         setError(`Please enter coordinates within ${selectedCountry.name}'s region.`);
         return;
       }
    }

    setSubmitting(true);
    setError('');
    try {
      await postSighting({
        species_id:  form.species_id ? parseInt(form.species_id) : null,
        lat:         latN,
        lng:         lngN,
        reported_by: form.reported_by.trim() || 'Anonymous',
        description: form.description.trim() || null,
        country_id:  selectedCountry?.id || null
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setForm(DEFAULT_FORM);
        onSubmitted();
      }, 2500);
    } catch (err) {
      setError(err.response?.data?.error || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="sighting-success">
        <div className="success-icon">🐋</div>
        <h3>Thank you!</h3>
        <p>Your sighting has been submitted. It will appear on the map once verified by our team.</p>
      </div>
    );
  }

  return (
    <form className="sighting-form" onSubmit={handleSubmit} id="sighting-form">
      <div className="form-intro">
        <p>Help us protect {selectedCountry?.name || "the ocean"} by reporting what you see. All community sightings help us track species and identify threats.</p>
      </div>

      {/* Species */}
      <div className="form-field">
        <label className="form-label" htmlFor="species_id">Species</label>
        <select
          id="species_id"
          name="species_id"
          className="form-input"
          value={form.species_id}
          onChange={handleChange}
        >
          <option value="">— Select species (optional) —</option>
          {species.map((sp) => (
            <option key={sp.id} value={sp.id}>
              {sp.common_name} ({sp.iucn_status})
            </option>
          ))}
        </select>
      </div>

      {/* Coordinates */}
      <div className="form-row">
        <div className="form-field">
          <label className="form-label" htmlFor="lat">Latitude *</label>
          <input
            id="lat"
            name="lat"
            type="number"
            step="0.000001"
            placeholder={selectedCountry?.center_lat.toFixed(3) || "-16.500"}
            className="form-input"
            value={form.lat}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-field">
          <label className="form-label" htmlFor="lng">Longitude *</label>
          <input
            id="lng"
            name="lng"
            type="number"
            step="0.000001"
            placeholder={selectedCountry?.center_lng.toFixed(3) || "167.500"}
            className="form-input"
            value={form.lng}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="coord-hint">
        💡 {selectedCountry ? `${selectedCountry.name} is approx. lat ${selectedCountry.bbox.minLat} to ${selectedCountry.bbox.maxLat}` : "Please enter decimal degrees"}
      </div>

      {/* Reporter */}
      <div className="form-field">
        <label className="form-label" htmlFor="reported_by">Your Name</label>
        <input
          id="reported_by"
          name="reported_by"
          type="text"
          placeholder="Anonymous"
          className="form-input"
          value={form.reported_by}
          onChange={handleChange}
          maxLength={100}
        />
      </div>

      {/* Description */}
      <div className="form-field">
        <label className="form-label" htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          rows={4}
          placeholder="Describe what you saw — species behaviour, size, number, any concerns…"
          className="form-input"
          value={form.description}
          onChange={handleChange}
          style={{ resize: 'vertical', minHeight: 90 }}
        />
      </div>

      {error && (
        <div className="form-error">{error}</div>
      )}

      <button
        type="submit"
        id="submit-sighting"
        className="btn btn-teal submit-btn"
        disabled={submitting}
      >
        {submitting ? '⏳ Submitting…' : '🌊 Submit Sighting'}
      </button>
    </form>
  );
}
