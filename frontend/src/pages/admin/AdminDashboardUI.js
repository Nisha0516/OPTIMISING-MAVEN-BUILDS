import React, { useState, useEffect } from 'react';
import { emergencyAPI } from '../../services/api';
import './AdminStyles.css';

const AdminDashboardUI = () => {
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

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome to your car rental management system</p>
      </div>

      <div className="notifications">
        <h2>Notifications</h2>
        {loading && <p>Loading...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {emergencies.length === 0 ? (
          <p>No new emergency alerts.</p>
        ) : (
          <div className="notification-card">
            {emergencies.map((emergency) => (
              <div key={emergency._id} className="notification-item">
                <p><b>🚨 New Emergency Alert</b></p>
                <p>Emergency: {emergency.type} reported by {emergency.customer?.name}</p>
                <p>Location: {emergency.location?.latitude}, {emergency.location?.longitude}</p>
                <p>{new Date(emergency.createdAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
        <button className="mark-read-btn">Mark all read</button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Bookings</h3>
          <p>4</p>
          <span>View All</span>
        </div>
        <div className="stat-card">
          <h3>Active Bookings</h3>
          <p>1</p>
          <span>Manage</span>
        </div>
        <div className="stat-card">
          <h3>Total Revenue</h3>
          <p>$4,006</p>
          <span>View Reports</span>
        </div>
        <div className="stat-card">
          <h3>Total Cars</h3>
          <p>1</p>
          <span>Manage Cars</span>
        </div>
        <div className="stat-card">
          <h3>Total Users</h3>
          <p>9</p>
          <span>View Users</span>
        </div>
        <div className="stat-card">
          <h3>Customers</h3>
          <p>3</p>
        </div>
        <div className="stat-card">
          <h3>Owners</h3>
          <p>4</p>
        </div>
        <div className="stat-card">
          <h3>Refresh Stats</h3>
          <span>Click to refresh</span>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardUI;