import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { carsAPI, bookingsAPI } from '../../services/api';
import CustomerLayout from './CustomerLayout';
import './Booking.css';

const Booking = () => {
  const { carId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bookingData, setBookingData] = useState({
    startDate: location.state?.startDate || '',
    endDate: location.state?.endDate || '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    drivingLicense: '',
    additionalNotes: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  });

  // Reset form when carId or location.state changes
  useEffect(() => {
    let isMounted = true;
    
    const resetForm = () => {
      if (!isMounted) return;
      
      // Reset form data
      setBookingData(prev => ({
        ...prev,
        startDate: location.state?.startDate || '',
        endDate: location.state?.endDate || '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        zipCode: '',
        drivingLicense: '',
        additionalNotes: ''
      }));
      
      // Reset payment method and card details
      setPaymentMethod('card');
      setCardDetails({
        cardNumber: '',
        cardName: '',
        expiryDate: '',
        cvv: ''
      });
      
      // Reset car data
      setCar(null);
    };
    
    resetForm();
    fetchCarDetails();
    
    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [carId, location.state]);

  const fetchCarDetails = async () => {
    try {
      // First check if car data was passed via navigation state
      if (location.state?.car) {
        const carData = location.state.car;
        setCar({
          id: carData._id || carData.id,
          name: carData.name,
          type: carData.type,
          price: carData.price,
          image: carData.images?.[0] || carData.image || '🚗',
          ownerName: carData.owner?.name || carData.ownerName || 'Owner',
          ownerPhone: carData.owner?.phone || carData.ownerPhone || '',
          ownerEmail: carData.owner?.email || carData.ownerEmail || '',
          location: carData.location || 'City',
          ownerId: carData.ownerId || carData.owner?._id || carData.owner,
          carNumber: carData.registrationNumber || carData.plateNumber || 'N/A'
        });
        return;
      }

      // Otherwise fetch from API
      const response = await carsAPI.getCar(carId);
      console.log('API Response:', response);
      const carData = response.car || response.data;
      
      if (!carData) {
        throw new Error('No car data received from API');
      }
      
      setCar({
        id: carData._id || carData.id,
        name: carData.name,
        type: carData.type,
        price: carData.price,
        image: carData.images?.[0] || carData.image || '🚗',
        ownerName: carData.owner?.name || carData.ownerName || 'Owner',
        ownerPhone: carData.owner?.phone || carData.ownerPhone || '',
        ownerEmail: carData.owner?.email || carData.ownerEmail || '',
        location: carData.location || 'City',
        ownerId: carData.ownerId || carData.owner?._id || carData.owner,
        carNumber: carData.registrationNumber || carData.plateNumber || 'N/A'
      });
    } catch (error) {
      console.error('Error fetching car:', error);
      console.error('Error details:', error.message);
      
      // More helpful error message
      alert(`Unable to load car details. 
      
Please ensure:
1. You are logged in as a customer
2. The car exists in the database
3. The car has been approved by an admin

Error: ${error.message}`);
      
      setTimeout(() => navigate('/customer/home'), 2000);
    }
  };

  const calculateTotal = () => {
    if (bookingData.startDate && bookingData.endDate && car) {
      const start = new Date(bookingData.startDate);
      const end = new Date(bookingData.endDate);
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      const subtotal = days * car.price;
      const tax = subtotal * 0.1; // 10% tax
      const serviceFee = 5; // Fixed service fee
      return {
        days,
        subtotal,
        tax,
        serviceFee,
        total: subtotal + tax + serviceFee
      };
    }
    return { days: 0, subtotal: 0, tax: 0, serviceFee: 0, total: 0 };
  };

  const handleInputChange = (e) => {
    setBookingData({
      ...bookingData,
      [e.target.name]: e.target.value
    });
  };

  const handleCardChange = (e) => {
    setCardDetails({
      ...cardDetails,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const pricing = calculateTotal();
      
      // Convert payment method to match backend enum values (Card, UPI, Cash, Wallet)
      const formatPaymentMethod = (method) => {
        const methodMap = {
          'card': 'Card',
          'upi': 'UPI',
          'cash': 'Cash',
          'wallet': 'Wallet'
        };
        return methodMap[method] || method; // Return original if not in map
      };
      
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const customerId = userData._id || userData.id;

      const bookingPayload = {
        customerId: customerId,
        customerName: userData.name || `${bookingData.firstName} ${bookingData.lastName}`.trim(),
        customerEmail: userData.email || bookingData.email,
        customerPhone: userData.phone || bookingData.phone,
        carId: car.id,  // Backend expects 'carId' not 'car'
        carName: car.name,
        carNumber: car.carNumber,
        ownerId: car.ownerId,
        ownerName: car.ownerName,
        ownerEmail: car.ownerEmail,
        startDate: bookingData.startDate,
        endDate: bookingData.endDate,
        totalPrice: pricing.total,
        paymentMethod: formatPaymentMethod(paymentMethod),
        notes: bookingData.additionalNotes
      };

      console.log('Sending booking payload:', bookingPayload);
      const response = await bookingsAPI.createBooking(bookingPayload);
      
      setLoading(false);
      alert('Booking request sent successfully! The owner will review your request.');
      navigate('/customer/my-bookings');
    } catch (error) {
      console.error('Error creating booking:', error);
      setLoading(false);
      alert(error.message || 'Failed to create booking. Please try again.');
    }
  };

  if (!car) return (
    <CustomerLayout>
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading car details...</p>
      </div>
    </CustomerLayout>
  );

  const pricing = calculateTotal();

  // Helper function to render car image
  const renderCarImage = () => {
    if (!car.image) {
      return <div className="car-emoji">🚗</div>;
    }
    
    // Check if it's an emoji (single character or short string)
    if (car.image.length <= 2) {
      return <div className="car-emoji">{car.image}</div>;
    }
    
    // Check if it's already a complete data URL
    if (car.image.startsWith('data:image')) {
      return <img src={car.image} alt={car.name} />;
    }
    
    // Check if it's base64 data without the data URL prefix
    if (car.image.startsWith('/9j/') || car.image.startsWith('iVBOR')) {
      return <img src={`data:image/jpeg;base64,${car.image}`} alt={car.name} />;
    }
    
    // Check if it's a regular URL
    if (car.image.startsWith('http://') || car.image.startsWith('https://') || car.image.startsWith('/')) {
      return <img src={car.image} alt={car.name} />;
    }
    
    // Default fallback to emoji
    return <div className="car-emoji">🚗</div>;
  };

  return (
    <CustomerLayout>
      <div className="booking-page">
        <div className="booking-container">
          <div className="booking-header">
            <button className="back-btn" onClick={() => navigate(-1)}>
              ← Back
            </button>
            <h1>Complete Your Booking</h1>
          </div>

          <div className="booking-content">
            {/* Car Summary */}
            <div className="car-booking-summary">
              <div className="car-summary-card">
                <div className="car-image-booking">
                  {renderCarImage()}
                </div>
                <div className="car-info-booking">
                  <h3>{car.name}</h3>
                  <p className="car-type">{car.type}</p>
                  <p className="car-owner">Owner: {car.ownerName}</p>
                  <p className="car-location">📍 {car.location}</p>
                  <p className="car-price">${car.price}/day</p>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="price-breakdown">
                <h3>Price Summary</h3>
                <div className="price-item">
                  <span>Rental ({pricing.days} days)</span>
                  <span>${pricing.subtotal.toFixed(2)}</span>
                </div>
                <div className="price-item">
                  <span>Service Fee</span>
                  <span>${pricing.serviceFee.toFixed(2)}</span>
                </div>
                <div className="price-item">
                  <span>Tax (10%)</span>
                  <span>${pricing.tax.toFixed(2)}</span>
                </div>
                <div className="price-divider"></div>
                <div className="price-item total">
                  <span>Total Amount</span>
                  <span>${pricing.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Booking Form */}
            <div className="booking-form-section">
              <form onSubmit={handleSubmitBooking} className="booking-form">
                {/* Rental Dates */}
                <div className="form-section">
                  <h3>Rental Period</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Start Date *</label>
                      <input
                        type="date"
                        name="startDate"
                        value={bookingData.startDate}
                        onChange={handleInputChange}
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>End Date *</label>
                      <input
                        type="date"
                        name="endDate"
                        value={bookingData.endDate}
                        onChange={handleInputChange}
                        min={bookingData.startDate}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Personal Information */}
                <div className="form-section">
                  <h3>Personal Information</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>First Name *</label>
                      <input
                        type="text"
                        name="firstName"
                        value={bookingData.firstName}
                        onChange={handleInputChange}
                        placeholder="Enter first name"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Last Name *</label>
                      <input
                        type="text"
                        name="lastName"
                        value={bookingData.lastName}
                        onChange={handleInputChange}
                        placeholder="Enter last name"
                        required
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={bookingData.email}
                        onChange={handleInputChange}
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Phone Number *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={bookingData.phone}
                        onChange={handleInputChange}
                        placeholder="+1 (555) 000-0000"
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Driving License Number *</label>
                    <input
                      type="text"
                      name="drivingLicense"
                      value={bookingData.drivingLicense}
                      onChange={handleInputChange}
                      placeholder="Enter your driving license number"
                      required
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="form-section">
                  <h3>Address</h3>
                  <div className="form-group">
                    <label>Street Address *</label>
                    <input
                      type="text"
                      name="address"
                      value={bookingData.address}
                      onChange={handleInputChange}
                      placeholder="123 Main Street"
                      required
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>City *</label>
                      <input
                        type="text"
                        name="city"
                        value={bookingData.city}
                        onChange={handleInputChange}
                        placeholder="City"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Zip Code *</label>
                      <input
                        type="text"
                        name="zipCode"
                        value={bookingData.zipCode}
                        onChange={handleInputChange}
                        placeholder="12345"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="form-section">
                  <h3>Payment Method</h3>
                  <div className="payment-methods">
                    <label className={`payment-option ${paymentMethod === 'card' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="payment"
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <span className="payment-icon">💳</span>
                      <span>Credit/Debit Card</span>
                    </label>
                    <label className={`payment-option ${paymentMethod === 'upi' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="payment"
                        value="upi"
                        checked={paymentMethod === 'upi'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <span className="payment-icon">📱</span>
                      <span>UPI Payment</span>
                    </label>
                    <label className={`payment-option ${paymentMethod === 'cash' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="payment"
                        value="cash"
                        checked={paymentMethod === 'cash'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <span className="payment-icon">💵</span>
                      <span>Cash on Pickup</span>
                    </label>
                  </div>

                  {paymentMethod === 'card' && (
                    <div className="card-details">
                      <div className="form-group">
                        <label>Card Number *</label>
                        <input
                          type="text"
                          name="cardNumber"
                          value={cardDetails.cardNumber}
                          onChange={handleCardChange}
                          placeholder="1234 5678 9012 3456"
                          maxLength="19"
                          required={paymentMethod === 'card'}
                        />
                      </div>
                      <div className="form-group">
                        <label>Cardholder Name *</label>
                        <input
                          type="text"
                          name="cardName"
                          value={cardDetails.cardName}
                          onChange={handleCardChange}
                          placeholder="Name on card"
                          required={paymentMethod === 'card'}
                        />
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Expiry Date *</label>
                          <input
                            type="text"
                            name="expiryDate"
                            value={cardDetails.expiryDate}
                            onChange={handleCardChange}
                            placeholder="MM/YY"
                            maxLength="5"
                            required={paymentMethod === 'card'}
                          />
                        </div>
                        <div className="form-group">
                          <label>CVV *</label>
                          <input
                            type="text"
                            name="cvv"
                            value={cardDetails.cvv}
                            onChange={handleCardChange}
                            placeholder="123"
                            maxLength="3"
                            required={paymentMethod === 'card'}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'upi' && (
                    <div className="upi-details">
                      <div className="form-group">
                        <label>UPI ID *</label>
                        <input
                          type="text"
                          placeholder="yourname@upi"
                          required={paymentMethod === 'upi'}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Additional Notes */}
                <div className="form-section">
                  <div className="form-group">
                    <label>Additional Notes (Optional)</label>
                    <textarea
                      name="additionalNotes"
                      value={bookingData.additionalNotes}
                      onChange={handleInputChange}
                      placeholder="Any special requests or requirements..."
                      rows="4"
                    ></textarea>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="form-actions">
                  <button
                    type="submit"
                    className="btn-confirm-booking"
                    disabled={loading || !pricing.days}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-small"></span>
                        Processing...
                      </>
                    ) : (
                      `Confirm Booking - $${pricing.total.toFixed(2)}`
                    )}
                  </button>
                  <p className="booking-note">
                    Your booking will be sent to the car owner for approval
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
};

export default Booking;