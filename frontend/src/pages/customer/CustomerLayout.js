import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import EmergencyButton from '../../components/EmergencyButton/EmergencyButton';
import { bookingsAPI } from '../../services/api';
import './CustomerLayout.css';

const CustomerLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [activeBooking, setActiveBooking] = useState(null);

  useEffect(() => {
    // Function to load user data
    const loadUserData = () => {
      const userData = localStorage.getItem('customerData') || localStorage.getItem('user');
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          // Only set user if they are a customer (not owner/admin)
          if (!parsedUser.role || parsedUser.role === 'customer') {
            setUser(parsedUser);
          }
        } catch (e) {
          console.error('Error parsing user data:', e);
        }
      } else {
        setUser(null);
      }
    };

    // Load on mount
    loadUserData();

    // Listen for storage events (updates from other tabs/windows)
    const handleStorageChange = (e) => {
      if (e.key === 'user' || e.key === 'customerData') {
        loadUserData();
      }
    };

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Fetch active booking for emergency button
  useEffect(() => {
    const fetchActiveBooking = async () => {
      const token = localStorage.getItem('customerToken') || localStorage.getItem('token');
      if (!token) {
        console.log('🚨 Emergency Button: No token found');
        setActiveBooking(null);
        return;
      }

      try {
        console.log('🚨 Emergency Button: Fetching bookings...');
        const response = await bookingsAPI.getBookings();
        console.log('🚨 Emergency Button: Bookings response:', response);
        console.log('🚨 Emergency Button: Full response data:', JSON.stringify(response, null, 2));
        
        if (response.success && response.bookings && Array.isArray(response.bookings)) {
          console.log(`📋 Found ${response.bookings.length} booking(s)`);
          
          // Log all booking statuses for debugging
          response.bookings.forEach((booking, index) => {
            console.log(`Booking ${index + 1}:`, {
              id: booking._id,
              status: booking.status,
              startDate: booking.startDate,
              endDate: booking.endDate,
              car: booking.car?.name
            });
          });
          
          // Find the most recent confirmed or pending booking (case-insensitive)
          const active = response.bookings.find(booking => {
            const status = (booking.status || '').toLowerCase().trim();
            return status === 'confirmed' || status === 'pending';
          });
          
          if (active) {
            console.log('✅ Emergency Button: Active booking found!', active);
            setActiveBooking(active);
          } else {
            console.log('⚠️ Emergency Button: No confirmed/pending booking found');
            console.log('Available bookings:', response.bookings);
            // Use any booking if available (for testing and to help users)
            if (response.bookings.length > 0) {
              const firstBooking = response.bookings[0];
              console.log('📋 Emergency Button: Using first available booking for emergency access:', firstBooking);
              console.log('⚠️ Note: This booking status is:', firstBooking.status);
              setActiveBooking(firstBooking);
            } else {
              console.log('❌ Emergency Button: No bookings found');
              setActiveBooking(null);
            }
          }
        } else {
          console.log('⚠️ Emergency Button: Invalid response format');
          console.log('Response:', response);
          setActiveBooking(null);
        }
      } catch (error) {
        console.error('❌ Error fetching active booking:', error);
        setActiveBooking(null);
      }
    };

    fetchActiveBooking();
    
    // Refresh active booking every 30 seconds
    const interval = setInterval(fetchActiveBooking, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('customerToken');
    localStorage.removeItem('customerData');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/customer/login');
  };

  // Check for both token types
  const isLoggedIn = localStorage.getItem('customerToken') || localStorage.getItem('token');

  return (
    <div className="customer-layout-new">
      {/* Modern Floating Navbar */}
      <header className={`customer-header-new ${scrolled ? 'scrolled' : ''}`}>
        <div className="header-container-new">
          <div className="header-content">
            <div className="logo-new" onClick={() => navigate('/customer/home')}>
              <div className="logo-icon-new">🚙</div>
              <span className="logo-text-new">
                <span className="logo-drive">Drive</span>
                <span className="logo-easy">Easy</span>
              </span>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="desktop-nav">
              <Link 
                to="/customer/home" 
                className={`nav-link ${location.pathname === '/customer/home' ? 'active' : ''}`}
              >
                <span className="nav-icon">🏠</span>
                Home
              </Link>
              {isLoggedIn && (
                <>
                  <Link 
                    to="/customer/my-bookings" 
                    className={`nav-link ${location.pathname === '/customer/my-bookings' ? 'active' : ''}`}
                  >
                    <span className="nav-icon">📋</span>
                    My Bookings
                  </Link>
                  <Link 
                    to="/customer/notifications" 
                    className={`nav-link ${location.pathname === '/customer/notifications' ? 'active' : ''}`}
                  >
                    <span className="nav-icon">🔔</span>
                    Notifications
                  </Link>
                  <Link 
                    to="/customer/profile" 
                    className={`nav-link ${location.pathname === '/customer/profile' ? 'active' : ''}`}
                  >
                    <span className="nav-icon">👤</span>
                    Profile
                  </Link>
                </>
              )}
            </nav>

            {/* User Actions */}
            <div className="user-actions">
              {isLoggedIn ? (
                <div className="user-menu">
                  <div className="user-info">
                    <span className="user-name">
                      Hello, {user && typeof user === 'object' ? (user.name || 'User') : 'User'}
                    </span>
                  </div>
                  <button onClick={handleLogout} className="btn btn-ghost btn-sm">
                    <span className="nav-icon">🚪</span>
                    Logout
                  </button>
                </div>
              ) : (
                <div className="auth-actions">
                  <Link to="/customer/login" className="btn btn-ghost btn-sm">
                    Login
                  </Link>
                  <Link to="/customer/signup" className="btn btn-primary btn-sm">
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="mobile-menu-btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>

          {/* Mobile Navigation */}
          <div className={`mobile-nav ${isMobileMenuOpen ? 'open' : ''}`}>
            <Link 
              to="/customer/home" 
              className={`nav-link ${location.pathname === '/customer/home' ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="nav-icon">🏠</span>
              Home
            </Link>
            {isLoggedIn && (
              <>
                <Link 
                  to="/customer/my-bookings" 
                  className={`nav-link ${location.pathname === '/customer/my-bookings' ? 'active' : ''}`}
                >
                  <span className="nav-icon">📋</span>
                  My Bookings
                </Link>
                <Link 
                  to="/customer/notifications" 
                  className={`nav-link ${location.pathname === '/customer/notifications' ? 'active' : ''}`}
                >
                  <span className="nav-icon">🔔</span>
                  Notifications
                </Link>
                <Link 
                  to="/customer/profile" 
                  className={`nav-link ${location.pathname === '/customer/profile' ? 'active' : ''}`}
                >
                  <span className="nav-icon">👤</span>
                  Profile
                </Link>
              </>
            )}
          </div>

          {/* User Actions */}
          <div className="user-actions">
            {isLoggedIn ? (
              <div className="user-menu">
                <div className="user-info">
                  <span className="user-name">
                    Hello, {user && typeof user === 'object' ? (user.name || 'User') : 'User'}
                  </span>
                </div>
                <button onClick={handleLogout} className="btn btn-ghost btn-sm">
                  <span className="nav-icon">🚪</span>
                  Logout
                </button>
              </div>
            ) : (
              <div className="auth-actions">
                <Link to="/customer/login" className="btn btn-ghost btn-sm">
                  <span className="nav-icon">🔑</span>
                  Login
                </Link>
                <Link 
                  to="/customer/signup" 
                  className="nav-link"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="nav-icon">📝</span>
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="customer-main">
        {children}
      </main>

      {/* Emergency Button - Shows for logged in users */}
      {isLoggedIn && (
        activeBooking && activeBooking._id ? (
          <EmergencyButton booking={activeBooking} />
        ) : (
          // Show button even without booking for testing, but it will show error when clicked
          <div style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            zIndex: 99999
          }}>
            <button
              onClick={() => {
                alert('⚠️ No Active Booking\n\nTo use the emergency button:\n1. Book a car first\n2. Wait for booking approval\n3. Then the emergency button will work\n\nFor testing, you can create a booking from the home page.');
              }}
              style={{
                background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '50px',
                padding: '15px 25px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(220, 38, 38, 0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                animation: 'pulse 2s infinite'
              }}
              title="Emergency Assistance - No active booking"
            >
              <span style={{ fontSize: '24px' }}>🚨</span>
              <span>Emergency</span>
            </button>
            <style>{`
              @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
              }
            `}</style>
          </div>
        )
      )}
      
      {/* Debug info - Hidden in production for professional look */}
      {false && process.env.NODE_ENV === 'development' && (
        <div style={{
          position: 'fixed',
          bottom: '100px',
          right: '20px',
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '10px',
          borderRadius: '5px',
          fontSize: '12px',
          zIndex: 99998,
          maxWidth: '200px'
        }}>
          <div>Logged In: {isLoggedIn ? 'Yes' : 'No'}</div>
          <div>Has Booking: {activeBooking ? 'Yes' : 'No'}</div>
          {activeBooking && <div>Booking ID: {activeBooking._id?.substring(0, 8)}...</div>}
          {activeBooking && <div>Status: {activeBooking.status}</div>}
          {!activeBooking && (
            <div style={{ marginTop: '5px', color: '#fbbf24' }}>
              ⚠️ Create a booking first
            </div>
          )}
        </div>
      )}

      <footer className="customer-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>DriveFlex</h3>
            <p>Your trusted partner for car rentals. Find the perfect vehicle for your journey.</p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <Link to="/customer/home">Browse Cars</Link>
            <Link to="/about">About Us</Link>
            <Link to="/contact">Contact</Link>
          </div>
          <div className="footer-section">
            <h4>Support</h4>
            <Link to="/help">Help Center</Link>
            <Link to="/faq">FAQ</Link>
            <Link to="/terms">Terms of Service</Link>
          </div>
          <div className="footer-section">
            <h4>Contact Info</h4>
            <p>📞 +1 (555) 123-4567</p>
            <p>✉️ support@driveflex.com</p>
            <p>📍 123 Rental St, City, State</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 DriveFlex. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default CustomerLayout;