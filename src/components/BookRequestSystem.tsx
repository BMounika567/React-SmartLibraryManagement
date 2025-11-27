import React, { useState } from 'react';
import { useLibrarianDashboardContext } from '../context/LibrarianDashboardContext';

interface BookRequest {
  id: string;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  userId: string;
  studentName: string;
  studentEmail: string;
  requestDate: string;
  approvalDate?: string;
  pickupDeadline?: string;
  status: number | string;
  librarianNotes?: string;
  bookAvailable?: boolean;
}



const BookRequestSystem: React.FC = () => {
  const { bookRequests, books, approveBookRequest, rejectBookRequest, completePickup } = useLibrarianDashboardContext();
  
  const [selectedCard, setSelectedCard] = useState<'issue' | 'return' | null>(null);
  const [issueSubTab, setIssueSubTab] = useState<'pending' | 'approved' | 'pickup'>('pending');
  const [selectedRequest, setSelectedRequest] = useState<BookRequest | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState<{show: boolean, message: string, type: 'success' | 'error'}>({show: false, message: '', type: 'success'});
  
  // Use bookRequests from context and add book availability from books data
  const issueRequests = bookRequests.map(request => {
    const book = books.find(b => (b.id || b.Id) === (request.bookId || request.BookId));
    return {
      ...request,
      bookId: request.bookId || request.BookId,
      bookAvailable: book ? (book.availableCopies || book.AvailableCopies) > 0 : false
    };
  });

  const handleApproveRequest = async (requestId: string) => {
    if (loading) return;
    
    setLoading(true);
    try {
      await approveBookRequest(requestId);
      setShowSuccessDialog({show: true, message: 'Request approved! Student has 2 days to pickup the book.', type: 'success'});
      setNotes('');
      setSelectedRequest(null);
    } catch (error: any) {
      setShowSuccessDialog({show: true, message: 'Error approving request', type: 'error'});
    } finally {
      setLoading(false);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    if (!notes.trim()) {
      setShowSuccessDialog({show: true, message: 'Please provide a reason for rejection', type: 'error'});
      return;
    }
    
    setLoading(true);
    try {
      await rejectBookRequest(requestId, notes);
      setShowSuccessDialog({show: true, message: 'Request rejected. Student will be notified.', type: 'success'});
      setNotes('');
      setSelectedRequest(null);
    } catch (error: any) {
      setShowSuccessDialog({show: true, message: 'Error rejecting request', type: 'error'});
    } finally {
      setLoading(false);
    }
  };

  const handleCompletePickup = async (requestId: string) => {
    if (loading) return; // Prevent double clicks
    
    setLoading(true);
    try {
      await completePickup(requestId);
      setShowSuccessDialog({show: true, message: 'Book issued successfully! Issue date starts from today.', type: 'success'});
    } catch (error: any) {
      setShowSuccessDialog({show: true, message: 'Error completing pickup', type: 'error'});
    } finally {
      setLoading(false);
    }
  };



  const getDaysRemaining = (deadline: string) => {
    const days = Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };



  if (!selectedCard) {
    setSelectedCard('issue');
    return null;
  }

  return (
    <div style={{ background: 'white', minHeight: '100vh', padding: '20px' }}>

      <div className="container-fluid">
        {selectedCard === 'issue' && (
          <div className="card border-0 shadow-sm">
            <div className="card-header border-0" style={{ background: 'white', padding: '0.5rem 1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h6 className="fw-semibold mb-0" style={{ color: '#333333', fontSize: '1rem' }}>
                  Issue Requests
                </h6>
                <ul className="nav nav-pills mb-0" style={{ display: 'flex', gap: '0.5rem' }}>
                  <li className="nav-item">
                    <button 
                      className={`nav-link ${issueSubTab === 'pending' ? 'active' : ''}`}
                      onClick={() => setIssueSubTab('pending')}
                      style={{
                        background: issueSubTab === 'pending' ? '#333333' : '#f3f4f6',
                        color: issueSubTab === 'pending' ? '#ffffff' : '#333333',
                        border: 'none',
                        fontWeight: '600',
                        fontSize: '0.8rem',
                        padding: '0.4rem 0.9rem'
                      }}
                    >
                      Pending Review
                      {issueRequests.filter(r => (r.status === 0 || r.status === '0' || r.status === 'Pending')).length > 0 && (
                        <span style={{ marginLeft: '0.5rem', background: '#fbbf24', color: '#000', padding: '0.1rem 0.4rem', borderRadius: '10px', fontSize: '0.7rem', fontWeight: '700' }}>
                          {issueRequests.filter(r => (r.status === 0 || r.status === '0' || r.status === 'Pending')).length}
                        </span>
                      )}
                    </button>
                  </li>
                  <li className="nav-item">
                    <button 
                      className={`nav-link ${issueSubTab === 'pickup' ? 'active' : ''}`}
                      onClick={() => setIssueSubTab('pickup')}
                      style={{
                        background: issueSubTab === 'pickup' ? '#333333' : '#f3f4f6',
                        color: issueSubTab === 'pickup' ? '#ffffff' : '#333333',
                        border: 'none',
                        fontWeight: '600',
                        fontSize: '0.8rem',
                        padding: '0.4rem 0.9rem'
                      }}
                    >
                      Waiting for Pickup
                      {issueRequests.filter(r => r.status === 2 || r.status === '2' || r.status === 'PendingPickup' || r.status === 1 || r.status === '1' || r.status === 'Approved').length > 0 && (
                        <span style={{ marginLeft: '0.5rem', background: '#3b82f6', color: '#fff', padding: '0.1rem 0.4rem', borderRadius: '10px', fontSize: '0.7rem', fontWeight: '700' }}>
                          {issueRequests.filter(r => r.status === 2 || r.status === '2' || r.status === 'PendingPickup' || r.status === 1 || r.status === '1' || r.status === 'Approved').length}
                        </span>
                      )}
                    </button>
                  </li>
                  <li className="nav-item">
                    <button 
                      className={`nav-link ${issueSubTab === 'approved' ? 'active' : ''}`}
                      onClick={() => setIssueSubTab('approved')}
                      style={{
                        background: issueSubTab === 'approved' ? '#333333' : '#f3f4f6',
                        color: issueSubTab === 'approved' ? '#ffffff' : '#333333',
                        border: 'none',
                        fontWeight: '600',
                        fontSize: '0.8rem',
                        padding: '0.4rem 0.9rem'
                      }}
                    >
                      Recent Activity
                    </button>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="card-body p-4">
              {issueSubTab === 'pending' && (
                <div style={{ background: 'white', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                  <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                    <thead>
                      <tr style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)', borderBottom: '2px solid #e5e7eb' }}>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#000000', fontSize: '0.85rem', fontWeight: '700', letterSpacing: '0.3px', textTransform: 'uppercase' }}>Student</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#000000', fontSize: '0.85rem', fontWeight: '700', letterSpacing: '0.3px', textTransform: 'uppercase' }}>Book</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#000000', fontSize: '0.85rem', fontWeight: '700', letterSpacing: '0.3px', textTransform: 'uppercase' }}>Request Date</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'center', color: '#000000', fontSize: '0.85rem', fontWeight: '700', letterSpacing: '0.3px', textTransform: 'uppercase' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {issueRequests.filter(r => (r.status === 0 || r.status === '0' || r.status === 'Pending')).sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime()).map((request) => (
                        <tr key={request.id} style={{ background: 'white', borderBottom: '1px solid #f3f4f6', transition: 'all 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'} onMouseLeave={(e) => e.currentTarget.style.background = 'white'}>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#333333', marginBottom: '0.25rem' }}>{request.studentName}</div>
                            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{request.studentEmail}</div>
                          </td>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#333333', marginBottom: '0.25rem' }}>{request.bookTitle}</div>
                            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>by {request.bookAuthor}</div>
                          </td>
                          <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', color: '#333333' }}>{new Date(request.requestDate).toLocaleDateString()}</td>
                          <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                            <button 
                              style={{ background: '#333333', color: 'white', border: 'none', padding: '0.5rem 1.2rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
                              onClick={() => setSelectedRequest(request)}
                              disabled={loading}
                              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                              Review
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {issueRequests.filter(r => (r.status === 0 || r.status === '0' || r.status === 'Pending')).length === 0 && (
                    <div className="text-center py-4" style={{ background: 'white', borderRadius: '8px' }}>
                      <p className="mb-0" style={{ color: '#6b7280' }}>No requests pending review</p>
                    </div>
                  )}
                </div>
              )}

              {issueSubTab === 'pickup' && (
                <div style={{ background: 'white', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                  <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                    <thead>
                      <tr style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)', borderBottom: '2px solid #e5e7eb' }}>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#000000', fontSize: '0.85rem', fontWeight: '700', letterSpacing: '0.3px', textTransform: 'uppercase' }}>Student</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#000000', fontSize: '0.85rem', fontWeight: '700', letterSpacing: '0.3px', textTransform: 'uppercase' }}>Book</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#000000', fontSize: '0.85rem', fontWeight: '700', letterSpacing: '0.3px', textTransform: 'uppercase' }}>Pickup Deadline</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'center', color: '#000000', fontSize: '0.85rem', fontWeight: '700', letterSpacing: '0.3px', textTransform: 'uppercase' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {issueRequests.filter(r => r.status === 2 || r.status === '2' || r.status === 'PendingPickup' || r.status === 1 || r.status === '1' || r.status === 'Approved').sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime()).map((request) => (
                        <tr key={request.id} style={{ background: 'white', borderBottom: '1px solid #f3f4f6', transition: 'all 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'} onMouseLeave={(e) => e.currentTarget.style.background = 'white'}>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#333333', marginBottom: '0.25rem' }}>{request.studentName}</div>
                            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{request.studentEmail}</div>
                          </td>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#333333', marginBottom: '0.25rem' }}>{request.bookTitle}</div>
                            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>by {request.bookAuthor}</div>
                          </td>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            {request.pickupDeadline && (
                              <>
                                <div style={{ fontSize: '0.85rem', color: '#333333', marginBottom: '0.25rem' }}>{new Date(request.pickupDeadline).toLocaleDateString()}</div>
                                <div style={{ fontSize: '0.75rem', color: getDaysRemaining(request.pickupDeadline) <= 0 ? '#dc2626' : '#f59e0b', fontWeight: '600' }}>
                                  {getDaysRemaining(request.pickupDeadline) <= 0 ? ' Expired!' : `${getDaysRemaining(request.pickupDeadline)} days left`}
                                </div>
                              </>
                            )}
                          </td>
                          <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                            <button 
                              style={{ background: '#333333', color: 'white', border: 'none', padding: '0.5rem 1.2rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
                              onClick={() => handleCompletePickup(request.id)}
                              disabled={loading}
                              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                              Complete Pickup
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {issueRequests.filter(r => r.status === 2 || r.status === '2' || r.status === 'PendingPickup' || r.status === 1 || r.status === '1' || r.status === 'Approved').length === 0 && (
                    <div className="text-center py-4" style={{ background: 'white', borderRadius: '8px' }}>
                      <p className="mb-0" style={{ color: '#6b7280' }}>No books waiting for pickup</p>
                    </div>
                  )}
                </div>
              )}

              {issueSubTab === 'approved' && (
                <div style={{ background: 'white', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                  <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                    <thead>
                      <tr style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)', borderBottom: '2px solid #e5e7eb' }}>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#000000', fontSize: '0.85rem', fontWeight: '700', letterSpacing: '0.3px', textTransform: 'uppercase' }}>Student</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#000000', fontSize: '0.85rem', fontWeight: '700', letterSpacing: '0.3px', textTransform: 'uppercase' }}>Book</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#000000', fontSize: '0.85rem', fontWeight: '700', letterSpacing: '0.3px', textTransform: 'uppercase' }}>Request Date</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'center', color: '#000000', fontSize: '0.85rem', fontWeight: '700', letterSpacing: '0.3px', textTransform: 'uppercase' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {issueRequests.filter(r => r.status === 3 || r.status === '3' || r.status === 'Issued' || r.status === 4 || r.status === '4' || r.status === 'Rejected' || r.status === 5 || r.status === '5' || r.status === 'Expired').sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime()).slice(0, 12).map((request) => (
                        <tr key={request.id} style={{ background: 'white', borderBottom: '1px solid #f3f4f6', transition: 'all 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'} onMouseLeave={(e) => e.currentTarget.style.background = 'white'}>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#333333', marginBottom: '0.25rem' }}>{request.studentName}</div>
                            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{request.studentEmail}</div>
                          </td>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#333333', marginBottom: '0.25rem' }}>{request.bookTitle}</div>
                            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>by {request.bookAuthor}</div>
                          </td>
                          <td style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', color: '#333333' }}>{new Date(request.requestDate).toLocaleDateString()}</td>
                          <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                            {(request.status === 3 || request.status === '3' || request.status === 'Issued') && (
                              <span style={{ background: '#10b981', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '600' }}>✓ Issued</span>
                            )}
                            {(request.status === 4 || request.status === '4' || request.status === 'Rejected') && (
                              <span style={{ background: '#ef4444', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '600' }}>✕ Rejected</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {issueRequests.filter(r => r.status === 3 || r.status === '3' || r.status === 'Issued' || r.status === 4 || r.status === '4' || r.status === 'Rejected' || r.status === 5 || r.status === '5' || r.status === 'Expired').length === 0 && (
                    <div className="text-center py-4" style={{ background: 'white', borderRadius: '8px' }}>
                      <p className="mb-0" style={{ color: '#6b7280' }}>No recent activity</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}


      </div>

      {/* Request Review Modal */}
      {selectedRequest && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl" style={{ maxWidth: '1000px' }}>
            <div className="modal-content" style={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
              <div className="modal-header" style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '1.25rem' }}>
                <h5 className="modal-title fw-semibold" style={{ color: '#000000', fontSize: '1.1rem' }}>
                  Review Book Request
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setSelectedRequest(null)}
                ></button>
              </div>
              
              <div className="modal-body p-4" style={{ background: 'white' }}>
                <div className="row g-3">
                  <div className="col-md-4">
                    <div style={{ background: '#f9fafb', borderRadius: '8px', padding: '1rem', border: '1px solid #e5e7eb' }}>
                      <h6 className="fw-semibold mb-2" style={{ color: '#000000', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Book Details
                      </h6>
                      <p className="mb-1" style={{ color: '#000000', fontSize: '0.95rem', fontWeight: '600' }}>{selectedRequest.bookTitle}</p>
                      <p className="mb-0" style={{ fontSize: '0.85rem', color: '#6b7280' }}>by {selectedRequest.bookAuthor}</p>
                    </div>
                  </div>
                  
                  <div className="col-md-4">
                    <div style={{ background: '#f9fafb', borderRadius: '8px', padding: '1rem', border: '1px solid #e5e7eb' }}>
                      <h6 className="fw-semibold mb-2" style={{ color: '#000000', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Student Details
                      </h6>
                      <p className="mb-1" style={{ color: '#000000', fontSize: '0.95rem', fontWeight: '600' }}>{selectedRequest.studentName}</p>
                      <p className="mb-0" style={{ fontSize: '0.85rem', color: '#6b7280' }}>{selectedRequest.studentEmail}</p>
                    </div>
                  </div>
                  
                  <div className="col-md-4">
                    <div style={{ background: '#f9fafb', borderRadius: '8px', padding: '1rem', border: '1px solid #e5e7eb' }}>
                      <h6 className="fw-semibold mb-2" style={{ color: '#000000', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Request Date
                      </h6>
                      <p className="mb-0" style={{ color: '#000000', fontSize: '0.95rem', fontWeight: '600' }}>
                        {new Date(selectedRequest.requestDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="row mt-3">
                  <div className="col-md-12">
                    <label className="form-label fw-semibold mb-2" style={{ color: '#000000', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Librarian Notes
                    </label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add notes for approval/rejection..."
                      style={{ border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.9rem' }}
                    />
                    <small style={{ color: '#6b7280', fontSize: '0.8rem', marginTop: '0.5rem', display: 'block' }}>
                      Note: If approved, student will have 2 days to pickup the book.
                    </small>
                  </div>
                </div>
              </div>
              
              <div className="modal-footer" style={{ background: 'white', borderTop: '1px solid #e5e7eb', padding: '1rem 1.25rem' }}>
                <button 
                  type="button" 
                  className="btn" 
                  style={{ background: '#f3f4f6', color: '#000000', border: '1px solid #d1d5db', fontWeight: '600', padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}
                  onClick={() => setSelectedRequest(null)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn me-2"
                  style={{ background: '#ef4444', color: 'white', border: 'none', fontWeight: '600', padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}
                  onClick={() => handleRejectRequest(selectedRequest.id)}
                  disabled={loading}
                >
                  Reject
                </button>
                <button 
                  type="button" 
                  className="btn"
                  style={{ background: '#000000', color: 'white', border: 'none', fontWeight: '600', padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}
                  onClick={() => handleApproveRequest(selectedRequest.id)}
                  disabled={loading}
                >
                  Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      
      {/* Custom Success/Error Dialog */}
      {showSuccessDialog.show && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9999 }}>
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '400px' }}>
            <div className="modal-content" style={{ 
              borderRadius: '16px', 
              border: 'none', 
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              overflow: 'hidden'
            }}>
              <div className="modal-body text-center p-0">
                <div style={{ 
                  background: showSuccessDialog.type === 'success' ? 'linear-gradient(135deg, #28a745, #20c997)' : 'linear-gradient(135deg, #dc3545, #fd7e14)',
                  padding: '30px 20px 20px',
                  color: 'white'
                }}>
                  <div className="mb-3">
                    <i className={`fas ${showSuccessDialog.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'}`} 
                       style={{ fontSize: '4rem', opacity: 0.9 }}></i>
                  </div>
                  <h5 className="fw-bold mb-0" style={{ fontSize: '1.3rem' }}>
                    {showSuccessDialog.type === 'success' ? 'Success!' : 'Error!'}
                  </h5>
                </div>
                
                <div style={{ background: '#F6E9CA', padding: '25px' }}>
                  <p className="mb-4" style={{ 
                    color: '#13312A', 
                    fontWeight: '500', 
                    fontSize: '1rem',
                    lineHeight: '1.5'
                  }}>
                    {showSuccessDialog.message}
                  </p>
                  <button 
                    className="btn px-4 py-2"
                    style={{ 
                      background: '#13312A', 
                      color: '#F6E9CA', 
                      fontWeight: '600', 
                      borderRadius: '25px',
                      border: 'none',
                      minWidth: '100px',
                      fontSize: '1rem',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => (e.target as HTMLElement).style.transform = 'scale(1.05)'}
                    onMouseOut={(e) => (e.target as HTMLElement).style.transform = 'scale(1)'}
                    onClick={() => setShowSuccessDialog({show: false, message: '', type: 'success'})}
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookRequestSystem;