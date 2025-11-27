import React from 'react';

interface UserDashboardNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const UserDashboardNavigation: React.FC<UserDashboardNavigationProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { key: 'overview', icon: 'fas fa-tachometer-alt', label: 'Dashboard' },
    { key: 'browse', icon: 'fas fa-search', label: 'Browse' },
    { key: 'mybooks', icon: 'fas fa-book-open', label: 'My Books' },
    { key: 'reservations', icon: 'fas fa-bookmark', label: 'Reserved' },
    { key: 'fines', icon: 'fas fa-dollar-sign', label: 'Fines' },
    { key: 'profile', icon: 'fas fa-user', label: 'Profile' }
  ];

  return (
    <div style={{
      background: '#EFE9DD',
      backdropFilter: 'blur(15px)',
      borderBottom: '1px solid #DCC7A1',
      padding: '10px 0'
    }}>
      <div className="container-fluid">
        <div style={{
          display: 'flex',
          gap: '5px',
          overflowX: 'auto',
          padding: '5px'
        }}>
          {tabs.map(tab => (
            <button 
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                background: activeTab === tab.key ? '#DCC7A1' : 'transparent',
                color: '#000000',
                border: `1px solid ${activeTab === tab.key ? '#DCC7A1' : 'transparent'}`,
                borderRadius: '10px',
                padding: '10px 15px',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: activeTab === tab.key ? '700' : '600',
                opacity: activeTab === tab.key ? 1 : 0.75
              }}
            >
              <i className={tab.icon}></i>
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserDashboardNavigation;