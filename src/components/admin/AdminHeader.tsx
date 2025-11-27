import React from 'react';
import { useAuth } from '../../context/AuthContext';

const AdminHeader: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <nav style={{
      background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 50%, #FFFFFF 100%)',
      borderBottom: '1px solid #DBEAFE',
      padding: '16px 0',
      boxShadow: '0 1px 3px rgba(59, 130, 246, 0.1)'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ 
            color: '#1E40AF', 
            fontSize: '20px', 
            fontWeight: '600',
            letterSpacing: '-0.5px'
          }}>
            {user?.libraryName || 'Smart Library'}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{
                color: '#111827',
                fontSize: '14px',
                fontWeight: '500'
              }}>Welcome, {user?.name || 'Admin'}</div>
              <div style={{
                color: '#6B7280',
                fontSize: '13px'
              }}>{user?.role || 'Administrator'}</div>
            </div>
            <button 
              onClick={logout}
              style={{
                background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 16px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 4px rgba(59, 130, 246, 0.2)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(59, 130, 246, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(59, 130, 246, 0.2)';
              }}
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminHeader;