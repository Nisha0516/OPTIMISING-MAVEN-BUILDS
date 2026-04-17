import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Speed, 
  Settings, 
  LocalGasStation, 
  People, 
  LocationOn,
  Stars
} from '@mui/icons-material';
import './CarCard.css';

const CarCard = ({ car }) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/customer/booking/${car._id || car.id}`, {
      state: { car: car }
    });
  };

  // Get car image (support both image and images array)
  const carImage = car.images?.[0] || car.image || '🚗';
  const isImageEmoji = carImage.length <= 2;

  const getImageSrc = () => {
    if (!carImage || isImageEmoji) return null;
    if (carImage.startsWith('data:image')) return carImage;
    if (carImage.startsWith('/9j/') || carImage.startsWith('iVBOR')) return `data:image/jpeg;base64,${carImage}`;
    if (carImage.startsWith('http://') || carImage.startsWith('https://') || carImage.startsWith('/')) return carImage;
    return null;
  };

  const imageSrc = getImageSrc();

  return (
    <div
      className={`luxury-car-card ${!car.available ? 'unavailable' : ''}`}
      onClick={() => { if (car.available) handleViewDetails(); }}
      onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && car.available) handleViewDetails(); }}
      role="button"
      tabIndex={0}
    >
      <div className="card-image-wrapper">
        {isImageEmoji || !imageSrc ? (
          <div className="card-image-placeholder">
            <span className="emoji-fallback">{carImage}</span>
          </div>
        ) : (
          <img src={imageSrc} alt={car.name} className="card-img" />
        )}
        
        {car.type && <div className="card-category-badge">{car.type}</div>}
        {car.rating > 4.5 && <div className="card-premium-badge"><Stars sx={{ fontSize: 14 }} /> Premium</div>}
        
        {!car.available && (
          <div className="card-status-overlay">
            <span className="status-label">Rented Out</span>
          </div>
        )}
      </div>

      <div className="card-info-content">
        <div className="card-header-main">
          <h3 className="card-title-text">{car.name}</h3>
          <div className="card-location-info">
            <LocationOn sx={{ fontSize: 14 }} />
            <span>{car.location || 'Main City'}</span>
          </div>
        </div>

        <div className="card-specs-grid-v2">
          <div className="spec-tile">
            <Settings sx={{ fontSize: 18, color: '#3b82f6' }} />
            <span>{car.transmission || 'Auto'}</span>
          </div>
          <div className="spec-tile">
            <LocalGasStation sx={{ fontSize: 18, color: '#3b82f6' }} />
            <span>{car.fuel || car.fuelType || 'Petrol'}</span>
          </div>
          <div className="spec-tile">
            <People sx={{ fontSize: 18, color: '#3b82f6' }} />
            <span>{car.seats || 4} Seats</span>
          </div>
          <div className="spec-tile">
            <Speed sx={{ fontSize: 18, color: '#3b82f6' }} />
            <span>{car.mileage ? `${car.mileage} km` : 'Unlimited'}</span>
          </div>
        </div>

        <div className="card-action-footer">
          <div className="card-price-display">
            <span className="currency-symbol">₹</span>
            <span className="price-val">{car.price}</span>
            <span className="price-unit">/day</span>
          </div>
          <button 
            className="card-book-btn"
            disabled={!car.available}
            onClick={(e) => { e.stopPropagation(); handleViewDetails(); }}
          >
            {car.available ? 'Reserve Now' : 'Check Later'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CarCard;
