import React, { useState, useEffect } from 'react';
import { useLibrarianDashboardContext } from '../../context/LibrarianDashboardContext';
import Notification from '../Notification';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  role: string;
  libraryMembershipId?: string;
  studentId?: string;
  profileImageUrl?: string;
  createdDate: string;
}

const LibrarianProfileTab: React.FC = () => {
  const { currentUser, loading, updateUserProfile } = useLibrarianDashboardContext();
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    phoneNumber: ''
  });
  const [phoneError, setPhoneError] = useState('');

  useEffect(() => {
    if (currentUser) {
      setEditForm({
        name: currentUser.name || '',
        phoneNumber: currentUser.phoneNumber || ''
      });
    }
  }, [currentUser]);

  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  } | null>(null);

  const validatePhoneNumber = (phone: string): boolean => {
    if (phone && !/^\d{10}$/.test(phone)) {
      setPhoneError('Phone number must be exactly 10 digits');
      return false;
    }
    setPhoneError('');
    return true;
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editForm.phoneNumber && !validatePhoneNumber(editForm.phoneNumber)) {
      return;
    }
    
    try {
      const result = await updateUserProfile(editForm);
      setNotification({
        message: result.message,
        type: result.success ? 'success' : 'error'
      });
      if (result.success) {
        setEditing(false);
      }
    } catch (error) {
      setNotification({
        message: 'Error updating profile',
        type: 'error'
      });
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ color: '#13312A' }}>Loading profile...</div>
      </div>
    );
  }

  return (
    <div style={{ background: '#f8f9fa', minHeight: '100vh', padding: '2rem' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ color: '#1e293b', fontSize: '1.75rem', fontWeight: '700', margin: '0 0 0.5rem 0' }}>
            Profile Settings
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>
            Manage your account information and preferences
          </p>
        </div>

        <div style={{
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          overflow: 'hidden'
        }}>
          <div style={{
            background: 'white',
            borderBottom: '2px solid #e5e7eb',
            padding: '1rem 1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h3 style={{ margin: 0, fontWeight: '700', fontSize: '1.1rem', color: '#000000' }}>
              Account Information
            </h3>
            <button
              onClick={() => setEditing(!editing)}
              style={{
                background: editing ? 'white' : '#0ea5e9',
                color: editing ? '#000000' : 'white',
                border: editing ? '2px solid #0ea5e9' : 'none',
                borderRadius: '8px',
                padding: '0.5rem 1rem',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: '600',
                transition: 'all 0.2s'
              }}
            >
              {editing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          <div style={{ padding: '2rem' }}>
            {!editing ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                <div>
                  <label style={{ color: '#6b7280', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Full Name
                  </label>
                  <div style={{
                    background: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    padding: '0.875rem 1rem',
                    color: '#000000',
                    fontSize: '0.95rem',
                    fontWeight: '500'
                  }}>
                    {currentUser?.name || 'Not provided'}
                  </div>
                </div>

                <div>
                  <label style={{ color: '#6b7280', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Email Address
                  </label>
                  <div style={{
                    background: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    padding: '0.875rem 1rem',
                    color: '#000000',
                    fontSize: '0.95rem',
                    fontWeight: '500'
                  }}>
                    {currentUser?.email || 'Not provided'}
                  </div>
                </div>

                <div>
                  <label style={{ color: '#6b7280', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Phone Number
                  </label>
                  <div style={{
                    background: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    padding: '0.875rem 1rem',
                    color: '#000000',
                    fontSize: '0.95rem',
                    fontWeight: '500'
                  }}>
                    {currentUser?.phoneNumber || 'Not provided'}
                  </div>
                </div>

                <div>
                  <label style={{ color: '#6b7280', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Role
                  </label>
                  <div style={{
                    background: '#ddd6fe',
                    border: '2px solid #a78bfa',
                    borderRadius: '8px',
                    padding: '0.875rem 1rem',
                    color: '#000000',
                    fontSize: '0.95rem',
                    fontWeight: '600'
                  }}>
                    {currentUser?.role || 'Not assigned'}
                  </div>
                </div>

                <div>
                  <label style={{ color: '#6b7280', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Member Since
                  </label>
                  <div style={{
                    background: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    padding: '0.875rem 1rem',
                    color: '#000000',
                    fontSize: '0.95rem',
                    fontWeight: '500'
                  }}>
                    {currentUser?.createdDate ? new Date(currentUser.createdDate).toLocaleDateString() : 'Unknown'}
                  </div>
                </div>

                {currentUser?.libraryMembershipId && (
                  <div>
                    <label style={{ color: '#6b7280', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Membership ID
                    </label>
                    <div style={{
                      background: '#f9fafb',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      padding: '0.875rem 1rem',
                      color: '#000000',
                      fontSize: '0.95rem',
                      fontWeight: '600',
                      fontFamily: 'monospace'
                    }}>
                      {currentUser.libraryMembershipId}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleUpdateProfile}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                  <div>
                    <label style={{ color: '#000000', fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      style={{
                        background: 'white',
                        color: '#000000',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        padding: '0.75rem 1rem',
                        fontSize: '0.95rem',
                        width: '100%',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ color: '#000000', fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={editForm.phoneNumber}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        setEditForm({ ...editForm, phoneNumber: value });
                        if (value) validatePhoneNumber(value);
                      }}
                      maxLength={10}
                      placeholder="Enter 10 digit number"
                      style={{
                        background: 'white',
                        color: '#000000',
                        border: phoneError ? '1px solid #dc2626' : '1px solid #d1d5db',
                        borderRadius: '6px',
                        padding: '0.75rem 1rem',
                        fontSize: '0.95rem',
                        width: '100%',
                        outline: 'none'
                      }}
                    />
                    {phoneError && (
                      <div style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: '0.25rem', fontWeight: '500' }}>
                        {phoneError}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    style={{
                      background: 'white',
                      color: '#000000',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      padding: '0.75rem 1.5rem',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      transition: 'all 0.2s'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      background: '#0ea5e9',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0.75rem 1.5rem',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      transition: 'all 0.2s'
                    }}
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
          />
        )}
      </div>
    </div>
  );
};

export default LibrarianProfileTab;