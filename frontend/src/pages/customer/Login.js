import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Email as EmailIcon, 
  Lock as LockIcon, 
  ArrowBack,
  DirectionsCar
} from '@mui/icons-material';
import { authAPI } from '../../services/api';
import './Login.css';

const CustomerLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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
    setLoading(true);
    setError('');
    
    try {
      const response = await authAPI.login(formData);
      if (response.user.role !== 'customer') {
        setError('Invalid credentials. Please use customer login.');
        setLoading(false);
        return;
      }
      navigate('/customer/home');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
      setLoading(false);
    }
  };

  return (
    <div className="luxury-login-container">
      <Link to="/" className="back-link">
        <ArrowBack /> <span>Home</span>
      </Link>
      
      <div className="login-visual-bg">
        <div className="bg-overlay"></div>
      </div>

      <div className="login-card-luxury">
        <div className="login-brand">
          <DirectionsCar sx={{ fontSize: 40, color: '#3b82f6' }} />
          <h2>DriveEasy</h2>
        </div>

        <div className="login-header-v2">
          <h1>Welcome Back</h1>
          <p>Login to access your premium rentals</p>
        </div>

        {error && (
          <div className="error-badge-luxury">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="luxury-login-form">
          <div className="input-field-luxury">
            <label htmlFor="email">Email</label>
            <div className="input-wrapper-v2">
              <EmailIcon className="input-icon-v2" />
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
            <label htmlFor="password">Password</label>
            <div className="input-wrapper-v2">
              <LockIcon className="input-icon-v2" />
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

          <div className="login-actions-v2">
            <label className="remember-checkbox">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>
            <Link to="/forgot-password">Forgot Password?</Link>
          </div>

          <button 
            type="submit" 
            className="login-btn-luxury"
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="login-footer-v2">
          <p>New to DriveEasy? <Link to="/customer/signup">Create Account</Link></p>
        </div>
      </div>
    </div>
  );
};

export default CustomerLogin;