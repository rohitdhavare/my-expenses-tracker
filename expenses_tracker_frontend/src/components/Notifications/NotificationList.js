import React, { useState, useEffect } from 'react';
import { notificationAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Bell, Check, CheckCheck, RotateCcw, Trash2 } from 'lucide-react';
import './Notifications.css';

const NotificationList = () => {
  const { user } = useAuth();
  const [unreadNotifications, setUnreadNotifications] = useState([]);
  const [readNotifications, setReadNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState('unread'); // 'unread' or 'read'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const response = await notificationAPI.getNotifications(user.id);
      const allNotifications = response.data;
      
      // Separate notifications into unread and read
      const unread = allNotifications.filter(n => !n.isRead);
      const read = allNotifications.filter(n => n.isRead);
      
      setUnreadNotifications(unread);
      setReadNotifications(read);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      console.log('Marking notification as read:', id);
      await notificationAPI.markAsRead(id);
      
      // Refetch to ensure consistency with backend
      await fetchNotifications();
      
      // Dispatch event to update navbar count
      window.dispatchEvent(new Event('notificationUpdate'));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      console.error('Error details:', error.response?.data);
      fetchNotifications(); // Fallback to refetch
    }
  };

  const handleMarkAsUnread = async (id) => {
    try {
      console.log('Marking notification as unread:', id);
      await notificationAPI.markAsUnread(id);
      
      // Refetch to ensure consistency with backend
      await fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as unread:', error);
      console.error('Error details:', error.response?.data);
      fetchNotifications(); // Fallback to refetch
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      console.log('Marking all as read for user:', user.id);
      const response = await notificationAPI.markAllAsRead(user.id);
      console.log('Mark all as read response:', response);
      
      // Refetch to ensure we have the latest state from backend
      await fetchNotifications();
      
      // Switch to read tab to show the results
      setActiveTab('read');
    } catch (error) {
      console.error('Error marking all as read:', error);
      console.error('Error details:', error.response?.data);
      fetchNotifications(); // Fallback to refetch
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) {
      return;
    }

    try {
      console.log('Deleting notification:', id);
      await notificationAPI.deleteNotification(id);
      
      // Refetch to ensure consistency with backend
      await fetchNotifications();
      
      // Dispatch event to update navbar count
      window.dispatchEvent(new Event('notificationUpdate'));
    } catch (error) {
      console.error('Error deleting notification:', error);
      console.error('Error details:', error.response?.data);
      fetchNotifications(); // Fallback to refetch
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('Are you sure you want to delete ALL notifications? This cannot be undone!')) {
      return;
    }

    try {
      console.log('Deleting all notifications for user:', user.id);
      await notificationAPI.deleteAllNotifications(user.id);
      
      // Refetch to ensure consistency with backend
      await fetchNotifications();
      
      // Dispatch event to update navbar count
      window.dispatchEvent(new Event('notificationUpdate'));
    } catch (error) {
      console.error('Error deleting all notifications:', error);
      console.error('Error details:', error.response?.data);
      fetchNotifications(); // Fallback to refetch
    }
  };

  const renderNotificationCard = (notification, isUnread) => (
    <div 
      key={notification.id} 
      className={`notification-card ${isUnread ? 'unread' : 'read'}`}
    >
      <div className="notification-icon">
        <Bell size={20} className={isUnread ? 'icon-unread' : 'icon-read'} />
      </div>
      <div className="notification-content">
        <h4>{notification.title || 'Notification'}</h4>
        <p>{notification.message}</p>
        <span className="notification-time">
          {new Date(notification.createdAt).toLocaleString()}
        </span>
      </div>
      <div className="notification-actions">
        {isUnread ? (
          <button 
            className="btn-action btn-mark-read"
            onClick={() => handleMarkAsRead(notification.id)}
            title="Mark as Read"
          >
            <Check size={18} />
          </button>
        ) : (
          <button 
            className="btn-action btn-mark-unread"
            onClick={() => handleMarkAsUnread(notification.id)}
            title="Mark as Unread"
          >
            <RotateCcw size={18} />
          </button>
        )}
        <button 
          className="btn-action btn-delete"
          onClick={() => handleDelete(notification.id)}
          title="Delete Notification"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );

  if (loading) {
    return <div className="loading">Loading notifications...</div>;
  }

  const currentNotifications = activeTab === 'unread' ? unreadNotifications : readNotifications;
  const isUnreadTab = activeTab === 'unread';

  return (
    <div className="notifications-container">
      <div className="notifications-header">
        <h1>Notifications</h1>
        <div className="header-actions">
          {unreadNotifications.length > 0 && activeTab === 'unread' && (
            <button className="btn-mark-all" onClick={handleMarkAllAsRead}>
              <CheckCheck size={20} /> Mark All as Read
            </button>
          )}
          {(unreadNotifications.length > 0 || readNotifications.length > 0) && (
            <button className="btn-delete-all" onClick={handleDeleteAll}>
              <Trash2 size={20} /> Delete All
            </button>
          )}
        </div>
      </div>

      {/* Toggle Buttons */}
      <div className="notification-tabs">
        <button 
          className={`tab-button ${activeTab === 'unread' ? 'active' : ''}`}
          onClick={() => setActiveTab('unread')}
        >
          <Bell size={18} />
          Unread
          {unreadNotifications.length > 0 && (
            <span className="tab-badge">{unreadNotifications.length}</span>
          )}
        </button>
        <button 
          className={`tab-button ${activeTab === 'read' ? 'active' : ''}`}
          onClick={() => setActiveTab('read')}
        >
          <CheckCheck size={18} />
          Read
        </button>
      </div>

      {/* Single Notifications List */}
      <div className="notifications-single-column">
        <div className="notifications-list">
          {currentNotifications.length > 0 ? (
            currentNotifications.map(notification => 
              renderNotificationCard(notification, isUnreadTab)
            )
          ) : (
            <div className="empty-state">
              {isUnreadTab ? (
                <>
                  <CheckCheck size={64} color="#4CAF50" />
                  <p>All caught up!</p>
                  <span className="empty-subtitle">No unread notifications</span>
                </>
              ) : (
                <>
                  <Bell size={64} color="#ccc" />
                  <p>No read notifications</p>
                  <span className="empty-subtitle">Read notifications will appear here</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationList;
