import React, { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';

interface AutoNotification {
  id: string;
  message: string;
  bookTitle: string;
  type: 'reservation_available' | 'pickup_reminder' | 'overdue_notice';
  timestamp: string;
}

const AutoNotificationHandler: React.FC = () => {
  const [notifications, setNotifications] = useState<AutoNotification[]>([]);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const interval = setInterval(checkForNotifications, 30000);
    
    checkForNotifications();
    
    return () => clearInterval(interval);
  }, []);

  const checkForNotifications = async () => {
    return;
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (notifications.length <= 1) {
      setShowToast(false);
    }
  };

  if (!showToast || notifications.length === 0) return null;

  return (
    <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 9999 }}>
      {notifications.map((notification) => (
        <div 
          key={notification.id}
          className="toast show mb-2"
          style={{ minWidth: '300px' }}
        >
          <div className="toast-header bg-success text-white">
            <i className="fas fa-bell me-2"></i>
            <strong className="me-auto">
              {notification.type === 'reservation_available' ? '📚 Book Available!' : 
               notification.type === 'pickup_reminder' ? '⏰ Pickup Reminder' : 
               '⚠️ Notice'}
            </strong>
            <button 
              type="button" 
              className="btn-close btn-close-white" 
              onClick={() => dismissNotification(notification.id)}
            ></button>
          </div>
          <div className="toast-body">
            <strong>{notification.bookTitle}</strong>
            <br />
            <small>{notification.message}</small>
            <br />
            <small className="text-muted">
              {new Date(notification.timestamp).toLocaleTimeString()}
            </small>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AutoNotificationHandler;