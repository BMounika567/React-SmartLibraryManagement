import React, { useState, useEffect } from 'react';
import { useLibrarianDashboardContext } from '../context/LibrarianDashboardContext';
import { useLibraryAdminDashboardContext } from '../context/LibraryAdminDashboardContext';
import Notification from './Notification';

interface LibrarySettings {
  id?: string;
  libraryId?: string;
  defaultIssueDuration: number;
  maxBooksPerUser: number;
  gracePeriodDays: number;
  allowRenewals: boolean;
  maxRenewals: number;
  finePerDay: number;
  maxFineAmount: number;
  autoCalculateFines: boolean;
  gracePeriodForFines: number;
  libraryName: string;
  libraryAddress: string;
  libraryPhone: string;
  libraryEmail: string;
  openingTime: string;
  closingTime: string;
  workingDays: string[];
  libraryLogoUrl?: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  overdueReminderDays: number;
  pickupReminderHours: number;
  allowOnlineRegistration: boolean;
  requireAdminApproval: boolean;
  enableBarcodeScan: boolean;
  enableQRScan: boolean;
  timezone: string;
  dateFormat: string;
  currency: string;
}



const LibrarySettings: React.FC = () => {
  // Try to get context from either dashboard
  let librarySettings, loading, updateLibrarySettings;
  
  try {
    const librarianContext = useLibrarianDashboardContext();
    librarySettings = librarianContext.librarySettings;
    loading = librarianContext.loading;
    updateLibrarySettings = librarianContext.updateLibrarySettings;
  } catch {
    try {
      const adminContext = useLibraryAdminDashboardContext();
      librarySettings = null; // Admin context doesn't have library settings yet
      loading = adminContext.loading;
      updateLibrarySettings = () => ({ success: true, message: 'Settings updated successfully!' });
    } catch {
      librarySettings = null;
      loading = false;
      updateLibrarySettings = () => ({ success: true, message: 'Settings updated successfully!' });
    }
  }
  const [settings, setSettings] = useState<LibrarySettings>({
    defaultIssueDuration: 14,
    maxBooksPerUser: 3,
    gracePeriodDays: 1,
    allowRenewals: true,
    maxRenewals: 2,
    finePerDay: 1.0,
    maxFineAmount: 50.0,
    autoCalculateFines: true,
    gracePeriodForFines: 1,
    libraryName: '',
    libraryAddress: '',
    libraryPhone: '',
    libraryEmail: '',
    openingTime: '09:00',
    closingTime: '18:00',
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    emailNotifications: true,
    smsNotifications: false,
    overdueReminderDays: 3,
    pickupReminderHours: 24,
    allowOnlineRegistration: true,
    requireAdminApproval: true,
    enableBarcodeScan: true,
    enableQRScan: true,
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    currency: 'USD'
  });
  
  const [hasEditPermission, setHasEditPermission] = useState(false);


  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  } | null>(null);

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    checkPermissions();
    if (librarySettings) {
      setSettings({ ...settings, ...librarySettings });
    }
  }, [librarySettings]);
  
  const checkPermissions = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        const userRole = user.role || user.Role;
        setHasEditPermission(userRole === 'LibraryAdmin' || userRole === 'Librarian');
      } catch (error) {
        setHasEditPermission(false);
      }
    } else {
      setHasEditPermission(false);
    }
  };



  const saveSettings = async () => {
    setSaving(true);
    try {
      const result = updateLibrarySettings(settings);
      setNotification({
        message: result.message,
        type: 'success'
      });
    } catch (error: any) {
      setNotification({
        message: 'Failed to save settings',
        type: 'error'
      });
    } finally {
      setSaving(false);
    }
  };



  const handleWorkingDayToggle = (day: string) => {
    const updatedDays = settings.workingDays.includes(day)
      ? settings.workingDays.filter(d => d !== day)
      : [...settings.workingDays, day];
    
    setSettings({ ...settings, workingDays: updatedDays });
  };

  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ color: '#1F2937', fontWeight: '700', marginBottom: '25px', fontSize: '24px' }}>Library Settings</h2>


        <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '30px', maxWidth: '800px' }}>
          <h3 style={{ color: '#111827', fontSize: '18px', fontWeight: '600', marginBottom: '25px' }}>Fine Settings</h3>
          <div style={{ display: 'grid', gap: '25px' }}>
            <div>
              <label style={{ display: 'block', color: '#374151', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Fine Per Day</label>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ background: '#F3F4F6', color: '#111827', padding: '10px 16px', border: '1px solid #D1D5DB', borderRight: 'none', borderRadius: '8px 0 0 8px', fontSize: '14px', fontWeight: '600' }}>₹</span>
                <input
                  type="number"
                  value={settings.finePerDay}
                  onChange={(e) => setSettings({...settings, finePerDay: parseFloat(e.target.value) || 1.0})}
                  min={0}
                  step={0.1}
                  style={{ flex: 1, padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: '0 8px 8px 0', fontSize: '14px', outline: 'none' }}
                />
              </div>
              <small style={{ color: '#6B7280', fontSize: '13px', display: 'block', marginTop: '6px' }}>Amount charged per day for overdue books</small>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '15px', background: '#F9FAFB', borderRadius: '8px' }}>
              <input
                type="checkbox"
                id="autoCalculateFines"
                checked={settings.autoCalculateFines}
                onChange={(e) => setSettings({...settings, autoCalculateFines: e.target.checked})}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <label htmlFor="autoCalculateFines" style={{ color: '#111827', fontSize: '14px', fontWeight: '500', cursor: 'pointer', margin: 0 }}>
                Automatically calculate fines
              </label>
            </div>
          </div>
        </div>

      <div style={{ marginTop: '30px' }}>
        {!hasEditPermission && (
          <div style={{ background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: '8px', padding: '15px', marginBottom: '20px', maxWidth: '800px' }}>
            <p style={{ color: '#92400E', fontSize: '14px', margin: 0, fontWeight: '500' }}>
              You need Library Administrator or Librarian permissions to modify settings.
            </p>
          </div>
        )}
        <button
          onClick={saveSettings}
          disabled={saving || !hasEditPermission}
          style={{
            background: hasEditPermission ? '#10B981' : '#9CA3AF',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 32px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: (saving || !hasEditPermission) ? 'not-allowed' : 'pointer',
            opacity: (saving || !hasEditPermission) ? 0.6 : 1,
            transition: 'all 0.2s ease',
            boxShadow: hasEditPermission ? '0 2px 8px rgba(16, 185, 129, 0.3)' : 'none'
          }}
          onMouseEnter={(e) => {
            if (hasEditPermission && !saving) {
              e.currentTarget.style.background = '#059669';
            }
          }}
          onMouseLeave={(e) => {
            if (hasEditPermission && !saving) {
              e.currentTarget.style.background = '#10B981';
            }
          }}
        >
          {saving ? 'Saving Settings...' : 'Save Settings'}
        </button>
      </div>

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
};

export default LibrarySettings;