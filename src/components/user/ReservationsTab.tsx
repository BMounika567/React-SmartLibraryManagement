import React from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../store';
import { fetchUserReservations } from '../../store/slices/bookIssuesSlice';
import axiosClient from '../../api/axiosClient';

interface ReservationsTabProps {
  userReservations: any[];
  onShowDialog: (title: string, message: string, type: 'success' | 'error' | 'confirm', onConfirm?: () => void) => void;
  onRefreshReservations: () => void;
}

const ReservationsTab: React.FC<ReservationsTabProps> = ({ 
  userReservations, 
  onShowDialog, 
  onRefreshReservations 
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const handleCancelReservation = async (reservationId: string) => {
    onShowDialog(
      'Confirm Cancellation',
      'Cancel this reservation?',
      'confirm',
      async () => {
        try {
          await axiosClient.delete(`/api/BookReservation/${reservationId}`);
          onShowDialog('Success', 'Reservation cancelled successfully', 'success');
          dispatch(fetchUserReservations());
          onRefreshReservations();
        } catch (error: any) {
          onShowDialog('Error', 'Error cancelling reservation: ' + (error.response?.data?.message || error.message), 'error');
        }
      }
    );
  };

  return (
    <div style={{ padding: '30px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px'
      }}>
        <div>
          <h3 style={{
            color: '#000000',
            fontWeight: '700',
            margin: '0',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <i className="bi bi-bookmark-fill" style={{ color: '#FFD700' }}></i>
            My Reserved Books
          </h3>
          <p style={{
            color: '#000000',
            margin: '5px 0 0 0',
            fontSize: '14px'
          }}>Books you've reserved for future borrowing</p>
        </div>
        <div style={{
          background: '#155446',
          borderRadius: '10px',
          padding: '8px',
          border: '1px solid #C69A72'
        }}>
          <span style={{
            color: '#F6E9CA',
            fontSize: '14px',
            fontWeight: '600',
            padding: '0 8px'
          }}>{userReservations.length} Reserved</span>
        </div>
      </div>
      
      {/* In Queue Section */}
      {userReservations.filter(r => r.status === 'Pending').length > 0 && (
        <div style={{ marginBottom: '25px' }}>
          <h5 style={{
            color: '#C69A72',
            fontWeight: '600',
            marginBottom: '15px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <i className="bi bi-hourglass-split"></i>
            In Queue ({userReservations.filter(r => r.status === 'Pending').length})
          </h5>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {userReservations.filter(r => r.status === 'Pending').map((reservation) => (
              <div key={reservation.id} style={{
                background: '#FFFFFF',
                borderRadius: '12px',
                border: '2px solid #C69A72',
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                transition: 'all 0.3s ease'
              }}>
                <div style={{
                  background: '#13312A',
                  borderRadius: '8px',
                  width: '50px',
                  height: '60px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  color: '#F6E9CA',
                  flexShrink: 0
                }}>
                  <i className="bi bi-hourglass-split"></i>
                </div>
                
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h6 style={{
                    color: '#13312A',
                    fontWeight: '600',
                    fontSize: '16px',
                    marginBottom: '4px'
                  }}>{reservation.bookTitle || reservation.book?.title || 'Unknown Title'}</h6>
                  <p style={{
                    color: '#155446',
                    fontSize: '13px',
                    margin: '0'
                  }}>by {reservation.bookAuthor || reservation.book?.author || 'Unknown Author'}</p>
                </div>
                
                <div style={{ textAlign: 'center', minWidth: '100px' }}>
                  <div style={{
                    color: '#155446',
                    fontSize: '11px',
                    fontWeight: '600',
                    marginBottom: '2px'
                  }}>RESERVED</div>
                  <div style={{
                    color: '#13312A',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>{reservation.reservationDate || reservation.createdDate ? new Date(reservation.reservationDate || reservation.createdDate).toLocaleDateString() : 'N/A'}</div>
                </div>
                
                <div style={{
                  display: 'flex',
                  gap: '6px',
                  flexShrink: 0
                }}>
                  <button 
                    onClick={() => handleCancelReservation(reservation.id)}
                    style={{
                      background: 'transparent',
                      color: '#C69A72',
                      border: '1px solid #C69A72',
                      borderRadius: '6px',
                      padding: '6px 10px',
                      fontSize: '11px',
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}
                  >
                    <i className="bi bi-x-circle"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Available Section */}
      {userReservations.filter(r => r.status === 'Available').length > 0 && (
        <div style={{ marginBottom: '25px' }}>
          <h5 style={{
            color: '#155446',
            fontWeight: '600',
            marginBottom: '15px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <i className="bi bi-check-circle"></i>
            Ready for Pickup ({userReservations.filter(r => r.status === 'Available').length})
          </h5>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {userReservations.filter(r => r.status === 'Available').map((reservation) => (
              <div key={reservation.id} style={{
                background: '#FFFFFF',
                borderRadius: '12px',
                border: '2px solid #155446',
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                transition: 'all 0.3s ease'
              }}>
                <div style={{
                  background: '#155446',
                  borderRadius: '8px',
                  width: '50px',
                  height: '60px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  color: '#F6E9CA',
                  flexShrink: 0
                }}>
                  <i className="bi bi-check-circle"></i>
                </div>
                
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h6 style={{
                    color: '#13312A',
                    fontWeight: '600',
                    fontSize: '16px',
                    marginBottom: '4px'
                  }}>{reservation.bookTitle || reservation.book?.title || 'Unknown Title'}</h6>
                  <p style={{
                    color: '#155446',
                    fontSize: '13px',
                    margin: '0'
                  }}>by {reservation.bookAuthor || reservation.book?.author || 'Unknown Author'}</p>
                </div>
                
                <div style={{ textAlign: 'center', minWidth: '100px' }}>
                  <div style={{
                    color: '#155446',
                    fontSize: '11px',
                    fontWeight: '600',
                    marginBottom: '2px'
                  }}>RESERVED</div>
                  <div style={{
                    color: '#13312A',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>{reservation.reservationDate || reservation.createdDate ? new Date(reservation.reservationDate || reservation.createdDate).toLocaleDateString() : 'N/A'}</div>
                </div>
                
                <div style={{
                  display: 'flex',
                  gap: '6px',
                  flexShrink: 0
                }}>
                  <button 
                    onClick={() => handleCancelReservation(reservation.id)}
                    style={{
                      background: 'transparent',
                      color: '#C69A72',
                      border: '1px solid #C69A72',
                      borderRadius: '6px',
                      padding: '6px 10px',
                      fontSize: '11px',
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}
                  >
                    <i className="bi bi-x-circle"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {userReservations.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '80px 20px',
          background: '#155446',
          borderRadius: '20px',
          border: '1px solid #C69A72'
        }}>
          <div style={{
            fontSize: '4rem',
            marginBottom: '20px',
            color: '#C69A72'
          }}>
            <i className="bi bi-bookmark"></i>
          </div>
          <h5 style={{
            color: '#F6E9CA',
            fontWeight: '600',
            marginBottom: '10px'
          }}>No reserved books</h5>
          <p style={{
            color: '#C69A72',
            fontSize: '14px'
          }}>Reserve books when they're unavailable to get notified when they become available</p>
        </div>
      )}
    </div>
  );
};

export default ReservationsTab;