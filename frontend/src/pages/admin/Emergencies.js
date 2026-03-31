import React, { useState, useEffect } from 'react';
import { emergencyAPI } from '../../services/api';
import './AdminStyles.css';

const Emergencies = () => {
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedEmergency, setSelectedEmergency] = useState(null);

  const statusFilters = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'acknowledged', label: 'Acknowledged' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  useEffect(() => {
    fetchEmergencies();
  }, [filterStatus]);

  const fetchEmergencies = async () => {
    setLoading(true);
    setError('');
    try {
      const params = filterStatus !== 'all' ? { status: filterStatus } : {};
      const data = await emergencyAPI.getAllEmergencies(params);
      
      if (data.success) {
        setEmergencies(data.emergencies || []);
      } else {
        setError(data.message || 'Failed to load emergencies');
      }
    } catch (err) {
      console.error('Error fetching emergencies:', err);
      setError(err.message || 'Failed to load emergencies. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (emergencyId, newStatus) => {
    try {
      const data = await emergencyAPI.updateEmergencyStatus(emergencyId, newStatus);
      
      if (data.success) {
        fetchEmergencies();
        setSelectedEmergency(null);
        alert('Emergency status updated successfully!');
      } else {
        alert(data.message || 'Failed to update status');
      }
    } catch (err) {
      console.error('Error updating status:', err);
      alert(err.message || 'Failed to update emergency status');
    }
  };

  const handleResolve = async (emergencyId) => {
    if (!window.confirm('Are you sure you want to resolve this emergency?')) {
      return;
    }

    try {
      const data = await emergencyAPI.resolveEmergency(emergencyId);
      
      if (data.success) {
        fetchEmergencies();
        setSelectedEmergency(null);
        alert('Emergency resolved successfully!');
      } else {
        alert(data.message || 'Failed to resolve emergency');
      }
    } catch (err) {
      console.error('Error resolving emergency:', err);
      alert(err.message || 'Failed to resolve emergency');
    }
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      pending: { bg: '#fef3c7', color: '#92400e', text: 'Pending' },
      acknowledged: { bg: '#dbeafe', color: '#1e40af', text: 'Acknowledged' },
      in_progress: { bg: '#fde68a', color: '#78350f', text: 'In Progress' },
      resolved: { bg: '#d1fae5', color: '#065f46', text: 'Resolved' },
      cancelled: { bg: '#fee2e2', color: '#991b1b', text: 'Cancelled' },
    };
    const style = statusStyles[status] || statusStyles.pending;
    return (
      <span style={{
        background: style.bg,
        color: style.color,
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '0.75rem',
        fontWeight: '600',
      }}>
        {style.text}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityStyles = {
      low: { bg: '#d1fae5', color: '#065f46' },
      medium: { bg: '#fde68a', color: '#78350f' },
      high: { bg: '#fed7aa', color: '#9a3412' },
      critical: { bg: '#fee2e2', color: '#991b1b' },
    };
    const style = priorityStyles[priority] || priorityStyles.medium;
    return (
      <span style={{
        background: style.bg,
        color: style.color,
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '0.75rem',
        fontWeight: '600',
      }}>
        {priority?.toUpperCase() || 'MEDIUM'}
      </span>
    );
  };

  const getLocationLink = (location) => {
    if (!location || location.error) return 'Location not available';
    const { latitude, longitude } = location;
    return (
      <a
        href={`https://www.google.com/maps?q=${latitude},${longitude}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: '#4f46e5', textDecoration: 'underline' }}
      >
        View on Google Maps ({latitude.toFixed(6)}, {longitude.toFixed(6)})
      </a>
    );
  };

  if (loading) {
    return (
      <div className="admin-container">
        <div className="loading-state">
          <p>Loading emergencies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>🚨 Emergency Management</h1>
        <p>Monitor and manage all emergency alerts from customers</p>
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

      {/* Filter Section - Status Nav Bar */}
      <div className="emergency-filters-row">
        <div className="emergency-status-nav">
          <span className="emergency-status-label">Filter by status:</span>
          {statusFilters.map((item) => (
            <button
              key={item.value}
              type="button"
              className={`emergency-status-tab ${filterStatus === item.value ? 'active' : ''}`}
              onClick={() => setFilterStatus(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="emergency-refresh-btn"
          onClick={fetchEmergencies}
        >
          🔄 Refresh
        </button>
      </div>

      {/* Emergencies List */}
      {emergencies.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <p style={{ fontSize: '1.125rem', color: '#666' }}>
            No emergencies found
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {emergencies.map((emergency) => (
            <div
              key={emergency._id}
              style={{
                background: 'white',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                border: emergency.priority === 'critical' ? '2px solid #dc2626' : '1px solid #e5e7eb',
                cursor: 'pointer',
                transition: 'transform 0.2s'
              }}
              onClick={() => setSelectedEmergency(emergency)}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                <div>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', color: '#111' }}>
                    🚨 {emergency.type?.replace('_', ' ').toUpperCase()}
                  </h3>
                  <p style={{ margin: '4px 0', color: '#666' }}>
                    <strong>Customer:</strong> {emergency.customer?.name || 'N/A'} ({emergency.customer?.phone || 'N/A'})
                  </p>
                  <p style={{ margin: '4px 0', color: '#666' }}>
                    <strong>Car:</strong> {emergency.car?.name || 'N/A'} - {emergency.car?.registrationNumber || 'N/A'}
                  </p>
                  <p style={{ margin: '4px 0', color: '#666' }}>
                    <strong>Owner:</strong> {emergency.owner?.name || 'N/A'} ({emergency.owner?.phone || 'N/A'})
                  </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                  {getStatusBadge(emergency.status)}
                  {getPriorityBadge(emergency.priority)}
                </div>
              </div>

              {emergency.description && (
                <p style={{ margin: '10px 0', color: '#666', fontStyle: 'italic' }}>
                  "{emergency.description}"
                </p>
              )}

              <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #e5e7eb' }}>
                <p style={{ margin: '4px 0', fontSize: '0.875rem', color: '#666' }}>
                  <strong>Location:</strong> {getLocationLink(emergency.location)}
                </p>
                <p style={{ margin: '4px 0', fontSize: '0.875rem', color: '#666' }}>
                  <strong>Reported:</strong> {new Date(emergency.createdAt).toLocaleString()}
                </p>
                {emergency.resolvedAt && (
                  <p style={{ margin: '4px 0', fontSize: '0.875rem', color: '#666' }}>
                    <strong>Resolved:</strong> {new Date(emergency.resolvedAt).toLocaleString()}
                  </p>
                )}
              </div>

              {emergency.status !== 'resolved' && emergency.status !== 'cancelled' && (
                <div style={{ marginTop: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {emergency.status === 'pending' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusUpdate(emergency._id, 'acknowledged');
                      }}
                      style={{
                        padding: '8px 16px',
                        background: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.875rem'
                      }}
                    >
                      ✓ Acknowledge
                    </button>
                  )}
                  {emergency.status === 'acknowledged' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusUpdate(emergency._id, 'in_progress');
                      }}
                      style={{
                        padding: '8px 16px',
                        background: '#f59e0b',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.875rem'
                      }}
                    >
                      🔄 Mark In Progress
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleResolve(emergency._id);
                    }}
                    style={{
                      padding: '8px 16px',
                      background: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.875rem'
                    }}
                  >
                    ✅ Resolve
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Emergency Detail Modal */}
      {selectedEmergency && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
          onClick={() => setSelectedEmergency(null)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '30px',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}>🚨 Emergency Details</h2>
              <button
                onClick={() => setSelectedEmergency(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                ×
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <strong>Type:</strong> {selectedEmergency.type?.replace('_', ' ').toUpperCase()}
              </div>
              <div>
                <strong>Status:</strong> {getStatusBadge(selectedEmergency.status)}
              </div>
              <div>
                <strong>Priority:</strong> {getPriorityBadge(selectedEmergency.priority)}
              </div>
              <div>
                <strong>Customer:</strong> {selectedEmergency.customer?.name} ({selectedEmergency.customer?.email}, {selectedEmergency.customer?.phone})
              </div>
              <div>
                <strong>Owner:</strong> {selectedEmergency.owner?.name} ({selectedEmergency.owner?.email}, {selectedEmergency.owner?.phone})
              </div>
              <div>
                <strong>Car:</strong> {selectedEmergency.car?.name} ({selectedEmergency.car?.type}) - {selectedEmergency.car?.registrationNumber}
              </div>
              {selectedEmergency.description && (
                <div>
                  <strong>Description:</strong>
                  <p style={{ marginTop: '5px', padding: '10px', background: '#f9fafb', borderRadius: '6px' }}>
                    {selectedEmergency.description}
                  </p>
                </div>
              )}
              <div>
                <strong>Location:</strong>
                <p style={{ marginTop: '5px' }}>{getLocationLink(selectedEmergency.location)}</p>
                {selectedEmergency.location && !selectedEmergency.location.error && (
                  <p style={{ fontSize: '0.875rem', color: '#666', marginTop: '5px' }}>
                    Accuracy: {selectedEmergency.location.accuracy?.toFixed(0)}m
                  </p>
                )}
              </div>
              <div>
                <strong>Reported At:</strong> {new Date(selectedEmergency.createdAt).toLocaleString()}
              </div>
              {selectedEmergency.resolvedAt && (
                <div>
                  <strong>Resolved At:</strong> {new Date(selectedEmergency.resolvedAt).toLocaleString()}
                </div>
              )}
              {selectedEmergency.notes && (
                <div>
                  <strong>Notes:</strong>
                  <p style={{ marginTop: '5px', padding: '10px', background: '#f9fafb', borderRadius: '6px' }}>
                    {selectedEmergency.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Emergencies;

