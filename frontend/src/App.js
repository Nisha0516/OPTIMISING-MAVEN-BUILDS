import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Home
import Home from "./pages/Home";

// Customer Pages
import CustomerLogin from "./pages/customer/Login";
import CustomerSignup from "./pages/customer/Signup";
import CustomerHome from "./pages/customer/Home";
import CarDetails from "./pages/customer/CarDetails";
import Booking from "./pages/customer/Booking";
import MyBooking from "./pages/customer/MyBooking";
import Profile from "./pages/customer/Profile";
import CustomerNotificationsPage from "./pages/customer/Notifications";

// Owner Pages
import OwnerLogin from "./pages/owner/Login";
import OwnerSignup from "./pages/owner/Signup";
import OwnerDashboard from "./pages/owner/Dashboard";

// Admin Pages
import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminAllBookings from "./pages/admin/AllBookings";
import AdminManageCars from "./pages/admin/ManageCars";
import AdminManageUser from "./pages/admin/ManageUser";
import AdminReport from "./pages/admin/Report";
import AdminLayout from "./pages/admin/AdminLayout";
import ManageOwners from "./pages/admin/ManageOwners";
import AdminEmergencies from "./pages/admin/Emergencies";

// Route Protection Components
const OwnerProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return (token && user.role === 'owner') ? children : <Navigate to="/owner/login" />;
};

const AdminProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return (token && user.role === 'admin') ? children : <Navigate to="/admin/login" />;
};

const CustomerProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return (token && user.role === 'customer') ? children : <Navigate to="/customer/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Home - Public landing page */}
        <Route path="/" element={<Home />} />

        {/* Customer Routes */}
        <Route path="/customer/login" element={<CustomerLogin />} />
        <Route path="/customer/signup" element={<CustomerSignup />} />
        <Route path="/customer/home" element={<CustomerHome />} />
        <Route path="/customer/cars/:id" element={<CarDetails />} />
        
        {/* Protected Customer Routes */}
        <Route 
          path="/customer/booking/:carId" 
          element={
            <CustomerProtectedRoute>
              <Booking />
            </CustomerProtectedRoute>
          } 
        />
        <Route 
          path="/customer/my-bookings" 
          element={
            <CustomerProtectedRoute>
              <MyBooking />
            </CustomerProtectedRoute>
          } 
        />
        <Route 
          path="/customer/profile" 
          element={
            <CustomerProtectedRoute>
              <Profile />
            </CustomerProtectedRoute>
          } 
        />
        <Route 
          path="/customer/notifications" 
          element={
            <CustomerProtectedRoute>
              <CustomerNotificationsPage />
            </CustomerProtectedRoute>
          } 
        />

        {/* Owner Routes */}
        <Route path="/owner/login" element={<OwnerLogin />} />
        <Route path="/owner/signup" element={<OwnerSignup />} />
        <Route 
          path="/owner/dashboard" 
          element={
            <OwnerProtectedRoute>
              <OwnerDashboard />
            </OwnerProtectedRoute>
          } 
        />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route 
          path="/admin/dashboard" 
          element={
            <AdminProtectedRoute>
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            </AdminProtectedRoute>
          } 
        />
        <Route 
          path="/admin/bookings" 
          element={
            <AdminProtectedRoute>
              <AdminLayout>
                <AdminAllBookings />
              </AdminLayout>
            </AdminProtectedRoute>
          } 
        />
        <Route 
          path="/admin/cars" 
          element={
            <AdminProtectedRoute>
              <AdminLayout>
                <AdminManageCars />
              </AdminLayout>
            </AdminProtectedRoute>
          } 
        />
        <Route 
          path="/admin/owners" 
          element={
            <AdminProtectedRoute>
              <AdminLayout>
                <ManageOwners />
              </AdminLayout>
            </AdminProtectedRoute>
          } 
        />
        <Route 
          path="/admin/users" 
          element={
            <AdminProtectedRoute>
              <AdminLayout>
                <AdminManageUser />
              </AdminLayout>
            </AdminProtectedRoute>
          } 
        />
        <Route 
          path="/admin/reports" 
          element={
            <AdminProtectedRoute>
              <AdminLayout>
                <AdminReport />
              </AdminLayout>
            </AdminProtectedRoute>
          } 
        />
        <Route 
          path="/admin/emergencies" 
          element={
            <AdminProtectedRoute>
              <AdminLayout>
                <AdminEmergencies />
              </AdminLayout>
            </AdminProtectedRoute>
          } 
        />

        {/* Redirects */}
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/customer" element={<Navigate to="/customer/home" replace />} />
        <Route path="/owner" element={<Navigate to="/owner/dashboard" replace />} />
        
        {/* Fallback route */}
        <Route path="*" element={
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100vh',
            fontSize: '1.5rem',
            color: '#666'
          }}>
            404 - Page Not Found
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;