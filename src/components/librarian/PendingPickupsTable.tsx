import React from 'react';

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

interface PendingPickupsTableProps {
  requests: BookRequest[];
  onCompletePickup: (requestId: string) => void;
  loading: boolean;
}

const PendingPickupsTable: React.FC<PendingPickupsTableProps> = ({ requests, onCompletePickup, loading }) => {
  const getPickupDaysRemaining = (deadline: string) => {
    const days = Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  if (requests.length === 0) {
    return (
      <div style={{
        background: 'white',
        borderRadius: '12px',
        border: '1px solid #ddd',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        padding: '60px 40px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>📚</div>
        <h4 style={{
          color: '#2c3e50',
          fontWeight: '600',
          marginBottom: '10px'
        }}>No Pending Pickups</h4>
        <p style={{
          color: '#7f8c8d',
          margin: '0',
          fontSize: '14px'
        }}>All requested books have been picked up or expired</p>
      </div>
    );
  }

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      border: '1px solid #ddd',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      overflow: 'hidden'
    }}>
      <div style={{
        background: '#f8f9fa',
        padding: '20px',
        borderBottom: '1px solid #ddd'
      }}>
        <h5 style={{
          color: '#2c3e50',
          fontWeight: '600',
          margin: '0 0 5px 0'
        }}>📋 Books Ready for Pickup</h5>
        <p style={{
          color: '#7f8c8d',
          margin: '0',
          fontSize: '14px'
        }}>Complete pickup process for requested books</p>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse'
        }}>
          <thead>
            <tr style={{ background: '#f8f9fa' }}>
              <th style={{
                color: '#2c3e50',
                fontWeight: '600',
                fontSize: '14px',
                padding: '15px 20px',
                textAlign: 'left',
                borderBottom: '1px solid #ddd'
              }}>Student</th>
              <th style={{
                color: '#2c3e50',
                fontWeight: '600',
                fontSize: '14px',
                padding: '15px 20px',
                textAlign: 'left',
                borderBottom: '1px solid #ddd'
              }}>Book</th>
              <th style={{
                color: '#2c3e50',
                fontWeight: '600',
                fontSize: '14px',
                padding: '15px 20px',
                textAlign: 'left',
                borderBottom: '1px solid #ddd'
              }}>Request Date</th>
              <th style={{
                color: '#2c3e50',
                fontWeight: '600',
                fontSize: '14px',
                padding: '15px 20px',
                textAlign: 'left',
                borderBottom: '1px solid #ddd'
              }}>Pickup Deadline</th>
              <th style={{
                color: '#2c3e50',
                fontWeight: '600',
                fontSize: '14px',
                padding: '15px 20px',
                textAlign: 'left',
                borderBottom: '1px solid #ddd'
              }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request, index) => (
              <tr key={request.id} style={{
                background: index % 2 === 0 ? 'white' : '#f5f5f5',
                borderBottom: index < requests.length - 1 ? '1px solid #eee' : 'none'
              }}>
                <td style={{ padding: '15px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      background: '#3498db',
                      color: 'white',
                      borderRadius: '50%',
                      width: '40px',
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px'
                    }}>
                      👤
                    </div>
                    <div>
                      <div style={{
                        color: '#2c3e50',
                        fontWeight: '600',
                        fontSize: '14px',
                        marginBottom: '2px'
                      }}>{request.studentName}</div>
                      <small style={{
                        color: '#7f8c8d',
                        fontSize: '12px'
                      }}>{request.studentEmail}</small>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '15px 20px' }}>
                  <div>
                    <div style={{
                      color: '#2c3e50',
                      fontWeight: '600',
                      fontSize: '14px',
                      marginBottom: '2px'
                    }}>{request.bookTitle}</div>
                    <small style={{
                      color: '#7f8c8d',
                      fontSize: '12px'
                    }}>by {request.bookAuthor}</small>
                  </div>
                </td>
                <td style={{ padding: '15px 20px' }}>
                  <div style={{
                    color: '#2c3e50',
                    fontSize: '14px'
                  }}>{new Date(request.requestDate).toLocaleDateString()}</div>
                </td>
                <td style={{ padding: '15px 20px' }}>
                  {request.pickupDeadline && (
                    <div>
                      <div style={{
                        color: '#2c3e50',
                        fontSize: '14px',
                        marginBottom: '2px'
                      }}>{new Date(request.pickupDeadline).toLocaleDateString()}</div>
                      <span style={{
                        background: getPickupDaysRemaining(request.pickupDeadline) <= 0 ? '#ffebee' : '#fff3cd',
                        color: getPickupDaysRemaining(request.pickupDeadline) <= 0 ? '#c62828' : '#f57c00',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {getPickupDaysRemaining(request.pickupDeadline) <= 0 
                          ? 'Expired!' 
                          : `${getPickupDaysRemaining(request.pickupDeadline)} days left`
                        }
                      </span>
                    </div>
                  )}
                </td>
                <td style={{ padding: '15px 20px' }}>
                  <button 
                    onClick={() => onCompletePickup(request.id)}
                    disabled={loading}
                    style={{
                      background: loading ? '#95a5a6' : '#27ae60',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    📚 Complete Pickup
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PendingPickupsTable;