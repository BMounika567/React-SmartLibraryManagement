import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../../store';
import { fetchUserNotifications } from '../../store/slices/bookIssuesSlice';

interface NotificationsTabProps {
  userNotifications: any[];
  onRefreshNotifications: () => void;
}

const NotificationsTab: React.FC<NotificationsTabProps> = ({ 
  userNotifications, 
  onRefreshNotifications 
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <div style={{ padding: '30px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px'
      }}>
        <div>
          <h3 style={{
            color: '#F6E9CA',
            fontWeight: '600',
            margin: '0',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <i className="bi bi-bell-fill" style={{ color: '#C69A72' }}></i>
            Notifications & Alerts
          </h3>
          <p style={{
            color: '#C69A72',
            margin: '5px 0 0 0',
            fontSize: '14px'
          }}>Stay updated with library activities</p>
        </div>
        <div style={{
          background: '#155446',
          borderRadius: '10px',
          padding: '8px',
          border: '1px solid #C69A72'
        }}>
          <span style={{
            color: '#F6E9CA',
            fontSize: '14px',
            fontWeight: '600',
            padding: '0 8px'
          }}>{userNotifications.length} Notifications</span>
        </div>
      </div>
      
      {/* Debug Info */}
      <div style={{
        background: 'rgba(21, 84, 70, 0.3)',
        borderRadius: '10px',
        padding: '15px',
        marginBottom: '20px',
        border: '1px solid rgba(198, 154, 114, 0.3)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h6 style={{ color: '#C69A72', marginBottom: '5px' }}>Debug Info</h6>
          <p style={{ color: '#F6E9CA', fontSize: '12px', margin: '0' }}>
            User ID: {user?.id || 'Not found'} | Count: {userNotifications.length}
          </p>
        </div>
        <button
          onClick={() => {
            if (user?.id) {
              dispatch(fetchUserNotifications(user.id));
            }
            onRefreshNotifications();
          }}
          style={{
            background: '#C69A72',
            color: '#13312A',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 16px',
            fontSize: '12px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          <i className="bi bi-arrow-clockwise"></i> Refresh
        </button>
      </div>
      
      {userNotifications.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {userNotifications.map((notification, index) => (
            <div key={notification.id || index} style={{
              background: '#F6E9CA',
              borderRadius: '12px',
              border: `1px solid ${!notification.isEmailSent ? '#C69A72' : '#155446'}`,
              padding: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 8px rgba(19, 49, 42, 0.3)'
            }}>
              <div style={{
                background: !notification.isEmailSent ? '#C69A72' : '#155446',
                borderRadius: '8px',
                width: '50px',
                height: '50px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                color: '#F6E9CA',
                flexShrink: 0
              }}>
                <i className={!notification.isEmailSent ? 'bi bi-bell' : 'bi bi-check-circle'}></i>
              </div>
              
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  color: '#13312A',
                  fontWeight: '600',
                  fontSize: '14px',
                  marginBottom: '8px',
                  lineHeight: '1.4'
                }}>{notification.message}</p>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px',
                  fontSize: '12px'
                }}>
                  <span style={{ color: '#155446' }}>
                    <i className="bi bi-calendar"></i> {new Date(notification.createdDate).toLocaleDateString()}
                  </span>
                  {notification.userName && (
                    <span style={{ color: '#155446' }}>
                      <i className="bi bi-person"></i> {notification.userName}
                    </span>
                  )}
                  {notification.sentDate && (
                    <span style={{ color: '#155446' }}>
                      <i className="bi bi-send"></i> Sent {new Date(notification.sentDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              
              <div style={{ textAlign: 'center', minWidth: '80px' }}>
                <span style={{
                  background: notification.isEmailSent ? '#155446' : '#C69A72',
                  color: '#F6E9CA',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '10px',
                  fontWeight: '600',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  {notification.isEmailSent ? (
                    <><i className="bi bi-check-circle"></i> Sent</>
                  ) : (
                    <><i className="bi bi-clock"></i> Pending</>
                  )}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '80px 20px',
          background: '#155446',
          borderRadius: '20px',
          border: '1px solid #C69A72'
        }}>
          <div style={{
            fontSize: '4rem',
            marginBottom: '20px',
            color: '#C69A72'
          }}>
            <i className="bi bi-bell-slash"></i>
          </div>
          <h5 style={{
            color: '#F6E9CA',
            fontWeight: '600',
            marginBottom: '10px'
          }}>No notifications</h5>
          <p style={{
            color: '#C69A72',
            fontSize: '14px',
            marginBottom: '25px'
          }}>You're all caught up! Notifications will appear here when you have library activities.</p>
        </div>
      )}
    </div>
  );
};

export default NotificationsTab;