import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState(null);

  const roles = [
    {
      id: 'customer',
      title: 'Customer',
      icon: '🚗',
      description: 'Browse and book your perfect car for any occasion',
      features: ['Wide Selection', 'Easy Booking', 'Best Prices'],
      color: '#4f46e5',
      loginPath: '/customer/login',
      signupPath: '/customer/signup'
    },
    {
      id: 'owner',
      title: 'Car Owner',
      icon: '🔑',
      description: 'List your cars and earn money while they\'re not in use',
      features: ['Extra Income', 'Manage Fleet', 'Track Earnings'],
      color: '#059669',
      loginPath: '/owner/login',
      signupPath: '/owner/signup'
    },
    {
      id: 'admin',
      title: 'Administrator',
      icon: '⚙️',
      description: 'Manage the entire platform with powerful admin tools',
      features: ['Full Control', 'Analytics', 'User Management'],
      color: '#dc2626',
      loginPath: '/admin/login',
      signupPath: null
    }
  ];

  return (
    <div className="landing-page">
      {/* Animated Background */}
      <div className="landing-bg">
        <div className="bg-shape shape-1"></div>
        <div className="bg-shape shape-2"></div>
        <div className="bg-shape shape-3"></div>
      </div>

      {/* Header */}
      <header className="landing-header">
        <div className="logo">
          <span className="logo-icon">🚙</span>
          <span className="logo-text">DriveEasy</span>
        </div>
        <nav className="nav-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Your Journey Starts Here
          </h1>
          <p className="hero-subtitle">
            The ultimate car rental platform connecting customers, owners, and administrators
          </p>
          <div className="hero-badge">
            <span>✨</span>
            <span>Trusted by 10,000+ users worldwide</span>
          </div>
        </div>
      </section>

      {/* Role Selection Section */}
      <section className="role-selection">
        <div className="section-header">
          <h2>Choose Your Role</h2>
          <p>Select how you'd like to use our platform</p>
        </div>

        <div className="role-cards">
          {roles.map((role) => (
            <div
              key={role.id}
              className={`role-card ${hoveredCard === role.id ? 'hovered' : ''}`}
              onMouseEnter={() => setHoveredCard(role.id)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{ '--role-color': role.color }}
            >
              <div className="card-glow"></div>
              <div className="card-icon">{role.icon}</div>
              <h3 className="card-title">{role.title}</h3>
              <p className="card-description">{role.description}</p>
              
              <div className="card-features">
                {role.features.map((feature, index) => (
                  <div key={index} className="feature-item">
                    <span className="feature-dot"></span>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <div className="card-actions">
                <button 
                  className="btn-login"
                  onClick={() => navigate(role.loginPath)}
                >
                  Login
                </button>
                {role.signupPath && (
                  <button 
                    className="btn-signup"
                    onClick={() => navigate(role.signupPath)}
                  >
                    Sign Up
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section" id="features">
        <div className="section-header">
          <h2>Why Choose Us?</h2>
          <p>Experience the best car rental service</p>
        </div>

        <div className="features-grid">
          <div className="feature-box">
            <div className="feature-icon">⚡</div>
            <h4>Instant Booking</h4>
            <p>Book your car in seconds with our streamlined process</p>
          </div>
          <div className="feature-box">
            <div className="feature-icon">💎</div>
            <h4>Premium Selection</h4>
            <p>Choose from a wide range of quality vehicles</p>
          </div>
          <div className="feature-box">
            <div className="feature-icon">🔒</div>
            <h4>Secure Payments</h4>
            <p>Multiple payment options with bank-grade security</p>
          </div>
          <div className="feature-box">
            <div className="feature-icon">🌟</div>
            <h4>24/7 Support</h4>
            <p>Our team is always here to help you</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>🚙 DriveEasy</h4>
            <p>Making car rental simple and accessible for everyone</p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <a href="#">About Us</a>
            <a href="#">Terms of Service</a>
            <a href="#">Privacy Policy</a>
          </div>
          <div className="footer-section">
            <h4>Contact</h4>
            <p>📧 support@driveeasy.com</p>
            <p>📞 +1 (555) 123-4567</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2024 DriveEasy. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
