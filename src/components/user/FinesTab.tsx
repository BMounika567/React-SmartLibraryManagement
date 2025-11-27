import React from 'react';

interface FinesTabProps {
  userStats: any;
  borrowedBooks: any[];
  paymentHistory: any[];
  onShowDialog: (title: string, message: string, type: 'success' | 'error' | 'confirm', onConfirm?: () => void) => void;
  onRefreshPayments: () => void;
}

const FinesTab: React.FC<FinesTabProps> = ({ userStats, paymentHistory }) => {
  const allPayments = userStats?.recentPayments || userStats?.RecentPayments || paymentHistory || [];
  const overdueBooks = userStats?.overdueBooks || userStats?.OverdueBooks || [];
  const paidPayments = allPayments.filter((p: any) => p.status === 'Paid' || p.Status === 'Paid');

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
            <i className="bi bi-currency-dollar" style={{ color: '#FFD700' }}></i>
            Fines & Payments
          </h3>
          <p style={{
            color: '#000000',
            margin: '5px 0 0 0',
            fontSize: '14px'
          }}>Manage your library fines and payment history</p>
        </div>
        <div style={{
          background: userStats?.hasOutstandingFines ? '#C69A72' : '#155446',
          borderRadius: '15px',
          padding: '15px 20px',
          border: '1px solid #C69A72',
          textAlign: 'center'
        }}>
          <div style={{
            color: '#F6E9CA',
            fontSize: '24px',
            fontWeight: '700',
            marginBottom: '5px'
          }}>₹{userStats?.totalFines?.toFixed(2) || '0.00'}</div>
          <div style={{
            color: '#F6E9CA',
            fontSize: '12px',
            fontWeight: '600'
          }}>Total Outstanding</div>
        </div>
      </div>
      
      {/* Outstanding Fines Section */}
      {overdueBooks.length > 0 ? (
        <div style={{
          background: '#155446',
          borderRadius: '15px',
          border: '1px solid #C69A72',
          marginBottom: '25px',
          overflow: 'hidden'
        }}>
          <div style={{
            background: '#C69A72',
            padding: '15px 20px',
            borderBottom: '1px solid #155446'
          }}>
            <h5 style={{
              color: '#13312A',
              fontWeight: '600',
              margin: '0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <i className="bi bi-exclamation-triangle"></i>
              Outstanding Fines ({overdueBooks.length} books)
            </h5>
          </div>
          <div style={{ padding: '0' }}>
            {overdueBooks.map((book: any, index: number) => {
              
              return (
                <div key={book.bookIssueId} style={{
                  background: index % 2 === 0 ? '#F6E9CA' : 'rgba(246, 233, 202, 0.8)',
                  padding: '15px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  borderBottom: index < overdueBooks.length - 1 ? '1px solid rgba(21, 84, 70, 0.2)' : 'none'
                }}>
                  <div style={{ flex: 1 }}>
                    <h6 style={{
                      color: '#13312A',
                      fontWeight: '600',
                      margin: '0 0 5px 0'
                    }}>{book.bookTitle}</h6>
                    <p style={{
                      color: '#155446',
                      fontSize: '12px',
                      margin: '0'
                    }}>Due: {new Date(book.dueDate).toLocaleDateString()}</p>
                  </div>
                  <div style={{ textAlign: 'center', minWidth: '80px' }}>
                    <span style={{
                      background: '#C69A72',
                      color: '#F6E9CA',
                      padding: '4px 8px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: '600'
                    }}>{book.overdueDays} days</span>
                  </div>
                  <div style={{ textAlign: 'center', minWidth: '80px' }}>
                    <div style={{
                      color: '#C69A72',
                      fontSize: '16px',
                      fontWeight: '700'
                    }}>₹{book.fineAmount.toFixed(2)}</div>
                  </div>
                  <div style={{ textAlign: 'center', minWidth: '100px' }}>
                    <span style={{
                      background: '#155446',
                      color: '#F6E9CA',
                      padding: '4px 8px',
                      borderRadius: '8px',
                      fontSize: '10px',
                      fontWeight: '600'
                    }}>Pending Return</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div style={{
          background: '#FFFFFF',
          borderRadius: '15px',
          border: '2px solid #C69A72',
          padding: '30px',
          marginBottom: '25px',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '3rem',
            color: '#FFD700',
            marginBottom: '15px'
          }}>
            <i className="bi bi-check-circle"></i>
          </div>
          <h5 style={{
            color: '#000000',
            fontWeight: '700',
            marginBottom: '8px'
          }}>No Outstanding Fines</h5>
          <p style={{
            color: '#000000',
            margin: '0',
            fontSize: '14px'
          }}>You're all caught up with your payments!</p>
        </div>
      )}
      
      {/* Payment History Section */}
      <div style={{
        background: '#155446',
        borderRadius: '15px',
        border: '1px solid #C69A72',
        overflow: 'hidden'
      }}>
        <div style={{
          background: 'rgba(198, 154, 114, 0.2)',
          padding: '15px 20px',
          borderBottom: '1px solid rgba(198, 154, 114, 0.3)'
        }}>
          <h5 style={{
            color: '#F6E9CA',
            fontWeight: '600',
            margin: '0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <i className="bi bi-clock-history"></i>
            Recent Payment History
          </h5>
        </div>
        <div style={{ padding: '20px' }}>
          {paidPayments?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {paidPayments.map((payment: any, index: number) => (
                <div key={payment.id || `payment-${index}`} style={{
                  background: '#FFFFFF',
                  borderRadius: '12px',
                  border: '2px solid #C69A72',
                  padding: '15px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px'
                }}>
                  <div style={{
                    background: '#13312A',
                    borderRadius: '8px',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    color: '#F6E9CA',
                    flexShrink: 0
                  }}>
                    <i className="bi bi-receipt"></i>
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <h6 style={{
                      color: '#13312A',
                      fontWeight: '600',
                      margin: '0 0 5px 0'
                    }}>{new Date(payment.paymentDate).toLocaleDateString()}</h6>
                    {payment.bookTitle && (
                      <p style={{
                        color: '#155446',
                        fontSize: '12px',
                        margin: '0'
                      }}>{payment.bookTitle}</p>
                    )}
                  </div>
                  
                  <div style={{ textAlign: 'center', minWidth: '80px' }}>
                    <div style={{
                      color: '#155446',
                      fontSize: '16px',
                      fontWeight: '700'
                    }}>₹{payment.amount.toFixed(2)}</div>
                  </div>
                  
                  <div style={{ textAlign: 'center', minWidth: '80px' }}>
                    <span style={{
                      background: '#155446',
                      color: '#F6E9CA',
                      padding: '4px 8px',
                      borderRadius: '8px',
                      fontSize: '10px',
                      fontWeight: '600'
                    }}>{payment.paymentMethod}</span>
                  </div>
                  
                  <div style={{ textAlign: 'center', minWidth: '100px' }}>
                    <div style={{
                      color: '#155446',
                      fontSize: '10px',
                      fontFamily: 'monospace',
                      marginBottom: '5px'
                    }}>{payment.transactionId || payment.TransactionId || (payment.paymentMethod === 'Waived' ? 'Waived' : 'N/A')}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              background: '#FFFFFF',
              borderRadius: '12px',
              border: '2px solid #C69A72'
            }}>
              <div style={{
                fontSize: '3rem',
                color: '#FFD700',
                marginBottom: '15px'
              }}>
                <i className="bi bi-receipt"></i>
              </div>
              <h6 style={{
                color: '#000000',
                fontWeight: '700',
                marginBottom: '8px'
              }}>No payment history</h6>
              <p style={{
                color: '#000000',
                margin: '0',
                fontSize: '14px'
              }}>Your payment transactions will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinesTab;