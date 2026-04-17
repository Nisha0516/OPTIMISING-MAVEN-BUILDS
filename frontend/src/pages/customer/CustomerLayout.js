import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  DirectionsCar, 
  History, 
  Notifications, 
  Person, 
  Logout, 
  Home as HomeIcon
} from "@mui/icons-material";
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
    const loadUserData = () => {
      const userData = localStorage.getItem('customerData') || localStorage.getItem('user');
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
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

    loadUserData();

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

  useEffect(() => {
    const fetchActiveBooking = async () => {
      const token = localStorage.getItem('customerToken') || localStorage.getItem('token');
      if (!token) return;

      try {
        const response = await bookingsAPI.getBookings();
        if (response.success && response.bookings && Array.isArray(response.bookings)) {
          const active = response.bookings.find(booking => {
            const status = (booking.status || '').toLowerCase().trim();
            return status === 'confirmed' || status === 'pending';
          });
          
          if (active) {
            setActiveBooking(active);
          } else if (response.bookings.length > 0) {
            setActiveBooking(response.bookings[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching active booking:', error);
      }
    };

    fetchActiveBooking();
    const interval = setInterval(fetchActiveBooking, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/customer/login');
  };

  const isLoggedIn = localStorage.getItem('customerToken') || localStorage.getItem('token');

  return (
    <div className="customer-layout-prof">
      <nav className={`glass-nav sticky-top ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-container">
            <div className="logo-section" onClick={() => navigate('/customer/home')}>
              <div className="logo-orb">
                <DirectionsCar sx={{ fontSize: 24, transition: '0.3s' }} />
              </div>
              <span className="logo-brand">Drive<span>Easy</span></span>
            </div>
            
            <nav className="desktop-actions">
              <Link 
                to="/customer/home" 
                className={`nav-link-prof ${location.pathname === '/customer/home' ? 'active' : ''}`}
              >
                <HomeIcon /> Home
              </Link>
              {isLoggedIn && (
                <>
                  <Link 
                    to="/customer/my-bookings" 
                    className={`nav-link-prof ${location.pathname === '/customer/my-bookings' ? 'active' : ''}`}
                  >
                    <History /> Bookings
                  </Link>
                  <Link 
                    to="/customer/notifications" 
                    className={`nav-link-prof ${location.pathname === '/customer/notifications' ? 'active' : ''}`}
                  >
                    <Notifications /> Alerts
                  </Link>
                  <Link 
                    to="/customer/profile" 
                    className={`nav-link-prof ${location.pathname === '/customer/profile' ? 'active' : ''}`}
                  >
                    <Person /> Profile
                  </Link>
                  <div className="user-badge-prof">
                     <span>{user?.name || 'Explorer'}</span>
                  </div>
                  <button onClick={handleLogout} className="btn-logout-prof">
                    <Logout sx={{ fontSize: 18 }} />
                  </button>
                </>
              )}
              {!isLoggedIn && (
                <div className="auth-group-prof">
                  <Link to="/customer/login" className="nav-link-prof">Login</Link>
                  <button className="nav-btn-primary" onClick={() => navigate('/customer/signup')}>Get Started</button>
                </div>
              )}
            </nav>

          <button 
            className="mobile-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <div className={`burger ${isMobileMenuOpen ? 'open' : ''}`}></div>
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`mobile-drawer ${isMobileMenuOpen ? 'open' : ''}`}>
          <Link to="/customer/home" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
          {isLoggedIn ? (
            <>
              <Link to="/customer/my-bookings" onClick={() => setIsMobileMenuOpen(false)}>My Bookings</Link>
              <Link to="/customer/profile" onClick={() => setIsMobileMenuOpen(false)}>Profile</Link>
              <button onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <Link to="/customer/login" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
          )}
        </div>
      </nav>

      <main className="content-area-prof">
        {children}
      </main>

      {isLoggedIn && activeBooking && activeBooking._id && (
        <EmergencyButton booking={activeBooking} />
      )}
      
      <footer className="luxury-footer">
        <div className="footer-container">
          <div className="footer-top">
            <div className="footer-brand">
              <span className="logo-brand">Drive<span>Easy</span></span>
              <p>Redefining your journey with luxury and ease.</p>
            </div>
            <div className="footer-links">
              <div className="link-col">
                <h5>Explore</h5>
                <Link to="/customer/home">Luxury Fleet</Link>
                <Link to="/customer/my-bookings">Activity</Link>
              </div>
              <div className="link-col">
                <h5>Support</h5>
                <Link to="/help">Help Center</Link>
                <Link to="/contact">Contact</Link>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 DriveEasy Global. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CustomerLayout;
