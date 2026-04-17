import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowBack, 
  ReceiptLong, 
  CalendarToday, 
  Person, 
  Home, 
  Payments,
  CreditCard,
  Smartphone,
  CheckCircle,
  LocationOn
} from '@mui/icons-material';
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

  const fetchCarDetails = useCallback(async () => {
    try {
      if (location.state?.car) {
        const carData = location.state.car;
        setCar({
          id: carData._id || carData.id,
          name: carData.name,
          type: carData.type,
          price: carData.price,
          image: carData.images?.[0] || carData.image || '🚗',
          ownerName: carData.owner?.name || carData.ownerName || 'DriveEasy Partner',
          ownerPhone: carData.owner?.phone || carData.ownerPhone || '',
          ownerEmail: carData.owner?.email || carData.ownerEmail || '',
          location: carData.location || 'Premium Service Area',
          ownerId: carData.ownerId || carData.owner?._id || carData.owner,
          carNumber: carData.registrationNumber || carData.plateNumber || 'N/A'
        });
        return;
      }

      const response = await carsAPI.getCar(carId);
      const carData = response.car || response.data;
      
      if (!carData) throw new Error('Experience data not available');
      
      setCar({
        id: carData._id || carData.id,
        name: carData.name,
        type: carData.type,
        price: carData.price,
        image: carData.images?.[0] || carData.image || '🚗',
        ownerName: carData.owner?.name || carData.ownerName || 'DriveEasy Partner',
        ownerPhone: carData.owner?.phone || carData.ownerPhone || '',
        ownerEmail: carData.owner?.email || carData.ownerEmail || '',
        location: carData.location || 'Premium Service Area',
        ownerId: carData.ownerId || carData.owner?._id || carData.owner,
        carNumber: carData.registrationNumber || carData.plateNumber || 'N/A'
      });
    } catch (error) {
      console.error('Error fetching car:', error);
      alert(`Unable to load vehicle details. Please try again.`);
      navigate('/customer/home');
    }
  }, [carId, location.state, navigate]);

  useEffect(() => {
    setBookingData({
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

    setPaymentMethod('card');
    setCardDetails({
      cardNumber: '',
      cardName: '',
      expiryDate: '',
      cvv: ''
    });
    setCar(null);
    fetchCarDetails();
  }, [fetchCarDetails, location.state]);

  const calculateTotal = () => {
    if (bookingData.startDate && bookingData.endDate && car) {
      const start = new Date(bookingData.startDate);
      const end = new Date(bookingData.endDate);
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      const subtotal = days * car.price;
      const tax = subtotal * 0.12; 
      const serviceFee = 15; 
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
      const formatPaymentMethod = (method) => {
        const methodMap = { 'card': 'Card', 'upi': 'UPI', 'cash': 'Cash' };
        return methodMap[method] || method;
      };
      
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const customerId = userData._id || userData.id;

      const bookingPayload = {
        customerId: customerId,
        customerName: userData.name || `${bookingData.firstName} ${bookingData.lastName}`.trim(),
        customerEmail: userData.email || bookingData.email,
        customerPhone: userData.phone || bookingData.phone,
        carId: car.id,
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

      await bookingsAPI.createBooking(bookingPayload);
      setLoading(false);
      alert('Your request has been submitted. Awaiting host approval.');
      navigate('/customer/my-bookings');
    } catch (error) {
      console.error('Booking failed:', error);
      setLoading(false);
      alert(error.message || 'Transaction failed. Please verify your details.');
    }
  };

  if (!car) return (
    <CustomerLayout>
      <div className="luxury-loading-state">
        <div className="spinner-v3"></div>
        <p>Preparing your experience...</p>
      </div>
    </CustomerLayout>
  );

  const pricing = calculateTotal();

  return (
    <CustomerLayout>
      <div className="luxury-booking-checkout">
        <div className="checkout-container">
          <header className="checkout-header">
            <button className="btn-back-luxury-v3" onClick={() => navigate(-1)}>
              <ArrowBack /> Return
            </button>
            <div className="header-labels">
              <h1>Finalize Booking</h1>
              <p>Secure your premium vehicle for the upcoming journey</p>
            </div>
          </header>

          <div className="checkout-main-grid">
            <aside className="checkout-summary-sidebar">
              <div className="glass-summary-card">
                <div className="visual-preview">
                  {car.image.length <= 2 ? (
                    <div className="preview-emoji">{car.image}</div>
                  ) : (
                    <img src={car.image} alt={car.name} />
                  )}
                </div>
                <div className="preview-info">
                  <h3>{car.name}</h3>
                  <span className="type-badge-luxury-v3">{car.type}</span>
                  <div className="meta-v3">
                    <LocationOn sx={{ fontSize: 14 }} /> {car.location}
                  </div>
                </div>

                <div className="checkout-price-stack">
                  <div className="price-item-v3">
                    <span className="label">Rental ({pricing.days} days)</span>
                    <span className="val">₹{pricing.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="price-item-v3">
                    <span className="label">Service Excellence Fee</span>
                    <span className="val">₹{pricing.serviceFee.toFixed(2)}</span>
                  </div>
                  <div className="price-item-v3">
                    <span className="label">VAT & Insurance (12%)</span>
                    <span className="val">₹{pricing.tax.toFixed(2)}</span>
                  </div>
                  <div className="price-divider-v3"></div>
                  <div className="total-highlight-v3">
                    <div className="label-box">
                      <ReceiptLong />
                      <span>Total Amount</span>
                    </div>
                    <span className="grand-val">₹{pricing.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </aside>

            <main className="checkout-form-area">
              <form onSubmit={handleSubmitBooking} className="luxury-checkout-form">
                <section className="form-cluster-v3">
                  <div className="cluster-header">
                    <CalendarToday /> <h3>Journey Timeline</h3>
                  </div>
                  <div className="form-row-v3">
                    <div className="input-group-v3">
                      <label>Departure Date</label>
                      <input
                        type="date"
                        name="startDate"
                        value={bookingData.startDate}
                        onChange={handleInputChange}
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                    <div className="input-group-v3">
                      <label>Return Date</label>
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
                </section>

                <section className="form-cluster-v3">
                  <div className="cluster-header">
                    <Person /> <h3>Guest Identification</h3>
                  </div>
                  <div className="form-row-v3">
                    <div className="input-group-v3">
                      <label>First Name</label>
                      <input
                        type="text"
                        name="firstName"
                        value={bookingData.firstName}
                        onChange={handleInputChange}
                        placeholder="John"
                        required
                      />
                    </div>
                    <div className="input-group-v3">
                      <label>Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        value={bookingData.lastName}
                        onChange={handleInputChange}
                        placeholder="Doe"
                        required
                      />
                    </div>
                  </div>
                  <div className="form-row-v3">
                    <div className="input-group-v3">
                      <label>Contact Email</label>
                      <input
                        type="email"
                        name="email"
                        value={bookingData.email}
                        onChange={handleInputChange}
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                    <div className="input-group-v3">
                      <label>Mobile Number</label>
                      <input
                        type="tel"
                        name="phone"
                        value={bookingData.phone}
                        onChange={handleInputChange}
                        placeholder="+91 XXXXX XXXXX"
                        required
                      />
                    </div>
                  </div>
                  <div className="input-group-v3">
                    <label>Government-issued Driving License</label>
                    <input
                      type="text"
                      name="drivingLicense"
                      value={bookingData.drivingLicense}
                      onChange={handleInputChange}
                      placeholder="DL-XXXXXXXXXXXX"
                      required
                    />
                  </div>
                </section>

                <section className="form-cluster-v3">
                  <div className="cluster-header">
                    <Home /> <h3>Residential Details</h3>
                  </div>
                  <div className="input-group-v3">
                    <label>Street Address</label>
                    <input
                      type="text"
                      name="address"
                      value={bookingData.address}
                      onChange={handleInputChange}
                      placeholder="Floor, Building, Street"
                      required
                    />
                  </div>
                  <div className="form-row-v3">
                    <div className="input-group-v3">
                      <label>City</label>
                      <input
                        type="text"
                        name="city"
                        value={bookingData.city}
                        onChange={handleInputChange}
                        placeholder="Electronic City"
                        required
                      />
                    </div>
                    <div className="input-group-v3">
                      <label>PIN Code</label>
                      <input
                        type="text"
                        name="zipCode"
                        value={bookingData.zipCode}
                        onChange={handleInputChange}
                        placeholder="560100"
                        required
                      />
                    </div>
                  </div>
                </section>

                <section className="form-cluster-v3">
                  <div className="cluster-header">
                    <Payments /> <h3>Preferred Settlement</h3>
                  </div>
                  <div className="luxury-payment-selector">
                    {[
                      { id: 'card', label: 'Secured Card', icon: <CreditCard /> },
                      { id: 'upi', label: 'Instant UPI', icon: <Smartphone /> },
                      { id: 'cash', label: 'Direct Cash', icon: <Payments /> }
                    ].map(opt => (
                      <label key={opt.id} className={`payment-pill-v3 ${paymentMethod === opt.id ? 'active' : ''}`}>
                        <input
                          type="radio"
                          name="payment"
                          value={opt.id}
                          checked={paymentMethod === opt.id}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                        />
                        {opt.icon}
                        <span>{opt.label}</span>
                      </label>
                    ))}
                  </div>

                  {paymentMethod === 'card' && (
                    <div className="glass-inner-payment-card">
                      <div className="input-group-v3">
                        <label>Card Identification Number</label>
                        <input
                          type="text"
                          name="cardNumber"
                          value={cardDetails.cardNumber}
                          onChange={handleCardChange}
                          placeholder="XXXX XXXX XXXX XXXX"
                          required={paymentMethod === 'card'}
                        />
                      </div>
                      <div className="form-row-v3">
                        <div className="input-group-v3">
                          <label>Expiry (MM/YY)</label>
                          <input
                            type="text"
                            name="expiryDate"
                            value={cardDetails.expiryDate}
                            onChange={handleCardChange}
                            placeholder="01/29"
                            required={paymentMethod === 'card'}
                          />
                        </div>
                        <div className="input-group-v3">
                          <label>Security CVV</label>
                          <input
                            type="password"
                            name="cvv"
                            value={cardDetails.cvv}
                            onChange={handleCardChange}
                            placeholder="XXX"
                            required={paymentMethod === 'card'}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </section>

                <div className="checkout-final-actions">
                  <button
                    type="submit"
                    className="btn-submit-booking-luxury"
                    disabled={loading || !pricing.days}
                  >
                    {loading ? (
                      <span className="spinner-mini"></span>
                    ) : (
                      <>Verify & Confirm Booking • ₹{pricing.total.toFixed(2)}</>
                    )}
                  </button>
                  <div className="security-assurance">
                    <CheckCircle sx={{ fontSize: 16 }} /> Secure multi-layer encrypted transaction
                  </div>
                </div>
              </form>
            </main>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
};

export default Booking;
