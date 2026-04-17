import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Person, 
  Email, 
  Phone, 
  Badge, 
  Lock, 
  ArrowBack,
  DirectionsCar
} from '@mui/icons-material';
import { authAPI } from '../../services/api';
import './Signup.css';

const CustomerSignup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    drivingLicense: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      await authAPI.signup({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        drivingLicense: formData.drivingLicense,
        role: 'customer'
      });
      navigate('/customer/login');
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="luxury-signup-container">
      <Link to="/" className="back-link">
        <ArrowBack /> <span>Home</span>
      </Link>
      
      <div className="signup-visual-bg">
        <div className="bg-overlay"></div>
      </div>

      <div className="signup-card-luxury">
        <div className="signup-brand">
          <DirectionsCar sx={{ fontSize: 32, color: '#3b82f6' }} />
          <h2>DriveEasy</h2>
        </div>

        <div className="signup-header-v2">
          <h1>Join DriveEasy</h1>
          <p>Experience the ultimate in car rentals</p>
        </div>

        {error && (
          <div className="error-badge-luxury">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="luxury-signup-form">
          <div className="signup-form-grid">
            <div className="input-field-luxury">
              <label htmlFor="name">Full Name</label>
              <div className="input-wrapper-v2">
                <Person className="input-icon-v2" />
                <input 
                  type="text" 
                  id="name"
                  name="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="input-field-luxury">
              <label htmlFor="email">Email</label>
              <div className="input-wrapper-v2">
                <Email className="input-icon-v2" />
                <input 
                  type="email" 
                  id="email"
                  name="email"
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="input-field-luxury">
              <label htmlFor="phone">Phone</label>
              <div className="input-wrapper-v2">
                <Phone className="input-icon-v2" />
                <input 
                  type="tel" 
                  id="phone"
                  name="phone"
                  placeholder="+91 XXXXX XXXXX"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="input-field-luxury">
              <label htmlFor="drivingLicense">License Number</label>
              <div className="input-wrapper-v2">
                <Badge className="input-icon-v2" />
                <input 
                  type="text" 
                  id="drivingLicense"
                  name="drivingLicense"
                  placeholder="DL-XXXXXX"
                  value={formData.drivingLicense}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="input-field-luxury">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper-v2">
                <Lock className="input-icon-v2" />
                <input 
                  type="password" 
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="input-field-luxury">
              <label htmlFor="confirmPassword">Confirm</label>
              <div className="input-wrapper-v2">
                <Lock className="input-icon-v2" />
                <input 
                  type="password" 
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            className="signup-btn-luxury"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="signup-footer-v2">
          <p>Already a member? <Link to="/customer/login">Sign In</Link></p>
        </div>
      </div>
    </div>
  );
};

export default CustomerSignup;