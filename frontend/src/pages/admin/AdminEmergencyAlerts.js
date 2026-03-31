import React, { useState, useEffect } from 'react';
import { emergencyAPI } from '../../services/api';
import './AdminEmergencyAlerts.css';

const AdminEmergencyAlerts = () => {
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEmergencies();
  }, []);

  const fetchEmergencies = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await emergencyAPI.getAllEmergencies();
      setEmergencies(data.emergencies || []);
    } catch (err) {
      setError(err.message || 'Failed to load emergencies');
    } finally {
      setLoading(false);
    }
  };

  const updateEmergencyStatus = async (id, status) => {
    try {
      await emergencyAPI.updateEmergencyStatus(id, status);
      alert(`Emergency status updated to ${status}`);
      fetchEmergencies();
    } catch (err) {
      alert('Failed to update emergency status');
    }
  };

  return (
    <div className="admin-emergency-alerts">
      <h1 className="page-title">Emergency Alerts</h1>
      {loading && <p className="loading">Loading...</p>}
      {error && <p className="error">{error}</p>}
      {emergencies.length === 0 ? (
        <p className="no-alerts">No emergency alerts found.</p>
      ) : (
        <div className="emergency-list">
          {emergencies.map((emergency) => (
            <div key={emergency._id} className="emergency-card">
              <div className="card-header">
                <p className="emergency-type">🚨 {emergency.type}</p>
                <p className="emergency-time">{new Date(emergency.createdAt).toLocaleString()}</p>
              </div>
              <div className="card-body">
                <p><b>Customer:</b> {emergency.customer?.name}</p>
                <p><b>Car:</b> {emergency.car?.name}</p>
                <p><b>Description:</b> {emergency.description || 'N/A'}</p>
                {emergency.location && emergency.location.latitude && (
                  <a href={`https://www.google.com/maps?q=${emergency.location.latitude},${emergency.location.longitude}`} target="_blank" rel="noopener noreferrer" className="location-link">View Location</a>
                )}
              </div>
              <div className="card-actions">
                <button className="action-btn done" onClick={() => updateEmergencyStatus(emergency._id, 'done')}>Mark as Done</button>
                <button className="action-btn pending" onClick={() => updateEmergencyStatus(emergency._id, 'pending')}>Mark as Pending</button>
                <button className="action-btn noticed" onClick={() => updateEmergencyStatus(emergency._id, 'noticed')}>Mark as Noticed</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminEmergencyAlerts;
