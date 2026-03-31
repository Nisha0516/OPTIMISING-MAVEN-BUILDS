// Authentication Helper Service
import { authAPI } from './api';

class AuthService {
  // Get current user from localStorage
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  }

  // Get current token
  getToken() {
    return localStorage.getItem('token');
  }

  // Check if user is logged in
  isLoggedIn() {
    return !!this.getToken();
  }

  // Get user role
  getUserRole() {
    const user = this.getCurrentUser();
    return user?.role || null;
  }

  // Check if user has specific role
  hasRole(role) {
    return this.getUserRole() === role;
  }

  // Check if user is customer
  isCustomer() {
    return this.hasRole('customer');
  }

  // Check if user is owner
  isOwner() {
    return this.hasRole('owner');
  }

  // Check if user is admin
  isAdmin() {
    return this.hasRole('admin');
  }

  // Login
  async login(credentials) {
    try {
      const response = await authAPI.login(credentials);
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Signup
  async signup(userData) {
    try {
      const response = await authAPI.signup(userData);
      // Store token and user data
      if (response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      return response;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  }

  // Logout
  logout() {
    authAPI.logout();
    // Redirect to home or login page
    window.location.href = '/';
  }

  // Refresh user data
  async refreshUser() {
    try {
      const response = await authAPI.getMe();
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      return response.user;
    } catch (error) {
      console.error('Refresh user error:', error);
      // If token is invalid, logout
      this.logout();
      throw error;
    }
  }
}

export default new AuthService();
