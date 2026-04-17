import React, { useState, useEffect } from 'react';
import { 
  Person, 
  Email, 
  Phone, 
  Badge, 
  Edit, 
  Save, 
  Cancel,
  CheckCircle,
  VerifiedUser,
  Security
} from '@mui/icons-material';
import CustomerLayout from './CustomerLayout';
import './Profile.css';

const Profile = () => {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    drivingLicense: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedProfile = localStorage.getItem('customerData') || localStorage.getItem('user');
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }
  }, []);

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = () => {
    setLoading(true);
    // Simulate API delay
    setTimeout(() => {
      localStorage.setItem('customerData', JSON.stringify(profile));
      setIsEditing(false);
      setLoading(false);
      alert('Profile updated successfully!');
    }, 800);
  };

  return (
    <CustomerLayout>
      <div className="luxury-profile-page">
        <header className="profile-v3-header">
          <div className="profile-avatar-large">
            <Person sx={{ fontSize: 60, color: '#3b82f6' }} />
          </div>
          <div className="header-text-box">
            <h1>Personal Account</h1>
            <p>Manage your identity and security preferences</p>
          </div>
        </header>

        <div className="profile-v3-content">
          <div className="glass-profile-card">
            <div className="card-v3-header">
              <div className="header-title">
                <Security sx={{ color: '#3b82f6' }} />
                <span>Profile Information</span>
              </div>
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className={`btn-edit-luxury ${isEditing ? 'active' : ''}`}
              >
                {isEditing ? <><Cancel /> Cancel</> : <><Edit /> Edit Profile</>}
              </button>
            </div>

            <form className="profile-v3-form" onSubmit={(e) => e.preventDefault()}>
              <div className="form-grid-v3">
                <div className="input-group-v3">
                  <label><Person sx={{ fontSize: 16 }} /> Full Name</label>
                  <div className="input-wrapper-v3">
                    <input 
                      type="text" 
                      name="name"
                      placeholder="Your Name"
                      value={profile.name}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                    {profile.name && <VerifiedUser className="verified-icon" />}
                  </div>
                </div>

                <div className="input-group-v3">
                  <label><Email sx={{ fontSize: 16 }} /> Email Address</label>
                  <div className="input-wrapper-v3">
                    <input 
                      type="email" 
                      name="email"
                      placeholder="email@example.com"
                      value={profile.email}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="input-group-v3">
                  <label><Phone sx={{ fontSize: 16 }} /> Phone Number</label>
                  <div className="input-wrapper-v3">
                    <input 
                      type="tel" 
                      name="phone"
                      placeholder="+91 XXXXX XXXXX"
                      value={profile.phone}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="input-group-v3">
                  <label><Badge sx={{ fontSize: 16 }} /> Driving License</label>
                  <div className="input-wrapper-v3">
                    <input 
                      type="text" 
                      name="drivingLicense"
                      placeholder="DL-XXXXXX"
                      value={profile.drivingLicense}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="form-v3-actions">
                  <button 
                    onClick={handleSave} 
                    className="btn-save-luxury"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : <><Save /> Save Changes</>}
                  </button>
                </div>
              )}
            </form>
          </div>
          
          <div className="profile-v3-sidebar">
            <div className="info-card-luxury">
              <h4>Security Status</h4>
              <div className="status-item">
                <CheckCircle sx={{ color: '#10b981', fontSize: 18 }} />
                <span>Email Verified</span>
              </div>
              <div className="status-item">
                <CheckCircle sx={{ color: '#10b981', fontSize: 18 }} />
                <span>Identity Confirmed</span>
              </div>
              <div className="status-item incomplete">
                <Cancel sx={{ color: '#64748b', fontSize: 18 }} />
                <span>2FA Not Enabled</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
};

export default Profile;