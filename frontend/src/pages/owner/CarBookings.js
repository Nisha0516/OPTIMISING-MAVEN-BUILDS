import React, { useState, useEffect } from "react";
import { ownerAPI } from '../../services/api';
import { toast } from 'react-toastify';
import "./CarBookings.css";

function CarBookings({ cars }) {
  const [filter, setFilter] = useState("all");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [extensionRequests, setExtensionRequests] = useState([]);
  const [extensionsLoading, setExtensionsLoading] = useState(false);

  useEffect(() => {
    fetchBookings();
    fetchExtensionRequests();
  }, []);

  const fetchExtensionRequests = async () => {
    setExtensionsLoading(true);
    try {
      console.log('Fetching extension requests...');
      const res = await ownerAPI.getExtensionRequests();
      console.log('Extension requests response:', res);
      const allRequests = res.notifications || [];
      // Only keep pending (or missing status) extension requests so that
      // approved/rejected ones disappear from the owner UI after action.
      const pendingRequests = allRequests.filter(n => {
        const status = (n.extensionStatus || 'pending').toString().toLowerCase();
        return status === 'pending';
      });
      setExtensionRequests(pendingRequests);
      console.log('Extension requests set (pending only):', pendingRequests);
    } catch (e) {
      console.error('Failed to fetch extension requests:', e);
    } finally {
      setExtensionsLoading(false);
    }
  };

  const normalizeStatus = (rawStatus) => {
    const value = (rawStatus || 'pending').toString().toLowerCase().trim();

    if (value === 'pending') return 'pending';
    if (value === 'confirmed') return 'confirmed';
    if (value === 'completed') return 'completed';
    if (value === 'cancelled' || value === 'canceled') return 'cancelled';

    if (value.includes('pending')) return 'pending';
    if (value.includes('confirm')) return 'confirmed';
    if (value.includes('complete')) return 'completed';
    if (value.includes('cancel')) return 'cancelled';

    return 'pending';
  };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await ownerAPI.getMyBookings();
      const normalizedBookings = (response.bookings || []).map(booking => ({
        ...booking,
        status: normalizeStatus(booking.status),
      }));
      setBookings(normalizedBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      // Fallback to sample data
      const sampleBookings = [
        {
          id: 1,
          carId: 1,
          customerName: "Amit Sharma",
          customerPhone: "+91 9876543210",
          carModel: "Toyota Innova",
          carNumber: "KA01AB1234",
          startDate: "2024-02-15",
          endDate: "2024-02-18",
          totalDays: 3,
          totalAmount: 4500,
          status: "pending",
          bookingDate: "2024-02-10"
        },
        {
          id: 2,
          carId: 2,
          customerName: "Priya Patel",
          customerPhone: "+91 9876543211",
          carModel: "Hyundai Creta",
          carNumber: "KA01CD5678",
          startDate: "2024-02-20",
          endDate: "2024-02-22",
          totalDays: 2,
          totalAmount: 6000,
          status: "confirmed",
          bookingDate: "2024-02-12"
        },
        {
          id: 3,
          carId: 3,
          customerName: "Rahul Verma",
          customerPhone: "+91 9876543212",
          carModel: "Maruti Swift",
          carNumber: "KA01EF9012",
          startDate: "2024-02-25",
          endDate: "2024-02-28",
          totalDays: 3,
          totalAmount: 3000,
          status: "completed",
          bookingDate: "2024-02-08"
        }
      ];
      const normalizedSampleBookings = sampleBookings.map(booking => ({
        ...booking,
        status: normalizeStatus(booking.status),
      }));
      setBookings(normalizedSampleBookings);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingAction = async (bookingId, action) => {
    try {
      if (action === 'confirmed') {
        await ownerAPI.approveBooking(bookingId);
      } else if (action === 'cancelled') {
        await ownerAPI.rejectBooking(bookingId);
      } else if (action === 'completed') {
        await ownerAPI.completeBooking(bookingId);
      }
      alert(`Booking ${action} successfully!`);
      fetchBookings(); // Refresh bookings
    } catch (error) {
      alert(error.message || 'Failed to update booking');
    }
  };

  const handleApproveExtension = async (notificationId) => {
    console.log('Approve button clicked for notification:', notificationId);
    try {
      console.log('Calling approveExtension API...');
      const res = await ownerAPI.approveExtension(notificationId);
      console.log('Approve response:', res);
      toast.success('Extension approved');
      fetchExtensionRequests();
      fetchBookings();
    } catch (e) {
      console.error('Approve error:', e);
      toast.error(e.message || 'Failed to approve');
    }
  };

  const handleRejectExtension = async (notificationId) => {
    console.log('Reject button clicked for notification:', notificationId);
    try {
      console.log('Calling rejectExtension API...');
      const res = await ownerAPI.rejectExtension(notificationId);
      console.log('Reject response:', res);
      toast.success('Extension rejected');
      fetchExtensionRequests();
    } catch (e) {
      console.error('Reject error:', e);
      toast.error(e.message || 'Failed to reject');
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === "all") return true;
    return booking.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'confirmed': return 'success';
      case 'completed': return 'primary';
      case 'cancelled': return 'error';
      default: return 'secondary';
    }
  };

  const getExtensionForBooking = (bookingId) => {
    console.log('Looking for extension for booking:', bookingId);
    console.log('Available extension requests:', extensionRequests);
    const ext = extensionRequests.find(n => {
      const isPending = (n.extensionStatus || 'pending').toString().toLowerCase() === 'pending';
      return isPending && n.relatedBooking?.toString() === bookingId;
    });
    console.log('Found extension:', ext);
    return ext;
  };

  return (
    <section className="bookings-section">
      <div className="section-header">
        <h3>Booking Requests</h3>
        <p>Manage all booking requests for your cars</p>
        
        <div className="booking-filters">
          <button 
            className={`filter-btn ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All ({bookings.length})
          </button>
          <button 
            className={`filter-btn ${filter === "pending" ? "active" : ""}`}
            onClick={() => setFilter("pending")}
          >
            Pending ({bookings.filter(b => b.status === 'pending').length})
          </button>
          <button 
            className={`filter-btn ${filter === "confirmed" ? "active" : ""}`}
            onClick={() => setFilter("confirmed")}
          >
            Confirmed ({bookings.filter(b => b.status === 'confirmed').length})
          </button>
          <button 
            className={`filter-btn ${filter === "completed" ? "active" : ""}`}
            onClick={() => setFilter("completed")}
          >
            Completed ({bookings.filter(b => b.status === 'completed').length})
          </button>
        </div>
      </div>
      
      <div className="bookings-list">
        {filteredBookings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h4>No bookings found</h4>
            <p>There are no {filter !== "all" ? filter : ""} bookings at the moment</p>
          </div>
        ) : (
          filteredBookings.map((booking) => {
            // Handle both API response format and mock data format
            const bookingId = booking._id || booking.id;
            const carModel = typeof booking.car === 'object' ? booking.car?.name : (booking.carName || booking.carModel);
            const carNumber = typeof booking.car === 'object' ? booking.car?.registrationNumber : (booking.carNumber || booking.plateNumber);
            const customerName = typeof booking.customer === 'object' ? booking.customer?.name : booking.customerName;
            const customerPhone = typeof booking.customer === 'object' ? booking.customer?.phone : booking.customerPhone;
            const totalAmount = booking.totalPrice || booking.totalAmount;
            const startDate = booking.startDate ? new Date(booking.startDate).toLocaleDateString() : 'N/A';
            const endDate = booking.endDate ? new Date(booking.endDate).toLocaleDateString() : 'N/A';
            
            // Calculate days if not provided
            let totalDays = booking.totalDays;
            if (!totalDays && booking.startDate && booking.endDate) {
              const start = new Date(booking.startDate);
              const end = new Date(booking.endDate);
              totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
            }
            
            return (
              <div className={`booking-card ${booking.status}`} key={bookingId}>
                <div className="booking-header">
                  <div className="booking-info">
                    <h4>{carModel || 'N/A'}</h4>
                    <span className="car-number">{carNumber || 'N/A'}</span>
                  </div>
                  <div className={`booking-status status-${getStatusColor(booking.status)}`}>
                    {(booking.status || 'pending').toUpperCase()}
                  </div>
                </div>
                
                <div className="booking-details">
                  <div className="customer-info">
                    <strong>{customerName || 'N/A'}</strong>
                    <span>{customerPhone || 'N/A'}</span>
                  </div>
                  
                  <div className="booking-dates">
                    <div className="date-group">
                      <span className="label">Pickup</span>
                      <span className="value">{startDate}</span>
                    </div>
                    <div className="date-group">
                      <span className="label">Return</span>
                      <span className="value">{endDate}</span>
                    </div>
                    <div className="date-group">
                      <span className="label">Days</span>
                      <span className="value">{totalDays || 0}</span>
                    </div>
                  </div>
                  
                  <div className="booking-amount">
                    <span className="label">Total Amount</span>
                    <span className="amount">₹{totalAmount || 0}</span>
                  </div>
                </div>
                
                <div className="booking-actions" style={{display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', alignItems: 'center', flexWrap: 'wrap', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb', minHeight: '50px'}}>
                  {booking.status === 'pending' && (
                    <>
                      <button 
                        className="btn btn-success"
                        style={{padding: '0.75rem 1.5rem', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', whiteSpace: 'nowrap', outline: 'none', minWidth: '120px', height: 'auto', visibility: 'visible', opacity: 1, pointerEvents: 'auto', position: 'relative', zIndex: 10}}
                        onClick={() => handleBookingAction(bookingId, 'confirmed')}
                      >
                        Accept
                      </button>
                      <button 
                        className="btn btn-error"
                        style={{padding: '0.75rem 1.5rem', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', whiteSpace: 'nowrap', outline: 'none', minWidth: '120px', height: 'auto', visibility: 'visible', opacity: 1, pointerEvents: 'auto', position: 'relative', zIndex: 10}}
                        onClick={() => handleBookingAction(bookingId, 'cancelled')}
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {booking.status === 'confirmed' && (
                    <>
                      <button 
                        className="btn btn-primary"
                        style={{padding: '0.75rem 1.5rem', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', whiteSpace: 'nowrap', outline: 'none', minWidth: '120px', height: 'auto', visibility: 'visible', opacity: 1, pointerEvents: 'auto', position: 'relative', zIndex: 10}}
                        onClick={() => handleBookingAction(bookingId, 'completed')}
                      >
                        Mark Complete
                      </button>
                      {(() => {
                        const ext = getExtensionForBooking(bookingId);
                        if (!ext) return null;
                        return (
                          <div className="extension-request-inline" style={{display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fef3c7', padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #fbbf24'}}>
                            <span style={{fontSize: '0.85rem', color: '#92400e'}}>
                              +{ext.extraDays} day(s) requested until {new Date(ext.newEndDate).toLocaleDateString()}
                            </span>
                            <button className="btn btn-success btn-sm" onClick={() => handleApproveExtension(ext._id)} style={{padding: '0.3rem 0.7rem', fontSize: '0.8rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}>✓</button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleRejectExtension(ext._id)} style={{padding: '0.3rem 0.7rem', fontSize: '0.8rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}>✕</button>
                          </div>
                        );
                      })()}
                    </>
                  )}
                  {(booking.status === 'completed' || booking.status === 'cancelled') && (
                    <span className="action-complete">
                      {booking.status === 'completed' ? 'Trip Completed' : 'Booking Cancelled'}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

export default CarBookings;