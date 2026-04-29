import React, { useState } from 'react';
import './EmergencyButton.css';

const emergencyTypes = [
  { id: 'breakdown', label: '🔧 Car Breakdown', priority: 'high', description: 'Engine or mechanical failure' },
  { id: 'puncture', label: '🛞 Tire Puncture', priority: 'high', description: 'Flat or damaged tire' },
  { id: 'fuel', label: '⛽ Out of Fuel', priority: 'medium', description: 'Need fuel refill' },
  { id: 'locked', label: '🔒 Keys Locked Inside', priority: 'medium', description: 'Keys stuck in car' },
  { id: 'accident', label: '🚔 Accident', priority: 'critical', description: 'Vehicle collision or damage' },
  { id: 'medical', label: '🚑 Medical Emergency', priority: 'critical', description: 'Health emergency' },
  { id: 'key_lost', label: '🗝️ Key Lost/Broken', priority: 'high', description: 'Lost or damaged keys' },
  { id: 'other', label: '❓ Other Issue', priority: 'medium', description: 'Other problems' }
];

const EmergencyModal = ({ 
  location, 
  locationError, 
  onSubmit, 
  onClose, 
  onRetryLocation, 
  loading,
  carName 
}) => {
  const [selectedType, setSelectedType] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    if (!selectedType) {
      alert('⚠️ Please select the type of emergency');
      return;
    }
    onSubmit(selectedType, description);
  };

  const selectedEmergency = emergencyTypes.find(t => t.id === selectedType);

  return (
    <div className="emergency-modal-overlay" onClick={onClose}>
      <div className="emergency-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="emergency-modal-header">
          <div className="emergency-modal-title">
            <span className="emergency-icon-large">🚨</span>
            <h2>Emergency Assistance</h2>
          </div>
          <button 
            className="emergency-close-btn" 
            onClick={onClose}
            disabled={loading}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="emergency-modal-body">
          <div className="emergency-info-box">
            <p className="emergency-info-text">
              <strong>Need help with {carName}?</strong><br/>
              Select the emergency type below. We'll immediately notify the owner and admin with your location.
            </p>
          </div>

          {/* Emergency Type Selection */}
          <div className="emergency-section">
            <label className="emergency-section-label">What happened?</label>
            <div className="emergency-types-grid">
              {emergencyTypes.map(type => (
                <button
                  key={type.id}
                  className={`emergency-type-btn ${selectedType === type.id ? 'selected' : ''} priority-${type.priority}`}
                  onClick={() => setSelectedType(type.id)}
                  disabled={loading}
                  title={type.description}
                >
                  <span className="emergency-type-label">{type.label}</span>
                  {type.priority === 'critical' && (
                    <span className="critical-badge">URGENT</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          {selectedType && (
            <div className="emergency-section">
              <label className="emergency-section-label">
                Additional Details (Optional)
              </label>
              <textarea
                className="emergency-description-input"
                placeholder={`Describe the issue... For example:\n- What happened?\n- Where exactly are you?\n- Any landmarks nearby?\n- How many passengers with you?`}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="4"
                disabled={loading}
              />
            </div>
          )}

          {/* Location Status */}
          <div className="emergency-section">
            <label className="emergency-section-label">Your Location</label>
            
            {!location && !locationError && (
              <div className="location-status loading">
                <div className="location-spinner"></div>
                <p>📍 Getting your location...</p>
              </div>
            )}

            {location && !location.error && (
              <div className="location-status success">
                <p className="location-success-text">
                  ✅ <strong>Location captured successfully!</strong>
                </p>
                <div className="location-coords">
                  <small>
                    📍 Coordinates: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                  </small>
                  <small>
                    🎯 Accuracy: ±{Math.round(location.accuracy)}m
                  </small>
                </div>
                <a
                  href={`https://www.google.com/maps?q=${location.latitude},${location.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="location-map-link"
                >
                  🗺️ View on Google Maps
                </a>
              </div>
            )}

            {(locationError || (location && location.error)) && (
              <div className="location-status error">
                <p className="location-error-text">
                  ⚠️ <strong>Location unavailable</strong>
                </p>
                <p className="location-error-desc">
                  {locationError || location.error}
                </p>
                <button 
                  className="retry-location-btn"
                  onClick={onRetryLocation}
                  disabled={loading}
                >
                  🔄 Try Again
                </button>
                <p className="location-manual-note">
                  Please describe your location in the details above
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="emergency-actions">
            <button 
              className="btn-emergency-submit"
              onClick={handleSubmit}
              disabled={loading || !selectedType}
            >
              {loading ? (
                <>
                  <span className="loading-spinner-small"></span>
                  Sending Alert...
                </>
              ) : (
                <>
                  🚨 Send Emergency Alert
                </>
              )}
            </button>
            
            <button 
              className="btn-emergency-cancel"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
          </div>

          {/* Emergency Contacts */}
          <div className="emergency-contacts-section">
            <p className="emergency-contacts-label">Or call directly:</p>
            <div className="emergency-contact-buttons">
              <a href="tel:+911234567890" className="contact-btn support">
                📞 Support: +91-1234567890
              </a>
              <a href="tel:108" className="contact-btn emergency-services">
                🚑 Emergency: 108
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyModal;
