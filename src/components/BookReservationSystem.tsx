import React, { useState } from 'react';
import { useLibrarianDashboardContext } from '../context/LibrarianDashboardContext';

interface BookReservation {
  id: string;
  userId: string;
  userName?: string;
  UserName?: string;
  userEmail?: string;
  UserEmail?: string;
  bookId: string;
  bookTitle?: string;
  BookTitle?: string;
  bookAuthor?: string;
  BookAuthor?: string;
  bookISBN?: string;
  BookISBN?: string;
  reservedDate: string;
  ReservedDate?: string;
  notifiedDate?: string;
  pickupDeadline?: string;
  pickupDate?: string;
  priority: number;
  status: 'Pending' | 'Available' | 'Completed' | 'Expired' | 'Cancelled';
  librarianNotes?: string;
  isCompleted: boolean;
  isCancelled: boolean;
  createdDate: string;
  CreatedDate?: string;
}

const BookReservationSystem: React.FC = () => {
  const { bookReservations, notifyReservationAvailable, completeReservationPickup, cancelReservation } = useLibrarianDashboardContext();
  const [selectedReservation, setSelectedReservation] = useState<BookReservation | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'available' | 'completed'>('pending');
  const [showDialog, setShowDialog] = useState<{show: boolean, message: string, type: 'success' | 'error'}>({show: false, message: '', type: 'success'});

  // Helper to get property value (handles both camelCase and PascalCase)
  const getProp = (obj: any, camelKey: string, pascalKey: string) => obj?.[camelKey] || obj?.[pascalKey] || null;

  const handleNotifyAvailable = async (reservationId: string) => {
    setLoading(true);
    try {
      const result = notifyReservationAvailable(reservationId, notes);
      setShowDialog({show: true, message: result.message, type: 'success'});
      setNotes('');
      setSelectedReservation(null);
    } catch (error: any) {
      setShowDialog({show: true, message: 'Error notifying user', type: 'error'});
    } finally {
      setLoading(false);
    }
  };

  const handleCompletePickup = async (reservationId: string) => {
    setLoading(true);
    try {
      const result = completeReservationPickup(reservationId);
      setShowDialog({show: true, message: result.message, type: 'success'});
    } catch (error: any) {
      setShowDialog({show: true, message: 'Error completing pickup', type: 'error'});
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = async (reservationId: string) => {
    if (!notes.trim()) {
      setShowDialog({show: true, message: 'Please provide a reason for cancellation', type: 'error'});
      return;
    }
    
    setLoading(true);
    try {
      const result = cancelReservation(reservationId, notes);
      setShowDialog({show: true, message: result.message, type: 'success'});
      setNotes('');
      setSelectedReservation(null);
    } catch (error: any) {
      setShowDialog({show: true, message: 'Error cancelling reservation', type: 'error'});
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    const statusMap: {[key: string]: {badge: string, text: string}} = {
      'Pending': { badge: 'bg-warning', text: 'Waiting for book' },
      'Available': { badge: 'bg-info', text: 'Ready for pickup' },
      'Completed': { badge: 'bg-success', text: 'Book issued' },
      'Expired': { badge: 'bg-secondary', text: 'Pickup expired' },
      'Cancelled': { badge: 'bg-danger', text: 'Cancelled' }
    };
    return statusMap[status] || { badge: 'bg-secondary', text: 'Unknown' };
  };

  const getDaysWaiting = (reservedDate: string) => {
    return Math.ceil((new Date().getTime() - new Date(reservedDate).getTime()) / (1000 * 60 * 60 * 24));
  };

  const getFilteredReservations = () => {
    switch (activeTab) {
      case 'pending':
        return bookReservations.filter(r => r.status === 'Pending');
      case 'available':
        return bookReservations.filter(r => r.status === 'Available');
      case 'completed':
        return bookReservations.filter(r => r.status === 'Completed' || r.status === 'Expired' || r.status === 'Cancelled');
      default:
        return bookReservations;
    }
  };

  const filteredReservations = getFilteredReservations();

  return (
    <div style={{ background: 'white', minHeight: '100vh', padding: '2rem' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <div style={{ background: 'white', borderBottom: '2px solid #e5e7eb', padding: '1.5rem 2rem' }}>
            <h4 style={{ color: '#000000', fontSize: '1.5rem', fontWeight: '700', margin: '0 0 1.5rem 0' }}>
              Book Reservations Management
            </h4>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <button 
                onClick={() => setActiveTab('pending')}
                style={{
                  background: activeTab === 'pending' ? '#2563eb' : 'white',
                  color: activeTab === 'pending' ? 'white' : '#000000',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '0.75rem 1.5rem',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Pending
                {bookReservations.filter(r => r.status === 'Pending').length > 0 && (
                  <span style={{ marginLeft: '0.5rem', background: activeTab === 'pending' ? 'white' : '#fef3c7', color: activeTab === 'pending' ? '#2563eb' : '#92400e', padding: '0.25rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '700' }}>
                    {bookReservations.filter(r => r.status === 'Pending').length}
                  </span>
                )}
              </button>
              <button 
                onClick={() => setActiveTab('available')}
                style={{
                  background: activeTab === 'available' ? '#10b981' : 'white',
                  color: activeTab === 'available' ? 'white' : '#000000',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '0.75rem 1.5rem',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Available
                {bookReservations.filter(r => r.status === 'Available').length > 0 && (
                  <span style={{ marginLeft: '0.5rem', background: activeTab === 'available' ? 'white' : '#d1fae5', color: activeTab === 'available' ? '#10b981' : '#065f46', padding: '0.25rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '700' }}>
                    {bookReservations.filter(r => r.status === 'Available').length}
                  </span>
                )}
              </button>
              <button 
                onClick={() => setActiveTab('completed')}
                style={{
                  background: activeTab === 'completed' ? '#6b7280' : 'white',
                  color: activeTab === 'completed' ? 'white' : '#000000',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '0.75rem 1.5rem',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Completed
              </button>
              <div style={{ marginLeft: 'auto', background: '#f9fafb', padding: '0.75rem 1.5rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <span style={{ color: '#6b7280', fontSize: '0.85rem', fontWeight: '600' }}>Total: </span>
                <span style={{ color: '#000000', fontSize: '0.9rem', fontWeight: '700' }}>{bookReservations.length}</span>
              </div>
            </div>
          </div>
      
          <div style={{ padding: '2rem' }}>
            <div style={{ background: 'white', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                <thead>
                  <tr style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)', borderBottom: '2px solid #e5e7eb' }}>
                    <th style={{ padding: '1rem 1.25rem', textAlign: 'left', color: '#000000', fontSize: '0.85rem', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Member</th>
                    <th style={{ padding: '1rem 1.25rem', textAlign: 'left', color: '#000000', fontSize: '0.85rem', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Book</th>
                    <th style={{ padding: '1rem 1.25rem', textAlign: 'left', color: '#000000', fontSize: '0.85rem', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Reserved Date</th>
                    <th style={{ padding: '1rem 1.25rem', textAlign: 'left', color: '#000000', fontSize: '0.85rem', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Status</th>
                    <th style={{ padding: '1rem 1.25rem', textAlign: 'right', color: '#000000', fontSize: '0.85rem', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReservations.map((reservation) => (
                    <tr key={reservation.id} style={{ background: 'white', borderBottom: '1px solid #f3f4f6', transition: 'all 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'} onMouseLeave={(e) => e.currentTarget.style.background = 'white'}>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#000000', marginBottom: '0.25rem' }}>{getProp(reservation, 'userName', 'UserName') || 'N/A'}</div>
                        <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{getProp(reservation, 'userEmail', 'UserEmail') || 'N/A'}</div>
                      </td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#000000', marginBottom: '0.25rem' }}>{getProp(reservation, 'bookTitle', 'BookTitle') || 'N/A'}</div>
                        <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>by {getProp(reservation, 'bookAuthor', 'BookAuthor') || 'N/A'}</div>
                        <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.15rem' }}>ISBN: {getProp(reservation, 'bookISBN', 'BookISBN') || 'N/A'}</div>
                      </td>
                      <td style={{ padding: '1rem 1.25rem', fontSize: '0.85rem', color: '#000000' }}>{getProp(reservation, 'reservedDate', 'ReservedDate') ? new Date(getProp(reservation, 'reservedDate', 'ReservedDate')).toLocaleDateString() : (getProp(reservation, 'createdDate', 'CreatedDate') ? new Date(getProp(reservation, 'createdDate', 'CreatedDate')).toLocaleDateString() : 'N/A')}</td>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        {reservation.status === 'Pending' && (
                          <>
                            <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#d97706', marginBottom: '0.15rem' }}>Pending</div>
                            <div style={{ fontSize: '0.75rem', color: '#b45309' }}>Waiting for book</div>
                          </>
                        )}
                        {reservation.status === 'Available' && (
                          <>
                            <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#059669', marginBottom: '0.15rem' }}>Available</div>
                            <div style={{ fontSize: '0.75rem', color: '#047857' }}>Ready for pickup</div>
                          </>
                        )}
                        {reservation.status === 'Completed' && (
                          <>
                            <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#2563eb', marginBottom: '0.15rem' }}>Completed</div>
                            <div style={{ fontSize: '0.75rem', color: '#1d4ed8' }}>Book issued</div>
                          </>
                        )}
                        {reservation.status === 'Expired' && (
                          <>
                            <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#4b5563', marginBottom: '0.15rem' }}>Expired</div>
                            <div style={{ fontSize: '0.75rem', color: '#374151' }}>Pickup expired</div>
                          </>
                        )}
                        {reservation.status === 'Cancelled' && (
                          <>
                            <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#dc2626', marginBottom: '0.15rem' }}>Cancelled</div>
                            <div style={{ fontSize: '0.75rem', color: '#b91c1c' }}>Cancelled</div>
                          </>
                        )}
                      </td>
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          {reservation.status === 'Pending' && (
                            <button 
                              onClick={() => setSelectedReservation(reservation)}
                              style={{
                                background: '#2563eb',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '0.5rem 1rem',
                                fontSize: '0.8rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                            >
                              Notify Available
                            </button>
                          )}
                          
                          {reservation.status === 'Available' && (
                            <button 
                              onClick={() => handleCompletePickup(reservation.id)}
                              disabled={loading}
                              style={{
                                background: '#10b981',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '0.5rem 1rem',
                                fontSize: '0.8rem',
                                fontWeight: '600',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                opacity: loading ? 0.6 : 1,
                                transition: 'all 0.2s'
                              }}
                            >
                              Complete Pickup
                            </button>
                          )}
                          
                          {(reservation.status === 'Pending' || reservation.status === 'Available') && (
                            <button 
                              onClick={() => setSelectedReservation(reservation)}
                              style={{
                                background: 'white',
                                color: '#ef4444',
                                border: '1px solid #ef4444',
                                borderRadius: '6px',
                                padding: '0.5rem 1rem',
                                fontSize: '0.8rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                            >
                              Cancel
                            </button>
                          )}
                          
                          {reservation.status === 'Completed' && (
                            <span style={{ background: '#d1fae5', color: '#065f46', padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600' }}>Completed</span>
                          )}
                          
                          {(reservation.status === 'Expired' || reservation.status === 'Cancelled') && (
                            <span style={{ background: '#f3f4f6', color: '#6b7280', padding: '0.35rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600' }}>Closed</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredReservations.length === 0 && (
              <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', marginTop: '1rem' }}>
                <h5 style={{ color: '#000000', fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>No {activeTab} reservations found</h5>
                <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: 0 }}>
                  {activeTab === 'pending' && 'No reservations are currently waiting for books'}
                  {activeTab === 'available' && 'No books are ready for pickup'}
                  {activeTab === 'completed' && 'No completed reservations to display'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reservation Action Modal */}
      {selectedReservation && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog" style={{ maxWidth: '600px' }}>
            <div className="modal-content" style={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
              <div className="modal-header" style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '1.5rem' }}>
                <h5 style={{ color: '#000000', fontSize: '1.2rem', fontWeight: '700', margin: 0 }}>
                  {selectedReservation.status === 'Pending' ? 'Notify Book Available' : 'Cancel Reservation'}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setSelectedReservation(null)}
                ></button>
              </div>
            
              <div className="modal-body" style={{ background: 'white', padding: '1.5rem' }}>
                <div style={{ background: '#f9fafb', borderRadius: '8px', padding: '1rem', border: '1px solid #e5e7eb', marginBottom: '1rem' }}>
                  <h6 style={{ color: '#000000', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.75rem' }}>Book Details</h6>
                  <p style={{ color: '#000000', fontSize: '0.95rem', fontWeight: '600', marginBottom: '0.25rem' }}>{getProp(selectedReservation, 'bookTitle', 'BookTitle')}</p>
                  <p style={{ color: '#6b7280', fontSize: '0.85rem', marginBottom: '0.15rem' }}>by {getProp(selectedReservation, 'bookAuthor', 'BookAuthor')}</p>
                  <p style={{ color: '#9ca3af', fontSize: '0.8rem', margin: 0 }}>ISBN: {getProp(selectedReservation, 'bookISBN', 'BookISBN')}</p>
                </div>
                
                <div style={{ background: '#f9fafb', borderRadius: '8px', padding: '1rem', border: '1px solid #e5e7eb', marginBottom: '1rem' }}>
                  <h6 style={{ color: '#000000', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.75rem' }}>Member Details</h6>
                  <p style={{ color: '#000000', fontSize: '0.95rem', fontWeight: '600', marginBottom: '0.25rem' }}>{getProp(selectedReservation, 'userName', 'UserName')}</p>
                  <p style={{ color: '#6b7280', fontSize: '0.85rem', marginBottom: '0.5rem' }}>{getProp(selectedReservation, 'userEmail', 'UserEmail')}</p>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <span style={{ color: '#6b7280', fontSize: '0.8rem' }}>Priority: <strong style={{ color: '#000000' }}>#{selectedReservation.priority}</strong></span>
                    <span style={{ color: '#6b7280', fontSize: '0.8rem' }}>Waiting: <strong style={{ color: '#000000' }}>{getDaysWaiting(getProp(selectedReservation, 'reservedDate', 'ReservedDate') || getProp(selectedReservation, 'createdDate', 'CreatedDate') || '')} days</strong></span>
                  </div>
                </div>
                
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ color: '#000000', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem', display: 'block' }}>Librarian Notes</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={selectedReservation.status === 'Pending' 
                      ? "Add notes about book availability..." 
                      : "Provide reason for cancellation..."
                    }
                    style={{ border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.9rem' }}
                  />
                </div>
                
                <div style={{ background: '#eff6ff', border: '1px solid #dbeafe', borderRadius: '6px', padding: '0.75rem' }}>
                  <p style={{ color: '#1e40af', fontSize: '0.85rem', margin: 0 }}>
                    {selectedReservation.status === 'Pending' ? (
                      <>
                        <strong>Note:</strong> User will be notified that the book is available for pickup. They will have 3 days to collect the book.
                      </>
                    ) : (
                      <>
                        <strong>Note:</strong> This will cancel the reservation and notify the user. The next person in queue will be moved up.
                      </>
                    )}
                  </p>
                </div>
              </div>
              
              <div className="modal-footer" style={{ background: 'white', borderTop: '1px solid #e5e7eb', padding: '1rem 1.5rem' }}>
                <button 
                  type="button" 
                  onClick={() => setSelectedReservation(null)}
                  style={{ background: 'white', color: '#000000', border: '1px solid #d1d5db', borderRadius: '6px', padding: '0.5rem 1.25rem', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                {selectedReservation.status === 'Pending' ? (
                  <button 
                    type="button" 
                    onClick={() => handleNotifyAvailable(selectedReservation.id)}
                    disabled={loading}
                    style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', padding: '0.5rem 1.25rem', fontSize: '0.9rem', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}
                  >
                    Notify Available
                  </button>
                ) : (
                  <button 
                    type="button" 
                    onClick={() => handleCancelReservation(selectedReservation.id)}
                    disabled={loading || !notes.trim()}
                    style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', padding: '0.5rem 1.25rem', fontSize: '0.9rem', fontWeight: '600', cursor: (loading || !notes.trim()) ? 'not-allowed' : 'pointer', opacity: (loading || !notes.trim()) ? 0.6 : 1 }}
                  >
                    Cancel Reservation
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success/Error Dialog */}
      {showDialog.show && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9999 }}>
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '400px' }}>
            <div className="modal-content" style={{ 
              borderRadius: '12px', 
              border: 'none', 
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              overflow: 'hidden'
            }}>
              <div className="modal-body text-center p-0">
                <div style={{ 
                  background: showDialog.type === 'success' ? '#10b981' : '#ef4444',
                  padding: '2rem',
                  color: 'white'
                }}>
                  <h5 style={{ fontSize: '1.3rem', fontWeight: '700', margin: 0 }}>
                    {showDialog.type === 'success' ? 'Success' : 'Error'}
                  </h5>
                </div>
                
                <div style={{ background: 'white', padding: '2rem' }}>
                  <p style={{ 
                    color: '#000000', 
                    fontWeight: '500', 
                    fontSize: '0.95rem',
                    lineHeight: '1.5',
                    marginBottom: '1.5rem'
                  }}>
                    {showDialog.message}
                  </p>
                  <button 
                    style={{ 
                      background: showDialog.type === 'success' ? '#10b981' : '#ef4444', 
                      color: 'white', 
                      fontWeight: '600', 
                      borderRadius: '6px',
                      border: 'none',
                      padding: '0.65rem 2rem',
                      fontSize: '0.9rem',
                      cursor: 'pointer'
                    }}
                    onClick={() => setShowDialog({show: false, message: '', type: 'success'})}
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

export default BookReservationSystem;