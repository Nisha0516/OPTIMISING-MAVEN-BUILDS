import React from 'react';
import './SearchFilter.css';

const SearchFilter = ({ filters, onFilterChange, carCount }) => {
  const handleSearchChange = (e) => {
    onFilterChange({
      ...filters,
      search: e.target.value
    });
  };

  const handleFilterChange = (key, value) => {
    onFilterChange({
      ...filters,
      [key]: value
    });
  };

  const clearFilters = () => {
    onFilterChange({
      search: '',
      type: '',
      priceRange: '',
      transmission: '',
      fuelType: ''
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <div className="search-filter">
      <div className="search-header">
        <h2>Find Your Perfect Car</h2>
        <div className="results-count">
          <span className="count">{carCount}</span> cars available
        </div>
      </div>

      <div className="search-controls">
        {/* Search Input */}
        <div className="search-input-group">
          <div className="search-icon">🔍</div>
          <input
            type="text"
            placeholder="Search by car name or location..."
            value={filters.search}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>

        {/* Filter Row */}
        <div className="filter-row">
          <div className="filter-group">
            <label className="filter-label">Car Type</label>
            <select 
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="filter-select"
            >
              <option value="">All Types</option>
              <option value="Sedan">Sedan</option>
              <option value="SUV">SUV</option>
              <option value="Sports">Sports</option>
              <option value="Luxury">Luxury</option>
              <option value="Electric">Electric</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Transmission</label>
            <select 
              value={filters.transmission}
              onChange={(e) => handleFilterChange('transmission', e.target.value)}
              className="filter-select"
            >
              <option value="">Any Transmission</option>
              <option value="Automatic">Automatic</option>
              <option value="Manual">Manual</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Fuel Type</label>
            <select 
              value={filters.fuelType}
              onChange={(e) => handleFilterChange('fuelType', e.target.value)}
              className="filter-select"
            >
              <option value="">Any Fuel Type</option>
              <option value="Petrol">Petrol</option>
              <option value="Diesel">Diesel</option>
              <option value="Electric">Electric</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Price Range</label>
            <select 
              value={filters.priceRange}
              onChange={(e) => handleFilterChange('priceRange', e.target.value)}
              className="filter-select"
            >
              <option value="">Any Price</option>
              <option value="0-30">$0 - $30</option>
              <option value="31-50">$31 - $50</option>
              <option value="51-80">$51 - $80</option>
              <option value="81-100">$81 - $100</option>
              <option value="100-999">$100+</option>
            </select>
          </div>

          {hasActiveFilters && (
            <div className="filter-group">
              <label className="filter-label">&nbsp;</label>
              <button 
                onClick={clearFilters}
                className="btn btn-ghost"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="active-filters">
          <span className="active-filters-label">Active filters:</span>
          {Object.entries(filters).map(([key, value]) => {
            if (!value) return null;
            
            let displayValue = value;
            if (key === 'priceRange') {
              const [min, max] = value.split('-');
              displayValue = `$${min} - $${max}`;
            }

            return (
              <span key={key} className="active-filter">
                {displayValue}
                <button 
                  onClick={() => handleFilterChange(key, '')}
                  className="remove-filter"
                >
                  ×
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SearchFilter;