import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSuperAdminDashboardContext } from '../../context/SuperAdminDashboardContext';
import AdminHeader from '../admin/AdminHeader';
import Dialog from '../common/Dialog';



const StyledSuperAdminDashboard: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { statistics, allUsers, allBooks, pendingRequests, allRequests, loading, approveLibrary, rejectLibrary } = useSuperAdminDashboardContext();
  const [activeTab, setActiveTab] = useState<'overview' | 'libraries' | 'users' | 'books' | 'profile'>('overview');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({ name: '', email: '' });
  const [dialog, setDialog] = useState<{
    show: boolean;
    type: 'message' | 'confirm' | 'input';
    title: string;
    message: string;
    dialogType: 'success' | 'error' | 'info';
    onConfirm?: () => void;
    onInputConfirm?: (value: string) => void;
    inputPlaceholder?: string;
  }>({ show: false, type: 'message', title: '', message: '', dialogType: 'info' });
  const [selectedLibrary, setSelectedLibrary] = useState<string>('all');
  const [selectedBookLibrary, setSelectedBookLibrary] = useState<string>('all');
  const [libraryDetailsModal, setLibraryDetailsModal] = useState<{ show: boolean; library: any | null }>({ show: false, library: null });
  const [librarySearch, setLibrarySearch] = useState<string>('');
  const [userSearch, setUserSearch] = useState<string>('');
  const [bookSearch, setBookSearch] = useState<string>('');



  const handleApprove = async (requestId: string) => {
    setDialog({
      show: true,
      type: 'confirm',
      title: 'Approve Library',
      message: 'Are you sure you want to approve this library registration?',
      dialogType: 'info',
      onConfirm: async () => {
        const result = await approveLibrary(requestId);
        setDialog({ 
          show: true, 
          type: 'message', 
          title: result.success ? 'Success' : 'Error', 
          message: result.message, 
          dialogType: result.success ? 'success' : 'error' 
        });
      }
    });
  };

  const handleReject = async (requestId: string) => {
    setDialog({
      show: true,
      type: 'input',
      title: 'Reject Library',
      message: 'Enter rejection reason:',
      dialogType: 'error',
      inputPlaceholder: 'Reason for rejection...',
      onInputConfirm: async (reason: string) => {
        if (!reason) return;
        const result = await rejectLibrary(requestId, reason);
        setDialog({ 
          show: true, 
          type: 'message', 
          title: result.success ? 'Success' : 'Error', 
          message: result.message, 
          dialogType: result.success ? 'success' : 'error' 
        });
      }
    });
  };

  if (loading) {
    return (
      <div style={{ 
        background: '#E3EED4', 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div style={{ 
          background: '#13312A', 
          color: '#F6E9CA', 
          padding: '20px 40px', 
          borderRadius: '15px',
          border: '1px solid #C69A72'
        }}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      background: 'linear-gradient(135deg, #E3EED4 0%, #F6E9CA 100%)', 
      minHeight: '100vh', 
      fontFamily: 'Inter, sans-serif',
      margin: 0,
      padding: 0,
      width: '100%'
    }}>
      <AdminHeader />
      
      {/* Tabs */}
      <div style={{ 
        background: 'linear-gradient(to bottom, #F0FDF4 0%, #DCFCE7 50%, #FFFFFF 100%)',
        borderBottom: '1px solid #BBF7D0',
        padding: '0 20px',
        boxShadow: '0 1px 3px rgba(34, 197, 94, 0.1)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: '0', flexWrap: 'wrap' }}>
            {[
              { key: 'overview', label: 'Dashboard', count: null },
              { key: 'libraries', label: 'Libraries', count: statistics?.TotalLibraries || allRequests.length },
              { key: 'users', label: 'Users', count: statistics?.TotalUsers || allUsers.length },
              { key: 'books', label: 'Books', count: statistics?.TotalBooks || allBooks.length },
              { key: 'profile', label: 'Profile', count: null }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                style={{
                  background: 'transparent',
                  color: activeTab === tab.key ? '#16A34A' : '#6B7280',
                  border: 'none',
                  borderBottom: `3px solid ${activeTab === tab.key ? '#16A34A' : 'transparent'}`,
                  borderRadius: '0',
                  padding: '16px 20px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: activeTab === tab.key ? '600' : '500',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== tab.key) {
                    e.currentTarget.style.color = '#111827';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab.key) {
                    e.currentTarget.style.color = '#6B7280';
                  }
                }}
              >
                {tab.label}
                {tab.count !== null && (
                  <span style={{
                    background: '#F3F4F6',
                    color: '#6B7280',
                    borderRadius: '12px',
                    padding: '2px 8px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {tab.count as React.ReactNode}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.9)',
        minHeight: 'calc(100vh - 140px)',
        margin: '20px',
        borderRadius: '20px',
        padding: '40px',
        boxShadow: '0 10px 40px rgba(19, 49, 42, 0.1)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(198, 154, 114, 0.2)'
      }}>
        {activeTab === 'overview' && (
          <div>
            <div style={{ marginBottom: '40px' }}>
              <h2 style={{ color: '#111827', fontWeight: '600', margin: '0 0 8px 0', fontSize: '24px', letterSpacing: '-0.5px' }}>
                Dashboard Overview
              </h2>
              <p style={{ color: '#6B7280', margin: 0, fontSize: '14px' }}>System-wide metrics and performance</p>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
              <div style={{ background: 'linear-gradient(135deg, #EFF6FF 0%, #FFFFFF 100%)', padding: '28px 24px', borderRadius: '12px', border: '1px solid #DBEAFE', boxShadow: '0 1px 3px rgba(59, 130, 246, 0.1)', transition: 'all 0.2s ease' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.15)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(59, 130, 246, 0.1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}>
                <div style={{ color: '#3B82F6', fontSize: '13px', fontWeight: '500', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Libraries</div>
                <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#1E40AF', lineHeight: '1' }}>{statistics?.TotalLibraries || allRequests.length}</div>
              </div>
              
              <div style={{ background: 'linear-gradient(135deg, #F0FDF4 0%, #FFFFFF 100%)', padding: '28px 24px', borderRadius: '12px', border: '1px solid #BBF7D0', boxShadow: '0 1px 3px rgba(34, 197, 94, 0.1)', transition: 'all 0.2s ease' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(34, 197, 94, 0.15)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(34, 197, 94, 0.1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}>
                <div style={{ color: '#22C55E', fontSize: '13px', fontWeight: '500', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Users</div>
                <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#15803D', lineHeight: '1' }}>{statistics?.TotalUsers || allUsers.length}</div>
              </div>
              
              <div style={{ background: 'linear-gradient(135deg, #FEF3C7 0%, #FFFFFF 100%)', padding: '28px 24px', borderRadius: '12px', border: '1px solid #FDE68A', boxShadow: '0 1px 3px rgba(245, 158, 11, 0.1)', transition: 'all 0.2s ease' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.15)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(245, 158, 11, 0.1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}>
                <div style={{ color: '#F59E0B', fontSize: '13px', fontWeight: '500', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Books</div>
                <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#B45309', lineHeight: '1' }}>{statistics?.TotalBooks || allBooks.length}</div>
              </div>
              
              <div style={{ background: 'linear-gradient(135deg, #FCE7F3 0%, #FFFFFF 100%)', padding: '28px 24px', borderRadius: '12px', border: '1px solid #FBCFE8', boxShadow: '0 1px 3px rgba(236, 72, 153, 0.1)', transition: 'all 0.2s ease' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(236, 72, 153, 0.15)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(236, 72, 153, 0.1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}>
                <div style={{ color: '#EC4899', fontSize: '13px', fontWeight: '500', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pending Requests</div>
                <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#BE185D', lineHeight: '1' }}>{pendingRequests.length}</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'libraries' && (
          <div>
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ color: '#111827', fontWeight: '600', margin: '0 0 8px 0', fontSize: '24px', letterSpacing: '-0.5px' }}>Library Management</h2>
              <p style={{ color: '#6B7280', margin: 0, fontSize: '14px' }}>Manage library registrations and approvals</p>
            </div>
            
            <div style={{ marginBottom: '24px' }}>
              <input
                type="text"
                placeholder="Search libraries by name, code, or admin..."
                value={librarySearch}
                onChange={(e) => setLibrarySearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#3B82F6'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#D1D5DB'}
              />
            </div>
            
            {pendingRequests.length > 0 && (
              <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #FDE68A', marginBottom: '24px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(245, 158, 11, 0.1)' }}>
                <div style={{ background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)', color: '#92400E', padding: '16px 20px', fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>Pending Approvals</span>
                  <span style={{ background: '#F59E0B', color: '#FFFFFF', padding: '2px 8px', borderRadius: '12px', fontSize: '12px' }}>{pendingRequests.length}</span>
                </div>
                <div style={{ padding: '20px' }}>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    {pendingRequests.map((request) => (
                      <div key={request.id} style={{ 
                        background: '#FEFCE8', 
                        padding: '16px', 
                        borderRadius: '8px', 
                        border: '1px solid #FDE68A',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'all 0.2s ease',
                        cursor: 'pointer'
                      }}
                      onClick={() => setLibraryDetailsModal({ show: true, library: request })}
                      onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 2px 8px rgba(245, 158, 11, 0.15)'}
                      onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}>
                        <div>
                          <div style={{ fontWeight: '600', color: '#111827', fontSize: '15px', marginBottom: '4px' }}>{request.libraryName}</div>
                          <div style={{ color: '#6B7280', fontSize: '14px', marginBottom: '4px' }}>{request.adminName} • {request.adminEmail}</div>
                          <div style={{ color: '#9CA3AF', fontSize: '12px' }}>Requested: {new Date(request.createdDate).toLocaleDateString()}</div>
                        </div>
                        <div style={{ color: '#F59E0B', fontSize: '20px' }}>→</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)' }}>
              <div style={{ background: '#F9FAFB', color: '#111827', padding: '16px 20px', fontWeight: '600', fontSize: '14px', borderBottom: '1px solid #E5E7EB' }}>All Libraries</div>
              <div style={{ padding: '20px' }}>
                {(() => {
                  const filteredLibraries = allRequests.filter(library => 
                    library.libraryName.toLowerCase().includes(librarySearch.toLowerCase()) ||
                    library.libraryCode.toLowerCase().includes(librarySearch.toLowerCase()) ||
                    library.adminName.toLowerCase().includes(librarySearch.toLowerCase()) ||
                    library.adminEmail.toLowerCase().includes(librarySearch.toLowerCase())
                  );
                  
                  return filteredLibraries.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#9CA3AF', padding: '60px', fontSize: '14px' }}>No libraries found</div>
                  ) : (
                    <div style={{ display: 'grid', gap: '12px' }}>
                      {filteredLibraries.map((library) => (
                      <div key={library.id} style={{ 
                        background: '#FAFAFA', 
                        padding: '16px', 
                        borderRadius: '8px', 
                        border: '1px solid #E5E7EB',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#F3F4F6'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = '#FAFAFA'; e.currentTarget.style.boxShadow = 'none'; }}>
                        <div>
                          <div style={{ fontWeight: '600', color: '#111827', fontSize: '15px', marginBottom: '4px' }}>{library.libraryName}</div>
                          <div style={{ color: '#6B7280', fontSize: '14px', marginBottom: '4px' }}>{library.adminName} • {library.adminEmail}</div>
                          <div style={{ color: '#9CA3AF', fontSize: '12px' }}>Code: {library.libraryCode} • Created: {new Date(library.createdDate).toLocaleDateString()}</div>
                        </div>
                        <div style={{
                          background: library.status === 'Approved' ? '#D1FAE5' : library.status === 'Rejected' ? '#FEE2E2' : '#FEF3C7',
                          color: library.status === 'Approved' ? '#065F46' : library.status === 'Rejected' ? '#991B1B' : '#92400E',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {library.status}
                        </div>
                      </div>
                      ))}
                    </div>
                  );
                })()
                }
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ color: '#111827', fontWeight: '600', margin: '0 0 8px 0', fontSize: '24px', letterSpacing: '-0.5px' }}>User Management</h2>
              <p style={{ color: '#6B7280', margin: 0, fontSize: '14px' }}>Manage users across all libraries</p>
            </div>
            
            <div style={{ marginBottom: '24px' }}>
              <input
                type="text"
                placeholder="Search users by name, email, or library..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#3B82F6'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#D1D5DB'}
              />
            </div>
            
            {/* Library Filter Tabs */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setSelectedLibrary('all')}
                  style={{
                    background: selectedLibrary === 'all' ? '#111827' : '#FFFFFF',
                    color: selectedLibrary === 'all' ? '#FFFFFF' : '#6B7280',
                    border: `1px solid ${selectedLibrary === 'all' ? '#111827' : '#E5E7EB'}`,
                    borderRadius: '8px',
                    padding: '10px 16px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '500',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedLibrary !== 'all') {
                      e.currentTarget.style.borderColor = '#9CA3AF';
                      e.currentTarget.style.color = '#111827';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedLibrary !== 'all') {
                      e.currentTarget.style.borderColor = '#E5E7EB';
                      e.currentTarget.style.color = '#6B7280';
                    }
                  }}
                >
                  All Libraries <span style={{ color: selectedLibrary === 'all' ? '#9CA3AF' : '#9CA3AF', marginLeft: '4px' }}>({allUsers.length})</span>
                </button>
                {Object.entries(
                  allUsers.reduce((acc, user) => {
                    const libraryName = user.libraryName || 'Unknown Library';
                    if (!acc[libraryName]) acc[libraryName] = 0;
                    acc[libraryName]++;
                    return acc;
                  }, {} as Record<string, number>)
                ).map(([libraryName, count]) => (
                  <button
                    key={libraryName}
                    onClick={() => setSelectedLibrary(libraryName)}
                    style={{
                      background: selectedLibrary === libraryName ? '#111827' : '#FFFFFF',
                      color: selectedLibrary === libraryName ? '#FFFFFF' : '#6B7280',
                      border: `1px solid ${selectedLibrary === libraryName ? '#111827' : '#E5E7EB'}`,
                      borderRadius: '8px',
                      padding: '10px 16px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '500',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedLibrary !== libraryName) {
                        e.currentTarget.style.borderColor = '#9CA3AF';
                        e.currentTarget.style.color = '#111827';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedLibrary !== libraryName) {
                        e.currentTarget.style.borderColor = '#E5E7EB';
                        e.currentTarget.style.color = '#6B7280';
                      }
                    }}
                  >
                    {libraryName} <span style={{ color: selectedLibrary === libraryName ? '#9CA3AF' : '#9CA3AF', marginLeft: '4px' }}>({count as React.ReactNode})</span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Users Display */}
            <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)' }}>
              <div style={{ background: '#F9FAFB', color: '#111827', padding: '16px 20px', fontWeight: '600', fontSize: '14px', borderBottom: '1px solid #E5E7EB' }}>
                {selectedLibrary === 'all' ? 'All Users' : `${selectedLibrary} Users`}
              </div>
              <div style={{ padding: '20px' }}>
                {(() => {
                  let filteredUsers = selectedLibrary === 'all' 
                    ? allUsers 
                    : allUsers.filter(user => (user.libraryName || 'Unknown Library') === selectedLibrary);
                  
                  if (userSearch) {
                    filteredUsers = filteredUsers.filter(user =>
                      user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
                      user.email.toLowerCase().includes(userSearch.toLowerCase()) ||
                      (user.libraryName || '').toLowerCase().includes(userSearch.toLowerCase()) ||
                      user.role.toLowerCase().includes(userSearch.toLowerCase())
                    );
                  }
                  
                  return filteredUsers.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#9CA3AF', padding: '60px', fontSize: '14px' }}>No users found</div>
                  ) : (
                    <div style={{ display: 'grid', gap: '12px' }}>
                      {filteredUsers.map((user) => (
                        <div key={user.id} style={{ 
                          background: '#FAFAFA', 
                          padding: '16px', 
                          borderRadius: '8px', 
                          border: '1px solid #E5E7EB',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#F3F4F6'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = '#FAFAFA'; e.currentTarget.style.boxShadow = 'none'; }}>
                          <div>
                            <div style={{ fontWeight: '600', color: '#111827', fontSize: '15px', marginBottom: '4px' }}>{user.name}</div>
                            <div style={{ color: '#6B7280', fontSize: '14px', marginBottom: '4px' }}>{user.email}</div>
                            <div style={{ color: '#9CA3AF', fontSize: '12px' }}>{user.libraryName || 'Unknown'} • Joined {new Date(user.createdDate).toLocaleDateString()}</div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                              background: user.role === 'SuperAdmin' ? '#FEE2E2' : user.role === 'LibraryAdmin' ? '#DBEAFE' : user.role === 'Librarian' ? '#E0E7FF' : '#F3F4F6',
                              color: user.role === 'SuperAdmin' ? '#991B1B' : user.role === 'LibraryAdmin' ? '#1E40AF' : user.role === 'Librarian' ? '#3730A3' : '#374151',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '600'
                            }}>
                              {user.role}
                            </div>
                            <div style={{
                              background: user.isApprovedByAdmin ? '#D1FAE5' : '#FEF3C7',
                              color: user.isApprovedByAdmin ? '#065F46' : '#92400E',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '600'
                            }}>
                              {user.isApprovedByAdmin ? 'Active' : 'Pending'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()
                }
              </div>
            </div>
          </div>
        )}

        {activeTab === 'books' && (
          <div>
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ color: '#111827', fontWeight: '600', margin: '0 0 8px 0', fontSize: '24px', letterSpacing: '-0.5px' }}>Book Management</h2>
              <p style={{ color: '#6B7280', margin: 0, fontSize: '14px' }}>Manage books across all libraries</p>
            </div>
            
            <div style={{ marginBottom: '24px' }}>
              <input
                type="text"
                placeholder="Search books by title, author, ISBN, or library..."
                value={bookSearch}
                onChange={(e) => setBookSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#3B82F6'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#D1D5DB'}
              />
            </div>
            
            {/* Library Filter Tabs for Books */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setSelectedBookLibrary('all')}
                  style={{
                    background: selectedBookLibrary === 'all' ? '#111827' : '#FFFFFF',
                    color: selectedBookLibrary === 'all' ? '#FFFFFF' : '#6B7280',
                    border: `1px solid ${selectedBookLibrary === 'all' ? '#111827' : '#E5E7EB'}`,
                    borderRadius: '8px',
                    padding: '10px 16px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '500',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedBookLibrary !== 'all') {
                      e.currentTarget.style.borderColor = '#9CA3AF';
                      e.currentTarget.style.color = '#111827';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedBookLibrary !== 'all') {
                      e.currentTarget.style.borderColor = '#E5E7EB';
                      e.currentTarget.style.color = '#6B7280';
                    }
                  }}
                >
                  All Libraries <span style={{ color: selectedBookLibrary === 'all' ? '#9CA3AF' : '#9CA3AF', marginLeft: '4px' }}>({allBooks.length})</span>
                </button>
                {Object.entries(
                  allBooks.reduce((acc, book) => {
                    const libraryName = book.libraryName || 'Unknown Library';
                    if (!acc[libraryName]) acc[libraryName] = 0;
                    acc[libraryName]++;
                    return acc;
                  }, {} as Record<string, number>)
                ).map(([libraryName, count]) => (
                  <button
                    key={libraryName}
                    onClick={() => setSelectedBookLibrary(libraryName)}
                    style={{
                      background: selectedBookLibrary === libraryName ? '#111827' : '#FFFFFF',
                      color: selectedBookLibrary === libraryName ? '#FFFFFF' : '#6B7280',
                      border: `1px solid ${selectedBookLibrary === libraryName ? '#111827' : '#E5E7EB'}`,
                      borderRadius: '8px',
                      padding: '10px 16px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '500',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedBookLibrary !== libraryName) {
                        e.currentTarget.style.borderColor = '#9CA3AF';
                        e.currentTarget.style.color = '#111827';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedBookLibrary !== libraryName) {
                        e.currentTarget.style.borderColor = '#E5E7EB';
                        e.currentTarget.style.color = '#6B7280';
                      }
                    }}
                  >
                    {libraryName} <span style={{ color: selectedBookLibrary === libraryName ? '#9CA3AF' : '#9CA3AF', marginLeft: '4px' }}>({count as React.ReactNode})</span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Books Display */}
            <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)' }}>
              <div style={{ background: '#F9FAFB', color: '#111827', padding: '16px 20px', fontWeight: '600', fontSize: '14px', borderBottom: '1px solid #E5E7EB' }}>
                {selectedBookLibrary === 'all' ? 'All Books' : `${selectedBookLibrary} Books`}
              </div>
              <div style={{ padding: '20px' }}>
                {(() => {
                  let filteredBooks = selectedBookLibrary === 'all' 
                    ? allBooks 
                    : allBooks.filter(book => (book.libraryName || 'Unknown Library') === selectedBookLibrary);
                  
                  if (bookSearch) {
                    filteredBooks = filteredBooks.filter(book =>
                      book.title.toLowerCase().includes(bookSearch.toLowerCase()) ||
                      book.author.toLowerCase().includes(bookSearch.toLowerCase()) ||
                      book.isbn.toLowerCase().includes(bookSearch.toLowerCase()) ||
                      (book.libraryName || '').toLowerCase().includes(bookSearch.toLowerCase())
                    );
                  }
                  
                  return filteredBooks.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#9CA3AF', padding: '60px', fontSize: '14px' }}>No books found</div>
                  ) : (
                    <div style={{ display: 'grid', gap: '12px' }}>
                      {filteredBooks.map((book, index) => (
                        <div key={`book-${index}`} style={{ 
                          background: '#FAFAFA', 
                          padding: '16px', 
                          borderRadius: '8px', 
                          border: '1px solid #E5E7EB',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#F3F4F6'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = '#FAFAFA'; e.currentTarget.style.boxShadow = 'none'; }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: '600', color: '#111827', fontSize: '15px', marginBottom: '4px' }}>{book.title}</div>
                            <div style={{ color: '#6B7280', fontSize: '14px', marginBottom: '4px' }}>by {book.author}</div>
                            <div style={{ color: '#9CA3AF', fontSize: '12px' }}>{book.libraryName || 'Unknown'} • ISBN: {book.isbn}</div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '16px' }}>
                            <div style={{
                              background: book.isAvailable ? '#D1FAE5' : '#FEE2E2',
                              color: book.isAvailable ? '#065F46' : '#991B1B',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '600',
                              whiteSpace: 'nowrap'
                            }}>
                              {book.isAvailable ? 'Available' : 'Issued'}
                            </div>
                            <div style={{
                              background: '#F3F4F6',
                              color: '#374151',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '600',
                              whiteSpace: 'nowrap'
                            }}>
                              {book.totalCopies} {book.totalCopies === 1 ? 'Copy' : 'Copies'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()
                }
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div>
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ color: '#111827', fontWeight: '600', margin: '0 0 8px 0', fontSize: '24px', letterSpacing: '-0.5px' }}>Profile Settings</h2>
              <p style={{ color: '#6B7280', margin: 0, fontSize: '14px' }}>Manage your account information and preferences</p>
            </div>
            
            <div style={{ maxWidth: '900px' }}>
              <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)' }}>
                <div style={{ background: '#F9FAFB', padding: '20px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ color: '#111827', fontWeight: '600', margin: '0 0 4px 0', fontSize: '16px' }}>Personal Information</h3>
                    <p style={{ color: '#6B7280', margin: 0, fontSize: '13px' }}>Update your profile details</p>
                  </div>
                  {!isEditingProfile && (
                    <button
                      onClick={() => {
                        setIsEditingProfile(true);
                        setProfileData({ name: user?.name || '', email: user?.email || '' });
                      }}
                      style={{
                        background: '#111827',
                        color: '#FFFFFF',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '500',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#374151'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#111827'}
                    >
                      Edit Profile
                    </button>
                  )}
                </div>

                <div style={{ padding: '32px 24px' }}>
                  <div style={{ display: 'grid', gap: '24px' }}>
                    <div>
                      <label style={{ display: 'block', color: '#374151', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>Full Name</label>
                      {isEditingProfile ? (
                        <input
                          type="text"
                          value={profileData.name}
                          onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            border: '1px solid #D1D5DB',
                            borderRadius: '6px',
                            fontSize: '14px',
                            background: '#FFFFFF',
                            color: '#111827',
                            outline: 'none',
                            transition: 'all 0.2s ease',
                            boxSizing: 'border-box'
                          }}
                          onFocus={(e) => e.currentTarget.style.borderColor = '#3B82F6'}
                          onBlur={(e) => e.currentTarget.style.borderColor = '#D1D5DB'}
                        />
                      ) : (
                        <div style={{ padding: '10px 12px', background: '#F9FAFB', borderRadius: '6px', color: '#111827', fontSize: '14px', fontWeight: '500' }}>{user?.name || 'Not Available'}</div>
                      )}
                    </div>
                    
                    <div>
                      <label style={{ display: 'block', color: '#374151', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>Email Address</label>
                      <div style={{ padding: '10px 12px', background: '#F9FAFB', borderRadius: '6px', color: '#6B7280', fontSize: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{user?.email || 'Not Available'}</span>
                        <span style={{ fontSize: '11px', background: '#E5E7EB', color: '#6B7280', padding: '2px 8px', borderRadius: '4px', fontWeight: '600' }}>Cannot be changed</span>
                      </div>
                    </div>
                    
                    <div>
                      <label style={{ display: 'block', color: '#374151', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>Role</label>
                      <div style={{ padding: '10px 12px', background: '#F9FAFB', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: '#111827', fontSize: '14px', fontWeight: '500' }}>{user?.role || 'Super Admin'}</span>
                        <span style={{ background: '#FEE2E2', color: '#991B1B', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600' }}>System Access</span>
                      </div>
                    </div>
                    
                    <div>
                      <label style={{ display: 'block', color: '#374151', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>Account Status</label>
                      <div style={{ padding: '10px 12px', background: '#F9FAFB', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22C55E' }}></div>
                        <span style={{ color: '#111827', fontSize: '14px', fontWeight: '500' }}>Active</span>
                      </div>
                    </div>
                  </div>

                  {isEditingProfile && (
                    <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #E5E7EB', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => setIsEditingProfile(false)}
                        style={{
                          background: '#FFFFFF',
                          color: '#6B7280',
                          border: '1px solid #D1D5DB',
                          padding: '10px 20px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '500',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#F9FAFB'; e.currentTarget.style.borderColor = '#9CA3AF'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.borderColor = '#D1D5DB'; }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            await updateProfile({ name: profileData.name });
                            setDialog({
                              show: true,
                              type: 'message',
                              title: 'Success',
                              message: 'Profile updated successfully!',
                              dialogType: 'success'
                            });
                            setIsEditingProfile(false);
                          } catch (error: any) {
                            setDialog({
                              show: true,
                              type: 'message',
                              title: 'Error',
                              message: error.message || 'Failed to update profile',
                              dialogType: 'error'
                            });
                          }
                        }}
                        style={{
                          background: '#22C55E',
                          color: '#FFFFFF',
                          border: 'none',
                          padding: '10px 24px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '600',
                          transition: 'all 0.2s ease',
                          boxShadow: '0 1px 3px rgba(34, 197, 94, 0.3)'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#16A34A'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(34, 197, 94, 0.4)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = '#22C55E'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(34, 197, 94, 0.3)'; }}
                      >
                        Save Changes
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Dialog Component */}
      <Dialog
        isOpen={dialog.show}
        onClose={() => setDialog({ ...dialog, show: false })}
        title={dialog.title}
        message={dialog.message}
        type={dialog.dialogType}
        theme="library"
        showConfirm={dialog.type === 'confirm'}
        onConfirm={dialog.onConfirm}
        showInput={dialog.type === 'input'}
        onInputChange={dialog.onInputConfirm}
        inputPlaceholder={dialog.inputPlaceholder}
        confirmText={dialog.type === 'confirm' ? 'Yes' : 'Submit'}
        cancelText="Cancel"
      />

      {/* Library Details Modal */}
      {libraryDetailsModal.show && libraryDetailsModal.library && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(4px)'
        }} onClick={() => setLibraryDetailsModal({ show: false, library: null })}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '12px',
            maxWidth: '560px',
            width: '90%',
            maxHeight: '85vh',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            display: 'flex',
            flexDirection: 'column'
          }} onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div style={{ 
              background: 'linear-gradient(135deg, #F9FAFB 0%, #FFFFFF 100%)', 
              padding: '24px 28px', 
              borderBottom: '1px solid #E5E7EB',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h2 style={{ color: '#111827', fontWeight: '600', margin: '0 0 4px 0', fontSize: '20px', letterSpacing: '-0.3px' }}>Library Registration</h2>
                <p style={{ color: '#6B7280', margin: 0, fontSize: '13px' }}>Review and approve library details</p>
              </div>
              <button onClick={() => setLibraryDetailsModal({ show: false, library: null })} style={{
                background: '#F3F4F6',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                color: '#6B7280',
                padding: '0',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '6px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#E5E7EB'; e.currentTarget.style.color = '#111827'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#F3F4F6'; e.currentTarget.style.color = '#6B7280'; }}>×</button>
            </div>

            {/* Content */}
            <div style={{ padding: '28px', overflow: 'auto', flex: 1 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div style={{ gridColumn: '1 / -1', background: '#F9FAFB', padding: '18px', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                  <div style={{ color: '#9CA3AF', fontSize: '11px', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Library Name</div>
                  <div style={{ color: '#111827', fontSize: '17px', fontWeight: '600' }}>{libraryDetailsModal.library.libraryName}</div>
                </div>

                <div style={{ background: '#F9FAFB', padding: '18px', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                  <div style={{ color: '#9CA3AF', fontSize: '11px', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Library Code</div>
                  <div style={{ color: '#111827', fontSize: '15px', fontWeight: '600', fontFamily: 'monospace' }}>{libraryDetailsModal.library.libraryCode}</div>
                </div>

                <div style={{ background: '#F9FAFB', padding: '18px', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                  <div style={{ color: '#9CA3AF', fontSize: '11px', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Request Date</div>
                  <div style={{ color: '#111827', fontSize: '15px', fontWeight: '600' }}>{new Date(libraryDetailsModal.library.createdDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                </div>
              </div>

              <div style={{ background: '#F9FAFB', padding: '18px', borderRadius: '8px', border: '1px solid #E5E7EB', marginBottom: '20px' }}>
                <div style={{ color: '#9CA3AF', fontSize: '11px', fontWeight: '600', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Administrator Details</div>
                <div style={{ display: 'grid', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ color: '#6B7280', fontSize: '13px', minWidth: '60px' }}>Name:</div>
                    <div style={{ color: '#111827', fontSize: '14px', fontWeight: '600' }}>{libraryDetailsModal.library.adminName}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ color: '#6B7280', fontSize: '13px', minWidth: '60px' }}>Email:</div>
                    <div style={{ color: '#111827', fontSize: '14px', fontWeight: '600' }}>{libraryDetailsModal.library.adminEmail}</div>
                  </div>
                </div>
              </div>

              <div style={{ background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)', padding: '16px', borderRadius: '8px', border: '1px solid #FDE68A' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B' }}></div>
                  <div style={{ color: '#92400E', fontSize: '13px', fontWeight: '600' }}>Pending Approval</div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ 
              background: '#F9FAFB', 
              padding: '20px 28px', 
              borderTop: '1px solid #E5E7EB',
              display: 'flex', 
              gap: '12px', 
              justifyContent: 'flex-end' 
            }}>
              <button 
                onClick={() => {
                  setLibraryDetailsModal({ show: false, library: null });
                  handleReject(libraryDetailsModal.library.id);
                }}
                style={{ 
                  background: '#FFFFFF', 
                  color: '#EF4444', 
                  border: '1px solid #EF4444', 
                  padding: '10px 20px', 
                  borderRadius: '8px', 
                  cursor: 'pointer', 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  transition: 'all 0.2s ease' 
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#FEE2E2'; e.currentTarget.style.borderColor = '#DC2626'; e.currentTarget.style.color = '#DC2626'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.borderColor = '#EF4444'; e.currentTarget.style.color = '#EF4444'; }}
              >
                Reject
              </button>
              <button 
                onClick={() => {
                  setLibraryDetailsModal({ show: false, library: null });
                  handleApprove(libraryDetailsModal.library.id);
                }}
                style={{ 
                  background: '#22C55E', 
                  color: '#FFFFFF', 
                  border: 'none', 
                  padding: '10px 24px', 
                  borderRadius: '8px', 
                  cursor: 'pointer', 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  transition: 'all 0.2s ease',
                  boxShadow: '0 1px 3px rgba(34, 197, 94, 0.3)'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#16A34A'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(34, 197, 94, 0.4)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#22C55E'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(34, 197, 94, 0.3)'; }}
              >
                Approve Library
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StyledSuperAdminDashboard;