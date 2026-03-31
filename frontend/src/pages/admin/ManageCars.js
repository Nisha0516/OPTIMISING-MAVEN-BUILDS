import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import './AdminStyles.css';

const ManageCars = () => {
  const [cars, setCars] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    price: '',
    location: '',
    available: true
  });

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getAllCars();
      console.log('Fetched cars:', response.cars);
      setCars(response.cars || []);
    } catch (error) {
      console.error('Error fetching cars:', error);
      alert('Failed to fetch cars: ' + (error.message || 'Unknown error'));
      // Fallback to mock data
      const mockCars = [
        {
          id: 1,
          name: 'Toyota Camry',
          model: 'Camry 2023',
          licensePlate: 'ABC123',
          status: 'available',
          dailyRate: 50,
          location: 'Downtown'
        },
        {
          id: 2,
          name: 'Honda Civic',
          model: 'Civic 2023',
          licensePlate: 'XYZ789',
          status: 'rented',
          dailyRate: 45,
          location: 'Airport'
        }
      ];
      setCars(mockCars);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCar = () => {
    setEditingCar(null);
    setFormData({
      name: '',
      type: '',
      price: '',
      location: '',
      available: true
    });
    setShowForm(true);
  };

  const handleEditCar = (car) => {
    setEditingCar(car);
    setFormData({
      name: car.name || '',
      type: car.type || '',
      price: car.price || '',
      location: car.location || '',
      available: car.available !== undefined ? car.available : true
    });
    setShowForm(true);
  };

  const handleSubmitCar = async (e) => {
    e.preventDefault();
    try {
      if (editingCar) {
        // Update existing car
        await adminAPI.updateCar(editingCar._id || editingCar.id, formData);
        alert('Car updated successfully!');
      } else {
        // Add new car
        await adminAPI.addCar(formData);
        alert('Car added successfully!');
      }
      setShowForm(false);
      fetchCars(); // Refresh the car list
    } catch (error) {
      alert(error.message || 'Failed to save car');
    }
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleApproveCar = async (carId) => {
    try {
      await adminAPI.approveCar(carId);
      alert('Car approved successfully!');
      fetchCars();
    } catch (error) {
      alert(error.message || 'Failed to approve car');
    }
  };

  const handleDeleteCar = async (carId) => {
    if (window.confirm('Are you sure you want to delete this car?')) {
      try {
        await adminAPI.deleteCar(carId);
        alert('Car deleted successfully!');
        fetchCars();
      } catch (error) {
        alert(error.message || 'Failed to delete car');
      }
    }
  };

  const filteredCars = cars.filter(car => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'approved') return car.approved === true;
    if (filterStatus === 'pending') return car.approved === false;
    return true;
  });

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div className="header-row">
          <div>
            <h1>Manage Cars</h1>
            <p>Manage your car rental fleet - {cars.length} total cars</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              className="btn-secondary" 
              onClick={fetchCars}
              style={{ background: '#059669' }}
            >
              🔄 Refresh
            </button>
            <button className="btn-primary" onClick={handleAddCar}>
              + Add New Car
            </button>
          </div>
        </div>
      </div>

      <div style={{ 
        marginBottom: '2rem', 
        display: 'flex', 
        gap: '12px',
        flexWrap: 'wrap'
      }}>
        <button 
          onClick={() => setFilterStatus('all')}
          style={{
            padding: '12px 24px',
            borderRadius: '10px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '0.95rem',
            transition: 'all 0.3s ease',
            background: filterStatus === 'all' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#e5e7eb',
            color: filterStatus === 'all' ? 'white' : '#374151',
            boxShadow: filterStatus === 'all' ? '0 4px 12px rgba(102, 126, 234, 0.3)' : 'none'
          }}
        >
          All Cars ({cars.length})
        </button>
        <button 
          onClick={() => setFilterStatus('pending')}
          style={{
            padding: '12px 24px',
            borderRadius: '10px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '0.95rem',
            transition: 'all 0.3s ease',
            background: filterStatus === 'pending' ? '#f59e0b' : '#e5e7eb',
            color: filterStatus === 'pending' ? 'white' : '#374151',
            boxShadow: filterStatus === 'pending' ? '0 4px 12px rgba(245, 158, 11, 0.3)' : 'none'
          }}
        >
          ⏳ Pending Approval ({cars.filter(c => !c.approved).length})
        </button>
        <button 
          onClick={() => setFilterStatus('approved')}
          style={{
            padding: '12px 24px',
            borderRadius: '10px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '0.95rem',
            transition: 'all 0.3s ease',
            background: filterStatus === 'approved' ? '#10b981' : '#e5e7eb',
            color: filterStatus === 'approved' ? 'white' : '#374151',
            boxShadow: filterStatus === 'approved' ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none'
          }}
        >
          ✓ Approved ({cars.filter(c => c.approved).length})
        </button>
      </div>

      {loading && (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔄</div>
          <p style={{ 
            color: '#6b7280', 
            fontSize: '1.1rem',
            fontWeight: '500'
          }}>
            Loading cars...
          </p>
        </div>
      )}
      
      {!loading && filteredCars.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '80px 20px',
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
            {filterStatus === 'pending' ? '⏳' : filterStatus === 'approved' ? '✓' : '🚗'}
          </div>
          <h3 style={{ 
            color: '#111827', 
            fontSize: '1.5rem', 
            marginBottom: '0.5rem',
            fontWeight: '700'
          }}>
            No {filterStatus !== 'all' ? filterStatus : ''} cars found
          </h3>
          <p style={{ color: '#6b7280', fontSize: '1rem' }}>
            {filterStatus !== 'all' 
              ? 'Try changing the filter to view other cars.' 
              : 'Start by adding a new car to your fleet.'}
          </p>
        </div>
      )}

      <div className="cards-grid">
        {filteredCars.map(car => (
          <div key={car._id || car.id} className="car-card" style={{
            border: car.approved ? '2px solid #10b981' : '2px solid #f59e0b'
          }}>
            <div style={{ position: 'relative', overflow: 'hidden', width: '100%' }}>
              {car.images && car.images[0] ? (
                <img 
                  src={car.images[0]} 
                  alt={car.name} 
                  style={{ 
                    width: '100%', 
                    height: '220px', 
                    objectFit: 'cover',
                    display: 'block',
                    margin: 0,
                    padding: 0
                  }} 
                />
              ) : (
                <div className="car-image-placeholder">🚗</div>
              )}
              {!car.approved ? (
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontWeight: '700',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)',
                  animation: 'pulse 2s infinite'
                }}>
                  ⏳ PENDING
                </div>
              ) : (
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontWeight: '700',
                  fontSize: '0.7rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                }}>
                  ✓ APPROVED
                </div>
              )}
            </div>
            <div className="car-info">
              <h3>{car.name}</h3>
              <p style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                fontSize: '0.85rem'
              }}>
                <span style={{ 
                  background: '#e0e7ff', 
                  color: '#4338ca', 
                  padding: '3px 8px', 
                  borderRadius: '4px',
                  fontWeight: '600',
                  fontSize: '0.75rem'
                }}>
                  {car.type}
                </span>
                <span>•</span>
                <span>{car.transmission}</span>
                <span>•</span>
                <span>{car.fuel}</span>
              </p>
              <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '12px',
                textAlign: 'center'
              }}>
                <div style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: '800', 
                  color: 'white',
                  lineHeight: '1'
                }}>
                  ₹{car.price}
                </div>
                <div style={{ 
                  fontSize: '0.75rem', 
                  color: 'rgba(255,255,255,0.9)',
                  marginTop: '2px',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  per day
                </div>
              </div>
              <div className="car-details">
                <span>💺 {car.seats} Seats</span>
                <span>📍 {car.location}</span>
                <span className={`status ${car.available ? 'available' : 'unavailable'}`}>
                  {car.available ? '✓ Available' : '✗ Unavailable'}
                </span>
              </div>
              {car.owner && (
                <div style={{ 
                  marginTop: '10px', 
                  padding: '8px 10px', 
                  background: '#f9fafb',
                  borderRadius: '6px',
                  borderLeft: '3px solid #667eea'
                }}>
                  <p style={{ 
                    fontSize: '0.65rem', 
                    color: '#9ca3af', 
                    margin: '0 0 3px 0',
                    textTransform: 'uppercase',
                    fontWeight: '700',
                    letterSpacing: '0.8px'
                  }}>
                    Owner
                  </p>
                  <p style={{ 
                    fontSize: '0.85rem', 
                    color: '#374151', 
                    margin: 0,
                    fontWeight: '700',
                    lineHeight: '1.3'
                  }}>
                    {car.owner.name}
                  </p>
                  <p style={{ 
                    fontSize: '0.75rem', 
                    color: '#6b7280', 
                    margin: '2px 0 0 0',
                    lineHeight: '1.3'
                  }}>
                    {car.owner.email}
                  </p>
                </div>
              )}
            </div>
            <div className="car-actions" style={{ gap: '10px' }}>
              {!car.approved && (
                <button 
                  onClick={() => handleApproveCar(car._id || car.id)}
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '700',
                    fontSize: '0.9rem',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                    flex: 1
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                  }}
                >
                  ✓ Approve Car
                </button>
              )}
              <button 
                className="btn-secondary"
                onClick={() => handleEditCar(car)}
                style={{ flex: car.approved ? 1 : 'initial' }}
              >
                ✏️ Edit
              </button>
              <button 
                className="btn-danger"
                onClick={() => handleDeleteCar(car._id || car.id)}
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Car Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingCar ? 'Edit Car' : 'Add New Car'}</h2>
            <form onSubmit={handleSubmitCar}>
              <div className="form-row">
                <div className="form-group">
                  <label>Car Name *</label>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name} 
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Car Type *</label>
                  <select 
                    name="type" 
                    value={formData.type}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="Sedan">Sedan</option>
                    <option value="SUV">SUV</option>
                    <option value="Hatchback">Hatchback</option>
                    <option value="Luxury">Luxury</option>
                    <option value="Sports">Sports</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Price per Day (₹) *</label>
                  <input 
                    type="number" 
                    name="price"
                    value={formData.price}
                    onChange={handleFormChange}
                    required
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>Location *</label>
                  <input 
                    type="text" 
                    name="location"
                    value={formData.location}
                    onChange={handleFormChange}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    name="available"
                    checked={formData.available}
                    onChange={handleFormChange}
                  />
                  <span>Available for booking</span>
                </label>
              </div>
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingCar ? '✓ Update Car' : '+ Add Car'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCars;