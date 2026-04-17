import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  DirectionsCar, 
  VpnKey, 
  AdminPanelSettings, 
  Speed, 
  Shield, 
  SupportAgent, 
  WorkspacePremium 
} from "@mui/icons-material";
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState(null);

  const roles = [
    {
      id: 'customer',
      title: 'Premium Renter',
      icon: <DirectionsCar sx={{ fontSize: 60 }} />,
      description: 'Experience the thrill of the road with our exquisite collection of premium vehicles.',
      features: ['Luxury Fleet', 'Concierge Booking', 'Transparent Pricing'],
      color: '#3b82f6',
      loginPath: '/customer/login',
      signupPath: '/customer/signup'
    },
    {
      id: 'owner',
      title: 'Fleet Partner',
      icon: <VpnKey sx={{ fontSize: 60 }} />,
      description: 'Turn your premium asset into a high-yielding investment with our management tools.',
      features: ['Revenue Analytics', 'Secure Custody', 'Automated Tracking'],
      color: '#6366f1',
      loginPath: '/owner/login',
      signupPath: '/owner/signup'
    },
    {
      id: 'admin',
      title: 'Director',
      icon: <AdminPanelSettings sx={{ fontSize: 60 }} />,
      description: 'Orchestrate the entire ecosystem with advanced administrative controls.',
      features: ['Command Center', 'Performance Metrics', 'System Integrity'],
      color: '#94a3b8',
      loginPath: '/admin/login',
      signupPath: null
    }
  ];

  return (
    <div className="landing-page">
      {/* Dynamic Glass Sidebar or Gradient Accent? Let's use Landing Header as sticky */}
      <nav className="glass-nav">
        <div className="nav-container">
          <div className="logo-section" onClick={() => window.scrollTo(0, 0)}>
            <div className="logo-orb">
              <DirectionsCar fontSize="small" />
            </div>
            <span className="logo-brand">Drive<span>Easy</span></span>
          </div>
          <div className="nav-actions">
            <a href="#fleet" className="nav-link">Our Fleet</a>
            <a href="#how-it-works" className="nav-link">Expereince</a>
            <button className="nav-btn-primary" onClick={() => navigate('/customer/login')}>Get Started</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-hero">
        <div className="hero-overlay"></div>
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <WorkspacePremium fontSize="small" sx={{ color: 'var(--primary)' }} />
              <span>Defining the Future of Luxury Car Rental</span>
            </div>
            <h1 className="hero-title text-gradient">
              Your Journey,<br /><span>Redefined.</span>
            </h1>
            <p className="hero-subtitle">
              Access the world's most exclusive fleet with seamless orchestration between owners and enthusiasts.
            </p>
            <div className="hero-buttons">
              <button className="btn-luxury-primary" onClick={() => document.getElementById('roles').scrollIntoView()}>Explore Experiences</button>
              <button className="btn-luxury-outline">Learn More</button>
            </div>
          </div>
        </div>
      </section>

      {/* Role Selection */}
      <section className="role-section" id="roles">
        <div className="container">
          <div className="section-head text-center">
            <h2 className="text-gradient">Choose Your Journey</h2>
            <p className="text-muted">Tailored access for every participant in the DriveEasy ecosystem.</p>
          </div>

          <div className="role-grid">
            {roles.map((role) => (
              <div
                key={role.id}
                className={`role-glass-card ${hoveredCard === role.id ? 'active' : ''}`}
                onMouseEnter={() => setHoveredCard(role.id)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{ '--accent': role.color }}
              >
                <div className="card-top">
                  <div className="card-icon-container">
                    {role.icon}
                  </div>
                  <h3 className="card-title">{role.title}</h3>
                </div>
                <p className="card-text">{role.description}</p>
                <div className="card-features-list">
                  {role.features.map((f, i) => (
                    <div key={i} className="f-item">
                      <div className="f-dot"></div>
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
                <div className="card-footer-btns">
                  <button className="btn-card-primary" onClick={() => navigate(role.loginPath)}>Access Hub</button>
                  {role.signupPath && (
                    <button className="btn-card-link" onClick={() => navigate(role.signupPath)}>Join Now</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Showcase */}
      <section className="highlights-section" id="how-it-works">
        <div className="container">
          <div className="highlights-grid">
            <div className="h-box glass">
              <Speed className="h-icon" />
              <h4>Instant Activation</h4>
              <p>Skip the paperwork. Our automated verification gets you on the road in minutes.</p>
            </div>
            <div className="h-box glass">
              <Shield className="h-icon" />
              <h4>Ultimate Protection</h4>
              <p>Top-tier insurance coverage and secure encryption for every transaction.</p>
            </div>
            <div className="h-box glass">
              <SupportAgent className="h-icon" />
              <h4>Premier Support</h4>
              <p>Our dedicated concierge team is available 24/7 for all your journey needs.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final Visual Seal */}
      <footer className="luxury-footer">
        <div className="footer-container">
          <div className="footer-top">
            <div className="footer-brand">
              <span className="logo-brand">Drive<span>Easy</span></span>
              <p>Redefining car rentals through luxury, speed, and integrity.</p>
            </div>
            <div className="footer-links">
              <div className="link-col">
                <h5>Platform</h5>
                <a href="#roles">The Fleet</a>
                <a href="#how-it-works">Security</a>
                <a href="/owner/signup">Partners</a>
              </div>
              <div className="link-col">
                <h5>Company</h5>
                <a href="#roles">Our Vision</a>
                <a href="mailto:support@driveeasy.example">Contact</a>
                <a href="/customer/login">Privacy</a>
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

export default Home;
