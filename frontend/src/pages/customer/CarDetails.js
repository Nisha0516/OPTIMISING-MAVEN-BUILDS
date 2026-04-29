import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CustomerLayout from './CustomerLayout';
import './CarDetails.css';

const CarDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [selectedDates, setSelectedDates] = useState({
    start: '',
    end: ''
  });

  useEffect(() => {
    const mockCar = {
      id: 1,
      name: 'Toyota Camry 2023',
      image: '🚗',
      type: 'Sedan',
      transmission: 'Automatic',
      fuel: 'Petrol',
      seats: 5,
      price: 50,
      location: 'Downtown',
      available: true,
      features: ['Air Conditioning', 'Bluetooth', 'GPS Navigation', 'Backup Camera'],
      description: 'A reliable and comfortable sedan perfect for city driving and long trips.'
    };
    setCar(mockCar);
  }, [id]);

  if (!car) return <div>Loading...</div>;

  const calculateTotal = () => {
    if (selectedDates.start && selectedDates.end) {
      const start = new Date(selectedDates.start);
      const end = new Date(selectedDates.end);
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      return days * car.price;
    }
    return 0;
  };

  return (
    <CustomerLayout>
      <div className="car-details-page">
        <div className="car-details-container">
          <div className="car-header">
            <div className="car-image-large">
              <div className="car-image-placeholder-large">{car.image}</div>
            </div>
            <div className="car-basic-info">
              <h1>{car.name}</h1>
              <div className="car-specs">
                <span>📍 {car.location}</span>
                <span>⚙️ {car.transmission}</span>
                <span>⛽ {car.fuel}</span>
                <span>👥 {car.seats} seats</span>
              </div>
              <div className="price-section">
                <h2>${car.price}/day</h2>
                <span className="availability-badge available">
                  {car.available ? 'Available' : 'Not Available'}
                </span>
              </div>
            </div>
          </div>

          <div className="booking-section">
            <h3>Book This Car</h3>
            <div className="date-picker">
              <div className="date-input">
                <label>Start Date</label>
                <input 
                  type="date" 
                  value={selectedDates.start}
                  onChange={(e) => setSelectedDates({...selectedDates, start: e.target.value})}
                />
              </div>
              <div className="date-input">
                <label>End Date</label>
                <input 
                  type="date" 
                  value={selectedDates.end}
                  onChange={(e) => setSelectedDates({...selectedDates, end: e.target.value})}
                />
              </div>
            </div>
            
            {calculateTotal() > 0 && (
              <div className="price-summary">
                <h4>Price Summary</h4>
                <p>Total: <strong>${calculateTotal()}</strong></p>
              </div>
            )}

            <button 
              onClick={() => navigate(`/customer/booking/${car.id}`, { 
                state: { 
                  startDate: selectedDates.start, 
                  endDate: selectedDates.end,
                  car: car // Pass the entire car object
                },
                replace: true // Replace current entry in history
              })}
              disabled={!car.available || !selectedDates.start || !selectedDates.end}
              className="btn-primary large"
            >
              Continue to Book
            </button>
          </div>

          <div className="car-features">
            <h3>Features</h3>
            <div className="features-grid">
              {car.features.map((feature, index) => (
                <div key={index} className="feature-item">
                  ✅ {feature}
                </div>
              ))}
            </div>
          </div>

          <div className="car-description">
            <h3>Description</h3>
            <p>{car.description}</p>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
};

export default CarDetails;