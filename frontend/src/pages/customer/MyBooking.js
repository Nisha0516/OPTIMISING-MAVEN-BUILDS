import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await bookingsAPI.getBookings();
      console.log('Fetched bookings:', response);
      
      // Transform API data to match component format
      const transformedBookings = (response.bookings || []).map(booking => ({
        id: booking._id || booking.id,
        _id: booking._id || booking.id, // Keep original ID for API calls
        carName: booking.car?.name || 'Car',
        image: booking.car?.images?.[0] || '🚗',
        startDate: booking.startDate ? new Date(booking.startDate).toLocaleDateString() : 'N/A',
        endDate: booking.endDate ? new Date(booking.endDate).toLocaleDateString() : 'N/A',
        status: (booking.status || 'pending').toLowerCase(),
        total: booking.totalPrice || 0,
        ownerName: booking.owner?.name || 'Owner',
        paymentMethod: booking.paymentMethod || 'N/A',
        paymentStatus: booking.paymentStatus || 'Pending',
        days: booking.days || Math.ceil((new Date(booking.endDate) - new Date(booking.startDate)) / (1000 * 60 * 60 * 24))
      }));
      
      setBookings(transformedBookings);
      // Trigger auto-PDF generation if status changed
      await checkAutoPdf(transformedBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      // Fallback to localStorage or mock data
      const savedBookings = JSON.parse(localStorage.getItem('customerBookings') || '[]');
      if (savedBookings.length > 0) {
        setBookings(savedBookings);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await bookingsAPI.cancelBooking(bookingId);
        toast.success('Booking cancelled successfully');
        // Refresh bookings list
        fetchBookings();
      } catch (error) {
        console.error('Error cancelling booking:', error);
        toast.error(error.message || 'Failed to cancel booking');
      }
    }
  };

  const handleExtendBooking = async (bookingId) => {
    const input = window.prompt('How many extra days would you like to add to this booking? (1-7)', '1');
    if (!input) return;

    const extraDays = parseInt(input, 10);
    if (Number.isNaN(extraDays) || extraDays <= 0) {
      toast.error('Please enter a valid number of days');
      return;
    }

    if (extraDays > 7) {
      toast.error('You can extend a booking by up to 7 days online.');
      return;
    }

    try {
      const res = await bookingsAPI.extendBooking(bookingId, extraDays);
      toast.success(res.message || 'Extension request sent to owner. Awaiting approval.');
      fetchBookings();
    } catch (error) {
      console.error('Error extending booking:', error);
      toast.error(error.message || 'Failed to request extension');
    }
  };

  const handleConfirmBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to confirm this booking?')) {
      try {
        await bookingsAPI.confirmBooking(bookingId);
        toast.success('Booking confirmed successfully');
        // Refresh bookings list
        fetchBookings();
      } catch (error) {
        console.error('Error confirming booking:', error);
        toast.error(error.message || 'Failed to confirm booking');
      }
    }
  };

  const handleAcceptBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to accept this booking?')) {
      try {
        await bookingsAPI.acceptBooking(bookingId);
        toast.success('Booking accepted successfully');
        // Refresh bookings list
        fetchBookings();
      } catch (error) {
        console.error('Error accepting booking:', error);
        toast.error(error.message || 'Failed to accept booking');
      }
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to delete this booking? This action cannot be undone.')) {
      try {
        await bookingsAPI.deleteBooking(bookingId);
        toast.success('Booking deleted successfully');
        // Refresh bookings list
        fetchBookings();
      } catch (error) {
        console.error('Error deleting booking:', error);
        toast.error(error.message || 'Failed to delete booking');
      }
    }
  };

  const handlePayNow = (booking) => {
    setSelectedBooking(booking);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = (payment) => {
    toast.success('Payment successful! Your booking is now confirmed.');
    setShowPaymentModal(false);
    setSelectedBooking(null);
    fetchBookings(); // Refresh bookings to show updated payment status
  };

  const handlePaymentFailure = (error) => {
    console.error('Payment failed:', error);
    // Modal will be closed by Razorpay component
  };

  const handleClosePayment = () => {
    setShowPaymentModal(false);
    setSelectedBooking(null);
  };

  // Generate professional PDF for a specific booking by fetching full details
  const handleDownloadPdf = async (bookingId) => {
    try {
      const response = await bookingsAPI.getBooking(bookingId);
      const booking = response.booking || response;
      if (!booking) {
        alert('Unable to load booking details for PDF');
        return;
      }
      generateBookingPDF(booking, { companyName: 'Car Rental' });
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert(error.message || 'Failed to generate PDF');
    }
  };

  // Auto-generate PDF after status changes to confirmed/cancelled/rejected/completed
  const checkAutoPdf = async (currentBookings) => {
    const AUTO_PDF_STATUSES = new Set(['confirmed', 'cancelled', 'rejected', 'completed']);
    try {
      const statusKey = 'customer_booking_status_map';
      const pdfKey = 'customer_booking_pdf_generated_map';
      const prevMap = JSON.parse(localStorage.getItem(statusKey) || '{}');
      const pdfMap = JSON.parse(localStorage.getItem(pdfKey) || '{}');
      const newMap = { ...prevMap };

      for (const b of currentBookings) {
        const prevStatus = (prevMap[b.id] || '').toLowerCase();
        const status = (b.status || '').toLowerCase();
        if (status && status !== prevStatus) {
          newMap[b.id] = status;
          if (AUTO_PDF_STATUSES.has(status) && pdfMap[b.id] !== status) {
            await handleDownloadPdf(b.id);
            pdfMap[b.id] = status;
          }
        }
      }

      localStorage.setItem(statusKey, JSON.stringify(newMap));
      localStorage.setItem(pdfKey, JSON.stringify(pdfMap));
    } catch (e) {
      console.error('Auto PDF check failed:', e);
    }
  };

  const filteredBookings = filter === 'all' 
    ? bookings 
    : bookings.filter(b => b.status === filter);

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'pending': return 'status-pending';
      case 'confirmed': return 'status-confirmed';
      case 'completed': return 'status-completed';
      case 'cancelled': return 'status-cancelled';
      case 'rejected': return 'status-cancelled';
      default: return '';
    }
  };

  return (
    <CustomerLayout>
      <div className="my-bookings-page">
        <div className="bookings-header">
          <h1>My Bookings</h1>
          <p>Manage and track your car rental bookings</p>
        </div>

        <div className="bookings-stats">
          <div className="stat-card">
            <span className="stat-number">{bookings.length}</span>
            <span className="stat-label">Total Bookings</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{bookings.filter(b => b.status === 'pending').length}</span>
            <span className="stat-label">Pending</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{bookings.filter(b => b.status === 'confirmed').length}</span>
            <span className="stat-label">Confirmed</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{bookings.filter(b => b.status === 'completed').length}</span>
            <span className="stat-label">Completed</span>
          </div>
        </div>

        <div className="booking-filters">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({bookings.length})
          </button>
          <button 
            className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pending ({bookings.filter(b => b.status === 'pending').length})
          </button>
          <button 
            className={`filter-btn ${filter === 'confirmed' ? 'active' : ''}`}
            onClick={() => setFilter('confirmed')}
          >
            Confirmed ({bookings.filter(b => b.status === 'confirmed').length})
          </button>
          <button 
            className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Completed ({bookings.filter(b => b.status === 'completed').length})
          </button>
        </div>

        <div className="bookings-list">
          {loading ? (
            <div className="empty-bookings">
              <div className="empty-icon">⏳</div>
              <h3>Loading your bookings...</h3>
              <p>Please wait while we fetch your booking history</p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="empty-bookings">
              <div className="empty-icon">📋</div>
              <h3>No {filter !== 'all' ? filter : ''} bookings found</h3>
              <p>Start exploring our amazing car collection!</p>
              <button 
                className="btn-primary"
                onClick={() => navigate('/customer/home')}
              >
                Browse Cars
              </button>
            </div>
          ) : (
            filteredBookings.map(booking => (
              <div key={booking.id} className="booking-card">
                <div className="booking-header">
                  <div className="booking-car">
                    <div className="car-image-small">
                      {booking.image && booking.image !== '🚗' ? (
                        <img src={booking.image} alt={booking.carName} className="car-image-photo" />
                      ) : (
                        '🚗'
                      )}
                    </div>
                    <div className="car-info-text">
                      <h3>{booking.carName}</h3>
                      <p className="booking-id">Booking ID: #{booking.id}</p>
                      <p className="owner-name">Owner: {typeof booking.ownerName === 'string' ? booking.ownerName : 'Owner'}</p>
                    </div>
                  </div>
                  <div className="booking-status-section">
                    <span className={`status-badge ${getStatusBadgeClass(booking.status)}`}>
                      {booking.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="booking-details">
                  <div className="detail-row">
                    <div className="detail-column">
                      <span className="detail-label">📅 Start Date</span>
                      <span className="detail-value">{booking.startDate}</span>
                    </div>
                    <div className="detail-column">
                      <span className="detail-label">📅 End Date</span>
                      <span className="detail-value">{booking.endDate}</span>
                    </div>
                    <div className="detail-column">
                      <span className="detail-label">⏱️ Duration</span>
                      <span className="detail-value">{booking.days} days</span>
                    </div>
                  </div>
                  <div className="detail-row">
                    <div className="detail-column">
                      <span className="detail-label">💳 Payment Method</span>
                      <span className="detail-value">{booking.paymentMethod?.toUpperCase()}</span>
                    </div>
                    <div className="detail-column">
                      <span className="detail-label">💰 Total Amount</span>
                      <span className="detail-value booking-total">${booking.total}</span>
                    </div>
                  </div>
                </div>

                <div className="booking-actions">
                  {booking.status === 'pending' && (
                    <>
                      <div className="pending-message">
                        ⏳ Waiting for your confirmation
                      </div>
                      <button 
                        className="btn-confirm"
                        onClick={() => handleConfirmBooking(booking.id)}
                      >
                        ✓ Confirm Booking
                      </button>
                      <button 
                        className="btn-cancel"
                        onClick={() => handleCancelBooking(booking.id)}
                      >
                        ✕ Cancel Booking
                      </button>
                    </>
                  )}
                  {booking.status === 'confirmed' && (
                    <>
                      <div className="confirmed-message">
                        ✅ Booking confirmed! You can pick up the car on {booking.startDate}
                      </div>
                      {booking.paymentStatus !== 'Completed' && (
                        <button
                          className="btn-pay-razorpay"
                          onClick={() => handlePayNow(booking)}
                        >
                          💳 Pay Now (₹{booking.total})
                        </button>
                      )}
                      {booking.paymentStatus === 'Completed' && (
                        <div className="payment-completed-badge">
                          ✅ Payment Completed
                        </div>
                      )}
                      <button 
                        className="btn-confirm"
                        onClick={() => handleExtendBooking(booking.id)}
                      >
                        ⏰ Extend Booking
                      </button>
                      <button 
                        className="btn-accept"
                        onClick={() => handleAcceptBooking(booking.id)}
                      >
                        ✓ Accept
                      </button>
                      <button 
                        className="btn-delete"
                        onClick={() => handleDeleteBooking(booking.id)}
                      >
                        🗑 Delete
                      </button>
                      <button 
                        className="btn-primary"
                        onClick={() => handleDownloadPdf(booking.id)}
                      >
                        Download PDF
                      </button>
                    </>
                  )}
                  {booking.status === 'completed' && (
                    <>
                      <button 
                        className="btn-delete"
                        onClick={() => handleDeleteBooking(booking.id)}
                      >
                        🗑 Delete
                      </button>
                      <button 
                        className="btn-primary"
                        onClick={() => handleDownloadPdf(booking.id)}
                      >
                        Download PDF
                      </button>
                    </>
                  )}
                  {booking.status === 'cancelled' && (
                    <>
                      <div className="cancelled-message">
                        ❌ This booking was cancelled
                      </div>
                      <button 
                        className="btn-accept"
                        onClick={() => handleAcceptBooking(booking.id)}
                      >
                        ✓ Accept
                      </button>
                      <button 
                        className="btn-delete"
                        onClick={() => handleDeleteBooking(booking.id)}
                      >
                        🗑 Delete
                      </button>
                      <button 
                        className="btn-primary"
                        onClick={() => handleDownloadPdf(booking.id)}
                      >
                        Download PDF
                      </button>
                    </>
                  )}
                  {booking.status === 'rejected' && (
                    <>
                      <div className="cancelled-message">
                        ❌ This booking was rejected by the owner
                      </div>
                      <button 
                        className="btn-accept"
                        onClick={() => handleAcceptBooking(booking.id)}
                      >
                        ✓ Accept
                      </button>
                      <button 
                        className="btn-delete"
                        onClick={() => handleDeleteBooking(booking.id)}
                      >
                        🗑 Delete
                      </button>
                      <button 
                        className="btn-primary"
                        onClick={() => handleDownloadPdf(booking.id)}
                      >
                        Download PDF
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Razorpay Payment Modal */}
      {showPaymentModal && selectedBooking && (
        <div className="payment-modal-overlay" onClick={handleClosePayment}>
          <div className="payment-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="payment-modal-close" onClick={handleClosePayment}>×</button>
            <RazorpayPayment
              bookingId={selectedBooking._id || selectedBooking.id}
              amount={selectedBooking.total}
              onSuccess={handlePaymentSuccess}
              onFailure={handlePaymentFailure}
              onClose={handleClosePayment}
            />
          </div>
        </div>
      )}
    </CustomerLayout>
  );
};

export default MyBooking;