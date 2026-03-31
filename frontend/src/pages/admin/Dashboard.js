import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import AdminNotifications from '../../components/AdminNotifications';
import './AdminStyles.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeBookings: 0,
    totalRevenue: 0,
    totalCars: 0,
    totalUsers: 0,
    totalCustomers: 0,
    totalOwners: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await adminAPI.getDashboardStats();
      setStats(response.stats || {
        totalBookings: 0,
        activeBookings: 0,
        totalRevenue: 0,
        totalCars: 0,
        totalUsers: 0,
        totalCustomers: 0,
        totalOwners: 0
      });
    } catch (err) {
      setError(err.message || 'Failed to load dashboard stats');
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-container">
        <div className="loading-state">
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome to your car rental management system</p>
      </div>

      {error && (
        <div style={{
          padding: '12px',
          background: '#fee2e2',
          color: '#dc2626',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}

      {/* Emergency Notifications Section */}
      <AdminNotifications limit={5} />

      <div className="stats-grid">
        <div 
          className="stat-card clickable"
          onClick={() => navigate('/admin/bookings')}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <h3>Total Bookings</h3>
            <p className="stat-number">{stats.totalBookings}</p>
            <span className="stat-link">View All</span>
          </div>
        </div>

        <div 
          className="stat-card clickable"
          onClick={() => navigate('/admin/bookings')}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-icon">🚗</div>
          <div className="stat-info">
            <h3>Active Bookings</h3>
            <p className="stat-number">{stats.activeBookings}</p>
            <span className="stat-link">Manage</span>
          </div>
        </div>

        <div 
          className="stat-card clickable"
          onClick={() => navigate('/admin/reports')}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h3>Total Revenue</h3>
            <p className="stat-number">${(stats.totalRevenue || 0).toLocaleString()}</p>
            <span className="stat-link">View Reports</span>
          </div>
        </div>

        <div 
          className="stat-card clickable"
          onClick={() => navigate('/admin/cars')}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-icon">🅿️</div>
          <div className="stat-info">
            <h3>Total Cars</h3>
            <p className="stat-number">{stats.totalCars}</p>
            <span className="stat-link">Manage Cars</span>
          </div>
        </div>

        <div 
          className="stat-card clickable"
          onClick={() => navigate('/admin/users')}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>Total Users</h3>
            <p className="stat-number">{stats.totalUsers}</p>
            <span className="stat-link">View Users</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👤</div>
          <div className="stat-info">
            <h3>Customers</h3>
            <p className="stat-number">{stats.totalCustomers}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🔑</div>
          <div className="stat-info">
            <h3>Owners</h3>
            <p className="stat-number">{stats.totalOwners}</p>
          </div>
        </div>

        <div 
          className="stat-card clickable"
          onClick={() => fetchDashboardStats()}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-icon">🔄</div>
          <div className="stat-info">
            <h3>Refresh Stats</h3>
            <span className="stat-link">Click to refresh</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;