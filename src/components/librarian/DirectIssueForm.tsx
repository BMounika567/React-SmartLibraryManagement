import React, { useState } from 'react';
import axiosClient from '../../api/axiosClient';

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

interface DirectIssueFormProps {
  users: User[];
  onSuccess: () => void;
  setDialog: (dialog: any) => void;
}

const DirectIssueForm: React.FC<DirectIssueFormProps> = ({ users, onSuccess, setDialog }) => {
  const [scannedBook, setScannedBook] = useState<BookCopy | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userSearch, setUserSearch] = useState('');
  const [scanError, setScanError] = useState('');
  const [loading, setLoading] = useState(false);
  const [customDueDate, setCustomDueDate] = useState('');
  const [scannedCode, setScannedCode] = useState('');

  const handleManualSearch = async () => {
    if (scannedCode?.trim()) {
      await handleBarcodeScan(scannedCode.trim());
    }
  };

  const handleBarcodeScan = async (code: string) => {
    setScanError('');
    setScannedBook(null);
    
    try {
      const response = await axiosClient.get(`/api/BookCopy/barcode/${code}`);
      
      if (response.data.data) {
        const bookCopy = response.data.data;
        
        if (bookCopy.bookId && !bookCopy.book?.title) {
          try {
            const bookResponse = await axiosClient.get(`/api/Book/${bookCopy.bookId}`);
            if (bookResponse.data.data) {
              bookCopy.book = bookResponse.data.data;
            }
          } catch (bookError) {
          }
        }
        
        setScannedBook(bookCopy);
      } else {
        setScanError('Book copy not found with this barcode');
      }
    } catch (error: any) {
      setScanError('Error searching for book: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDirectIssue = async () => {
    if (!scannedBook || !selectedUser) {
      setDialog({
        isOpen: true,
        title: 'Missing Information',
        message: 'Please scan a book and select a user',
        type: 'error'
      });
      return;
    }

    if (scannedBook.status !== 'Available' && String(scannedBook.status) !== '0') {
      setDialog({
        isOpen: true,
        title: 'Book Not Available',
        message: 'This book copy is not available for issue',
        type: 'error'
      });
      return;
    }

    setLoading(true);
    try {
      const dueDate = customDueDate 
        ? new Date(customDueDate).toISOString()
        : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
      
      const issueData = {
        userId: selectedUser.id,
        bookCopyId: scannedBook.id,
        dueDate: dueDate
      };

      await axiosClient.post('/api/BookIssue', issueData);
      
      const bookTitle = scannedBook.book?.title || 'Book';
      setDialog({
        isOpen: true,
        title: 'Success',
        message: `Book "${bookTitle}" issued successfully to ${selectedUser.name}!`,
        type: 'success'
      });
      
      // Reset form
      setScannedBook(null);
      setSelectedUser(null);
      setUserSearch('');
      setCustomDueDate('');
      setScannedCode('');
      setScanError('');
      
      onSuccess();
      
      if (window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('bookDataChanged'));
      }
    } catch (error: any) {
      setDialog({
        isOpen: true,
        title: 'Error',
        message: 'Error issuing book: ' + (error.response?.data?.message || error.message),
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const isStudent = !user.email.includes('admin') && 
                     !user.email.includes('librarian') && 
                     !user.email.includes('mailinator.com');
    
    const matchesSearch = user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
                         user.email.toLowerCase().includes(userSearch.toLowerCase()) ||
                         (user.studentId && user.studentId.toLowerCase().includes(userSearch.toLowerCase()));
    
    return isStudent && matchesSearch;
  });

  const getStatusText = (status: string | number) => {
    const statusMap: {[key: string]: string} = {
      '0': 'Available',
      '1': 'Already Issued',
      '2': 'Reserved',
      '3': 'Lost',
      '4': 'Under Maintenance',
      'Available': 'Available',
      'Issued': 'Already Issued',
      'Reserved': 'Reserved',
      'Lost': 'Lost',
      'Maintenance': 'Under Maintenance'
    };
    return statusMap[String(status)] || `Status ${status}`;
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
      gap: '25px'
    }}>
      {/* Book Search Section */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        border: '1px solid #B3CFE5',
        boxShadow: '0 4px 12px rgba(74, 127, 167, 0.1)',
        overflow: 'hidden'
      }}>
        <div style={{
          background: '#4A7FA7',
          padding: '20px',
          borderBottom: '1px solid #B3CFE5'
        }}>
          <h5 style={{
            color: 'white',
            fontWeight: '600',
            margin: '0 0 5px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Find Book
          </h5>
          <p style={{
            color: '#E8F1F8',
            margin: '0',
            fontSize: '14px'
          }}>Enter book barcode to find the book copy</p>
        </div>
        
        <div style={{ padding: '20px' }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              color: '#2c3e50',
              fontWeight: '600',
              fontSize: '14px',
              display: 'block',
              marginBottom: '8px'
            }}>Enter Book Barcode</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="Enter book barcode (e.g., BOOK001)"
                value={scannedCode || ''}
                onChange={(e) => setScannedCode(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleManualSearch()}
                style={{
                  flex: 1,
                  padding: '12px 15px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
              <button 
                onClick={handleManualSearch}
                disabled={!scannedCode?.trim()}
                style={{
                  background: scannedCode?.trim() ? '#4A7FA7' : '#95a5a6',
                  color: 'white',
                  border: 'none',
                  padding: '12px 20px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: scannedCode?.trim() ? 'pointer' : 'not-allowed',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="11" cy="11" r="8" stroke="white" strokeWidth="2"/>
                  <path d="M21 21l-4.35-4.35" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Search
              </button>
            </div>
            <small style={{
              color: '#7f8c8d',
              fontSize: '12px',
              display: 'block',
              marginTop: '5px'
            }}>
              Try: BOOK001, BOOK002, or any book barcode from your database
            </small>
          </div>
          
          {scanError && (
            <div style={{
              background: '#ffebee',
              color: '#c62828',
              padding: '12px 15px',
              borderRadius: '8px',
              fontSize: '14px',
              marginBottom: '15px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              {scanError}
            </div>
          )}

          {scannedBook && (
            <div style={{
              background: scannedBook.status === 'Available' || String(scannedBook.status) === '0' ? '#e8f5e8' : '#fff3cd',
              border: `1px solid ${scannedBook.status === 'Available' || String(scannedBook.status) === '0' ? '#27ae60' : '#f39c12'}`,
              borderRadius: '8px',
              padding: '15px'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{
                  background: '#2c3e50',
                  color: 'white',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px'
                }}>
                  
                </div>
                <div style={{ flex: 1 }}>
                  <h6 style={{
                    color: '#2c3e50',
                    fontWeight: '600',
                    margin: '0 0 5px 0'
                  }}>{scannedBook.book?.title}</h6>
                  <p style={{
                    color: '#7f8c8d',
                    margin: '0 0 8px 0',
                    fontSize: '14px'
                  }}>by {scannedBook.book?.author}</p>
                  <p style={{
                    color: '#2c3e50',
                    margin: '0 0 8px 0',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>Copy #{scannedBook.copyNumber}</p>
                  <span style={{
                    background: scannedBook.status === 'Available' || String(scannedBook.status) === '0' ? '#27ae60' : '#e74c3c',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {getStatusText(scannedBook.status)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Selection Section */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        border: '1px solid #C69A72',
        boxShadow: '0 4px 12px rgba(19, 49, 42, 0.1)',
        overflow: 'hidden'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #13312A 0%, #155446 100%)',
          padding: '20px',
          borderBottom: '1px solid #C69A72'
        }}>
          <h5 style={{
            color: '#F6E9CA',
            fontWeight: '600',
            margin: '0 0 5px 0'
          }}>Select Member</h5>
          <p style={{
            color: '#C69A72',
            margin: '0',
            fontSize: '14px'
          }}>Search and select member to issue the book</p>
        </div>
        
        <div style={{ padding: '20px' }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              color: '#2c3e50',
              fontWeight: '600',
              fontSize: '14px',
              display: 'block',
              marginBottom: '8px'
            }}>Search Member</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Type member name, email, or ID..."
                value={userSearch}
                onChange={(e) => {
                  setUserSearch(e.target.value);
                  setSelectedUser(null);
                }}
                style={{
                  width: '100%',
                  padding: '12px 15px 12px 45px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
              <div style={{
                position: 'absolute',
                left: '15px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#7f8c8d'
              }}>
                
              </div>
              
              {userSearch && filteredUsers.length > 0 && !selectedUser && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  background: 'white',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  zIndex: 1000,
                  marginTop: '4px',
                  maxHeight: '200px',
                  overflowY: 'auto'
                }}>
                  {filteredUsers.slice(0, 5).map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => {
                        setSelectedUser(user);
                        setUserSearch(user.name);
                      }}
                      style={{
                        width: '100%',
                        padding: '12px 15px',
                        border: 'none',
                        background: 'transparent',
                        textAlign: 'left',
                        cursor: 'pointer',
                        borderBottom: '1px solid #f0f0f0'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = '#f8f9fa'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          background: '#3498db',
                          color: 'white',
                          borderRadius: '50%',
                          width: '32px',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '14px'
                        }}>
                          
                        </div>
                        <div>
                          <div style={{
                            color: '#2c3e50',
                            fontWeight: '600',
                            fontSize: '14px'
                          }}>{user.name}</div>
                          <small style={{
                            color: '#7f8c8d',
                            fontSize: '12px'
                          }}>{user.email}</small>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {selectedUser && (
            <div style={{
              background: '#e3f2fd',
              border: '1px solid #2196f3',
              borderRadius: '8px',
              padding: '15px',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  background: '#2196f3',
                  color: 'white',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px'
                }}>
                  ✓
                </div>
                <div>
                  <h6 style={{
                    color: '#2c3e50',
                    fontWeight: '600',
                    margin: '0 0 5px 0'
                  }}>{selectedUser.name}</h6>
                  <small style={{
                    color: '#7f8c8d',
                    fontSize: '12px',
                    display: 'block'
                  }}>{selectedUser.email}</small>
                  {selectedUser.studentId && (
                    <small style={{
                      color: '#7f8c8d',
                      fontSize: '12px'
                    }}>ID: {selectedUser.studentId}</small>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Issue Section */}
          {scannedBook && selectedUser ? (
            (scannedBook.status === 'Available' || String(scannedBook.status) === '0') ? (
              <div style={{
                borderTop: '1px solid #ddd',
                paddingTop: '20px'
              }}>
                <div style={{
                  background: '#e8f5e8',
                  color: '#27ae60',
                  padding: '12px 15px',
                  borderRadius: '8px',
                  marginBottom: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <strong>Ready to Issue!</strong> Book and member selected.
                </div>
                
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    color: '#2c3e50',
                    fontWeight: '600',
                    fontSize: '14px',
                    display: 'block',
                    marginBottom: '8px'
                  }}>Due Date (Optional)</label>
                  <input
                    type="date"
                    value={customDueDate}
                    onChange={(e) => setCustomDueDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 15px',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                  <small style={{
                    color: '#7f8c8d',
                    fontSize: '12px',
                    display: 'block',
                    marginTop: '5px'
                  }}>
                    {customDueDate 
                      ? `Due: ${new Date(customDueDate).toLocaleDateString()}` 
                      : 'Default: 14 days from today'
                    }
                  </small>
                </div>
                
                <button 
                  onClick={handleDirectIssue}
                  disabled={loading}
                  style={{
                    width: '100%',
                    background: loading ? '#95a5a6' : '#27ae60',
                    color: 'white',
                    border: 'none',
                    padding: '15px',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  {loading ? (
                    <>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid transparent',
                        borderTop: '2px solid white',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }}></div>
                      Issuing Book...
                    </>
                  ) : (
                    <>
                      Issue Book to {selectedUser.name}
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div style={{
                borderTop: '1px solid #ddd',
                paddingTop: '20px'
              }}>
                <div style={{
                  background: '#fff3cd',
                  color: '#856404',
                  padding: '12px 15px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px'
                }}>
                  <span></span>
                  <div>
                    <strong>Cannot Issue:</strong> This book copy is {getStatusText(scannedBook.status)}.
                    {String(scannedBook.status) === '1' && (
                      <div style={{ marginTop: '8px', fontSize: '12px' }}>
                        <strong>Tip:</strong> Try a different barcode for an available copy of this book.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          ) : (
            <div style={{
              borderTop: '1px solid #ddd',
              paddingTop: '20px'
            }}>
              <div style={{
                background: '#e3f2fd',
                color: '#1976d2',
                padding: '12px 15px',
                borderRadius: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <span></span>
                  <div>
                    <strong>Next Steps:</strong>
                    <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
                      {!scannedBook && <li>Enter and search for a book code</li>}
                      {!selectedUser && <li>Search and select a member</li>}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DirectIssueForm;
