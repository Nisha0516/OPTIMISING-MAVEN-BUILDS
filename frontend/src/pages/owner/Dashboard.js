import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ownerAPI } from '../../services/api';
import Profile from "./Profile";
import AddCars from "./AddCars";
import MyCars from "./MyCars";
import CarBookings from "./CarBookings";
import "./Dashboard.css";

function OwnerDashboard() {  // Component name is OwnerDashboard
  const [cars, setCars] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState("profile");
  
  // Get user data from localStorage
  const getUserData = () => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    return {
      id: userData._id || userData.id || 1,
      name: userData.name || "Owner",
      email: userData.email || "owner@example.com",
      phone: userData.phone || "Not provided",
      address: userData.address || "Not provided",
      joinDate: userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : "N/A",
      totalCars: 0,
      totalEarnings: 0,
      rating: userData.rating || 4.8,
      profilePicture: null,
      profilePictureUrl: userData.profilePicture || null,
      companyName: userData.companyName || "My Car Rentals",
      aadharNumber: userData.aadharNumber || "XXXX-XXXX-XXXX",
      licenseNumber: userData.licenseNumber || "XXXX-XXXX-XXXX",
      bankAccount: userData.bankAccount || "XXXX-XXXX-XXXX",
      ifscCode: userData.ifscCode || "XXXX-XXXX"
    };
  };
  
  const [ownerProfile, setOwnerProfile] = useState(getUserData());

  const [stats, setStats] = useState({
    totalCars: 0,
    activeBookings: 0,
    totalEarnings: 0,
    completedBookings: 0
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const location = useLocation();

  // Update active tab based on URL
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('add-cars')) setActiveTab('addCars');
    else if (path.includes('my-cars')) setActiveTab('myCars');
    else if (path.includes('bookings')) setActiveTab('bookings');
    else setActiveTab('profile');
  }, [location]);

  useEffect(() => {
    fetchDashboardData();
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const response = await ownerAPI.getProfile();
      if (response.success && response.user) {
        const profileData = {
          id: response.user._id,
          name: response.user.name,
          email: response.user.email,
          phone: response.user.phone,
          address: response.user.address || "Not provided",
          joinDate: new Date(response.user.createdAt).toLocaleDateString(),
          totalCars: 0,
          totalEarnings: 0,
          rating: 4.8,
          profilePicture: null,
          profilePictureUrl: response.user.profilePictureUrl || null,
          companyName: response.user.companyName || "My Car Rentals",
          aadharNumber: response.user.aadharNumber || "XXXX-XXXX-XXXX",
          licenseNumber: response.user.licenseNumber || "XXXX-XXXX-XXXX",
          bankAccount: response.user.bankAccount || "XXXX-XXXX-XXXX",
          ifscCode: response.user.ifscCode || "XXXX-XXXX"
        };
        
        setOwnerProfile(profileData);
        
        // Update localStorage with fresh data
        localStorage.setItem('user', JSON.stringify(response.user));
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Fall back to localStorage data
      const localData = getUserData();
      setOwnerProfile(localData);
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await ownerAPI.getDashboard();
      const data = response.stats || {};
      setStats({
        totalCars: data.activeCars || 0,
        activeBookings: data.pendingBookings || 0,
        totalEarnings: data.totalEarnings || 0,
        completedBookings: data.totalRentals || 0
      });
      setCars(response.activeCars || []);
      setBookings(response.recentBookings || []);
      setOwnerProfile(prev => ({
        ...prev,
        totalCars: data.activeCars || 0,
        totalEarnings: data.totalEarnings || 0
      }));
    } catch (err) {
      setError(err.message || 'Failed to load dashboard');
      console.error('Error fetching dashboard:', err);
      // Fallback to mock data
      setStats({
        totalCars: 0,
        activeCars: 0,
        totalBookings: 0,
        totalEarnings: 0
      });
    } finally {
      setLoading(false);
    }
  };

  // Removed redundant stats-override useEffect

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/owner/login');
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // For now, we'll just change the tab state since we're not using URL routing internally
  };

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'profile':
        return <Profile ownerProfile={ownerProfile} setOwnerProfile={setOwnerProfile} />;
      case 'addCars':
        return <AddCars cars={cars} setCars={setCars} />;
      case 'myCars':
        return <MyCars cars={cars} setCars={setCars} />;
      case 'bookings':
        return <CarBookings bookings={bookings} setBookings={setBookings} cars={cars} />;
      default:
        return <Profile ownerProfile={ownerProfile} setOwnerProfile={setOwnerProfile} />;
    }
  };

  return (
    <div className="owner-dashboard">
      <aside className="owner-sidebar">
        <div className="sidebar-header">
          <h2>Owner Portal</h2>
          <p>Manage your cars & bookings</p>
        </div>
        
        <nav className="sidebar-nav">
          <ul>
            <li 
              className={activeTab === "profile" ? "active" : ""}
              onClick={() => handleTabChange('profile')}
            >
              <span>👤 My Profile</span>
            </li>
            <li 
              className={activeTab === "addCars" ? "active" : ""}
              onClick={() => handleTabChange('addCars')}
            >
              <span>📝 Add Car</span>
            </li>
            <li 
              className={activeTab === "myCars" ? "active" : ""}
              onClick={() => handleTabChange('myCars')}
            >
              <span>🚗 My Cars ({stats.totalCars})</span>
            </li>
            <li 
              className={activeTab === "bookings" ? "active" : ""}
              onClick={() => handleTabChange('bookings')}
            >
              <span>📋 Bookings ({stats.activeBookings})</span>
            </li>
          </ul>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {ownerProfile.profilePictureUrl ? (
                <img src={ownerProfile.profilePictureUrl} alt="Profile" />
              ) : (
                <span style={{ color: 'white' }}>{ownerProfile.name?.charAt(0) || 'O'}</span>
              )}
            </div>
            <div className="user-details">
              <strong style={{ color: 'white' }}>{ownerProfile.name || 'Owner'}</strong>
              <span style={{ color: 'rgba(255, 255, 255, 0.9)' }}>{ownerProfile.email || 'owner@example.com'}</span>
            </div>
          </div>
          <button className="btn btn-logout" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </aside>

      <main className="owner-main">
        <header className="dashboard-header">
          <div className="header-content">
            <h1>
              {activeTab === "profile" && "My Profile"}
              {activeTab === "addCars" && "Add New Car"}
              {activeTab === "myCars" && "My Cars"}
              {activeTab === "bookings" && "Bookings"}
            </h1>
            <div className="header-stats">
              <div className="stat-card">
                <span className="stat-number">{stats.totalCars}</span>
                <span className="stat-label">Total Cars</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">{stats.activeBookings}</span>
                <span className="stat-label">Active Bookings</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">₹{stats.totalEarnings}</span>
                <span className="stat-label">Total Earnings</span>
              </div>
            </div>
          </div>
        </header>

        <div className="dashboard-content">
          {renderActiveComponent()}
        </div>
      </main>
    </div>
  );
}

// FIX: Change this from 'Dashboard' to 'OwnerDashboard'
export default OwnerDashboard; // ✅ This should match the component name