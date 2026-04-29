import React, { useState, useEffect } from 'react';
import CustomerLayout from './CustomerLayout';
import CarCard from './components/CarCard/CarCard';
import SearchFilter from './components/SearchFilter/SearchFilter';
import { carsAPI } from '../../services/api';
import './Home.css';

const CustomerHome = () => {
  const [cars, setCars] = useState([]);
  const [filteredCars, setFilteredCars] = useState([]);
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line no-unused-vars
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    priceRange: '',
    transmission: '',
    fuelType: ''
  });

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await carsAPI.getCars();
      // Filter to show only approved and available cars
      const approvedCars = (response.cars || []).filter(car => car.approved === true);
      setCars(approvedCars);
      setFilteredCars(approvedCars);
    } catch (err) {
      setError(err.message || 'Failed to load cars');
      console.error('Error fetching cars:', err);
      // Don't use mock data - show empty state instead
      setCars([]);
      setFilteredCars([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    
    let filtered = cars;

    // Search filter
    if (newFilters.search) {
      filtered = filtered.filter(car =>
        car.name.toLowerCase().includes(newFilters.search.toLowerCase()) ||
        car.location.toLowerCase().includes(newFilters.search.toLowerCase())
      );
    }

    // Type filter
    if (newFilters.type) {
      filtered = filtered.filter(car => car.type === newFilters.type);
    }

    // Transmission filter
    if (newFilters.transmission) {
      filtered = filtered.filter(car => car.transmission === newFilters.transmission);
    }

    // Fuel type filter
    if (newFilters.fuelType) {
      filtered = filtered.filter(car => car.fuelType === newFilters.fuelType);
    }

    // Price range filter
    if (newFilters.priceRange) {
      const [min, max] = newFilters.priceRange.split('-').map(Number);
      filtered = filtered.filter(car => car.price >= min && car.price <= max);
    }

    setFilteredCars(filtered);
  };


  return (
    <CustomerLayout>
      <div className="customer-home">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-background">
            <div className="hero-overlay"></div>
          </div>
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">
                Find Your Perfect
                <span className="hero-highlight"> Ride</span>
              </h1>
              <p className="hero-subtitle">
                Discover the best cars for your journey at unbeatable prices. 
                From economy to luxury, we have the perfect vehicle for every adventure.
              </p>
            </div>
            <div className="hero-stats">
              <div className="stat">
                <div className="stat-number">500+</div>
                <div className="stat-label">Happy Customers</div>
              </div>
              <div className="stat">
                <div className="stat-number">50+</div>
                <div className="stat-label">Car Models</div>
              </div>
              <div className="stat">
                <div className="stat-number">24/7</div>
                <div className="stat-label">Support</div>
              </div>
            </div>
          </div>
        </section>

        {/* Search and Filter Section */}
        <section className="search-section">
          <div className="container">
            <SearchFilter 
              filters={filters}
              onFilterChange={handleFilterChange}
            />
          </div>
        </section>

        {/* Cars Section */}
        <section className="cars-section">
          <div className="container">
            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Finding the best cars for you...</p>
              </div>
            ) : (
              <>
                {filteredCars.length > 0 && (
                  <div className="cars-section-header">
                    <h2>Available Cars</h2>
                  </div>
                )}

                {filteredCars.length > 0 ? (
                  <div className="cars-grid">
                    {filteredCars.map(car => (
                      <CarCard key={car._id || car.id} car={car} />
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <div className="empty-icon">🚗</div>
                    <h3>No cars found</h3>
                    <p>Try adjusting your search criteria to find more options.</p>
                    <button 
                      className="btn btn-primary"
                      onClick={() => handleFilterChange({
                        search: '',
                        type: '',
                        priceRange: '',
                        transmission: '',
                        fuelType: ''
                      })}
                    >
                      Clear Filters
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* Features Section */}
        <section className="features-section">
          <div className="container">
            <div className="section-header">
              <h2>Why Choose DriveFlex?</h2>
              <p>Experience the difference with our premium rental service</p>
            </div>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">🔒</div>
                <h3>Secure Booking</h3>
                <p>Your information is protected with bank-level security encryption.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">💰</div>
                <h3>Best Prices</h3>
                <p>Guaranteed competitive pricing with no hidden fees or charges.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🛡️</div>
                <h3>Full Insurance</h3>
                <p>Comprehensive insurance coverage included with every rental.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🚀</div>
                <h3>Instant Confirmation</h3>
                <p>Get immediate booking confirmation with real-time availability.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </CustomerLayout>
  );
};

export default CustomerHome;