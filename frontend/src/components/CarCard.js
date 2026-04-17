import React from "react";
import { Link } from "react-router-dom";
import { 
  LocationOn, 
  LocalGasStation, 
  Settings, 
  ChevronRight,
  CurrencyRupee
} from "@mui/icons-material";
import "./CarCard.css";

const CarCard = ({ car }) => {
  return (
    <div className="premium-car-card">
      <div className="card-image-wrapper">
        <img
          src={car.image || "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800"}
          alt={`${car.brand} ${car.model}`}
          className="card-image"
        />
        <div className="image-overlay"></div>
        <div className="price-tag">
          <CurrencyRupee fontSize="inherit" />
          <span>{car.pricePerDay}</span>
          <small>/day</small>
        </div>
      </div>
      
      <div className="card-content">
        <div className="brand-badge">{car.brand}</div>
        <h3 className="car-model-title">{car.model}</h3>
        
        <div className="car-specs-grid">
          <div className="spec-item">
            <LocationOn fontSize="small" className="spec-icon" />
            <span>{car.location}</span>
          </div>
          <div className="spec-item">
            <LocalGasStation fontSize="small" className="spec-icon" />
            <span>{car.type || "Petrol"}</span>
          </div>
          <div className="spec-item">
            <Settings fontSize="small" className="spec-icon" />
            <span>Automatic</span>
          </div>
        </div>
        
        <div className="card-footer">
          <Link to={`/car/${car._id}`} className="view-details-btn">
            View Details <ChevronRight fontSize="small" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CarCard;
