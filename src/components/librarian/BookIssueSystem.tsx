import React, { useState } from 'react';
import Dialog from '../common/Dialog';
import { useLibrarianDashboardContext } from '../../context/LibrarianDashboardContext';

interface BookCopy {
  id: string;
  copyNumber: number;
  barcode: string;
  qrCode: string;
  status: 'Available' | 'Issued' | 'Reserved' | 'Lost' | 'Maintenance' | number;
  condition: string;
  bookTitle?: string;
  BookTitle?: string;
  bookAuthor?: string;
  BookAuthor?: string;
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

const BookIssueSystem: React.FC = () => {
  const { members, activeBookIssues, overdueBookIssues, getBookCopyByBarcode, issueBook } = useLibrarianDashboardContext();
  const [activeTab, setActiveTab] = useState<'direct' | 'active' | 'overdue'>('direct');
  const [scannedBook, setScannedBook] = useState<BookCopy | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userSearch, setUserSearch] = useState('');
  const [scanError, setScanError] = useState('');
  const [loading, setLoading] = useState(false);
  const [customDueDate, setCustomDueDate] = useState('');
  const [scannedCode, setScannedCode] = useState('');
  const [dialog, setDialog] = useState<{isOpen: boolean, title: string, message: string, type: 'success' | 'error' | 'info', showConfirm?: boolean, onConfirm?: () => void}>({isOpen: false, title: '', message: '', type: 'info'});

  // Data comes from context - no need for separate API calls
  const users = members;

  const handleManualSearch = async () => {
    if (scannedCode?.trim()) {
      await handleBarcodeScan(scannedCode.trim());
    }
  };

  const handleBarcodeScan = async (code: string) => {
    setScanError('');
    setScannedBook(null);
    
    const result = await getBookCopyByBarcode(code);
    if (result.success) {
      setScannedBook(result.data);
    } else {
      setScanError('Book copy not found with this barcode');
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

    if (scannedBook.status !== 'Available' && (scannedBook.status as any) !== 0) {
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

      await issueBook(issueData);
      
      const bookTitle = scannedBook.book?.title || scannedBook.bookTitle || 'Book';
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

  const getDaysRemaining = (dueDate: string) => {
    const days = Math.ceil((new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

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
      minHeight: '100vh',
      padding: '0'
    }}>
      {/* Tab Navigation */}
      <div style={{
        marginBottom: '25px',
        display: 'flex',
        gap: '8px'
      }}>
        <button
          onClick={() => setActiveTab('direct')}
          style={{
            background: activeTab === 'direct' ? '#4A7FA7' : 'white',
            color: activeTab === 'direct' ? 'white' : '#2c3e50',
            border: '1px solid #B3CFE5',
            padding: '10px 20px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap'
          }}
        >
          Direct Issue
        </button>

        <button
          onClick={() => setActiveTab('active')}
          style={{
            background: activeTab === 'active' ? '#4A7FA7' : 'white',
            color: activeTab === 'active' ? 'white' : '#2c3e50',
            border: '1px solid #B3CFE5',
            padding: '10px 20px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            whiteSpace: 'nowrap'
          }}
        >
          Active Issues
          {activeBookIssues.length > 0 && (
            <span style={{
              background: activeTab === 'active' ? 'rgba(255, 255, 255, 0.2)' : '#27ae60',
              color: 'white',
              borderRadius: '10px',
              padding: '2px 8px',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              {activeBookIssues.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('overdue')}
          style={{
            background: activeTab === 'overdue' ? '#4A7FA7' : 'white',
            color: activeTab === 'overdue' ? 'white' : '#2c3e50',
            border: '1px solid #B3CFE5',
            padding: '10px 20px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            whiteSpace: 'nowrap'
          }}
        >
          Overdue
          {overdueBookIssues.length > 0 && (
            <span style={{
              background: activeTab === 'overdue' ? 'rgba(255, 255, 255, 0.2)' : '#e74c3c',
              color: 'white',
              borderRadius: '10px',
              padding: '2px 8px',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              {overdueBookIssues.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'direct' && (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          border: '1px solid #B3CFE5',
          boxShadow: '0 4px 12px rgba(74, 127, 167, 0.1)',
          padding: '30px'
        }}>
          {/* Single Form Layout */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  color: '#000000',
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
                      cursor: scannedCode?.trim() ? 'pointer' : 'not-allowed'
                    }}
                  >
                     Search
                  </button>
                </div>
                <small style={{
                  color: '#6b7280',
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
                  background: scannedBook.status === 'Available' || (scannedBook.status as any) === 0 ? '#e8f5e8' : '#fff3cd',
                  border: `1px solid ${scannedBook.status === 'Available' || (scannedBook.status as any) === 0 ? '#27ae60' : '#f39c12'}`,
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
                        color: '#000000',
                        fontWeight: '600',
                        margin: '0 0 5px 0'
                      }}>{scannedBook.book?.title || scannedBook.bookTitle || scannedBook.BookTitle || 'Unknown Book'}</h6>
                      <p style={{
                        color: '#6b7280',
                        margin: '0 0 8px 0',
                        fontSize: '14px'
                      }}>by {scannedBook.book?.author || scannedBook.bookAuthor || scannedBook.BookAuthor || 'Unknown Author'}</p>
                      <p style={{
                        color: '#000000',
                        margin: '0 0 8px 0',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}>Copy #{scannedBook.copyNumber}</p>
                      <span style={{
                        background: scannedBook.status === 'Available' || (scannedBook.status as any) === 0 ? '#27ae60' : '#e74c3c',
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
          
          {/* Divider */}
          <div style={{
            borderTop: '2px solid #B3CFE5',
            margin: '30px 0'
          }}></div>
          
          {/* Member Selection */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  color: '#000000',
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
                        color: '#000000',
                        fontWeight: '600',
                        margin: '0 0 5px 0'
                      }}>{selectedUser.name}</h6>
                      <small style={{
                        color: '#6b7280',
                        fontSize: '12px',
                        display: 'block'
                      }}>{selectedUser.email}</small>
                      {selectedUser.studentId && (
                        <small style={{
                          color: '#6b7280',
                          fontSize: '12px'
                        }}>ID: {selectedUser.studentId}</small>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Issue Section */}
              {scannedBook && selectedUser ? (
                (scannedBook.status === 'Available' || (scannedBook.status as any) === 0) ? (
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
                        color: '#000000',
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
                        color: '#6b7280',
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
                        {(scannedBook.status as any) === 1 && (
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
                    background: '#f0fdf4',
                    color: '#16a34a',
                    padding: '12px 15px',
                    borderRadius: '8px',
                    border: '1px solid #86efac'
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
      )}



      {/* Active Issues Tab */}
      {activeTab === 'active' && (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          border: '1px solid #B3CFE5',
          boxShadow: '0 4px 12px rgba(74, 127, 167, 0.1)',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '20px 20px 15px 20px',
            borderBottom: '1px solid #B3CFE5'
          }}>
            <h5 style={{
              color: '#2c3e50',
              fontWeight: '600',
              margin: '0',
              fontSize: '18px'
            }}>Active Issues</h5>
          </div>
          <div style={{ padding: '20px' }}>
          {activeBookIssues.filter(issue => getDaysRemaining(issue.dueDate) > 0).length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 2fr 1fr 0.8fr 1fr 1fr 0.8fr 0.8fr', gap: '15px', padding: '15px 20px', background: '#f8f9fa', borderRadius: '8px', marginBottom: '10px', fontWeight: '700', fontSize: '14px', color: '#000000', minWidth: '1200px' }}>
                <div>Student</div>
                <div>Book</div>
                <div>Barcode</div>
                <div>Issue Type</div>
                <div>Issue Date</div>
                <div>Due Date</div>
                <div>Days Left</div>
                <div>Status</div>
              </div>
              {activeBookIssues.filter(issue => getDaysRemaining(issue.dueDate) > 0).map((issue: any) => (
                <div key={issue.id} style={{ display: 'grid', gridTemplateColumns: '1.5fr 2fr 1fr 0.8fr 1fr 1fr 0.8fr 0.8fr', gap: '15px', padding: '18px 20px', background: 'white', border: '1px solid #e8e8e8', borderRadius: '8px', marginBottom: '8px', alignItems: 'center', transition: 'all 0.2s ease', minWidth: '1200px' }} onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f8f9fa';
                  e.currentTarget.style.borderColor = '#4A7FA7';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(74, 127, 167, 0.1)';
                }} onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'white';
                  e.currentTarget.style.borderColor = '#e8e8e8';
                  e.currentTarget.style.boxShadow = 'none';
                }}>
                  <div>
                    <div style={{ color: '#000000', fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>{issue.studentName || issue.userName || 'N/A'}</div>
                    <div style={{ color: '#6b7280', fontSize: '12px' }}>{issue.userEmail || 'N/A'}</div>
                  </div>
                  <div>
                    <div style={{ color: '#000000', fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>{issue.bookTitle}</div>
                    <div style={{ color: '#6b7280', fontSize: '12px' }}>by {issue.bookAuthor} (Copy #{issue.copyNumber})</div>
                  </div>
                  <div style={{ color: '#000000', fontSize: '13px', fontFamily: 'monospace' }}>{issue.barcode || 'N/A'}</div>
                  <div>
                    <span style={{ 
                      background: issue.issueType === 'Online' ? '#17a2b8' : '#007bff',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: '600',
                      display: 'inline-block'
                    }}>
                      {issue.issueType || 'Direct'}
                    </span>
                  </div>
                  <div style={{ color: '#000000', fontSize: '13px' }}>{new Date(issue.issueDate).toLocaleDateString()}</div>
                  <div style={{ color: '#000000', fontSize: '13px' }}>{new Date(issue.dueDate).toLocaleDateString()}</div>
                  <div>
                    <span style={{
                      background: getDaysRemaining(issue.dueDate) <= 3 ? '#ffc107' : '#28a745',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: '600',
                      display: 'inline-block'
                    }}>
                      {getDaysRemaining(issue.dueDate)} days
                    </span>
                  </div>
                  <div>
                    <span style={{
                      background: '#28a745',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: '600',
                      display: 'inline-block'
                    }}>Active</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: '#7f8c8d'
            }}>
              <div style={{
                fontSize: '48px',
                marginBottom: '16px'
              }}></div>
              <p style={{ margin: '0', fontSize: '16px' }}>No active book issues</p>
            </div>
          )}
          </div>
        </div>
      )}

      {/* Overdue Issues Tab */}
      {activeTab === 'overdue' && (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          border: '1px solid #B3CFE5',
          boxShadow: '0 4px 12px rgba(74, 127, 167, 0.1)',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '20px 20px 15px 20px',
            borderBottom: '1px solid #B3CFE5'
          }}>
            <h5 style={{
              color: '#2c3e50',
              fontWeight: '600',
              margin: '0',
              fontSize: '18px'
            }}>Overdue Books</h5>
          </div>
          <div style={{ padding: '20px' }}>
            {overdueBookIssues.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 2fr 1fr 0.8fr 1fr 1fr 1fr', gap: '15px', padding: '15px 20px', background: '#f8f9fa', borderRadius: '8px', marginBottom: '10px', fontWeight: '700', fontSize: '14px', color: '#000000', minWidth: '1100px' }}>
                  <div>Student</div>
                  <div>Book</div>
                  <div>Barcode</div>
                  <div>Issue Type</div>
                  <div>Due Date</div>
                  <div>Days Overdue</div>
                  <div>Fine Amount</div>
                </div>
                {overdueBookIssues.map((issue: any) => (
                  <div key={issue.id} style={{ display: 'grid', gridTemplateColumns: '1.5fr 2fr 1fr 0.8fr 1fr 1fr 1fr', gap: '15px', padding: '18px 20px', background: 'white', border: '1px solid #e8e8e8', borderRadius: '8px', marginBottom: '8px', alignItems: 'center', transition: 'all 0.2s ease', minWidth: '1100px' }} onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f8f9fa';
                    e.currentTarget.style.borderColor = '#4A7FA7';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(74, 127, 167, 0.1)';
                  }} onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'white';
                    e.currentTarget.style.borderColor = '#e8e8e8';
                    e.currentTarget.style.boxShadow = 'none';
                  }}>
                    <div>
                      <div style={{ color: '#000000', fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>{issue.studentName || issue.userName || 'N/A'}</div>
                      <div style={{ color: '#6b7280', fontSize: '12px' }}>{issue.userEmail || 'N/A'}</div>
                    </div>
                    <div>
                      <div style={{ color: '#000000', fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>{issue.bookTitle}</div>
                      <div style={{ color: '#6b7280', fontSize: '12px' }}>by {issue.bookAuthor} (Copy #{issue.copyNumber})</div>
                    </div>
                    <div style={{ color: '#000000', fontSize: '13px', fontFamily: 'monospace' }}>{issue.barcode || 'N/A'}</div>
                    <div>
                      <span style={{
                        background: issue.issueType === 'Online' ? '#17a2b8' : '#007bff',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '600',
                        display: 'inline-block'
                      }}>
                        {issue.issueType || 'Direct'}
                      </span>
                    </div>
                    <div style={{ color: '#000000', fontSize: '13px' }}>{new Date(issue.dueDate).toLocaleDateString()}</div>
                    <div style={{ color: '#d32f2f', fontSize: '14px', fontWeight: '700' }}>
                      {Math.abs(getDaysRemaining(issue.dueDate))} days
                    </div>
                    <div style={{ color: '#d32f2f', fontSize: '16px', fontWeight: '700' }}>
                      ${issue.fineAmount || (Math.abs(getDaysRemaining(issue.dueDate)) * 1).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: '#7f8c8d'
            }}>
              <div style={{
                fontSize: '48px',
                marginBottom: '16px'
              }}></div>
              <p style={{ margin: '0', fontSize: '16px' }}>No overdue books</p>
            </div>
          )}
          </div>
        </div>
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

export default BookIssueSystem;