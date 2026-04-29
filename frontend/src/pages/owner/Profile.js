import React, { useState } from "react";
import { ownerAPI } from '../../services/api';
import "./Profile.css";

function Profile({ ownerProfile, setOwnerProfile }) {
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileFormData, setProfileFormData] = useState({ ...ownerProfile });
  const [saving, setSaving] = useState(false);

  const handleProfileChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "profilePicture") {
      setProfileFormData({ 
        ...profileFormData, 
        profilePicture: files[0],
        profilePictureUrl: URL.createObjectURL(files[0])
      });
    } else {
      setProfileFormData({ ...profileFormData, [name]: value });
    }
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // Prepare data for backend (exclude file objects)
      const profileDataToSave = {
        name: profileFormData.name,
        email: profileFormData.email,
        phone: profileFormData.phone,
        address: profileFormData.address,
        companyName: profileFormData.companyName,
        aadharNumber: profileFormData.aadharNumber,
        licenseNumber: profileFormData.licenseNumber,
        bankAccount: profileFormData.bankAccount,
        ifscCode: profileFormData.ifscCode,
        profilePictureUrl: profileFormData.profilePictureUrl
      };
      
      // Save to backend
      const response = await ownerAPI.updateProfile(profileDataToSave);
      
      // Update local state
      setOwnerProfile(profileFormData);
      
      // Update localStorage
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = { ...currentUser, ...profileDataToSave };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setEditingProfile(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error('Error saving profile:', error);
      alert(error.message || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const cancelEditProfile = () => {
    setProfileFormData(ownerProfile);
    setEditingProfile(false);
  };

  return (
    <section className="profile-section">
      <div className="profile-card">
        <div className="profile-header">
          <h3>Owner Profile</h3>
          {!editingProfile && (
            <button 
              className="btn btn-primary"
              onClick={() => {
                setEditingProfile(true);
                setProfileFormData(ownerProfile);
              }}
            >
              Edit Profile
            </button>
          )}
        </div>

        {editingProfile ? (
          <form onSubmit={saveProfile} className="profile-form">
            <div className="profile-image-upload">
              <div className="current-avatar">
                {profileFormData.profilePictureUrl ? (
                  <img src={profileFormData.profilePictureUrl} alt="Profile" />
                ) : (
                  <div className="avatar-placeholder">
                    {profileFormData.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="file-input-container">
                <input
                  type="file"
                  name="profilePicture"
                  accept="image/*"
                  onChange={handleProfileChange}
                  className="file-input"
                />
                <label className="file-input-label">
                  <span>📷 Change Photo</span>
                </label>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={profileFormData.name}
                  onChange={handleProfileChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={profileFormData.email}
                  onChange={handleProfileChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={profileFormData.phone}
                  onChange={handleProfileChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Company Name</label>
                <input
                  type="text"
                  name="companyName"
                  value={profileFormData.companyName}
                  onChange={handleProfileChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Address</label>
              <textarea
                name="address"
                value={profileFormData.address}
                onChange={handleProfileChange}
                rows="3"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Aadhar Number</label>
                <input
                  type="text"
                  name="aadharNumber"
                  value={profileFormData.aadharNumber}
                  onChange={handleProfileChange}
                />
              </div>
              <div className="form-group">
                <label>License Number</label>
                <input
                  type="text"
                  name="licenseNumber"
                  value={profileFormData.licenseNumber}
                  onChange={handleProfileChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Bank Account Number</label>
                <input
                  type="text"
                  name="bankAccount"
                  value={profileFormData.bankAccount}
                  onChange={handleProfileChange}
                />
              </div>
              <div className="form-group">
                <label>IFSC Code</label>
                <input
                  type="text"
                  name="ifscCode"
                  value={profileFormData.ifscCode}
                  onChange={handleProfileChange}
                />
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={saving}
                style={{ opacity: saving ? 0.7 : 1 }}
              >
                {saving ? '💾 Saving...' : '✓ Save Changes'}
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={cancelEditProfile}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="profile-view">
            <div className="profile-info">
              <div className="profile-avatar">
                {ownerProfile.profilePictureUrl ? (
                  <img src={ownerProfile.profilePictureUrl} alt="Profile" />
                ) : (
                  <div className="avatar-large">
                    {ownerProfile.name.charAt(0)}
                  </div>
                )}
              </div>
              
              <div className="profile-details">
                <div className="detail-group">
                  <h4>{ownerProfile.name}</h4>
                  <p className="company">{ownerProfile.companyName}</p>
                </div>
                
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="label">Email</span>
                    <span className="value">{ownerProfile.email}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Phone</span>
                    <span className="value">{ownerProfile.phone}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Address</span>
                    <span className="value">{ownerProfile.address}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Join Date</span>
                    <span className="value">{ownerProfile.joinDate}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Aadhar Number</span>
                    <span className="value">{ownerProfile.aadharNumber}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">License Number</span>
                    <span className="value">{ownerProfile.licenseNumber}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Bank Account</span>
                    <span className="value">{ownerProfile.bankAccount}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">IFSC Code</span>
                    <span className="value">{ownerProfile.ifscCode}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="profile-stats">
              <div className="stat-item">
                <span className="stat-number">{ownerProfile.totalCars}</span>
                <span className="stat-label">Cars Listed</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">₹{ownerProfile.totalEarnings}</span>
                <span className="stat-label">Total Earnings</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{ownerProfile.rating}</span>
                <span className="stat-label">Rating</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default Profile;