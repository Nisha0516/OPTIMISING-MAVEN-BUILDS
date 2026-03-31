import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ManageOwners = () => {
  const [owners, setOwners] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    // Mock data - replace with actual API calls
    const mockOwners = [
      {
        id: 1,
        name: 'John Smith',
        email: 'john.smith@example.com',
        phone: '+1 (555) 123-4567',
        joinDate: '2024-01-15',
        status: 'active',
        totalCars: 3,
        totalEarnings: 12500,
        cars: [
          { id: 1, name: 'Toyota Camry 2023', licensePlate: 'ABC123', status: 'available', dailyRate: 50 },
          { id: 2, name: 'Honda Civic 2023', licensePlate: 'XYZ789', status: 'rented', dailyRate: 45 },
          { id: 3, name: 'Ford Mustang 2022', licensePlate: 'MUS123', status: 'maintenance', dailyRate: 75 }
        ]
      },
      {
        id: 2,
        name: 'Sarah Johnson',
        email: 'sarah.j@example.com',
        phone: '+1 (555) 987-6543',
        joinDate: '2024-02-01',
        status: 'active',
        totalCars: 2,
        totalEarnings: 8900,
        cars: [
          { id: 4, name: 'BMW X5 2023', licensePlate: 'BMW456', status: 'available', dailyRate: 90 },
          { id: 5, name: 'Mercedes C-Class', licensePlate: 'MER789', status: 'available', dailyRate: 85 }
        ]
      },
      {
        id: 3,
        name: 'Mike Chen',
        email: 'mike.chen@example.com',
        phone: '+1 (555) 456-7890',
        joinDate: '2024-01-20',
        status: 'inactive',
        totalCars: 1,
        totalEarnings: 3200,
        cars: [
          { id: 6, name: 'Hyundai Elantra 2023', licensePlate: 'HYU123', status: 'available', dailyRate: 40 }
        ]
      },
      {
        id: 4,
        name: 'Emily Davis',
        email: 'emily.davis@example.com',
        phone: '+1 (555) 234-5678',
        joinDate: '2024-03-10',
        status: 'active',
        totalCars: 4,
        totalEarnings: 21500,
        cars: [
          { id: 7, name: 'Audi A4 2023', licensePlate: 'AUD123', status: 'rented', dailyRate: 80 },
          { id: 8, name: 'Tesla Model 3', licensePlate: 'TES123', status: 'available', dailyRate: 95 },
          { id: 9, name: 'Jeep Wrangler', licensePlate: 'JEE456', status: 'available', dailyRate: 70 },
          { id: 10, name: 'Subaru Outback', licensePlate: 'SUB789', status: 'maintenance', dailyRate: 60 }
        ]
      }
    ];
    setOwners(mockOwners);
  }, []);

  const filteredOwners = owners.filter(owner => {
    const matchesSearch = owner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         owner.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || owner.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const toggleOwnerStatus = (ownerId) => {
    setOwners(owners.map(owner =>
      owner.id === ownerId 
        ? { ...owner, status: owner.status === 'active' ? 'inactive' : 'active' }
        : owner
    ));
  };

  const getStatusBadge = (status) => {
    return status === 'active' ? 'status-active' : 'status-inactive';
  };

  const getCarStatusBadge = (status) => {
    const statusClasses = {
      available: 'status-active',
      rented: 'status-completed',
      maintenance: 'status-warning'
    };
    return statusClasses[status] || 'status-inactive';
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Manage Car Owners</h1>
        <p>Manage owner accounts and their car listings</p>
      </div>

      {/* Stats Overview */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>Total Owners</h3>
            <p className="stat-number">{owners.length}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🚗</div>
          <div className="stat-info">
            <h3>Total Cars Listed</h3>
            <p className="stat-number">{owners.reduce((sum, owner) => sum + owner.totalCars, 0)}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h3>Total Earnings</h3>
            <p className="stat-number">${owners.reduce((sum, owner) => sum + owner.totalEarnings, 0).toLocaleString()}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h3>Active Owners</h3>
            <p className="stat-number">{owners.filter(o => o.status === 'active').length}</p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="filters-section">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search owners by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            All Owners
          </button>
          <button 
            className={`filter-btn ${filterStatus === 'active' ? 'active' : ''}`}
            onClick={() => setFilterStatus('active')}
          >
            Active
          </button>
          <button 
            className={`filter-btn ${filterStatus === 'inactive' ? 'active' : ''}`}
            onClick={() => setFilterStatus('inactive')}
          >
            Inactive
          </button>
        </div>
      </div>

      {/* Owners List */}
      <div className="owners-list">
        {filteredOwners.map(owner => (
          <div key={owner.id} className="owner-card">
            <div className="owner-header">
              <div className="owner-info">
                <h3>{owner.name}</h3>
                <div className="owner-details">
                  <span>📧 {owner.email}</span>
                  <span>📞 {owner.phone}</span>
                  <span>📅 Joined: {owner.joinDate}</span>
                  <span className={`status-badge ${getStatusBadge(owner.status)}`}>
                    {owner.status}
                  </span>
                </div>
              </div>
              <div className="owner-stats">
                <div className="owner-stat">
                  <strong>{owner.totalCars}</strong>
                  <span>Cars</span>
                </div>
                <div className="owner-stat">
                  <strong>${owner.totalEarnings.toLocaleString()}</strong>
                  <span>Earnings</span>
                </div>
                <div className="owner-actions">
                  <button className="btn-primary">View Profile</button>
                  <button 
                    className={`btn-${owner.status === 'active' ? 'warning' : 'secondary'}`}
                    onClick={() => toggleOwnerStatus(owner.id)}
                  >
                    {owner.status === 'active' ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            </div>

            {/* Cars List */}
            <div className="cars-section">
              <h4>Car Listings ({owner.cars.length})</h4>
              <div className="cars-grid">
                {owner.cars.map(car => (
                  <div key={car.id} className="car-item">
                    <div className="car-image">
                      <div className="car-image-placeholder">🚗</div>
                    </div>
                    <div className="car-details">
                      <h5>{car.name}</h5>
                      <div className="car-info">
                        <span>Plate: {car.licensePlate}</span>
                        <span className={`status-badge ${getCarStatusBadge(car.status)}`}>
                          {car.status}
                        </span>
                        <span>${car.dailyRate}/day</span>
                      </div>
                    </div>
                    <div className="car-actions">
                      <button className="btn-secondary">Edit</button>
                      <button className="btn-primary">View</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredOwners.length === 0 && (
        <div className="no-data">
          <p>No owners found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default ManageOwners;