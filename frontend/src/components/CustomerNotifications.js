import React, { useState, useEffect, useCallback } from 'react';
import { 
  Notifications, 
  CheckCircle, 
  Error, 
  Celebration, 
  Block, 
  CreditCard, 
  BrokenImage, 
  Delete, 
  DoneAll,
  MarkEmailRead,
  FilterList,
  Inbox
} from '@mui/icons-material';
import { notificationsAPI } from '../services/api';
import { toast } from 'react-toastify';
import './CustomerNotifications.css';

const CustomerNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const response = await notificationsAPI.getNotifications();
      let filteredNotifications = response.notifications || [];
      
      if (filter !== 'all') {
        filteredNotifications = filteredNotifications.filter(n => n.type === filter);
      }
      
      setNotifications(filteredNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to retrieve updates');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (notificationId) => {
    try {
      await notificationsAPI.markAsRead(notificationId);
      fetchNotifications();
      toast.success('Marked as read');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      fetchNotifications();
      toast.success('Inbox cleared');
    } catch (error) {
      toast.error('Failed to clear inbox');
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await notificationsAPI.deleteNotification(notificationId);
      fetchNotifications();
      toast.success('Notification removed');
    } catch (error) {
      toast.error('Failed to remove notification');
    }
  };

  const getNotificationIcon = (type) => {
    const iconStyle = { fontSize: 20 };
    switch (type) {
      case 'booking_extension_approved':
        return <CheckCircle sx={{ ...iconStyle, color: '#10b981' }} />;
      case 'booking_extension_rejected':
        return <Error sx={{ ...iconStyle, color: '#ef4444' }} />;
      case 'booking_confirmed':
        return <Celebration sx={{ ...iconStyle, color: '#3b82f6' }} />;
      case 'booking_rejected':
        return <Block sx={{ ...iconStyle, color: '#64748b' }} />;
      case 'payment_success':
        return <CreditCard sx={{ ...iconStyle, color: '#10b981' }} />;
      case 'payment_failed':
        return <BrokenImage sx={{ ...iconStyle, color: '#ef4444' }} />;
      default:
        return <Notifications sx={{ ...iconStyle, color: '#3b82f6' }} />;
    }
  };

  if (loading) {
    return (
      <div className="luxury-notify-loading">
        <div className="compact-spinner"></div>
        <p>Syncing notifications...</p>
      </div>
    );
  }

  return (
    <div className="luxury-notifications-container">
      <header className="notify-v3-header">
        <div className="notify-title-box">
          <Notifications sx={{ color: '#3b82f6' }} />
          <h3>Activity Feed</h3>
        </div>
        
        <div className="notify-v3-actions">
          <div className="luxury-filter-pill">
            <FilterList sx={{ fontSize: 16, color: '#64748b' }} />
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">Global Activity</option>
              <option value="booking_confirmed">Successful Bookings</option>
              <option value="booking_rejected">Declined Requests</option>
              <option value="payment_success">Payments</option>
            </select>
          </div>
          
          <button 
            onClick={markAllAsRead}
            className="btn-clear-inbox"
            disabled={notifications.filter(n => !n.read).length === 0}
          >
            <DoneAll sx={{ fontSize: 18 }} /> Clear Unread
          </button>
        </div>
      </header>

      <div className="notify-v3-list">
        {notifications.length === 0 ? (
          <div className="empty-inbox-v3">
            <div className="empty-icon-pulse">
              <Inbox sx={{ fontSize: 48, color: '#1e293b' }} />
            </div>
            <h4>All Caught Up</h4>
            <p>Your notifications will appear here as they arrive</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div 
              key={notification._id} 
              className={`notify-v3-item ${notification.read ? 'is-read' : 'is-unread'}`}
            >
              <div className="item-v3-icon">
                {getNotificationIcon(notification.type)}
                {!notification.read && <div className="unread-dot-v3"></div>}
              </div>
              
              <div className="item-v3-main">
                <div className="item-v3-header">
                  <h4>{notification.title}</h4>
                  <span className="item-v3-time">
                    {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    <span className="date-sep">•</span>
                    {new Date(notification.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="item-v3-body">{notification.message}</p>
                
                <div className="item-v3-actions">
                  {!notification.read && (
                    <button onClick={() => markAsRead(notification._id)} className="btn-v3-read">
                      <MarkEmailRead sx={{ fontSize: 14 }} /> Mark Read
                    </button>
                  )}
                  <button onClick={() => deleteNotification(notification._id)} className="btn-v3-delete">
                    <Delete sx={{ fontSize: 14 }} /> Remove
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
