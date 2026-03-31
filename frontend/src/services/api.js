// API Service for Backend Communication
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Ensure the URL doesn't end with a slash
const cleanBaseUrl = API_BASE_URL.endsWith('/') 
  ? API_BASE_URL.slice(0, -1) 
  : API_BASE_URL;

const API_URL = `${cleanBaseUrl}`;

// Helper function to get token from localStorage
const getToken = () => {
  return localStorage.getItem('token');
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  console.log('handleResponse called with status:', response.status);
  const data = await response.json();
  console.log('handleResponse parsed data:', data);

  if (!response.ok) {
    console.log('Response not OK, throwing error');
    throw new Error(data.message || 'Something went wrong');
  }
  console.log('Response OK, returning data');
  return data;
};

// Authentication APIs
export const authAPI = {
  signup: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  login: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    const data = await handleResponse(response);
    
    // Store token and user data
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    
    return data;
  },

  getMe: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    return handleResponse(response);
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

// Cars APIs
export const carsAPI = {
  getCars: async (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    const url = queryParams ? `${API_BASE_URL}/cars?${queryParams}` : `${API_BASE_URL}/cars`;
    
    const response = await fetch(url);
    return handleResponse(response);
  },

  getCar: async (id) => {
    const response = await fetch(`${API_BASE_URL}/cars/${id}`);
    return handleResponse(response);
  },

  createCar: async (carData) => {
    const response = await fetch(`${API_BASE_URL}/cars`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
      body: JSON.stringify(carData),
    });
    return handleResponse(response);
  },

  updateCar: async (id, carData) => {
    const response = await fetch(`${API_BASE_URL}/cars/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
      body: JSON.stringify(carData),
    });
    return handleResponse(response);
  },

  deleteCar: async (id) => {
    const response = await fetch(`${API_BASE_URL}/cars/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    return handleResponse(response);
  },
};

// Bookings APIs
export const bookingsAPI = {
  getBookings: async () => {
    const response = await fetch(`${API_BASE_URL}/bookings`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    return handleResponse(response);
  },

  getBooking: async (id) => {
    const response = await fetch(`${API_BASE_URL}/bookings/${id}`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    return handleResponse(response);
  },

  createBooking: async (bookingData) => {
    const response = await fetch(`${API_BASE_URL}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
      body: JSON.stringify(bookingData),
    });
    return handleResponse(response);
  },

  updateBooking: async (id, bookingData) => {
    const response = await fetch(`${API_BASE_URL}/bookings/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
      body: JSON.stringify(bookingData),
    });
    return handleResponse(response);
  },

  cancelBooking: async (id) => {
    const response = await fetch(`${API_BASE_URL}/bookings/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    return handleResponse(response);
  },

  confirmBooking: async (id) => {
    const response = await fetch(`${API_BASE_URL}/bookings/${id}/status?status=confirmed`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    return handleResponse(response);
  },

  acceptBooking: async (id) => {
    const response = await fetch(`${API_BASE_URL}/bookings/${id}/status?status=confirmed`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    return handleResponse(response);
  },

  deleteBooking: async (id) => {
    const response = await fetch(`${API_BASE_URL}/bookings/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    return handleResponse(response);
  },

  approveBooking: async (id) => {
    const response = await fetch(`${API_BASE_URL}/bookings/${id}/status?status=confirmed`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    return handleResponse(response);
  },

  rejectBooking: async (id) => {
    const response = await fetch(`${API_BASE_URL}/bookings/${id}/status?status=rejected`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    return handleResponse(response);
  },

  extendBooking: async (id, extraDays) => {
    const response = await fetch(`${API_BASE_URL}/bookings/${id}/extend`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ extraDays }),
    });
    return handleResponse(response);
  },
};

// Admin APIs
export const adminAPI = {
  getDashboardStats: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/stats`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    return handleResponse(response);
  },

  getAllBookings: async (page = 1, status = '') => {
    const params = new URLSearchParams({ page });
    if (status) params.append('status', status);
    
    const response = await fetch(`${API_BASE_URL}/admin/bookings?${params}`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    return handleResponse(response);
  },

  getAllUsers: async (page = 1, role = '') => {
    const params = new URLSearchParams({ page });
    if (role) params.append('role', role);
    
    const response = await fetch(`${API_BASE_URL}/admin/users?${params}`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    return handleResponse(response);
  },

  getAllCars: async (page = 1) => {
    const response = await fetch(`${API_BASE_URL}/admin/cars?page=${page}`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    return handleResponse(response);
  },

  approveCar: async (id) => {
    const response = await fetch(`${API_BASE_URL}/admin/cars/${id}/approve`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    return handleResponse(response);
  },

  deleteCar: async (id) => {
    const response = await fetch(`${API_BASE_URL}/cars/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    return handleResponse(response);
  },

  updateCar: async (id, carData) => {
    const response = await fetch(`${API_BASE_URL}/cars/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
      body: JSON.stringify(carData),
    });
    return handleResponse(response);
  },

  addCar: async (carData) => {
    const response = await fetch(`${API_BASE_URL}/cars`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
      body: JSON.stringify(carData),
    });
    return handleResponse(response);
  },

  getReports: async (type, startDate, endDate) => {
    const params = new URLSearchParams({ type });
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await fetch(`${API_BASE_URL}/admin/reports?${params}`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    return handleResponse(response);
  },
};

// Reviews APIs
export const reviewsAPI = {
  getCarReviews: async (carId) => {
    const response = await fetch(`${API_BASE_URL}/reviews/car/${carId}`);
    return handleResponse(response);
  },

  addReview: async (reviewData) => {
    const response = await fetch(`${API_BASE_URL}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
      body: JSON.stringify(reviewData),
    });
    return handleResponse(response);
  },

  updateReview: async (id, reviewData) => {
    const response = await fetch(`${API_BASE_URL}/reviews/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
      body: JSON.stringify(reviewData),
    });
    return handleResponse(response);
  },

  deleteReview: async (id) => {
    const response = await fetch(`${API_BASE_URL}/reviews/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    return handleResponse(response);
  },

  markHelpful: async (id) => {
    const response = await fetch(`${API_BASE_URL}/reviews/${id}/helpful`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    return handleResponse(response);
  },
};

// Favorites APIs
export const favoritesAPI = {
  getFavorites: async () => {
    const response = await fetch(`${API_BASE_URL}/favorites`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    return handleResponse(response);
  },

  addFavorite: async (carId) => {
    const response = await fetch(`${API_BASE_URL}/favorites`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ carId }),
    });
    return handleResponse(response);
  },

  removeFavorite: async (carId) => {
    const response = await fetch(`${API_BASE_URL}/favorites/${carId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    return handleResponse(response);
  },

  checkFavorite: async (carId) => {
    const response = await fetch(`${API_BASE_URL}/favorites/check/${carId}`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    return handleResponse(response);
  },
};

// Notifications APIs
export const notificationsAPI = {
  getNotifications: async (read = null, limit = 20) => {
    const params = new URLSearchParams({ limit });
    if (read !== null) params.append('read', read);
    
    const response = await fetch(`${API_BASE_URL}/notifications?${params}`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    return handleResponse(response);
  },

  markAsRead: async (id) => {
    const response = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    return handleResponse(response);
  },

  markAllAsRead: async () => {
    const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    return handleResponse(response);
  },

  deleteNotification: async (id) => {
    const response = await fetch(`${API_BASE_URL}/notifications/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    return handleResponse(response);
  },
};

// Messages APIs
export const messagesAPI = {
  getMessages: async (type = 'received') => {
    const response = await fetch(`${API_BASE_URL}/messages?type=${type}`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    return handleResponse(response);
  },

  getMessage: async (id) => {
    const response = await fetch(`${API_BASE_URL}/messages/${id}`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    return handleResponse(response);
  },

  sendMessage: async (messageData) => {
    const response = await fetch(`${API_BASE_URL}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
      body: JSON.stringify(messageData),
    });
    return handleResponse(response);
  },

  markAsRead: async (id) => {
    const response = await fetch(`${API_BASE_URL}/messages/${id}/read`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    return handleResponse(response);
  },

  deleteMessage: async (id) => {
    const response = await fetch(`${API_BASE_URL}/messages/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    return handleResponse(response);
  },
};

// Owner APIs
export const ownerAPI = {
  getDashboard: async () => {
    const response = await fetch(`${API_BASE_URL}/owner/dashboard`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    return handleResponse(response);
  },

  // Get owner profile
  getProfile: async () => {
    const response = await fetch(`${API_BASE_URL}/owner/profile`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    return handleResponse(response);
  },

  // Update owner profile
  updateProfile: async (profileData) => {
    const response = await fetch(`${API_BASE_URL}/owner/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
      body: JSON.stringify(profileData),
    });
    return handleResponse(response);
  },

  // Get owner's cars
  getMyCars: async (status = '', page = 1) => {
    const params = new URLSearchParams({ page });
    if (status) params.append('status', status);
    
    const response = await fetch(`${API_BASE_URL}/owner/cars?${params}`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    return handleResponse(response);
  },

  getCars: async (status = '', page = 1) => {
    const params = new URLSearchParams({ page });
    if (status) params.append('status', status);
    
    const response = await fetch(`${API_BASE_URL}/owner/cars?${params}`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    return handleResponse(response);
  },

  // Add new car
  addCar: async (carData) => {
    const response = await fetch(`${API_BASE_URL}/owner/cars`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
      body: JSON.stringify(carData),
    });
    return handleResponse(response);
  },

  // Update car
  updateCar: async (carId, carData) => {
    const response = await fetch(`${API_BASE_URL}/owner/cars/${carId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
      body: JSON.stringify(carData),
    });
    return handleResponse(response);
  },

  // Delete car
  deleteCar: async (carId) => {
    const response = await fetch(`${API_BASE_URL}/owner/cars/${carId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    return handleResponse(response);
  },

  // Get owner's bookings
  getMyBookings: async (status = '', page = 1) => {
    const params = new URLSearchParams({ page });
    if (status) params.append('status', status);
    
    const response = await fetch(`${API_BASE_URL}/owner/bookings?${params}`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    return handleResponse(response);
  },

  getBookings: async (status = '', page = 1) => {
    const params = new URLSearchParams({ page });
    if (status) params.append('status', status);
    
    const response = await fetch(`${API_BASE_URL}/owner/bookings?${params}`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    return handleResponse(response);
  },

  // Approve booking
  approveBooking: async (bookingId) => {
    const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/status?status=confirmed`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    return handleResponse(response);
  },

  // Reject booking
  rejectBooking: async (bookingId) => {
    const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/status?status=rejected`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    return handleResponse(response);
  },

  // Cancel/Delete booking
  cancelBooking: async (bookingId) => {
    const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    return handleResponse(response);
  },

  // Complete booking
  completeBooking: async (bookingId) => {
    const response = await fetch(`${API_BASE_URL}/owner/bookings/${bookingId}/complete`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    return handleResponse(response);
  },

  getCarReviews: async (carId) => {
    const response = await fetch(`${API_BASE_URL}/owner/reviews/${carId}`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    return handleResponse(response);
  },

  // Get owner's reviews
  getMyReviews: async () => {
    const response = await fetch(`${API_BASE_URL}/owner/reviews`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    return handleResponse(response);
  },

  getEarnings: async (startDate, endDate) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await fetch(`${API_BASE_URL}/owner/earnings?${params}`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    return handleResponse(response);
  },

  updateCarAvailability: async (carId, available) => {
    const response = await fetch(`${API_BASE_URL}/owner/cars/${carId}/availability`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ available }),
    });
    return handleResponse(response);
  },

  getCarPerformance: async (carId) => {
    const response = await fetch(`${API_BASE_URL}/owner/cars/${carId}/performance`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    return handleResponse(response);
  },

  // Extension requests for owners
  getExtensionRequests: async () => {
    const response = await fetch(`${API_BASE_URL}/notifications?type=booking_extension_requested`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    return handleResponse(response);
  },

  approveExtension: async (notificationId) => {
    console.log('ownerAPI.approveExtension called with:', notificationId);
    const response = await fetch(`${API_BASE_URL}/bookings/notifications/${notificationId}/approve-extension`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    console.log('approveExtension response status:', response.status);
    const result = await handleResponse(response);
    console.log('approveExtension result:', result);
    return result;
  },

  rejectExtension: async (notificationId) => {
    console.log('ownerAPI.rejectExtension called with:', notificationId);
    const response = await fetch(`${API_BASE_URL}/bookings/notifications/${notificationId}/reject-extension`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    console.log('rejectExtension response status:', response.status);
    const result = await handleResponse(response);
    console.log('rejectExtension result:', result);
    return result;
  },
};

// Admin Advanced APIs
export const adminAdvancedAPI = {
  toggleUserStatus: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/admin/advanced/users/${userId}/toggle-status`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    return handleResponse(response);
  },

  deleteUser: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/admin/advanced/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    return handleResponse(response);
  },

  rejectCar: async (carId, reason) => {
    const response = await fetch(`${API_BASE_URL}/admin/advanced/cars/${carId}/reject`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ reason }),
    });
    return handleResponse(response);
  },

  getPlatformAnalytics: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/advanced/analytics`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    return handleResponse(response);
  },

  getRevenueAnalytics: async (startDate, endDate) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await fetch(`${API_BASE_URL}/admin/advanced/revenue?${params}`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    return handleResponse(response);
  },

  deleteReview: async (reviewId) => {
    const response = await fetch(`${API_BASE_URL}/admin/advanced/reviews/${reviewId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    return handleResponse(response);
  },

  getSystemHealth: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/advanced/system-health`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    return handleResponse(response);
  },
};

// Emergency APIs
export const emergencyAPI = {
  createEmergency: async (emergencyData) => {
    const response = await fetch(`${API_BASE_URL}/emergency`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
      body: JSON.stringify(emergencyData),
    });
    return handleResponse(response);
  },

  getMyEmergencies: async () => {
    const response = await fetch(`${API_BASE_URL}/emergency/my-emergencies`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    return handleResponse(response);
  },

  getOwnerEmergencies: async () => {
    const response = await fetch(`${API_BASE_URL}/emergency/owner`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    return handleResponse(response);
  },

  getAllEmergencies: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${API_BASE_URL}/emergency/all?${params}`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    return handleResponse(response);
  },

  updateEmergencyStatus: async (emergencyId, status, notes) => {
    const response = await fetch(`${API_BASE_URL}/emergency/${emergencyId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ status, notes }),
    });
    return handleResponse(response);
  },

  resolveEmergency: async (emergencyId, notes) => {
    const response = await fetch(`${API_BASE_URL}/emergency/${emergencyId}/resolve`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ notes }),
    });
    return handleResponse(response);
  },
};
export const paymentsAPI = {
  getPayments: async () => {
    const response = await fetch(`${API_BASE_URL}/payments`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    return handleResponse(response);
  },

  getPayment: async (id) => {
    const response = await fetch(`${API_BASE_URL}/payments/${id}`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    return handleResponse(response);
  },

  processPayment: async (paymentData) => {
    const response = await fetch(`${API_BASE_URL}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
      body: JSON.stringify(paymentData),
    });
    return handleResponse(response);
  },

  processRefund: async (id, refundData) => {
    const response = await fetch(`${API_BASE_URL}/payments/${id}/refund`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
      body: JSON.stringify(refundData),
    });
    return handleResponse(response);
  },

  getPaymentStats: async () => {
    const response = await fetch(`${API_BASE_URL}/payments/stats`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
    });
    return handleResponse(response);
  },

  createRazorpayOrder: async (data) => {
    try {
      // Support both createRazorpayOrder(bookingId) and createRazorpayOrder({ ... })
      const payload = (typeof data === 'string' || typeof data === 'number')
        ? { bookingId: data }
        : data;

      console.log('[DEBUG] Creating Razorpay order with data:', payload);
      const url = `${API_BASE_URL}/payments/create-order`;
      console.log('[DEBUG] Making request to:', url);
      
      const token = getToken();
      console.log('[DEBUG] Using auth token:', token ? 'Token exists' : 'No token found');
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      console.log('[DEBUG] Response status:', response.status);
      const rawText = await response.text();
      let responseData = {};
      try {
        responseData = rawText ? JSON.parse(rawText) : {};
      } catch (e) {
        console.error('[ERROR] Non-JSON response from /payments/create-order:', rawText);
        const err = new Error('Unexpected response from payment server while creating order');
        err.response = { data: rawText, status: response.status };
        throw err;
      }

      console.log('[DEBUG] Response data:', responseData);

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to create payment order');
      }

      return responseData;
    } catch (error) {
      console.error('[ERROR] Error in createRazorpayOrder:', error);
      throw error;
    }
  },

  verifyRazorpayPayment: async (paymentData) => {
    try {
      // Normalize keys so we support both our internal names and Razorpay callback names
      const orderId = paymentData.orderId || paymentData.razorpayOrderId || paymentData.razorpay_order_id;
      const paymentId = paymentData.paymentId || paymentData.razorpayPaymentId || paymentData.razorpay_payment_id;
      const signature = paymentData.signature || paymentData.razorpaySignature || paymentData.razorpay_signature;
      const bookingId = paymentData.bookingId || paymentData.booking_id;

      const response = await fetch(`${API_BASE_URL}/payments/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ orderId, paymentId, signature, bookingId }),
      });

      const rawText = await response.text();
      let data = {};
      try {
        data = rawText ? JSON.parse(rawText) : {};
      } catch (e) {
        console.error('Non-JSON response from /payments/verify:', rawText);
        const error = new Error('Unexpected response from payment server');
        error.response = { data: rawText, status: response.status };
        throw error;
      }

      if (!response.ok) {
        const error = new Error(data.message || 'Payment verification failed');
        error.response = { data, status: response.status };
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in verifyRazorpayPayment:', error);
      throw error;
    }
  },
  
  generateUPILink: async (data) => {
    const response = await fetch(`${API_BASE_URL}/payments/upi-link`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },
};

// Export all APIs
export default {
  auth: authAPI,
  cars: carsAPI,
  bookings: bookingsAPI,
  admin: adminAPI,
  owner: ownerAPI,
  adminAdvanced: adminAdvancedAPI,
  reviews: reviewsAPI,
  favorites: favoritesAPI,
  notifications: notificationsAPI,
  messages: messagesAPI,
  payments: paymentsAPI,
  emergency: emergencyAPI,
};

