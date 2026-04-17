import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  DirectionsCar, 
  Dashboard, 
  AddBox, 
  History, 
  Logout, 
  Person 
} from "@mui/icons-material";

const Navbar = ({ role }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <nav className="glass-nav sticky-top">
      <div className="nav-container">
        <Link className="logo-section" to="/">
          <div className="logo-orb">
            <DirectionsCar fontSize="small" />
          </div>
          <span className="logo-brand">Drive<span>Easy</span></span>
        </Link>

        <div className="nav-actions">
          <ul className="nav-list" style={{ display: 'flex', gap: '2rem', listStyle: 'none', margin: 0, padding: 0 }}>
            {role === "customer" && (
              <>
                <li>
                  <Link className="nav-link-prof" to="/customer/home">
                    <DirectionsCar fontSize="small" /> Home
                  </Link>
                </li>
                <li>
                  <Link className="nav-link-prof" to="/customer/my-bookings">
                    <History fontSize="small" /> My Bookings
                  </Link>
                </li>
              </>
            )}
            {role === "owner" && (
              <>
                <li>
                  <Link className="nav-link-prof" to="/owner/dashboard">
                    <Dashboard fontSize="small" /> Dashboard
                  </Link>
                </li>
                <li>
                  <Link className="nav-link-prof" to="/owner/add-car">
                    <AddBox fontSize="small" /> Add Car
                  </Link>
                </li>
              </>
            )}
            {role === "admin" && (
              <>
                <li>
                  <Link className="nav-link-prof" to="/admin/dashboard">
                    <Dashboard fontSize="small" /> Admin Panel
                  </Link>
                </li>
              </>
            )}
            <li>
              <button onClick={handleLogout} className="nav-link-prof" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <Logout fontSize="small" /> Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
