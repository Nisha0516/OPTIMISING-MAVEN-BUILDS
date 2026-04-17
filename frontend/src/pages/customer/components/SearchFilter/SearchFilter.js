import React from 'react';
import { 
  Search as SearchIcon, 
  Close,
  DirectionsCar,
  Settings,
  LocalGasStation,
  AttachMoney
} from '@mui/icons-material';
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
    <div className="luxury-search-filter">
      <div className="search-top-bar">
        <div className="search-input-wrapper">
          <SearchIcon className="search-input-icon" />
          <input
            type="text"
            placeholder="Search for your dream car..."
            value={filters.search}
            onChange={handleSearchChange}
            className="luxury-search-input"
          />
        </div>
        <div className="results-badge">
          <span className="results-number">{carCount}</span>
          <span className="results-label">Vehicles Found</span>
        </div>
      </div>

      <div className="filter-controls-grid">
        <div className="filter-item">
          <label className="luxury-filter-label">
            <DirectionsCar sx={{ fontSize: 16 }} />
            <span>Vehicle Type</span>
          </label>
          <select 
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="luxury-filter-select"
          >
            <option value="">All Categories</option>
            <option value="Sedan">Sedan</option>
            <option value="SUV">SUV</option>
            <option value="Sports">Sports</option>
            <option value="Luxury">Luxury</option>
            <option value="Electric">Electric</option>
          </select>
        </div>

        <div className="filter-item">
          <label className="luxury-filter-label">
            <Settings sx={{ fontSize: 16 }} />
            <span>Transmission</span>
          </label>
          <select 
            value={filters.transmission}
            onChange={(e) => handleFilterChange('transmission', e.target.value)}
            className="luxury-filter-select"
          >
            <option value="">Any Drive</option>
            <option value="Automatic">Automatic</option>
            <option value="Manual">Manual</option>
          </select>
        </div>

        <div className="filter-item">
          <label className="luxury-filter-label">
            <LocalGasStation sx={{ fontSize: 16 }} />
            <span>Fuel Type</span>
          </label>
          <select 
            value={filters.fuelType}
            onChange={(e) => handleFilterChange('fuelType', e.target.value)}
            className="luxury-filter-select"
          >
            <option value="">Any Fuel</option>
            <option value="Petrol">Petrol</option>
            <option value="Diesel">Diesel</option>
            <option value="Electric">Electric</option>
            <option value="Hybrid">Hybrid</option>
          </select>
        </div>

        <div className="filter-item">
          <label className="luxury-filter-label">
            <AttachMoney sx={{ fontSize: 16 }} />
            <span>Budget per Day</span>
          </label>
          <select 
            value={filters.priceRange}
            onChange={(e) => handleFilterChange('priceRange', e.target.value)}
            className="luxury-filter-select"
          >
            <option value="">Any Budget</option>
            <option value="0-1000">₹0 - ₹1000</option>
            <option value="1001-3000">₹1001 - ₹3000</option>
            <option value="3001-5000">₹3001 - ₹5000</option>
            <option value="5001-10000">₹5001 - ₹10000</option>
            <option value="10001-99999">₹10001+</option>
          </select>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="active-filters-row">
          <div className="active-filters-list">
            {Object.entries(filters).map(([key, value]) => {
              if (!value || key === 'search') return null;
              
              let displayValue = value;
              if (key === 'priceRange') {
                const [min, max] = value.split('-');
                displayValue = `₹${min} - ₹${max}`;
              }

              return (
                <div key={key} className="luxury-pill">
                  <span>{displayValue}</span>
                  <button 
                    onClick={() => handleFilterChange(key, '')}
                    className="pill-remove-btn"
                  >
                    <Close sx={{ fontSize: 14 }} />
                  </button>
                </div>
              );
            })}
          </div>
          <button onClick={clearFilters} className="clear-all-btn">
            Reset All
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchFilter;
