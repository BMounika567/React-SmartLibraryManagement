import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

interface ProfileTabProps {
  userStats: any;
  borrowedBooks: any[];
  libraryInfo: any;
  userProfile: any;
  onUpdateProfile: (profileData: any) => Promise<void>;
  onChangePassword: (currentPassword: string, newPassword: string, confirmPassword: string) => Promise<void>;
}

const ProfileTab: React.FC<ProfileTabProps> = ({ 
  userStats, 
  borrowedBooks, 
  libraryInfo,
  userProfile,
  onUpdateProfile,
  onChangePassword
}) => {
  const { user } = useAuth();
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', phoneNumber: '', profileImageUrl: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ show: false, text: '', type: '' });
  
  // Use userStats data instead of calculating from borrowedBooks
  const overdueBooks = userStats?.overdueBooks || [];
  const totalFines = userStats?.totalFines || 0;

  const handleEditProfile = () => {
    setProfileForm({
      name: userProfile?.name || user?.name || '',
      phoneNumber: userProfile?.phoneNumber || '',
      profileImageUrl: userProfile?.profileImageUrl || ''
    });
    setShowEditProfile(true);
  };

  const handleChangePassword = () => {
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setShowChangePassword(true);
  };

  const handleNotifications = () => {
    setShowNotifications(true);
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      await onUpdateProfile(profileForm);
      setMessage({ show: true, text: 'Profile updated successfully!', type: 'success' });
      setShowEditProfile(false);
    } catch (error) {
      setMessage({ show: true, text: 'Failed to update profile', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePasswordSubmit = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ show: true, text: 'New passwords do not match', type: 'error' });
      return;
    }
    setLoading(true);
    try {
      await onChangePassword(passwordForm.currentPassword, passwordForm.newPassword, passwordForm.confirmPassword);
      setMessage({ show: true, text: 'Password changed successfully!', type: 'success' });
      setShowChangePassword(false);
    } catch (error) {
      setMessage({ show: true, text: 'Failed to change password', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '30px' }}>
      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
        {/* Profile Card */}
        <div style={{ flex: '0 0 350px' }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            border: '1px solid #E0E0E0',
            padding: '30px',
            textAlign: 'center'
          }}>
            <div style={{
              background: userProfile?.profileImageUrl ? 'transparent' : '#667EEA',
              borderRadius: '50%',
              width: '100px',
              height: '100px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px',
              border: '3px solid #E0E0E0',
              overflow: 'hidden'
            }}>
              {userProfile?.profileImageUrl ? (
                <img 
                  src={userProfile.profileImageUrl} 
                  alt="Profile" 
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    const nextSibling = (e.target as HTMLImageElement).nextElementSibling as HTMLElement;
                    if (nextSibling) nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <i 
                className="bi bi-person-fill" 
                style={{ 
                  fontSize: '3rem', 
                  color: '#FFFFFF',
                  display: userProfile?.profileImageUrl ? 'none' : 'flex'
                }}
              ></i>
            </div>
            
            <h3 style={{
              color: '#2D3748',
              fontWeight: '600',
              marginBottom: '8px'
            }}>{userProfile?.name || user?.name}</h3>
            
            <p style={{
              color: '#718096',
              fontSize: '14px',
              marginBottom: '8px'
            }}>{userProfile?.email || user?.email}</p>
            
            {userProfile?.phoneNumber && (
              <p style={{
                color: '#718096',
                fontSize: '14px',
                marginBottom: '15px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px'
              }}>
                <i className="bi bi-telephone"></i>
                {userProfile.phoneNumber}
              </p>
            )}
            
            <div style={{
              background: '#48BB78',
              borderRadius: '25px',
              padding: '8px 20px',
              display: 'inline-block',
              marginBottom: '20px'
            }}>
              <span style={{
                color: '#FFFFFF',
                fontSize: '12px',
                fontWeight: '600'
              }}>Active Member</span>
            </div>
            
            {libraryInfo && (
              <div style={{
                borderTop: '1px solid #E0E0E0',
                paddingTop: '20px',
                marginTop: '20px'
              }}>
                <p style={{
                  color: '#718096',
                  fontSize: '13px',
                  margin: '0'
                }}>Member of</p>
                <h6 style={{
                  color: '#2D3748',
                  fontWeight: '600',
                  margin: '5px 0 0 0'
                }}>{libraryInfo.name}</h6>
              </div>
            )}
          </div>
          
          {/* Account Settings */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: '15px',
            border: '1px solid #E0E0E0',
            marginTop: '20px',
            overflow: 'hidden'
          }}>
            <div style={{
              background: '#F7FAFC',
              padding: '15px 20px',
              borderBottom: '1px solid #E0E0E0'
            }}>
              <h6 style={{
                color: '#2D3748',
                fontWeight: '600',
                margin: '0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <i className="bi bi-gear" style={{ color: '#667EEA' }}></i>
                Account Settings
              </h6>
            </div>
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button onClick={handleEditProfile} style={{
                background: '#FFFFFF',
                color: '#4A5568',
                border: '1px solid #E0E0E0',
                borderRadius: '10px',
                padding: '10px 15px',
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontWeight: '500',
                pointerEvents: 'auto',
                zIndex: 10,
                position: 'relative'
              }}>
                <i className="bi bi-pencil" style={{ color: '#667EEA' }}></i>
                Edit Profile
              </button>
              <button onClick={handleChangePassword} style={{
                background: '#FFFFFF',
                color: '#4A5568',
                border: '1px solid #E0E0E0',
                borderRadius: '10px',
                padding: '10px 15px',
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontWeight: '500',
                pointerEvents: 'auto',
                zIndex: 10,
                position: 'relative'
              }}>
                <i className="bi bi-lock" style={{ color: '#667EEA' }}></i>
                Change Password
              </button>
              <button onClick={handleNotifications} style={{
                background: '#FFFFFF',
                color: '#4A5568',
                border: '1px solid #E0E0E0',
                borderRadius: '10px',
                padding: '10px 15px',
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontWeight: '500',
                pointerEvents: 'auto',
                zIndex: 10,
                position: 'relative'
              }}>
                <i className="bi bi-bell" style={{ color: '#667EEA' }}></i>
                Notifications
              </button>
            </div>
          </div>
        </div>
        
        {/* Recent Activity */}
        <div style={{ flex: '1', minWidth: '400px' }}>
          {/* Recent Activity */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: '15px',
            border: '1px solid #E0E0E0',
            overflow: 'hidden'
          }}>
            <div style={{
              background: '#F7FAFC',
              padding: '15px 20px',
              borderBottom: '1px solid #E0E0E0'
            }}>
              <h6 style={{
                color: '#2D3748',
                fontWeight: '600',
                margin: '0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <i className="bi bi-clock-history" style={{ color: '#667EEA' }}></i>
                Recent Activity
              </h6>
            </div>
            <div style={{ padding: '20px' }}>
              {borrowedBooks.slice(0, 6).length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {borrowedBooks.slice(0, 6).map((book, index) => (
                    <div key={index} style={{
                      background: '#F6E9CA',
                      borderRadius: '12px',
                      padding: '15px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '15px',
                      border: '1px solid #C69A72'
                    }}>
                      <div style={{
                        background: '#13312A',
                        borderRadius: '10px',
                        width: '45px',
                        height: '45px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <i className="bi bi-book" style={{ color: '#F6E9CA', fontSize: '18px' }}></i>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h6 style={{
                          color: '#13312A',
                          fontWeight: '600',
                          margin: '0 0 4px 0',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>{book.bookTitle}</h6>
                        <p style={{
                          color: '#155446',
                          fontSize: '12px',
                          margin: '0'
                        }}>
                          {book.status === 'Pending' ? 'Requested' : 'Borrowed'} on {book.issueDate ? new Date(book.issueDate).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <span style={{
                        background: book.status === 'Issued' ? '#155446' :
                                   book.status === 'Pending' ? '#C69A72' :
                                   book.status === 'Returned' ? '#13312A' : '#155446',
                        color: '#F6E9CA',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '10px',
                        fontWeight: '600',
                        flexShrink: 0
                      }}>
                        {book.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '40px 20px'
                }}>
                  <div style={{
                    fontSize: '3rem',
                    color: '#CBD5E0',
                    marginBottom: '15px'
                  }}>
                    <i className="bi bi-journal-x"></i>
                  </div>
                  <h6 style={{
                    color: '#2D3748',
                    fontWeight: '600',
                    marginBottom: '8px'
                  }}>No recent activity</h6>
                  <p style={{
                    color: '#718096',
                    margin: '0',
                    fontSize: '14px'
                  }}>Start borrowing books to see your activity here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#155446',
            borderRadius: '15px',
            border: '1px solid #C69A72',
            padding: '30px',
            width: '400px',
            maxWidth: '90vw'
          }}>
            <h4 style={{ color: '#F6E9CA', marginBottom: '20px' }}>Edit Profile</h4>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ color: '#C69A72', fontSize: '14px', display: 'block', marginBottom: '5px' }}>Name *</label>
              <input 
                type="text" 
                value={profileForm.name}
                onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid #C69A72',
                  background: '#F6E9CA',
                  color: '#13312A'
                }}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ color: '#C69A72', fontSize: '14px', display: 'block', marginBottom: '5px' }}>Phone Number</label>
              <input 
                type="text" 
                value={profileForm.phoneNumber}
                onChange={(e) => setProfileForm({...profileForm, phoneNumber: e.target.value})}
                placeholder="Enter phone number"
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid #C69A72',
                  background: '#F6E9CA',
                  color: '#13312A'
                }}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ color: '#C69A72', fontSize: '14px', display: 'block', marginBottom: '5px' }}>Profile Image URL</label>
              <input 
                type="url" 
                value={profileForm.profileImageUrl}
                onChange={(e) => setProfileForm({...profileForm, profileImageUrl: e.target.value})}
                placeholder="Enter image URL"
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid #C69A72',
                  background: '#F6E9CA',
                  color: '#13312A'
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setShowEditProfile(false)}
                style={{
                  background: 'transparent',
                  color: '#C69A72',
                  border: '1px solid #C69A72',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveProfile}
                disabled={loading || !profileForm.name}
                style={{
                  background: loading || !profileForm.name ? '#999' : '#C69A72',
                  color: '#13312A',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  cursor: loading || !profileForm.name ? 'not-allowed' : 'pointer',
                  fontWeight: '600'
                }}
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Change Password Modal */}
      {showChangePassword && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#155446',
            borderRadius: '15px',
            border: '1px solid #C69A72',
            padding: '30px',
            width: '400px',
            maxWidth: '90vw'
          }}>
            <h4 style={{ color: '#F6E9CA', marginBottom: '20px' }}>Change Password</h4>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ color: '#C69A72', fontSize: '14px', display: 'block', marginBottom: '5px' }}>Current Password *</label>
              <input 
                type="password" 
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid #C69A72',
                  background: '#F6E9CA',
                  color: '#13312A'
                }}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ color: '#C69A72', fontSize: '14px', display: 'block', marginBottom: '5px' }}>New Password * (min 6 characters)</label>
              <input 
                type="password" 
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid #C69A72',
                  background: '#F6E9CA',
                  color: '#13312A'
                }}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ color: '#C69A72', fontSize: '14px', display: 'block', marginBottom: '5px' }}>Confirm Password *</label>
              <input 
                type="password" 
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid #C69A72',
                  background: '#F6E9CA',
                  color: '#13312A'
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setShowChangePassword(false)}
                style={{
                  background: 'transparent',
                  color: '#C69A72',
                  border: '1px solid #C69A72',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button 
                onClick={handleChangePasswordSubmit}
                disabled={loading || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword || passwordForm.newPassword.length < 6}
                style={{
                  background: loading || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword || passwordForm.newPassword.length < 6 ? '#999' : '#C69A72',
                  color: '#13312A',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  cursor: loading || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword || passwordForm.newPassword.length < 6 ? 'not-allowed' : 'pointer',
                  fontWeight: '600'
                }}
              >
                {loading ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Notifications Modal */}
      {showNotifications && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#155446',
            borderRadius: '15px',
            border: '1px solid #C69A72',
            padding: '30px',
            width: '400px',
            maxWidth: '90vw'
          }}>
            <h4 style={{ color: '#F6E9CA', marginBottom: '20px' }}>Notification Settings</h4>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ color: '#C69A72', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input type="checkbox" defaultChecked />
                Email notifications for due dates
              </label>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ color: '#C69A72', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input type="checkbox" defaultChecked />
                SMS notifications for overdue books
              </label>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ color: '#C69A72', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input type="checkbox" />
                Newsletter and updates
              </label>
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setShowNotifications(false)}
                style={{
                  background: 'transparent',
                  color: '#C69A72',
                  border: '1px solid #C69A72',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  setShowNotifications(false);
                }}
                style={{
                  background: '#C69A72',
                  color: '#13312A',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Message Box */}
      {message.show && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1001
        }}>
          <div style={{
            background: '#155446',
            borderRadius: '15px',
            border: `2px solid ${message.type === 'success' ? '#4CAF50' : '#f44336'}`,
            padding: '30px',
            width: '300px',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '3rem',
              color: message.type === 'success' ? '#4CAF50' : '#f44336',
              marginBottom: '15px'
            }}>
              <i className={message.type === 'success' ? 'bi bi-check-circle' : 'bi bi-x-circle'}></i>
            </div>
            <h4 style={{ color: '#F6E9CA', marginBottom: '20px' }}>
              {message.type === 'success' ? 'Success' : 'Error'}
            </h4>
            <p style={{ color: '#C69A72', marginBottom: '20px' }}>{message.text}</p>
            <button 
              onClick={() => setMessage({ show: false, text: '', type: '' })}
              style={{
                background: message.type === 'success' ? '#4CAF50' : '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 20px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileTab;