import React, { useState, useEffect } from 'react';
import { notificationsAPI } from '../services/api';
import { toast } from 'react-toastify';
import './CustomerNotifications.css';

const CustomerNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await notificationsAPI.getNotifications();
      console.log('Customer notifications:', response);
      
      let filteredNotifications = response.notifications || [];
      
      // Apply filter
      if (filter !== 'all') {
        filteredNotifications = filteredNotifications.filter(n => n.type === filter);
      }
      
      setNotifications(filteredNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await notificationsAPI.markAsRead(notificationId);
      fetchNotifications();
      toast.success('Notification marked as read');
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      fetchNotifications();
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await notificationsAPI.deleteNotification(notificationId);
      fetchNotifications();
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'booking_extension_approved':
        return '✅';
      case 'booking_extension_rejected':
        return '❌';
      case 'booking_confirmed':
        return '🎉';
      case 'booking_rejected':
        return '🚫';
      case 'payment_success':
        return '💳';
      case 'payment_failed':
        return '💔';
      default:
        return '📢';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'booking_extension_approved':
        return 'success';
      case 'booking_extension_rejected':
        return 'danger';
      case 'booking_confirmed':
        return 'primary';
      case 'booking_rejected':
        return 'warning';
      case 'payment_success':
        return 'success';
      case 'payment_failed':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return <div className="loading">Loading notifications...</div>;
  }

  return (
    <div className="customer-notifications">
      <div className="notifications-header">
        <h3>📬 My Notifications</h3>
        <div className="notifications-controls">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Notifications</option>
            <option value="booking_extension_approved">Extension Approved</option>
            <option value="booking_extension_rejected">Extension Rejected</option>
            <option value="booking_confirmed">Booking Confirmed</option>
            <option value="booking_rejected">Booking Rejected</option>
            <option value="payment_success">Payment Success</option>
            <option value="payment_failed">Payment Failed</option>
          </select>
          <button 
            onClick={markAllAsRead}
            className="btn btn-secondary btn-sm"
            disabled={notifications.filter(n => !n.read).length === 0}
          >
            Mark All Read
          </button>
        </div>
      </div>

      <div className="notifications-list">
        {notifications.length === 0 ? (
          <div className="no-notifications">
            <div className="no-notifications-icon">📭</div>
            <h4>No notifications</h4>
            <p>You don't have any notifications yet</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div 
              key={notification._id} 
              className={`notification-item ${notification.read ? 'read' : 'unread'} ${getNotificationColor(notification.type)}`}
            >
              <div className="notification-icon">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="notification-content">
                <div className="notification-header">
                  <h4>{notification.title}</h4>
                  <span className="notification-time">
                    {new Date(notification.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="notification-message">{notification.message}</p>
                <div className="notification-actions">
                  {!notification.read && (
                    <button 
                      onClick={() => markAsRead(notification._id)}
                      className="btn btn-sm btn-outline-primary"
                    >
                      Mark as Read
                    </button>
                  )}
                  <button 
                    onClick={() => deleteNotification(notification._id)}
                    className="btn btn-sm btn-outline-danger"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CustomerNotifications;
