import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  LocationOn, 
  Settings, 
  LocalGasStation, 
  People, 
  CheckCircle,
  CalendarMonth,
  AttachMoney,
  ArrowBack,
  Info
} from '@mui/icons-material';
import CustomerLayout from './CustomerLayout';
import { carsAPI } from '../../services/api';
import './CarDetails.css';

const CarDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDates, setSelectedDates] = useState({
    start: '',
    end: ''
  });

  useEffect(() => {
    const fetchCarDetails = async () => {
      setLoading(true);
      try {
        const response = await carsAPI.getCarById(id);
        if (response.success) {
          setCar(response.car);
        } else {
          setError('Car not found');
        }
      } catch (err) {
        console.error('Error fetching car details:', err);
        setError('Failed to load car details. Please try again.');
        
        // Fallback for demo if API fails
        setCar({
          name: 'Premium Car',
          image: '🚗',
          type: 'Luxury',
          transmission: 'Automatic',
          fuel: 'Petrol',
          seats: 5,
          price: 5000,
          location: 'Main City',
          available: true,
          features: ['GPS', 'Bluetooth', 'Leather Seats'],
          description: 'A premium vehicle for your elite travel needs.'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCarDetails();
  }, [id]);

  const calculateTotal = () => {
    if (selectedDates.start && selectedDates.end && car) {
      const start = new Date(selectedDates.start);
      const end = new Date(selectedDates.end);
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      return days > 0 ? days * car.price : 0;
    }
    return 0;
  };

  const handleBooking = () => {
    navigate(`/customer/booking/${id}`, { 
      state: { 
        startDate: selectedDates.start, 
        endDate: selectedDates.end,
        car: car 
      }
    });
  };

  if (loading) return (
    <CustomerLayout>
      <div className="loading-container-luxury">
        <div className="spinner-luxury"></div>
        <p>Igniting Engine...</p>
      </div>
    </CustomerLayout>
  );

  if (error && !car) return (
    <CustomerLayout>
      <div className="error-container-luxury">
        <h2>Oops!</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/customer/home')} className="btn-back-home">
          Back to Fleet
        </button>
      </div>
    </CustomerLayout>
  );

  const carImage = car.images?.[0] || car.image || '🚗';
  const isImageEmoji = carImage.length <= 2;

  return (
    <CustomerLayout>
      <div className="luxury-car-details-page">
        <div className="details-top-bar">
          <button onClick={() => navigate(-1)} className="btn-back-luxury">
            <ArrowBack /> <span>Back to Fleet</span>
          </button>
        </div>

        <div className="details-main-grid">
          {/* Left: Content and Info */}
          <div className="details-content-column">
            <div className="details-visual-card">
              <div className="image-display-wrapper">
                {isImageEmoji ? (
                  <div className="large-emoji-fallback">{carImage}</div>
                ) : (
                  <img src={carImage} alt={car.name} className="main-car-image" />
                )}
                {car.type && <div className="type-overlay-badge">{car.type}</div>}
              </div>
            </div>

            <div className="details-info-section">
              <div className="info-header">
                <h1>{car.name}</h1>
                <div className="location-chip">
                  <LocationOn sx={{ fontSize: 18 }} />
                  <span>{car.location || 'Premium Station'}</span>
                </div>
              </div>

              <div className="specs-row-luxury">
                <div className="spec-item-v3">
                  <Settings />
                  <div className="spec-meta">
                    <label>Transmission</label>
                    <span>{car.transmission || 'Automatic'}</span>
                  </div>
                </div>
                <div className="spec-item-v3">
                  <LocalGasStation />
                  <div className="spec-meta">
                    <label>Fuel Type</label>
                    <span>{car.fuel || car.fuelType || 'Petrol'}</span>
                  </div>
                </div>
                <div className="spec-item-v3">
                  <People />
                  <div className="spec-meta">
                    <label>Capacity</label>
                    <span>{car.seats || 5} Seats</span>
                  </div>
                </div>
              </div>

              <div className="description-box-luxury">
                <h3><Info sx={{ fontSize: 18 }} /> Vehicle Overview</h3>
                <p>{car.description || 'Experience the ultimate comfort and performance with our premium vehicle fleet. Perfect for both business journeys and leisurely adventures.'}</p>
              </div>

              <div className="features-list-luxury">
                <h3>Included Features</h3>
                <div className="features-grid-v3">
                  {(car.features || ['GPS', 'Bluetooth', 'Airbags']).map((feature, index) => (
                    <div key={index} className="feature-pill-v3">
                      <CheckCircle sx={{ fontSize: 16, color: '#3b82f6' }} />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Booking Sidebar */}
          <div className="details-booking-column">
            <div className="booking-sticky-card">
              <div className="booking-price-header">
                <div className="price-tag-v3">
                  <span className="cur">₹</span>
                  <span className="amt">{car.price}</span>
                  <span className="unt">/day</span>
                </div>
                <div className={`status-pill-v3 ${car.available ? 'online' : 'offline'}`}>
                  {car.available ? 'Available Now' : 'Currently Rented'}
                </div>
              </div>

              <div className="booking-form-v3">
                <div className="input-group-v3">
                  <label><CalendarMonth sx={{ fontSize: 14 }} /> Pickup Date</label>
                  <input 
                    type="date" 
                    value={selectedDates.start}
                    onChange={(e) => setSelectedDates({...selectedDates, start: e.target.value})}
                  />
                </div>
                <div className="input-group-v3">
                  <label><CalendarMonth sx={{ fontSize: 14 }} /> Return Date</label>
                  <input 
                    type="date" 
                    value={selectedDates.end}
                    onChange={(e) => setSelectedDates({...selectedDates, end: e.target.value})}
                  />
                </div>

                {calculateTotal() > 0 && (
                  <div className="total-calculation-v3">
                    <div className="calc-row">
                      <span>Total Duration</span>
                      <span>{Math.ceil((new Date(selectedDates.end) - new Date(selectedDates.start)) / (1000 * 60 * 60 * 24))} Days</span>
                    </div>
                    <div className="calc-row grand-total">
                      <span>Grand Total</span>
                      <span>₹{calculateTotal()}</span>
                    </div>
                  </div>
                )}

                <button 
                  className="btn-reserve-luxury"
                  disabled={!car.available || !selectedDates.start || !selectedDates.end}
                  onClick={handleBooking}
                >
                  <AttachMoney />
                  {car.available ? 'Book Your Journey' : 'Join Waitlist'}
                </button>
                <p className="booking-note">Secure with DriveEasy Protection Plan</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
};

export default CarDetails;