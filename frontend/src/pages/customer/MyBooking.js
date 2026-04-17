import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  History, 
  DirectionsCar, 
  CalendarMonth, 
  Timer, 
  CheckCircle, 
  Cancel, 
  Download,
  Payments,
  AccessTime
} from '@mui/icons-material';
import { bookingsAPI } from '../../services/api';
import CustomerLayout from './CustomerLayout';
import RazorpayPayment from '../../components/RazorpayPayment';
import './MyBooking.css';
import { generateBookingPDF } from '../../utils/bookingPdf';
import { toast } from 'react-toastify';

const MyBooking = () => {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const navigate = useNavigate();

  const handleDownloadPdf = useCallback(async (bookingId) => {
    try {
      const response = await bookingsAPI.getBooking(bookingId);
      const booking = response.booking || response;
      generateBookingPDF(booking, { companyName: 'DriveEasy' });
    } catch (error) {
      toast.error('Failed to generate PDF');
    }
  }, []);

  const checkAutoPdf = useCallback(async (currentBookings) => {
    const AUTO_PDF_STATUSES = new Set(['confirmed', 'completed']);
    try {
      const pdfKey = 'driveeasy_pdf_generated_map';
      const pdfMap = JSON.parse(localStorage.getItem(pdfKey) || '{}');
      
      for (const b of currentBookings) {
        const status = (b.status || '').toLowerCase();
        if (AUTO_PDF_STATUSES.has(status) && pdfMap[b.id] !== status) {
          await handleDownloadPdf(b.id);
          pdfMap[b.id] = status;
        }
      }
      localStorage.setItem(pdfKey, JSON.stringify(pdfMap));
    } catch (e) {}
  }, [handleDownloadPdf]);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const response = await bookingsAPI.getBookings();
      
      const transformedBookings = (response.bookings || []).map(booking => ({
        id: booking._id || booking.id,
        _id: booking._id || booking.id,
        carName: booking.car?.name || 'Luxury Vehicle',
        image: booking.car?.images?.[0] || booking.car?.image || '🚗',
        startDate: booking.startDate ? new Date(booking.startDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A',
        endDate: booking.endDate ? new Date(booking.endDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A',
        status: (booking.status || 'pending').toLowerCase(),
        total: booking.totalPrice || 0,
        ownerName: booking.owner?.name || 'DriveEasy Partner',
        paymentMethod: booking.paymentMethod || 'N/A',
        paymentStatus: booking.paymentStatus || 'Pending',
        days: booking.days || Math.ceil((new Date(booking.endDate) - new Date(booking.startDate)) / (1000 * 60 * 60 * 24))
      }));
      
      setBookings(transformedBookings);
      await checkAutoPdf(transformedBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      const savedBookings = JSON.parse(localStorage.getItem('customerBookings') || '[]');
      if (savedBookings.length > 0) {
        setBookings(savedBookings);
      }
    } finally {
      setLoading(false);
    }
  }, [checkAutoPdf]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await bookingsAPI.cancelBooking(bookingId);
        toast.success('Booking cancelled successfully');
        fetchBookings();
      } catch (error) {
        toast.error(error.message || 'Failed to cancel booking');
      }
    }
  };

  const handleExtendBooking = async (bookingId) => {
    const input = window.prompt('How many extra days would you like to add to this booking? (1-7)', '1');
    if (!input) return;

    const extraDays = parseInt(input, 10);
    if (Number.isNaN(extraDays) || extraDays <= 0 || extraDays > 7) {
      toast.error('Please enter a valid number of days (1-7)');
      return;
    }

    try {
      const res = await bookingsAPI.extendBooking(bookingId, extraDays);
      toast.success(res.message || 'Extension request sent to owner.');
      fetchBookings();
    } catch (error) {
      toast.error(error.message || 'Failed to request extension');
    }
  };

  const handleConfirmBooking = async (bookingId) => {
    try {
      await bookingsAPI.confirmBooking(bookingId);
      toast.success('Booking confirmed!');
      fetchBookings();
    } catch (error) {
      toast.error(error.message || 'Failed to confirm booking');
    }
  };

  const filteredBookings = filter === 'all' 
    ? bookings 
    : bookings.filter(b => b.status === filter);

  return (
    <CustomerLayout>
      <div className="luxury-bookings-page">
        <header className="bookings-v3-header">
          <div className="header-icon-box">
            <History sx={{ fontSize: 40, color: '#3b82f6' }} />
          </div>
          <div className="header-text-box">
            <h1>Activity & Bookings</h1>
            <p>Manage your premium rentals and journey history</p>
          </div>
        </header>

        <section className="bookings-v3-stats">
          <div className="stat-pill-luxury">
            <span className="val">{bookings.length}</span>
            <span className="lab">Total</span>
          </div>
          <div className="stat-pill-luxury accent">
            <span className="val">{bookings.filter(b => b.status === 'confirmed').length}</span>
            <span className="lab">Active</span>
          </div>
          <div className="stat-pill-luxury">
            <span className="val">{bookings.filter(b => b.status === 'pending').length}</span>
            <span className="lab">Pending</span>
          </div>
        </section>

        <nav className="bookings-v3-filters">
          {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(f => (
            <button 
              key={f}
              className={`filter-chip-v3 ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </nav>

        <div className="bookings-v3-list">
          {loading ? (
            <div className="loading-v3-state">
              <div className="spinner-v3"></div>
              <p>Retrieving your experiences...</p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="empty-v3-state">
              <DirectionsCar sx={{ fontSize: 80, opacity: 0.2 }} />
              <h3>No bookings found</h3>
              <p>Your premium car awaits. Start your first journey today.</p>
              <button 
                className="btn-discover-luxury"
                onClick={() => navigate('/customer/home')}
              >
                Discover the Fleet
              </button>
            </div>
          ) : (
            filteredBookings.map(booking => (
              <div key={booking.id} className="booking-v3-card">
                <div className="card-v3-main">
                  <div className="car-v3-visual">
                    {booking.image.length <= 2 ? (
                      <div className="car-v3-emoji">{booking.image}</div>
                    ) : (
                      <img src={booking.image} alt={booking.carName} />
                    )}
                    <div className={`status-v3-badge ${booking.status}`}>
                      {booking.status}
                    </div>
                  </div>

                  <div className="card-v3-info">
                    <div className="info-v3-top">
                      <h3>{booking.carName}</h3>
                      <span className="booking-v3-id">ID: #{booking.id.slice(-6).toUpperCase()}</span>
                    </div>
                    
                    <div className="info-v3-grid">
                      <div className="info-v3-item">
                        <CalendarMonth />
                        <div className="meta">
                          <label>Timeline</label>
                          <span>{booking.startDate} - {booking.endDate}</span>
                        </div>
                      </div>
                      <div className="info-v3-item">
                        <Timer />
                        <div className="meta">
                          <label>Duration</label>
                          <span>{booking.days} Days</span>
                        </div>
                      </div>
                      <div className="info-v3-item">
                        <Payments />
                        <div className="meta">
                          <label>Investment</label>
                          <span className="price-v3-accent">₹{booking.total}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card-v3-actions">
                  <div className="status-message-v3">
                    {booking.status === 'pending' && <><AccessTime /> Awaiting Confirmation</>}
                    {booking.status === 'confirmed' && <><CheckCircle /> Journey Secured</>}
                    {booking.status === 'completed' && <><CheckCircle /> Rental Completed</>}
                    {booking.status === 'cancelled' && <><Cancel /> Booking Revoked</>}
                  </div>

                  <div className="action-v3-group">
                    {booking.status === 'pending' && (
                      <>
                        <button className="btn-v3 secondary" onClick={() => handleCancelBooking(booking.id)}>Cancel</button>
                        <button className="btn-v3 primary" onClick={() => handleConfirmBooking(booking.id)}>Confirm</button>
                      </>
                    )}
                    {booking.status === 'confirmed' && (
                      <>
                        {booking.paymentStatus !== 'Completed' && (
                          <button className="btn-v3 success" onClick={() => { setSelectedBooking(booking); setShowPaymentModal(true); }}>
                            Pay Now
                          </button>
                        )}
                        <button className="btn-v3 secondary" onClick={() => handleExtendBooking(booking.id)}>Extend</button>
                        <button className="btn-v3 outline" onClick={() => handleDownloadPdf(booking.id)}><Download /></button>
                      </>
                    )}
                    {['completed', 'cancelled', 'rejected'].includes(booking.status) && (
                      <button className="btn-v3 outline" onClick={() => handleDownloadPdf(booking.id)}>
                        <Download sx={{ mr: 1 }} /> Receipt
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showPaymentModal && selectedBooking && (
        <div className="payment-v3-overlay" onClick={() => setShowPaymentModal(false)}>
          <div className="payment-v3-box" onClick={e => e.stopPropagation()}>
            <button className="close-v3" onClick={() => setShowPaymentModal(false)}>×</button>
            <RazorpayPayment
              bookingId={selectedBooking._id}
              amount={selectedBooking.total}
              onSuccess={() => { toast.success('Payment Secured!'); setShowPaymentModal(false); fetchBookings(); }}
              onFailure={() => toast.error('Payment Failed')}
              onClose={() => setShowPaymentModal(false)}
            />
          </div>
        </div>
      )}
    </CustomerLayout>
  );
};

export default MyBooking;
