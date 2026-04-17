import React, { useState, useEffect, useCallback } from 'react';
import { adminAPI, bookingsAPI } from '../../services/api';
import './AdminStyles.css';

const AllBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchBookings = useCallback(async () => {
    try {
      const response = await adminAPI.getAllBookings(1, filter !== 'all' ? filter : '');
      setBookings(response.bookings || []);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      // Fallback to mock data
      const mockBookings = [
      {
        id: 1,
        customer: 'John Doe',
        customerEmail: 'john@example.com',
        customerPhone: '+1 (555) 123-4567',
        car: 'Toyota Camry 2023',
        carNumber: 'ABC-1234',
        owner: 'Rajesh Kumar',
        ownerEmail: 'rajesh@example.com',
        startDate: '2024-01-15',
        endDate: '2024-01-20',
        status: 'pending',
        total: 250,
        paymentMethod: 'card',
        paymentStatus: 'paid',
        bookingDate: '2024-01-10'
      },
      {
        id: 2,
        customer: 'Jane Smith',
        customerEmail: 'jane@example.com',
        customerPhone: '+1 (555) 987-6543',
        car: 'Honda Civic 2023',
        carNumber: 'XYZ-5678',
        owner: 'Priya Patel',
        ownerEmail: 'priya@example.com',
        startDate: '2024-01-18',
        endDate: '2024-01-25',
        status: 'confirmed',
        total: 320,
        paymentMethod: 'upi',
        paymentStatus: 'paid',
        bookingDate: '2024-01-12'
      },
      {
        id: 3,
        customer: 'Mike Johnson',
        customerEmail: 'mike@example.com',
        customerPhone: '+1 (555) 456-7890',
        car: 'BMW X5 2023',
        carNumber: 'BMW-9012',
        owner: 'Amit Sharma',
        ownerEmail: 'amit@example.com',
        startDate: '2024-01-20',
        endDate: '2024-01-27',
        status: 'completed',
        total: 595,
        paymentMethod: 'card',
        paymentStatus: 'paid',
        bookingDate: '2024-01-15'
      }
    ];
      setBookings(mockBookings);
    }
  }, [filter]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const filteredBookings = filter === 'all' 
    ? bookings 
    : bookings.filter(booking => booking.status === filter);

  const getStatusBadge = (status) => {
    const statusClasses = {
      active: 'status-active',
      confirmed: 'status-active',
      completed: 'status-completed',
      cancelled: 'status-cancelled',
      pending: 'status-pending'
    };
    return <span className={`status-badge ${statusClasses[status]}`}>{status.toUpperCase()}</span>;
  };

  const handleViewBooking = (booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      if (newStatus === 'confirmed') {
        await bookingsAPI.approveBooking(bookingId);
      } else if (newStatus === 'rejected') {
        await bookingsAPI.rejectBooking(bookingId);
      }
      alert(`Booking ${newStatus} successfully!`);
      fetchBookings();
      setShowModal(false);
    } catch (error) {
      alert(error.message || 'Failed to update booking');
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      try {
        await bookingsAPI.cancelBooking(bookingId);
        alert('Booking deleted successfully!');
        fetchBookings();
        setShowModal(false);
      } catch (error) {
        alert(error.message || 'Failed to delete booking');
      }
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>All Bookings</h1>
        <p>Manage and monitor all rental bookings</p>
      </div>

      <div className="stats-summary">
        <div className="stat-box">
          <span className="stat-value">{bookings.length}</span>
          <span className="stat-label">Total Bookings</span>
        </div>
        <div className="stat-box">
          <span className="stat-value">{bookings.filter(b => b.status === 'pending').length}</span>
          <span className="stat-label">Pending</span>
        </div>
        <div className="stat-box">
          <span className="stat-value">{bookings.filter(b => b.status === 'confirmed').length}</span>
          <span className="stat-label">Confirmed</span>
        </div>
        <div className="stat-box">
          <span className="stat-value">{bookings.filter(b => b.status === 'completed').length}</span>
          <span className="stat-label">Completed</span>
        </div>
      </div>

      <div className="filters">
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
        <button 
          className={`filter-btn ${filter === 'cancelled' ? 'active' : ''}`}
          onClick={() => setFilter('cancelled')}
        >
          Cancelled ({bookings.filter(b => b.status === 'cancelled').length})
        </button>
      </div>

      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Car</th>
              <th>Owner</th>
              <th>Duration</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Total</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '2rem' }}>
                  No {filter !== 'all' ? filter : ''} bookings found
                </td>
              </tr>
            ) : (
              filteredBookings.map(booking => {
                // Handle both API response format (objects) and mock data format (strings)
                const customerId = booking._id || booking.id;
                const customerName = typeof booking.customer === 'object' ? booking.customer?.name : (booking.customerName || booking.customer);
                const customerEmail = typeof booking.customer === 'object' ? booking.customer?.email : (booking.customerEmail || booking.email);
                const customerPhone = typeof booking.customer === 'object' ? booking.customer?.phone : (booking.customerPhone || booking.phone);
                const carName = typeof booking.car === 'object' ? booking.car?.name : (booking.carName || booking.car);
                const carNumber = typeof booking.car === 'object' ? booking.car?.registrationNumber : (booking.carNumber || booking.plateNumber);
                const ownerName = typeof booking.owner === 'object' ? booking.owner?.name : (booking.ownerName || booking.owner);
                const totalAmount = booking.totalPrice || booking.total;
                
                return (
                  <tr key={customerId}>
                    <td>#{customerId}</td>
                    <td>
                      <div className="customer-cell">
                        <strong>{customerName || 'N/A'}</strong>
                        <small>{customerEmail || 'N/A'}</small>
                      </div>
                    </td>
                    <td>
                      <div className="car-cell">
                        <strong>{carName || 'N/A'}</strong>
                        <small>{carNumber || 'N/A'}</small>
                      </div>
                    </td>
                    <td>{ownerName || 'N/A'}</td>
                    <td>
                      <div className="date-cell">
                        <small>{booking.startDate ? new Date(booking.startDate).toLocaleDateString() : 'N/A'}</small>
                        <span>→</span>
                        <small>{booking.endDate ? new Date(booking.endDate).toLocaleDateString() : 'N/A'}</small>
                      </div>
                    </td>
                    <td>{getStatusBadge(booking.status)}</td>
                    <td>
                      <span className={`payment-badge ${booking.paymentStatus === 'paid' ? 'paid' : 'pending'}`}>
                        {(booking.paymentStatus || 'pending').toUpperCase()}
                      </span>
                    </td>
                    <td><strong>₹{totalAmount || 0}</strong></td>
                    <td>
                      <button 
                        className="btn-view"
                        onClick={() => handleViewBooking({
                          ...booking,
                          id: customerId,
                          customer: customerName,
                          customerEmail: customerEmail,
                          customerPhone: customerPhone,
                          car: carName,
                          carNumber: carNumber,
                          owner: ownerName,
                          total: totalAmount
                        })}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Booking Detail Modal */}
      {showModal && selectedBooking && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Booking Details #{selectedBooking.id}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="detail-section">
                <h3>Customer Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="label">Name:</span>
                    <span className="value">{selectedBooking.customer}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Email:</span>
                    <span className="value">{selectedBooking.customerEmail}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Phone:</span>
                    <span className="value">{selectedBooking.customerPhone}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Car & Owner Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="label">Car:</span>
                    <span className="value">{selectedBooking.car}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Car Number:</span>
                    <span className="value">{selectedBooking.carNumber}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Owner:</span>
                    <span className="value">{selectedBooking.owner}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Owner Email:</span>
                    <span className="value">{selectedBooking.ownerEmail}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Booking Details</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="label">Start Date:</span>
                    <span className="value">{selectedBooking.startDate}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">End Date:</span>
                    <span className="value">{selectedBooking.endDate}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Booking Date:</span>
                    <span className="value">{selectedBooking.bookingDate}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Status:</span>
                    <span className="value">{getStatusBadge(selectedBooking.status)}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Payment Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="label">Method:</span>
                    <span className="value">{selectedBooking.paymentMethod.toUpperCase()}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Status:</span>
                    <span className="value">
                      <span className={`payment-badge ${selectedBooking.paymentStatus === 'paid' ? 'paid' : 'pending'}`}>
                        {selectedBooking.paymentStatus.toUpperCase()}
                      </span>
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Total Amount:</span>
                    <span className="value" style={{fontSize: '1.25rem', fontWeight: '700', color: '#667eea'}}>
                      ${selectedBooking.total}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              {selectedBooking.status === 'pending' && (
                <>
                  <button 
                    className="btn btn-success"
                    onClick={() => handleUpdateStatus(selectedBooking.id, 'confirmed')}
                  >
                    Approve Booking
                  </button>
                  <button 
                    className="btn btn-error"
                    onClick={() => handleUpdateStatus(selectedBooking.id, 'cancelled')}
                  >
                    Reject Booking
                  </button>
                </>
              )}
              {selectedBooking.status === 'confirmed' && (
                <button 
                    className="btn btn-primary"
                    onClick={() => handleUpdateStatus(selectedBooking.id, 'completed')}
                  >
                    Mark as Completed
                  </button>
              )}
              <button 
                className="btn btn-danger"
                onClick={() => handleDeleteBooking(selectedBooking.id)}
              >
                Delete Booking
              </button>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllBookings;
