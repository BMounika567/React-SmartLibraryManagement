import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLibraryAdminDashboardContext } from '../../context/LibraryAdminDashboardContext';
import AdminHeader from './AdminHeader';
import DashboardOverview from './DashboardOverview';

import BookForm from '../librarian/BookForm';
import InviteLibrarianForm from '../InviteLibrarianForm';
import LibrarySettings from '../LibrarySettings';
import Dialog from '../common/Dialog';
import './AdminDashboard.css';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isApprovedByAdmin: boolean;
  libraryMembershipId: string;
  createdDate: string;
}

interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  categoryId: string;
  categoryName?: string;
  totalCopies: number;
  availableCopies: number;
  publishYear?: number;
  description?: string;
}

interface BookCategory {
  id: string;
  name: string;
}

const StyledLibraryAdminDashboard: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { statistics, users, pendingUsers, books, categories, librarians, finePayments, loading, approveUser, rejectUser, addBook, updateBook, deleteBook, inviteLibrarian, removeLibrarian, deleteUser, waiveFine } = useLibraryAdminDashboardContext();
  const [activeTab, setActiveTab] = useState<'overview' | 'books' | 'users' | 'librarians' | 'fines' | 'settings' | 'profile'>('overview');
  const [financeTab, setFinanceTab] = useState<'unpaid' | 'paid' | 'waived' | 'all'>('unpaid');
  const [showAddBook, setShowAddBook] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
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
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({ name: '', email: '' });
  const [showWaiveModal, setShowWaiveModal] = useState(false);
  const [selectedFine, setSelectedFine] = useState<any>(null);
  const [waiverReason, setWaiverReason] = useState('');
  const [waiverNotes, setWaiverNotes] = useState('');
  const [isWaiving, setIsWaiving] = useState(false);



  const handleApproveUser = async (userId: string) => {
    const result = await approveUser(userId);
    setDialog({ 
      show: true, 
      type: 'message', 
      title: result.success ? 'Success' : 'Error', 
      message: result.message, 
      dialogType: result.success ? 'success' : 'error' 
    });
  };

  const handleRejectUser = async (userId: string) => {
    setDialog({
      show: true,
      type: 'input',
      title: 'Reject User',
      message: 'Enter rejection reason:',
      dialogType: 'error',
      inputPlaceholder: 'Reason for rejection...',
      onInputConfirm: async (reason: string) => {
        if (!reason) return;
        const result = await rejectUser(userId, reason);
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

  const handleAddBook = async (bookData: any) => {
    const result = await addBook(bookData);
    setShowAddBook(false);
    setDialog({ 
      show: true, 
      type: 'message', 
      title: result.success ? 'Success' : 'Error', 
      message: result.message, 
      dialogType: result.success ? 'success' : 'error' 
    });
  };

  const handleEditBook = async (bookData: any) => {
    const result = await updateBook(bookData);
    setEditingBook(null);
    setDialog({ 
      show: true, 
      type: 'message', 
      title: result.success ? 'Success' : 'Error', 
      message: result.message, 
      dialogType: result.success ? 'success' : 'error' 
    });
  };

  const handleDeleteBook = async (bookId: string) => {
    setDialog({
      show: true,
      type: 'confirm',
      title: 'Delete Book',
      message: 'Are you sure you want to delete this book?',
      dialogType: 'error',
      onConfirm: async () => {
        const result = await deleteBook(bookId);
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

  const handleInviteLibrarian = async (inviteData: any) => {
    const result = await inviteLibrarian(inviteData);
    setShowInviteForm(false);
    setDialog({ 
      show: true, 
      type: 'message', 
      title: result.success ? 'Success' : 'Error', 
      message: result.message, 
      dialogType: result.success ? 'success' : 'error' 
    });
  };

  const handleDeleteLibrarian = async (librarianId: string) => {
    setDialog({
      show: true,
      type: 'confirm',
      title: 'Remove Librarian',
      message: 'Are you sure you want to remove this librarian from the list?',
      dialogType: 'error',
      onConfirm: async () => {
        const result = removeLibrarian(librarianId);
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

  const handleDeleteUser = async (userId: string) => {
    setDialog({
      show: true,
      type: 'confirm',
      title: 'Delete User',
      message: 'Are you sure you want to delete this user? This action cannot be undone.',
      dialogType: 'error',
      onConfirm: async () => {
        const result = await deleteUser(userId);
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

  const handleWaiveFine = async () => {
    if (!selectedFine || !waiverReason) return;
    
    if (!selectedFine.bookIssueId) {
      setDialog({ 
        show: true, 
        type: 'message', 
        title: 'Error', 
        message: 'Book Issue ID is missing', 
        dialogType: 'error' 
      });
      return;
    }
    
    setIsWaiving(true);
    try {
      const result = await waiveFine(selectedFine.bookIssueId, waiverReason, waiverNotes);
      setShowWaiveModal(false);
      setWaiverReason('');
      setWaiverNotes('');
      setSelectedFine(null);
      setDialog({ 
        show: true, 
        type: 'message', 
        title: result.success ? 'Success' : 'Error', 
        message: result.message, 
        dialogType: result.success ? 'success' : 'error' 
      });
    } catch (error) {
      setDialog({ 
        show: true, 
        type: 'message', 
        title: 'Error', 
        message: 'Failed to waive fine', 
        dialogType: 'error' 
      });
    } finally {
      setIsWaiving(false);
    }
  };

  const filteredBooks = books.filter(book => 
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.isbn.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div style={{ 
        background: '#FFFFFF', 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div style={{ 
          background: '#13312A', 
          color: '#FFFFFF', 
          padding: '20px 40px', 
          borderRadius: '15px',
          border: '1px solid #E5E7EB'
        }}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-wrapper" style={{ 
      background: 'linear-gradient(135deg, #F0FDF4 0%, #FFFFFF 50%, #ECFDF5 100%)', 
      minHeight: '100vh', 
      fontFamily: 'Inter, sans-serif',
      margin: 0,
      padding: 0,
      width: '100%'
    }}>
      <AdminHeader />
      
      {/* Tabs */}
      <div style={{ 
        background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)', 
        backdropFilter: 'blur(15px)',
        borderBottom: '2px solid #A7F3D0',
        padding: '15px 20px',
        boxShadow: '0 2px 12px rgba(16, 185, 129, 0.1)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: '2px', flexWrap: 'wrap' }}>
            {[
              { key: 'overview', label: 'Dashboard', count: null },
              { key: 'books', label: 'Books', count: books.length },
              { key: 'users', label: 'Users', count: users.length },
              { key: 'librarians', label: 'Librarians', count: librarians.length },
              { key: 'fines', label: 'Finance', count: null },
              { key: 'settings', label: 'Settings', count: null },
              { key: 'profile', label: 'Profile', count: null }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                style={{
                  background: activeTab === tab.key ? 'linear-gradient(135deg, #10B981 0%, #34D399 100%)' : '#FFFFFF',
                  color: activeTab === tab.key ? '#FFFFFF' : '#000000',
                  border: `2px solid ${activeTab === tab.key ? '#10B981' : '#D1FAE5'}`,
                  borderRadius: '12px',
                  padding: '10px 15px',
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  flex: '1',
                  minWidth: '0',
                  justifyContent: 'center',
                  boxShadow: activeTab === tab.key ? '0 4px 15px rgba(16, 185, 129, 0.3)' : 'none',
                  transform: activeTab === tab.key ? 'translateY(-2px)' : 'none'
                }}
              >
                {tab.label}
                {tab.count !== null && (
                  <span style={{
                    background: '#FFFFFF',
                    color: '#10B981',
                    borderRadius: '10px',
                    padding: '1px 6px',
                    fontSize: '11px',
                    fontWeight: '600'
                  }}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        minHeight: 'calc(100vh - 140px)',
        margin: '20px',
        borderRadius: '20px',
        padding: '40px',
        boxShadow: '0 10px 40px rgba(59, 130, 246, 0.08)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(219, 234, 254, 0.5)'
      }}>
        {activeTab === 'overview' && (
          <div>
            <h2 style={{ color: '#111827', fontWeight: '600', marginBottom: '30px' }}>
              Library Dashboard Overview
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px', marginBottom: '40px' }}>
              <div style={{ 
                background: 'linear-gradient(135deg, #F6E9CA 0%, rgba(246, 233, 202, 0.8) 100%)', 
                padding: '30px 20px', 
                borderRadius: '20px', 
                textAlign: 'center', 
                border: '2px solid rgba(198, 154, 114, 0.3)',
                boxShadow: '0 8px 25px rgba(19, 49, 42, 0.1)',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}>
                <div style={{ fontSize: '3rem', fontWeight: '800', color: '#000000', marginBottom: '10px' }}>{statistics?.TotalBooks || books.length}</div>
                <div style={{ color: '#000000', fontWeight: '700', fontSize: '18px' }}>Total Books</div>
              </div>
              <div style={{ background: 'linear-gradient(135deg, #DCFCE7 0%, #BBF7D0 100%)', padding: '35px 25px', borderRadius: '20px', textAlign: 'center', border: '2px solid #86EFAC', boxShadow: '0 10px 30px rgba(34, 197, 94, 0.15)', transition: 'all 0.3s ease', cursor: 'pointer' }}>
                <div style={{ fontSize: '3rem', fontWeight: '800', color: '#000000', marginBottom: '10px' }}>{statistics?.TotalUsers || users.length}</div>
                <div style={{ color: '#000000', fontWeight: '700', fontSize: '18px' }}>Total Users</div>
              </div>
              <div style={{ background: 'linear-gradient(135deg, #DCFCE7 0%, #BBF7D0 100%)', padding: '35px 25px', borderRadius: '20px', textAlign: 'center', border: '2px solid #86EFAC', boxShadow: '0 10px 30px rgba(34, 197, 94, 0.15)', transition: 'all 0.3s ease', cursor: 'pointer' }}>
                <div style={{ fontSize: '3rem', fontWeight: '800', color: '#000000', marginBottom: '10px' }}>{statistics?.TotalLibrarians || librarians.length}</div>
                <div style={{ color: '#000000', fontWeight: '700', fontSize: '18px' }}>Total Librarians</div>
              </div>
              <div style={{ background: 'linear-gradient(135deg, #DCFCE7 0%, #BBF7D0 100%)', padding: '35px 25px', borderRadius: '20px', textAlign: 'center', border: '2px solid #86EFAC', boxShadow: '0 10px 30px rgba(34, 197, 94, 0.15)', transition: 'all 0.3s ease', cursor: 'pointer' }}>
                <div style={{ fontSize: '3rem', fontWeight: '800', color: '#000000', marginBottom: '10px' }}>{statistics?.IssuedBooks || 0}</div>
                <div style={{ color: '#000000', fontWeight: '700', fontSize: '18px' }}>Issued Books</div>
              </div>
            </div>


          </div>
        )}

        {activeTab === 'librarians' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
              <h2 style={{ color: '#1F2937', fontWeight: '700', margin: 0, fontSize: '24px' }}>Librarian Management</h2>
              <button
                onClick={() => setShowInviteForm(true)}
                style={{
                  background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
                  transition: 'all 0.3s ease'
                }}
              >
                + Invite New Librarian
              </button>
            </div>
            
            {librarians.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#6B7280', padding: '60px', background: '#F9FAFB', borderRadius: '12px' }}>
                No librarians found. Invite librarians to get started.
              </div>
            ) : (
              <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 2fr 1.5fr 1.2fr 1fr',
                  gap: '16px',
                  padding: '16px 20px',
                  background: '#F9FAFB',
                  borderBottom: '1px solid #E5E7EB',
                  fontWeight: '600',
                  fontSize: '13px',
                  color: '#6B7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  <div>Name</div>
                  <div>Email</div>
                  <div>Member ID</div>
                  <div>Joined Date</div>
                  <div style={{ textAlign: 'right' }}>Actions</div>
                </div>
                {librarians.map((librarian, index) => (
                  <div 
                    key={librarian.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '2fr 2fr 1.5fr 1.2fr 1fr',
                      gap: '16px',
                      padding: '18px 20px',
                      borderBottom: index < librarians.length - 1 ? '1px solid #F3F4F6' : 'none',
                      alignItems: 'center',
                      transition: 'background 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <div>
                      <div style={{ fontWeight: '600', color: '#111827', fontSize: '15px' }}>{librarian.name}</div>
                      <div style={{ color: '#9CA3AF', fontSize: '12px', marginTop: '2px' }}>Librarian</div>
                    </div>
                    <div style={{ color: '#6B7280', fontSize: '14px' }}>{librarian.email}</div>
                    <div style={{ color: '#374151', fontSize: '14px', fontFamily: 'monospace' }}>{librarian.libraryMembershipId}</div>
                    <div style={{ color: '#6B7280', fontSize: '14px' }}>{new Date(librarian.createdDate).toLocaleDateString()}</div>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => handleDeleteLibrarian(librarian.id)}
                        style={{
                          background: '#FFFFFF',
                          color: '#EF4444',
                          border: '1px solid #EF4444',
                          padding: '6px 14px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: '500',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#EF4444';
                          e.currentTarget.style.color = '#FFFFFF';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#FFFFFF';
                          e.currentTarget.style.color = '#EF4444';
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <h2 style={{ color: '#1F2937', fontWeight: '700', marginBottom: '25px', fontSize: '24px' }}>User Management</h2>
            
            {pendingUsers.length > 0 && (
              <div style={{ marginBottom: '30px' }}>
                <h3 style={{ color: '#111827', fontSize: '16px', fontWeight: '600', marginBottom: '15px' }}>Pending Approvals ({pendingUsers.length})</h3>
                <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '12px', overflow: 'hidden' }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 2fr 1.5fr 1.5fr',
                    gap: '16px',
                    padding: '16px 20px',
                    background: '#FEF3C7',
                    borderBottom: '1px solid #FDE68A',
                    fontWeight: '600',
                    fontSize: '13px',
                    color: '#92400E',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    <div>Name</div>
                    <div>Email</div>
                    <div>Request Date</div>
                    <div style={{ textAlign: 'right' }}>Actions</div>
                  </div>
                  {pendingUsers.map((user, index) => (
                    <div 
                      key={`pending-${user.id}`}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 2fr 1.5fr 1.5fr',
                        gap: '16px',
                        padding: '18px 20px',
                        borderBottom: index < pendingUsers.length - 1 ? '1px solid #F3F4F6' : 'none',
                        alignItems: 'center',
                        transition: 'background 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#FFFBEB'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{ fontWeight: '600', color: '#111827', fontSize: '15px' }}>{user.name}</div>
                      <div style={{ color: '#6B7280', fontSize: '14px' }}>{user.email}</div>
                      <div style={{ color: '#6B7280', fontSize: '14px' }}>{new Date(user.createdDate).toLocaleDateString()}</div>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button 
                          onClick={() => handleApproveUser(user.id)}
                          style={{
                            background: '#FFFFFF',
                            color: '#10B981',
                            border: '1px solid #10B981',
                            padding: '6px 14px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: '500',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#10B981';
                            e.currentTarget.style.color = '#FFFFFF';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#FFFFFF';
                            e.currentTarget.style.color = '#10B981';
                          }}
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => handleRejectUser(user.id)}
                          style={{
                            background: '#FFFFFF',
                            color: '#EF4444',
                            border: '1px solid #EF4444',
                            padding: '6px 14px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: '500',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#EF4444';
                            e.currentTarget.style.color = '#FFFFFF';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#FFFFFF';
                            e.currentTarget.style.color = '#EF4444';
                          }}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div>
              <h3 style={{ color: '#111827', fontSize: '16px', fontWeight: '600', marginBottom: '15px' }}>All Users</h3>
              {users.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#6B7280', padding: '60px', background: '#F9FAFB', borderRadius: '12px' }}>No users found</div>
              ) : (
                <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '12px', overflow: 'hidden' }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 2fr 1.5fr 1fr 1fr',
                    gap: '16px',
                    padding: '16px 20px',
                    background: '#F9FAFB',
                    borderBottom: '1px solid #E5E7EB',
                    fontWeight: '600',
                    fontSize: '13px',
                    color: '#6B7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    <div>Name</div>
                    <div>Email</div>
                    <div>Member ID</div>
                    <div>Status</div>
                    <div style={{ textAlign: 'right' }}>Actions</div>
                  </div>
                  {users.filter(user => !pendingUsers.some(p => p.id === user.id)).map((user, index) => (
                    <div 
                      key={`user-${user.id}`}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 2fr 1.5fr 1fr 1fr',
                        gap: '16px',
                        padding: '18px 20px',
                        borderBottom: index < users.filter(u => !pendingUsers.some(p => p.id === u.id)).length - 1 ? '1px solid #F3F4F6' : 'none',
                        alignItems: 'center',
                        transition: 'background 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <div>
                        <div style={{ fontWeight: '600', color: '#111827', fontSize: '15px' }}>{user.name}</div>
                        <div style={{ color: '#9CA3AF', fontSize: '12px', marginTop: '2px' }}>{user.role}</div>
                      </div>
                      <div style={{ color: '#6B7280', fontSize: '14px' }}>{user.email}</div>
                      <div style={{ color: '#374151', fontSize: '14px', fontFamily: 'monospace' }}>{user.libraryMembershipId}</div>
                      <div>
                        <span style={{
                          background: user.isApprovedByAdmin ? '#D1FAE5' : '#FEE2E2',
                          color: user.isApprovedByAdmin ? '#059669' : '#DC2626',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {user.isApprovedByAdmin ? 'Active' : 'Pending'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          style={{
                            background: '#FFFFFF',
                            color: '#EF4444',
                            border: '1px solid #EF4444',
                            padding: '6px 14px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: '500',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#EF4444';
                            e.currentTarget.style.color = '#FFFFFF';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#FFFFFF';
                            e.currentTarget.style.color = '#EF4444';
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'books' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
              <h2 style={{ color: '#1F2937', fontWeight: '700', margin: 0, fontSize: '24px' }}>Book Collection</h2>
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <input
                  type="text"
                  placeholder="Search books by title, author, or ISBN..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    padding: '10px 15px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '8px',
                    width: '300px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
                <button
                  onClick={() => setShowAddBook(true)}
                  style={{
                    background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  + Add New Book
                </button>
              </div>
            </div>
            
            {filteredBooks.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#6B7280', padding: '60px', background: '#F9FAFB', borderRadius: '12px' }}>No books found</div>
            ) : (
              <div style={{ 
                background: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: '12px',
                overflow: 'hidden'
              }}>
                {/* Table Header */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1.5fr 1.2fr 1fr 1fr 1.2fr',
                  gap: '16px',
                  padding: '16px 20px',
                  background: '#F9FAFB',
                  borderBottom: '1px solid #E5E7EB',
                  fontWeight: '600',
                  fontSize: '13px',
                  color: '#6B7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  <div>Title & Author</div>
                  <div>ISBN</div>
                  <div>Category</div>
                  <div>Total</div>
                  <div>Available</div>
                  <div style={{ textAlign: 'right' }}>Actions</div>
                </div>
                
                {/* Table Rows */}
                {filteredBooks.map((book, index) => (
                  <div 
                    key={book.id} 
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '2fr 1.5fr 1.2fr 1fr 1fr 1.2fr',
                      gap: '16px',
                      padding: '18px 20px',
                      borderBottom: index < filteredBooks.length - 1 ? '1px solid #F3F4F6' : 'none',
                      alignItems: 'center',
                      transition: 'background 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <div>
                      <div style={{ fontWeight: '600', color: '#111827', fontSize: '15px', marginBottom: '4px' }}>{book.title}</div>
                      <div style={{ color: '#6B7280', fontSize: '13px' }}>by {book.author}</div>
                    </div>
                    <div style={{ color: '#374151', fontSize: '14px', fontFamily: 'monospace' }}>{book.isbn}</div>
                    <div>
                      <span style={{
                        background: '#F3F4F6',
                        color: '#374151',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: '500'
                      }}>
                        {book.categoryName || 'N/A'}
                      </span>
                    </div>
                    <div style={{ color: '#111827', fontSize: '15px', fontWeight: '600' }}>{book.totalCopies}</div>
                    <div>
                      <span style={{
                        color: book.availableCopies > 0 ? '#059669' : '#DC2626',
                        fontSize: '15px',
                        fontWeight: '700'
                      }}>
                        {book.availableCopies}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => setEditingBook(book)}
                        style={{
                          background: '#FFFFFF',
                          color: '#3B82F6',
                          border: '1px solid #3B82F6',
                          padding: '6px 14px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: '500',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#3B82F6';
                          e.currentTarget.style.color = '#FFFFFF';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#FFFFFF';
                          e.currentTarget.style.color = '#3B82F6';
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteBook(book.id)}
                        style={{
                          background: '#FFFFFF',
                          color: '#EF4444',
                          border: '1px solid #EF4444',
                          padding: '6px 14px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: '500',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#EF4444';
                          e.currentTarget.style.color = '#FFFFFF';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#FFFFFF';
                          e.currentTarget.style.color = '#EF4444';
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}



        {activeTab === 'settings' && (
          <div>
            <LibrarySettings />
          </div>
        )}





        {activeTab === 'fines' && (
          <div>
            <h2 style={{ color: '#1F2937', fontWeight: '700', marginBottom: '25px', fontSize: '24px' }}>Finance Management</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '30px' }}>
              <div style={{ background: '#FFFFFF', padding: '25px', borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
                <div style={{ color: '#6B7280', fontSize: '13px', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Collected</div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#059669' }}>₹{finePayments.filter(f => f.status === 'Paid').reduce((sum, f) => sum + f.amount, 0)}</div>
              </div>
              <div style={{ background: '#FFFFFF', padding: '25px', borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
                <div style={{ color: '#6B7280', fontSize: '13px', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Outstanding Fines</div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#DC2626' }}>₹{finePayments.filter(f => f.status !== 'Paid').reduce((sum, f) => sum + f.amount, 0)}</div>
              </div>
              <div style={{ background: '#FFFFFF', padding: '25px', borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
                <div style={{ color: '#6B7280', fontSize: '13px', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Unpaid Count</div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#111827' }}>{finePayments.filter(f => f.status !== 'Paid').length}</div>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #E5E7EB', paddingBottom: '10px' }}>
              <button
                onClick={() => setFinanceTab('unpaid')}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '8px 8px 0 0',
                  background: financeTab === 'unpaid' ? '#13312A' : 'transparent',
                  color: financeTab === 'unpaid' ? '#FFFFFF' : '#6B7280',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Unpaid ({finePayments.filter(f => f.status === 'Pending').length})
              </button>
              <button
                onClick={() => setFinanceTab('paid')}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '8px 8px 0 0',
                  background: financeTab === 'paid' ? '#13312A' : 'transparent',
                  color: financeTab === 'paid' ? '#FFFFFF' : '#6B7280',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Paid ({finePayments.filter(f => f.status === 'Paid' && f.paymentMethod !== 'Waived').length})
              </button>
              <button
                onClick={() => setFinanceTab('waived')}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '8px 8px 0 0',
                  background: financeTab === 'waived' ? '#13312A' : 'transparent',
                  color: financeTab === 'waived' ? '#FFFFFF' : '#6B7280',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Waived ({finePayments.filter(f => f.paymentMethod === 'Waived').length})
              </button>
              <button
                onClick={() => setFinanceTab('all')}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '8px 8px 0 0',
                  background: financeTab === 'all' ? '#13312A' : 'transparent',
                  color: financeTab === 'all' ? '#FFFFFF' : '#6B7280',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                All ({finePayments.length})
              </button>
            </div>
            
            {finePayments.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#6B7280', padding: '60px', background: '#F9FAFB', borderRadius: '12px' }}>No fines recorded</div>
            ) : (
              <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 2fr 1.2fr 1fr 1fr 1fr',
                  gap: '16px',
                  padding: '16px 20px',
                  background: '#F9FAFB',
                  borderBottom: '1px solid #E5E7EB',
                  fontWeight: '600',
                  fontSize: '13px',
                  color: '#6B7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  <div>User Name</div>
                  <div>Book Title</div>
                  <div>Date</div>
                  <div>Amount</div>
                  <div>Status</div>
                  <div style={{ textAlign: 'right' }}>Actions</div>
                </div>
                {finePayments.filter(f => {
                  if (financeTab === 'unpaid') return f.status === 'Pending';
                  if (financeTab === 'paid') return f.status === 'Paid' && f.paymentMethod !== 'Waived';
                  if (financeTab === 'waived') return f.paymentMethod === 'Waived';
                  return true; // 'all'
                }).slice(0, 20).map((fine, index) => (
                  <div 
                    key={fine.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '2fr 2fr 1.2fr 1fr 1fr 1fr',
                      gap: '16px',
                      padding: '18px 20px',
                      borderBottom: index < Math.min(finePayments.length, 10) - 1 ? '1px solid #F3F4F6' : 'none',
                      alignItems: 'center',
                      transition: 'background 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ fontWeight: '600', color: '#111827', fontSize: '15px' }}>{fine.userName || 'Unknown User'}</div>
                    <div style={{ color: '#6B7280', fontSize: '14px' }}>{fine.bookTitle || 'Unknown Book'}</div>
                    <div style={{ color: '#6B7280', fontSize: '14px' }}>{new Date(fine.createdDate).toLocaleDateString()}</div>
                    <div style={{ color: '#111827', fontWeight: '700', fontSize: '15px' }}>₹{fine.amount}</div>
                    <div>
                      <span style={{
                        background: fine.status === 'Paid' ? '#D1FAE5' : '#FEE2E2',
                        color: fine.status === 'Paid' ? '#059669' : '#DC2626',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {fine.status}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      {fine.status !== 'Paid' && (
                        <button
                          style={{
                            background: '#FFFFFF',
                            color: '#10B981',
                            border: '1px solid #10B981',
                            padding: '6px 14px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: '500',
                            transition: 'all 0.2s ease'
                          }}
                          onClick={() => {
                            setSelectedFine(fine);
                            setShowWaiveModal(true);
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#10B981';
                            e.currentTarget.style.color = '#FFFFFF';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#FFFFFF';
                            e.currentTarget.style.color = '#10B981';
                          }}
                        >
                          Waive
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div>
            <h2 style={{ color: '#1F2937', fontWeight: '700', marginBottom: '30px', fontSize: '24px' }}>Admin Profile</h2>
            
            <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '40px', maxWidth: '800px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h3 style={{ color: '#111827', fontSize: '18px', fontWeight: '600', margin: 0 }}>Profile Information</h3>
              {!isEditingProfile ? (
                <button
                  onClick={() => {
                    setIsEditingProfile(true);
                    setProfileData({ name: user?.name || '', email: user?.email || '' });
                  }}
                  style={{
                    background: '#13312A',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                >
                  Edit Profile
                </button>
              ) : (
                <div style={{ display: 'flex', gap: '10px' }}>
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
                      background: '#10B981',
                      color: '#FFFFFF',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditingProfile(false)}
                    style={{
                      background: '#EF4444',
                      color: '#111827',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px', alignItems: 'start' }}>
              {/* Profile Avatar Section */}
              <div style={{ 
                background: 'linear-gradient(135deg, #F6E9CA 0%, rgba(246, 233, 202, 0.8) 100%)', 
                borderRadius: '20px', 
                border: '2px solid rgba(198, 154, 114, 0.3)',
                padding: '40px 20px',
                textAlign: 'center',
                boxShadow: '0 8px 25px rgba(19, 49, 42, 0.1)'
              }}>
                <div style={{ 
                  width: '120px', 
                  height: '120px', 
                  borderRadius: '50%', 
                  background: 'linear-gradient(135deg, #13312A 0%, #155446 100%)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  margin: '0 auto 20px',
                  boxShadow: '0 8px 20px rgba(19, 49, 42, 0.3)'
                }}>
                  <span style={{ fontSize: '3rem', color: '#FFFFFF' }}>👤</span>
                </div>
                <h4 style={{ color: '#111827', fontWeight: '600', marginBottom: '8px' }}>{isEditingProfile ? profileData.name : user?.name || 'Admin User'}</h4>
                <div style={{ 
                  background: '#13312A', 
                  color: '#FFFFFF', 
                  padding: '6px 16px', 
                  borderRadius: '20px', 
                  fontSize: '14px', 
                  fontWeight: '600',
                  display: 'inline-block'
                }}>
                  {user?.role || 'Library Admin'}
                </div>
              </div>

              {/* Profile Details Section */}
              <div style={{ background: '#FFFFFF', borderRadius: '20px', border: '2px solid rgba(198, 154, 114, 0.3)', overflow: 'hidden', boxShadow: '0 8px 25px rgba(19, 49, 42, 0.1)' }}>
                <div style={{ background: 'linear-gradient(90deg, #13312A 0%, #155446 100%)', color: '#FFFFFF', padding: '20px', fontWeight: '600', fontSize: '18px' }}>
                  Profile Information
                </div>
                <div style={{ padding: '30px' }}>
                  <div style={{ display: 'grid', gap: '25px' }}>
                    <div style={{ 
                      background: '#FFFFFF', 
                      padding: '20px', 
                      borderRadius: '15px', 
                      border: '1px solid rgba(198, 154, 114, 0.3)'
                    }}>
                      <div style={{ color: '#9CA3AF', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>FULL NAME</div>
                      {isEditingProfile ? (
                        <input
                          type="text"
                          value={profileData.name}
                          onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                          style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid #E5E7EB',
                            borderRadius: '8px',
                            fontSize: '16px',
                            background: '#fff'
                          }}
                        />
                      ) : (
                        <div style={{ color: '#111827', fontSize: '18px', fontWeight: '600' }}>{user?.name || 'Not Available'}</div>
                      )}
                    </div>
                    
                    <div style={{ 
                      background: '#FFFFFF', 
                      padding: '20px', 
                      borderRadius: '15px', 
                      border: '1px solid rgba(198, 154, 114, 0.3)'
                    }}>
                      <div style={{ color: '#9CA3AF', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>EMAIL ADDRESS</div>
                      {isEditingProfile ? (
                        <input
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                          style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid #E5E7EB',
                            borderRadius: '8px',
                            fontSize: '16px',
                            background: '#fff'
                          }}
                        />
                      ) : (
                        <div style={{ color: '#111827', fontSize: '18px', fontWeight: '600' }}>{user?.email || 'Not Available'}</div>
                      )}
                    </div>
                    
                    <div style={{ 
                      background: '#FFFFFF', 
                      padding: '20px', 
                      borderRadius: '15px', 
                      border: '1px solid rgba(198, 154, 114, 0.3)'
                    }}>
                      <div style={{ color: '#9CA3AF', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>ROLE & PERMISSIONS</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ color: '#111827', fontSize: '18px', fontWeight: '600' }}>{user?.role || 'Library Admin'}</div>
                        <div style={{ 
                          background: '#10B981', 
                          color: '#FFFFFF', 
                          padding: '4px 12px', 
                          borderRadius: '12px', 
                          fontSize: '12px', 
                          fontWeight: '600'
                        }}>
                          Full Access
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ 
                      background: '#FFFFFF', 
                      padding: '20px', 
                      borderRadius: '15px', 
                      border: '1px solid rgba(198, 154, 114, 0.3)'
                    }}>
                      <div style={{ color: '#9CA3AF', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>ACCOUNT STATUS</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ 
                          width: '12px', 
                          height: '12px', 
                          borderRadius: '50%', 
                          background: '#10B981'
                        }}></div>
                        <div style={{ color: '#111827', fontSize: '18px', fontWeight: '600' }}>Active</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}
      </div>

      {/* Modal Forms */}
      {showAddBook && (
        <BookForm
          open={showAddBook}
          categories={categories}
          onSubmit={handleAddBook}
          onCancel={() => setShowAddBook(false)}
          uploadBookCover={undefined}
        />
      )}

      {editingBook && (
        <BookForm
          open={!!editingBook}
          book={editingBook as any}
          categories={categories}
          onSubmit={handleEditBook}
          onCancel={() => setEditingBook(null)}
          uploadBookCover={undefined}
        />
      )}

      {showInviteForm && (
        <InviteLibrarianForm
          open={showInviteForm}
          onSubmit={handleInviteLibrarian}
          onCancel={() => setShowInviteForm(false)}
        />
      )}

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

      {/* Waive Fine Modal */}
      {showWaiveModal && selectedFine && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', maxWidth: '500px', width: '90%', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
            <h3 style={{ margin: '0 0 1.5rem 0', color: '#111827', fontSize: '1.25rem', fontWeight: '600' }}>Waive Fine</h3>
            
            <div style={{ background: '#F9FAFB', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #E5E7EB' }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong style={{ color: '#374151', fontSize: '0.875rem' }}>User:</strong>
                <div style={{ color: '#6B7280' }}>{selectedFine.userName}</div>
              </div>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong style={{ color: '#374151', fontSize: '0.875rem' }}>Book:</strong>
                <div style={{ color: '#6B7280' }}>{selectedFine.bookTitle}</div>
              </div>
              <div>
                <strong style={{ color: '#374151', fontSize: '0.875rem' }}>Amount:</strong>
                <div style={{ color: '#EF4444', fontWeight: '600' }}>₹{selectedFine.amount?.toFixed(2)}</div>
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontSize: '0.875rem', fontWeight: '600' }}>Waiver Reason *</label>
              <select
                value={waiverReason}
                onChange={(e) => setWaiverReason(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '0.875rem' }}
              >
                <option value="">Select reason...</option>
                <option value="Administrative Decision">Administrative Decision</option>
                <option value="First Time Offender">First Time Offender</option>
                <option value="System Error">System Error</option>
                <option value="Library Closure">Library Closure</option>
                <option value="Medical Emergency">Medical Emergency</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontSize: '0.875rem', fontWeight: '600' }}>Notes</label>
              <textarea
                value={waiverNotes}
                onChange={(e) => setWaiverNotes(e.target.value)}
                placeholder="Add waiver notes..."
                rows={3}
                style={{ width: '100%', padding: '0.75rem', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '0.875rem', resize: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowWaiveModal(false);
                  setWaiverReason('');
                  setWaiverNotes('');
                  setSelectedFine(null);
                }}
                disabled={isWaiving}
                style={{ padding: '0.625rem 1.25rem', border: '1px solid #D1D5DB', borderRadius: '6px', background: 'white', color: '#374151', fontSize: '0.875rem', fontWeight: '600', cursor: isWaiving ? 'not-allowed' : 'pointer', opacity: isWaiving ? 0.6 : 1 }}
              >
                Cancel
              </button>
              <button
                onClick={handleWaiveFine}
                disabled={!waiverReason || isWaiving}
                style={{ padding: '0.625rem 1.25rem', border: 'none', borderRadius: '6px', background: !waiverReason || isWaiving ? '#9CA3AF' : '#EF4444', color: 'white', fontSize: '0.875rem', fontWeight: '600', cursor: !waiverReason || isWaiving ? 'not-allowed' : 'pointer' }}
              >
                {isWaiving ? 'Waiving...' : 'Waive Fine'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StyledLibraryAdminDashboard;



