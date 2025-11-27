import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import Dialog from '../common/Dialog';
import DirectIssueForm from './DirectIssueForm';
import PendingPickupsTable from './PendingPickupsTable';
import ActiveIssuesTable from './ActiveIssuesTable';
import OverdueIssuesTable from './OverdueIssuesTable';

interface BookCopy {
  id: string;
  copyNumber: number;
  barcode: string;
  qrCode: string;
  status: 'Available' | 'Issued' | 'Reserved' | 'Lost' | 'Maintenance';
  condition: string;
  book?: {
    id: string;
    title: string;
    author: string;
    isbn: string;
  };
}

interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  studentId?: string;
}

interface BookIssue {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  bookCopyId: string;
  bookTitle: string;
  bookAuthor: string;
  copyNumber: number;
  issueDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'Active' | 'Returned' | 'Overdue';
  fineAmount?: number;
}

interface BookRequest {
  id: string;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  userId: string;
  studentName: string;
  studentEmail: string;
  requestDate: string;
  status: 'Pending' | 'PendingPickup' | 'Issued' | 'Rejected' | 'Expired';
  pickupDeadline?: string;
}

const IssueTab: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'direct' | 'requests' | 'active' | 'overdue'>('direct');
  const [users, setUsers] = useState<User[]>([]);
  const [pendingRequests, setPendingRequests] = useState<BookRequest[]>([]);
  const [activeIssues, setActiveIssues] = useState<BookIssue[]>([]);
  const [overdueIssues, setOverdueIssues] = useState<BookIssue[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialog, setDialog] = useState<{isOpen: boolean, title: string, message: string, type: 'success' | 'error' | 'info', showConfirm?: boolean, onConfirm?: () => void}>({isOpen: false, title: '', message: '', type: 'info'});

  useEffect(() => {
    fetchUsers();
    fetchPendingRequests();
    fetchActiveIssues();
    fetchOverdueIssues();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axiosClient.get('/api/UserManagement');
      setUsers(response.data.data || []);
    } catch (error) {
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const response = await axiosClient.get('/api/BookRequest');
      const requests = response.data.data || [];
      setPendingRequests(requests.filter((req: BookRequest) => req.status === 'PendingPickup'));
    } catch (error) {
    }
  };

  const fetchActiveIssues = async () => {
    try {
      const response = await axiosClient.get('/api/BookIssue/active');
      setActiveIssues(response.data.data || []);
    } catch (error) {
    }
  };

  const fetchOverdueIssues = async () => {
    try {
      const response = await axiosClient.get('/api/BookIssue/overdue');
      setOverdueIssues(response.data.data || []);
    } catch (error) {
    }
  };

  const handleCompletePickup = async (requestId: string) => {
    setLoading(true);
    try {
      await axiosClient.post(`/api/BookRequest/${requestId}/pickup-complete`);
      setDialog({
        isOpen: true,
        title: 'Success',
        message: 'Book issued successfully from request!',
        type: 'success'
      });
      fetchPendingRequests();
      fetchActiveIssues();
    } catch (error: any) {
      setDialog({
        isOpen: true,
        title: 'Error',
        message: 'Error completing pickup: ' + (error.response?.data?.message || error.message),
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    fetchActiveIssues();
    fetchPendingRequests();
    fetchOverdueIssues();
  };

  return (
    <div style={{ padding: '0' }}>
      {/* Header Section - STYLED VERSION */}
      <div style={{
        background: '#13312A',
        borderRadius: '12px',
        border: '1px solid #155446',
        padding: '25px',
        marginBottom: '25px',
        boxShadow: '0 4px 12px rgba(19, 49, 42, 0.2)'
      }}>
        <h3 style={{
          color: '#F6E9CA',
          fontWeight: '600',
          margin: '0 0 8px 0',
          fontSize: '1.5rem'
        }}>Book Issue Management</h3>
        <p style={{
          color: '#C69A72',
          margin: '0',
          fontSize: '14px'
        }}>Issue books to members and manage book circulation</p>
      </div>

      {/* Tab Navigation */}
      <div style={{ marginBottom: '25px' }}>
        <div style={{
          background: '#13312A',
          borderRadius: '12px',
          border: '1px solid #155446',
          padding: '8px',
          display: 'flex',
          gap: '4px'
        }}>
          <button
            onClick={() => setActiveTab('direct')}
            style={{
              background: activeTab === 'direct' ? '#C69A72' : 'transparent',
              color: activeTab === 'direct' ? '#13312A' : '#F6E9CA',
              border: 'none',
              padding: '12px 20px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            Direct Issue
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            style={{
              background: activeTab === 'requests' ? '#C69A72' : 'transparent',
              color: activeTab === 'requests' ? '#13312A' : '#F6E9CA',
              border: 'none',
              padding: '12px 20px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            Pending Pickups
            {pendingRequests.length > 0 && (
              <span style={{
                background: '#e74c3c',
                color: 'white',
                borderRadius: '10px',
                padding: '2px 6px',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                {pendingRequests.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('active')}
            style={{
              background: activeTab === 'active' ? '#C69A72' : 'transparent',
              color: activeTab === 'active' ? '#13312A' : '#F6E9CA',
              border: 'none',
              padding: '12px 20px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            Active Issues
            {activeIssues.length > 0 && (
              <span style={{
                background: '#27ae60',
                color: 'white',
                borderRadius: '10px',
                padding: '2px 6px',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                {activeIssues.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('overdue')}
            style={{
              background: activeTab === 'overdue' ? '#C69A72' : 'transparent',
              color: activeTab === 'overdue' ? '#13312A' : '#F6E9CA',
              border: 'none',
              padding: '12px 20px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            Overdue
            {overdueIssues.length > 0 && (
              <span style={{
                background: '#e74c3c',
                color: 'white',
                borderRadius: '10px',
                padding: '2px 6px',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                {overdueIssues.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'direct' && (
        <DirectIssueForm 
          users={users} 
          onSuccess={refreshData}
          setDialog={setDialog}
        />
      )}

      {activeTab === 'requests' && (
        <PendingPickupsTable 
          requests={pendingRequests}
          onCompletePickup={handleCompletePickup}
          loading={loading}
        />
      )}

      {activeTab === 'active' && (
        <ActiveIssuesTable issues={activeIssues} />
      )}

      {activeTab === 'overdue' && (
        <OverdueIssuesTable issues={overdueIssues} />
      )}

      <Dialog
        isOpen={dialog.isOpen}
        onClose={() => setDialog({...dialog, isOpen: false})}
        title={dialog.title}
        message={dialog.message}
        type={dialog.type}
        showConfirm={dialog.showConfirm}
        onConfirm={dialog.onConfirm}
      />
    </div>
  );
};

export default IssueTab;