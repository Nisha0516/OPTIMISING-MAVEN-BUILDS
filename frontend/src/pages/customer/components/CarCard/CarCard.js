import React from 'react';
import { useNavigate } from 'react-router-dom';
import './CarCard.css';

const CarCard = ({ car }) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/customer/booking/${car._id || car.id}`, {
      state: { car: car }
    });
  };

  const getTransmissionIcon = (transmission) => {
    return transmission === 'Automatic' ? '⚡' : '🎛️';
  };

  const getFuelIcon = (fuelType) => {
    const icons = {
      'Petrol': '⛽',
      'Diesel': '🛢️',
      'Electric': '🔌',
      'Hybrid': '🔋'
    };
    return icons[fuelType] || '⛽';
  };

  // Get car image (support both image and images array)
  const carImage = car.images?.[0] || car.image || '🚗';
  const isImageEmoji = carImage.length <= 2;

  // Format image URL properly
  const getImageSrc = () => {
    if (!carImage || isImageEmoji) return null;
    
    // If it's already a complete data URL
    if (carImage.startsWith('data:image')) {
      return carImage;
    }
    
    // If it's base64 data without the data URL prefix
    if (carImage.startsWith('/9j/') || carImage.startsWith('iVBOR')) {
      return `data:image/jpeg;base64,${carImage}`;
    }
    
    // If it's a regular URL
    if (carImage.startsWith('http://') || carImage.startsWith('https://') || carImage.startsWith('/')) {
      return carImage;
    }
    
    return null;
  };

  const imageSrc = getImageSrc();

  return (
    <div
      className="car-card"
      onClick={() => { if (car.available) handleViewDetails(); }}
      onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && car.available) handleViewDetails(); }}
      role="button"
      tabIndex={0}
    >
      <div className="car-image-container">
        {isImageEmoji || !imageSrc ? (
          <div className="car-image-placeholder">
            <span className="car-emoji">{carImage}</span>
          </div>
        ) : (
          <img 
            src={imageSrc} 
            alt={car.name}
            className="car-image"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        )}
        <div className="car-image-fallback" style={{ display: 'none' }}>
          <span className="car-emoji">🚗</span>
        </div>
        
        {!car.available && (
          <div className="car-overlay">
            <span className="availability-badge unavailable">Not Available</span>
          </div>
        )}
        
        {car.type && (
          <div className="car-type-badge">{car.type}</div>
        )}
      </div>

      <div className="car-content">
        <div className="car-header">
          <h3 className="car-name">{car.name}</h3>
          {car.owner && (
            <p className="car-owner">
              <span className="owner-icon">👤</span> 
              {car.owner.name || 'Car Rental'}
            </p>
          )}
        </div>

        <div className="car-specs">
          <div className="spec-item">
            <span className="spec-icon">{getTransmissionIcon(car.transmission)}</span>
            <span className="spec-text">{car.transmission || 'Auto'}</span>
          </div>
          <div className="spec-item">
            <span className="spec-icon">{getFuelIcon(car.fuel || car.fuelType)}</span>
            <span className="spec-text">{car.fuel || car.fuelType || 'Petrol'}</span>
          </div>
          <div className="spec-item">
            <span className="spec-icon">👥</span>
            <span className="spec-text">{car.seats || 4} Seats</span>
          </div>
          <div className="spec-item">
            <span className="spec-icon">📍</span>
            <span className="spec-text">{car.location || 'City'}</span>
          </div>
          {car.year && (
            <div className="spec-item">
              <span className="spec-icon">📅</span>
              <span className="spec-text">{car.year}</span>
            </div>
          )}
          {car.mileage && (
            <div className="spec-item">
              <span className="spec-icon">🛣️</span>
              <span className="spec-text">{car.mileage} km</span>
            </div>
          )}
        </div>

        <div className="car-footer-new">
          <div className="price-section-new">
            <div className="price-main-new">
              <span className="price-amount-new">₹{car.price}</span>
              <span className="price-period-new">/day</span>
            </div>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); handleViewDetails(); }}
            disabled={!car.available}
            className={`btn-book-now-new ${car.available ? '' : 'btn-disabled'}`}
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default CarCard;