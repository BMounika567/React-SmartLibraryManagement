import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import axiosClient from '../../api/axiosClient';

interface MyBooksTabProps {
  borrowedBooks: any[];
  books: any[];
  categories: any[];
  pendingRequests: any[];
  onShowDialog: (title: string, message: string, type: 'success' | 'error' | 'confirm', onConfirm?: () => void) => void;
  onRefreshData: () => void;
}

const MyBooksTab: React.FC<MyBooksTabProps> = ({ 
  borrowedBooks,
  pendingRequests: propsPendingRequests,
  onShowDialog, 
  onRefreshData 
}) => {
  const { user } = useAuth();
  const [bookFilter, setBookFilter] = useState<'all' | 'pending' | 'active' | 'overdue' | 'returned'>('all');
  const [requestingReturn, setRequestingReturn] = useState(false);
  const [renewingBook, setRenewingBook] = useState(false);
  const [pendingRequests] = useState<any[]>(propsPendingRequests || []);


  const handleRequestReturn = async (bookIssueId: string) => {
    onShowDialog(
      'Confirm Return Request',
      'Request return for this book?',
      'confirm',
      async () => {
        setRequestingReturn(true);
        try {
          await axiosClient.post('/api/BookReturnRequest', {
            bookIssueId: bookIssueId
          });
          
          onShowDialog('Success', 'Return request submitted successfully!', 'success');
          onRefreshData();
        } catch (error: any) {
          onShowDialog('Error', 'Error requesting return: ' + (error.response?.data?.message || error.message), 'error');
        } finally {
          setRequestingReturn(false);
        }
      }
    );
  };

  const handleRenewBook = async (bookIssueId: string) => {
    onShowDialog(
      'Confirm Renewal',
      'Renew this book for additional 14 days?',
      'confirm',
      async () => {
        setRenewingBook(true);
        try {
          const currentIssue = borrowedBooks.find(b => b.id === bookIssueId);
          if (!currentIssue) throw new Error('Book issue not found');
          
          const newDueDate = new Date(currentIssue.dueDate);
          newDueDate.setDate(newDueDate.getDate() + 14);
          
          await axiosClient.put(`/api/BookIssue/${bookIssueId}`, {
            id: bookIssueId,
            dueDate: newDueDate.toISOString()
          });
          
          onShowDialog('Success', 'Book renewed successfully!', 'success');
          onRefreshData();
        } catch (error: any) {
          onShowDialog('Error', 'Error renewing book: ' + (error.response?.data?.message || error.message), 'error');
        } finally {
          setRenewingBook(false);
        }
      }
    );
  };

  const filteredBooks = borrowedBooks.filter(book => {
    if (bookFilter === 'all') return true;
    if (bookFilter === 'pending') return false; // Pending requests shown separately
    if (bookFilter === 'active') return !book.returnDate && new Date(book.dueDate) >= new Date();
    if (bookFilter === 'overdue') return !book.returnDate && new Date(book.dueDate) < new Date();
    if (bookFilter === 'returned') return !!book.returnDate;
    return true;
  });
  
  const filteredRequests = bookFilter === 'pending' ? pendingRequests : [];
  const displayItems = bookFilter === 'pending' ? filteredRequests : filteredBooks;

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
            <i className="bi bi-book-half" style={{ color: '#FFD700' }}></i>
            My Borrowed Books
          </h3>
          <p style={{
            color: '#000000',
            margin: '5px 0 0 0',
            fontSize: '14px'
          }}>Manage your currently borrowed books</p>
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
          }}>{filteredBooks.length} Books</span>
        </div>
      </div>
      

      
      {/* Filter Buttons */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '25px',
        flexWrap: 'wrap'
      }}>
        {[
          { key: 'all', label: 'All Books', icon: 'bi bi-collection' },
          { key: 'pending', label: 'Pending', icon: 'bi bi-clock-history' },
          { key: 'active', label: 'Active', icon: 'bi bi-check-circle' },
          { key: 'overdue', label: 'Overdue', icon: 'bi bi-exclamation-triangle' },
          { key: 'returned', label: 'Returned', icon: 'bi bi-arrow-return-left' }
        ].map(filter => {
          const count = filter.key === 'all' ? borrowedBooks.length :
                       filter.key === 'pending' ? pendingRequests.length :
                       filter.key === 'active' ? borrowedBooks.filter(b => !b.returnDate && new Date(b.dueDate) >= new Date()).length :
                       filter.key === 'overdue' ? borrowedBooks.filter(b => !b.returnDate && new Date(b.dueDate) < new Date()).length :
                       borrowedBooks.filter(b => !!b.returnDate).length;
          
          return (
            <button
              key={filter.key}
              onClick={() => setBookFilter(filter.key as any)}
              style={{
                background: bookFilter === filter.key ? '#C69A72' : 'transparent',
                color: bookFilter === filter.key ? '#13312A' : '#000000',
                border: '1px solid #C69A72',
                borderRadius: '10px',
                padding: '8px 16px',
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <i className={filter.icon}></i>
              {filter.label}
              <span style={{
                background: bookFilter === filter.key ? '#13312A' : '#155446',
                color: '#F6E9CA',
                padding: '2px 6px',
                borderRadius: '8px',
                fontSize: '11px',
                marginLeft: '4px'
              }}>{count}</span>
            </button>
          );
        })}
      </div>
    
      {displayItems.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {displayItems.map((book) => {
            // Handle pending requests differently
            if (bookFilter === 'pending') {
              return (
                <div key={book.id} style={{
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
                    <i className="bi bi-clock-history"></i>
                  </div>
                  
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h6 style={{
                      color: '#13312A',
                      fontWeight: '600',
                      fontSize: '16px',
                      marginBottom: '4px'
                    }}>{book.bookTitle}</h6>
                    <p style={{
                      color: '#155446',
                      fontSize: '13px',
                      margin: '0'
                    }}>Request submitted on {new Date(book.requestDate).toLocaleDateString()}</p>
                  </div>
                  
                  <div style={{ textAlign: 'center', minWidth: '80px' }}>
                    <span style={{
                      background: '#13312A',
                      color: '#F6E9CA',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '10px',
                      fontWeight: '600',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <i className="bi bi-clock-history"></i>
                      Pending Approval
                    </span>
                  </div>
                </div>
              );
            }
            
            // Handle regular book issues
            const isOverdue = new Date(book.dueDate) < new Date() && book.status !== 'Returned';
            const daysUntilDue = Math.ceil((new Date(book.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            
            return (
              <div key={book.id} style={{
                background: '#FFFFFF',
                borderRadius: '12px',
                border: `2px solid ${isOverdue ? '#C69A72' : '#C69A72'}`,
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
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
                  <i className="bi bi-book"></i>
                </div>
                
                <div style={{ flex: '1 1 250px', minWidth: '150px' }}>
                  <h6 style={{
                    color: '#13312A',
                    fontWeight: '600',
                    fontSize: '16px',
                    marginBottom: '4px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>{book.bookTitle}</h6>
                  <p style={{
                    color: '#155446',
                    fontSize: '13px',
                    margin: '0',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>by {book.bookAuthor}</p>
                </div>
                
                {book.status !== 'Pending' && (
                  <div style={{ textAlign: 'center', width: '120px', flexShrink: 0 }}>
                    <div style={{
                      color: '#155446',
                      fontSize: '11px',
                      fontWeight: '600',
                      marginBottom: '4px'
                    }}>DUE DATE</div>
                    <div style={{
                      color: isOverdue ? '#C69A72' : '#13312A',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {book.dueDate ? new Date(book.dueDate).toLocaleDateString() : 'N/A'}
                      {isOverdue && (
                        <div style={{
                          color: '#C69A72',
                          fontSize: '10px',
                          fontWeight: '500',
                          marginTop: '2px'
                        }}>Overdue {Math.abs(daysUntilDue)}d</div>
                      )}
                    </div>
                  </div>
                )}
                
                <div style={{ textAlign: 'center', width: '110px', flexShrink: 0 }}>
                  <span style={{
                    background: book.status === 'Pending' ? '#C69A72' :
                               book.status === 'Issued' ? '#13312A' :
                               book.status === 'Overdue' ? '#C69A72' :
                               book.status === 'Return Requested' ? '#155446' : '#13312A',
                    color: '#F6E9CA',
                    padding: '6px 10px',
                    borderRadius: '12px',
                    fontSize: '10px',
                    fontWeight: '600',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    whiteSpace: 'nowrap'
                  }}>
                    {book.status === 'Pending' && <i className="bi bi-clock-history"></i>}
                    {book.status === 'Issued' && <i className="bi bi-check-circle"></i>}
                    {book.status === 'Overdue' && <i className="bi bi-exclamation-triangle"></i>}
                    {book.status === 'Return Requested' && <i className="bi bi-arrow-return-left"></i>}
                    {book.status === 'Pending' ? 'Awaiting Approval' : book.status}
                  </span>
                </div>
                
                <div style={{
                  display: 'flex',
                  gap: '6px',
                  width: '70px',
                  flexShrink: 0,
                  justifyContent: 'flex-end'
                }}>
                  {book.status === 'Issued' && (
                    <>
                      <button 
                        onClick={() => handleRenewBook(book.id)}
                        disabled={renewingBook}
                        style={{
                          background: '#13312A',
                          color: '#F6E9CA',
                          border: '1px solid #C69A72',
                          borderRadius: '6px',
                          padding: '6px 10px',
                          fontSize: '11px',
                          cursor: renewingBook ? 'not-allowed' : 'pointer',
                          transition: 'all 0.3s ease',
                          fontWeight: '600'
                        }}
                      >
                        <i className="bi bi-arrow-clockwise"></i>
                      </button>
                      <button 
                        onClick={() => handleRequestReturn(book.id)}
                        disabled={requestingReturn}
                        style={{
                          background: 'transparent',
                          color: '#C69A72',
                          border: '1px solid #C69A72',
                          borderRadius: '6px',
                          padding: '6px 10px',
                          fontSize: '11px',
                          cursor: requestingReturn ? 'not-allowed' : 'pointer',
                          transition: 'all 0.3s ease',
                          fontWeight: '600'
                        }}
                      >
                        <i className="bi bi-box-arrow-up"></i>
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
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
            <i className="bi bi-book-half"></i>
          </div>
          <h5 style={{
            color: '#F6E9CA',
            fontWeight: '600',
            marginBottom: '10px'
          }}>No books borrowed yet</h5>
          <p style={{
            color: '#C69A72',
            fontSize: '14px'
          }}>Start exploring our collection and borrow your first book!</p>
        </div>
      )}
    </div>
  );
};

export default MyBooksTab;