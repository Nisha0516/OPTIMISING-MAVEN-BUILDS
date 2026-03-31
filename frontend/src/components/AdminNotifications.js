import React, { useState, useEffect, useRef } from 'react';
import { notificationsAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './AdminNotifications.css';

const AdminNotifications = ({ limit = 5, showAll = false }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const previousNotificationIdsRef = useRef(new Set());
  const hasInitializedRef = useRef(false);
  const audioContextRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
    // Refresh notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const playAlertSound = () => {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContextClass();
      }

      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(880, ctx.currentTime);
      gainNode.gain.setValueAtTime(0.0001, ctx.currentTime);
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      const duration = 0.4;
      const now = ctx.currentTime;
      gainNode.gain.exponentialRampToValueAtTime(0.2, now + 0.03);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      oscillator.start(now);
      oscillator.stop(now + duration);
    } catch (soundError) {
      console.warn('Notification sound could not play:', soundError);
    }
  };

  const showNotificationToast = (notification) => {
    const baseOptions = {
      pauseOnFocusLoss: false,
      closeOnClick: true,
      draggable: true,
      icon: getNotificationIcon(notification.type),
    };

    if (notification.type === 'emergency') {
      toast.error(
        `${notification.title}\n${notification.message}`,
        {
          ...baseOptions,
          autoClose: 8000,
          className: 'toast-emergency',
        }
      );
      playAlertSound();
    } else {
      toast.info(
        `${notification.title}\n${notification.message}`,
        {
          ...baseOptions,
          autoClose: 5000,
        }
      );
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await notificationsAPI.getNotifications(null, showAll ? 50 : limit);
      const fetchedNotifications = response.notifications || [];
      const currentIds = new Set(fetchedNotifications.map((n) => n._id));

      const newNotifications = fetchedNotifications.filter(
        (notification) => !previousNotificationIdsRef.current.has(notification._id)
      );

      if (hasInitializedRef.current && newNotifications.length > 0) {
        newNotifications.forEach(showNotificationToast);
      }

      if (!hasInitializedRef.current) {
        hasInitializedRef.current = true;
      }

      previousNotificationIdsRef.current = currentIds;

      setNotifications(fetchedNotifications);
      setUnreadCount(response.unreadCount || 0);
      setError('');
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationsAPI.markAsRead(notificationId);
      fetchNotifications();
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      fetchNotifications();
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const handleNotificationClick = (notification) => {
    // Mark as read
    if (!notification.read) {
      handleMarkAsRead(notification._id);
    }

    // Navigate based on notification type
    if (notification.type === 'emergency') {
      // Navigate to emergencies page
      navigate(`/admin/emergencies`);
    } else if (notification.relatedBooking) {
      navigate(`/admin/bookings`);
    } else if (notification.relatedCar) {
      navigate(`/admin/cars`);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'emergency':
        return '🚨';
      case 'booking_created':
      case 'booking_confirmed':
        return '📋';
      case 'booking_rejected':
      case 'booking_cancelled':
        return '❌';
      case 'payment_success':
        return '💰';
      case 'payment_failed':
        return '⚠️';
      case 'car_approved':
        return '✅';
      case 'car_rejected':
        return '🚫';
      default:
        return '🔔';
    }
  };

  const getNotificationClass = (type) => {
    if (type === 'emergency') return 'notification-emergency';
    return 'notification-normal';
  };

  if (loading && notifications.length === 0) {
    return (
      <div className="admin-notifications">
        <div className="notifications-loading">Loading notifications...</div>
      </div>
    );
  }

  return (
    <div className="admin-notifications">
      <div className="notifications-header">
        <h3>
          <span className="notification-icon">🔔</span>
          Notifications
          {unreadCount > 0 && (
            <span className="unread-badge">{unreadCount}</span>
          )}
        </h3>
        {notifications.length > 0 && (
          <button 
            className="mark-all-read-btn"
            onClick={handleMarkAllAsRead}
            title="Mark all as read"
          >
            Mark all read
          </button>
        )}
      </div>

      {error && (
        <div className="notifications-error">{error}</div>
      )}

      {notifications.length === 0 ? (
        <div className="no-notifications">
          <p>No new notifications</p>
        </div>
      ) : (
        <div className="notifications-list">
          {notifications.map((notification) => (
            <div
              key={notification._id}
              className={`notification-item ${getNotificationClass(notification.type)} ${!notification.read ? 'unread' : ''}`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="notification-icon-large">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="notification-content">
                <div className="notification-title">
                  {notification.title}
                  {!notification.read && <span className="unread-dot"></span>}
                </div>
                <div className="notification-message">{notification.message}</div>
                <div className="notification-time">
                  {new Date(notification.createdAt).toLocaleString()}
                </div>
              </div>
              {!notification.read && (
                <button
                  className="mark-read-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMarkAsRead(notification._id);
                  }}
                  title="Mark as read"
                >
                  ✓
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {!showAll && unreadCount > limit && (
        <div className="view-all-notifications">
          <button onClick={() => navigate('/admin/notifications')}>
            View All Notifications ({unreadCount})
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminNotifications;

