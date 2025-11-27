import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../../store';
import { logout } from '../../store/slices/authSlice';

interface UserDashboardHeaderProps {
  libraryInfo: any;
}

const UserDashboardHeader: React.FC<UserDashboardHeaderProps> = ({ libraryInfo }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <div style={{
      background: '#5A5548',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid #DCC7A1',
      padding: '15px 0',
      boxShadow: '0 2px 10px rgba(90, 85, 72, 0.2)'
    }}>
      <div className="container-fluid">
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center">
            <h4 style={{
              color: '#FAF7F2',
              fontWeight: '700',
              margin: '0',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
            }}>{libraryInfo?.name || user?.libraryName || 'Smart Library'}</h4>
          </div>
          <div className="d-flex align-items-center">
            <div style={{ marginRight: '30px', textAlign: 'right' }}>
              <div style={{
                color: '#FAF7F2',
                fontSize: '16px',
                fontWeight: '600'
              }}>Welcome back, {user?.name}</div>
              <div style={{
                color: '#F8E4C2',
                fontSize: '14px'
              }}>Last login: {new Date().toLocaleDateString()}</div>
            </div>
            <button 
              onClick={() => dispatch(logout())} 
              style={{
                background: '#DCC7A1',
                color: '#5A5548',
                border: '1px solid #DCC7A1',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >Sign Out</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboardHeader;