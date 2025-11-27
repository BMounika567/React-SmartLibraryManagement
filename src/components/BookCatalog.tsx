import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  categoryId: string;
  categoryName?: string;
  totalCopies: number;
  availableCopies: number;
  coverImageUrl?: string;
  description?: string;
  publishYear?: number;
  publisher?: string;
  edition?: string;
  language?: string;
  pageCount?: number;
}

interface BookCategory {
  id: string;
  name: string;
  description?: string;
}

interface BookCatalogProps {
  books?: Book[];
  categories?: BookCategory[];
  userReservations?: any[];
  borrowedBooks?: any[];
  pendingRequests?: any[];
  onRefresh?: () => void;
  onCreateRequest?: (bookId: string) => Promise<any>;
  onCreateReservation?: (bookId: string) => Promise<any>;
}

const BookCatalog: React.FC<BookCatalogProps> = ({ 
  books: propBooks, 
  categories: propCategories, 
  userReservations: propUserReservations, 
  borrowedBooks: propBorrowedBooks,
  pendingRequests: propPendingRequests,
  onRefresh,
  onCreateRequest,
  onCreateReservation
}) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<BookCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [showCategories, setShowCategories] = useState(true);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [reserving, setReserving] = useState(false);
  const [userRequests, setUserRequests] = useState<string[]>(propPendingRequests?.map(req => req.bookId) || []);
  const [userReservations, setUserReservations] = useState<string[]>([]);
  const [userBorrowedBooks, setUserBorrowedBooks] = useState<string[]>([]);
  const [dialog, setDialog] = useState<{
    show: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'confirm';
    onConfirm?: () => void;
  }>({ show: false, title: '', message: '', type: 'success' });

  const showDialog = (title: string, message: string, type: 'success' | 'error' | 'confirm', onConfirm?: () => void) => {
    setDialog({ show: true, title, message, type, onConfirm });
  };

  const hideDialog = () => {
    setDialog({ show: false, title: '', message: '', type: 'success' });
  };

  useEffect(() => {
    if (propBooks && propCategories) {
      setBooks(propBooks);
      setCategories(propCategories);
      setLoading(false);
      
      if (propUserReservations && propBorrowedBooks) {
        const reservedBookIds = propUserReservations.map((res: any) => res.bookId);
        const borrowedBookIds = propBorrowedBooks
          .filter((issue: any) => !issue.returnDate)
          .map((issue: any) => issue.bookCopyId || issue.bookId);
        
        setUserReservations(reservedBookIds);
        setUserBorrowedBooks(borrowedBookIds);
      }
    }
  }, [propBooks, propCategories, propUserReservations, propBorrowedBooks]);



  const handleRequestBook = async (bookId: string) => {
    if (!onCreateRequest) return;
    setRequesting(true);
    try {
      const response = await onCreateRequest(bookId);
      if (response.success) {
        showDialog('Success', 'Book request submitted successfully! You will be notified when it\'s ready for pickup.', 'success');
        setUserRequests(prev => [...prev, bookId]);
      } else {
        showDialog('Error', response.message || 'Unable to request this book', 'error');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error submitting request. Please try again.';
      showDialog('Error', errorMessage, 'error');
    } finally {
      setRequesting(false);
    }
  };

  const handleReserveBook = async (bookId: string, bookTitle: string) => {
    showDialog('Confirm Reservation', `Reserve "${bookTitle}" for when it becomes available?`, 'confirm', () => {
      performReservation(bookId, bookTitle);
    });
  };

  const performReservation = async (bookId: string, bookTitle: string) => {
    if (!onCreateReservation) return;
    setReserving(true);
    try {
      const response = await onCreateReservation(bookId);
      showDialog('Success', 'Book reserved successfully! You will be notified when it becomes available for pickup.', 'success');
      setUserReservations(prev => [...prev, bookId]);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error submitting reservation. Please try again.';
      showDialog('Error', errorMessage, 'error');
    } finally {
      setReserving(false);
    }
  };

  const getStyledButtonForBook = (book: Book) => {
    const baseStyle = {
      border: 'none',
      borderRadius: '6px',
      padding: '8px 12px',
      fontSize: '12px',
      cursor: 'pointer',
      flex: '1',
      transition: 'all 0.2s ease',
      fontWeight: '500'
    };

    if (userBorrowedBooks.includes(book.id)) {
      return (
        <button 
          style={{
            ...baseStyle,
            background: '#FEF3C7',
            color: '#92400E'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#FDE68A'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#FEF3C7'}
        >
          <i className="bi bi-box-arrow-up"></i> Return
        </button>
      );
    }
    
    if (book.availableCopies > 0) {
      if (userRequests.includes(book.id)) {
        return (
          <button 
            disabled
            style={{
              ...baseStyle,
              background: '#D1FAE5',
              color: '#065F46',
              cursor: 'not-allowed',
              opacity: 0.7
            }}
          >
            <i className="bi bi-check-circle"></i> Requested
          </button>
        );
      } else {
        return (
          <button 
            onClick={() => handleRequestBook(book.id)}
            disabled={requesting}
            style={{
              ...baseStyle,
              background: '#3B82F6',
              color: '#FFFFFF'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#2563EB'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#3B82F6'}
          >
            <i className="bi bi-clipboard-plus"></i> {requesting ? 'Requesting...' : 'Request'}
          </button>
        );
      }
    } else {
      if (userReservations.includes(book.id)) {
        return (
          <button 
            disabled
            style={{
              ...baseStyle,
              background: '#E0E7FF',
              color: '#3730A3',
              cursor: 'not-allowed',
              opacity: 0.7
            }}
          >
            <i className="bi bi-bookmark-check"></i> Reserved
          </button>
        );
      } else {
        return (
          <button 
            onClick={() => handleReserveBook(book.id, book.title)}
            disabled={reserving}
            style={{
              ...baseStyle,
              background: '#A855F7',
              color: '#FFFFFF'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#9333EA'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#A855F7'}
          >
            <i className="bi bi-bookmark-plus"></i> {reserving ? 'Reserving...' : 'Reserve'}
          </button>
        );
      }
    }
  };

  const filteredBooks = books.filter(book => {
    const matchesCategory = !selectedCategory || book.categoryId === selectedCategory;
    const matchesSearch = !searchTerm || 
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.isbn.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  const handleCategorySelect = (categoryId: string, categoryName: string) => {
    setSelectedCategory(categoryId);
    setShowCategories(false);
  };

  const handleBackToCategories = () => {
    setSelectedCategory('');
    setSearchTerm('');
    setShowCategories(true);
  };

  const getCategoryBookCount = (categoryId: string) => {
    return books.filter(book => book.categoryId === categoryId).length;
  };

  if (loading) {
    return <div className="text-center py-4">Loading books...</div>;
  }

  return (
    <div style={{ background: '#FFFFFF', padding: '20px', minHeight: '100vh' }}>
      <div className="row mb-4">
        <div className="col-md-6">
          <h4 style={{
            color: '#000000',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <i className="bi bi-book-half" style={{ color: '#FFD700' }}></i>
            {showCategories ? 'Book Categories' : `Books in ${categories.find(c => c.id === selectedCategory)?.name || 'Category'}`}
          </h4>
        </div>
        <div className="col-md-6">
          <div className="d-flex gap-2">
            {!showCategories && (
              <button 
                onClick={handleBackToCategories}
                style={{
                  background: '#155446',
                  color: '#F6E9CA',
                  border: '1px solid #C69A72',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  transition: 'all 0.3s ease',
                  whiteSpace: 'nowrap'
                }}
              >
                <i className="bi bi-arrow-left"></i> Back to Categories
              </button>
            )}
            {!showCategories && (
              <input
                type="text"
                placeholder="Search books by title, author, or ISBN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #D1D5DB',
                  borderRadius: '8px',
                  padding: '10px 16px',
                  color: '#111827',
                  fontSize: '14px',
                  flex: '1',
                  outline: 'none',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#3B82F6'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#D1D5DB'}
              />
            )}

          </div>
        </div>
      </div>

      {showCategories ? (
        <div className="row g-3">
          {categories.map((category) => (
            <div key={category.id} className="col-md-6 col-lg-4 col-xl-3">
              <div 
                onClick={() => handleCategorySelect(category.id, category.name)}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '12px',
                  border: '2px solid #000000',
                  cursor: 'pointer',
                  height: '180px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease',
                  textAlign: 'center',
                  padding: '20px'
                }}
              >
                <div style={{
                  background: '#FFFFFF',
                  borderRadius: '50%',
                  width: '60px',
                  height: '60px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '15px',
                  fontSize: '24px',
                  color: '#000000',
                  border: '2px solid #000000'
                }}>
                  <i className="bi bi-collection-fill"></i>
                </div>
                <h6 style={{
                  color: '#000000',
                  fontWeight: '700',
                  fontSize: '16px',
                  marginBottom: '8px',
                  textAlign: 'center'
                }}>{category.name}</h6>
                <p style={{
                  color: '#000000',
                  fontSize: '12px',
                  margin: '0',
                  fontWeight: '600'
                }}>{getCategoryBookCount(category.id)} books</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="row g-3">
          {filteredBooks.map((book) => (
            <div key={book.id} className="col-md-6 col-lg-4 col-xl-3">
              <div style={{
                background: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E5E7EB',
                cursor: 'pointer',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s ease',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}>
                <div style={{ position: 'relative' }}>
                  {book.coverImageUrl && book.coverImageUrl.trim() && !book.coverImageUrl.startsWith('blob:') ? (
                    <img 
                      src={book.coverImageUrl.startsWith('/') 
                        ? `https://localhost:7020${book.coverImageUrl}` 
                        : book.coverImageUrl
                      } 
                      alt={book.title}
                      style={{
                        width: '100%',
                        height: '200px',
                        objectFit: 'cover',
                        borderRadius: '12px 12px 0 0'
                      }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '100%',
                      height: '200px',
                      background: '#F3F4F6',
                      borderRadius: '12px 12px 0 0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '3rem',
                      color: '#9CA3AF'
                    }}>
                      <i className="bi bi-book"></i>
                    </div>
                  )}
                  <span style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: book.availableCopies > 0 ? '#D1FAE5' : '#FEE2E2',
                    color: book.availableCopies > 0 ? '#065F46' : '#991B1B',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: '600'
                  }}>
                    {book.availableCopies > 0 ? 'Available' : 'Out of Stock'}
                  </span>
                </div>
                
                <div style={{
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  flexGrow: 1
                }}>
                  <h6 style={{
                    color: '#111827',
                    fontWeight: '600',
                    fontSize: '15px',
                    marginBottom: '6px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }} title={book.title}>
                    {book.title}
                  </h6>
                  <p style={{
                    color: '#6B7280',
                    fontSize: '13px',
                    marginBottom: '12px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>by {book.author}</p>
                  
                  <div style={{
                    marginBottom: '6px',
                    fontSize: '12px',
                    color: '#6B7280'
                  }}>
                    <strong style={{ color: '#374151' }}>Category:</strong> {book.categoryName || 'Unknown'}
                  </div>
                  
                  <div style={{
                    marginBottom: '6px',
                    fontSize: '12px',
                    color: '#6B7280'
                  }}>
                    <strong style={{ color: '#374151' }}>Available:</strong> {book.availableCopies}/{book.totalCopies} copies
                  </div>

                  {book.publishYear && (
                    <div style={{
                      marginBottom: '12px',
                      fontSize: '12px',
                      color: '#6B7280'
                    }}>
                      <strong style={{ color: '#374151' }}>Published:</strong> {book.publishYear}
                    </div>
                  )}
                  
                  <div style={{ marginTop: 'auto' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => setSelectedBook(book)}
                        style={{
                          background: '#FFFFFF',
                          color: '#374151',
                          border: '1px solid #D1D5DB',
                          borderRadius: '6px',
                          padding: '8px 12px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          flex: '1',
                          transition: 'all 0.2s ease',
                          fontWeight: '500'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#F9FAFB'; e.currentTarget.style.borderColor = '#9CA3AF'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.borderColor = '#D1D5DB'; }}
                      >
                        <i className="bi bi-eye"></i> Details
                      </button>
                      {getStyledButtonForBook(book)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Book Details Modal */}
      {selectedBook && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#13312A',
            borderRadius: '15px',
            border: '2px solid #C69A72',
            maxWidth: '800px',
            width: '90%',
            maxHeight: '90%',
            overflow: 'auto',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{
              padding: '20px',
              borderBottom: '1px solid #155446',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h5 style={{
                color: '#F6E9CA',
                fontWeight: '600',
                margin: 0
              }}>Book Details</h5>
              <button 
                onClick={() => setSelectedBook(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#C69A72',
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: '5px'
                }}
              >
                <i className="bi bi-x"></i>
              </button>
            </div>
              
            <div style={{ padding: '20px' }}>
              <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ minWidth: '200px' }}>
                  {selectedBook.coverImageUrl && selectedBook.coverImageUrl.trim() && !selectedBook.coverImageUrl.startsWith('blob:') ? (
                    <img 
                      src={selectedBook.coverImageUrl.startsWith('/') 
                        ? `https://localhost:7020${selectedBook.coverImageUrl}` 
                        : selectedBook.coverImageUrl
                      } 
                      alt={selectedBook.title}
                      style={{
                        width: '100%',
                        maxHeight: '300px',
                        objectFit: 'cover',
                        borderRadius: '10px',
                        border: '2px solid #155446'
                      }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '200px',
                      height: '300px',
                      background: '#F6E9CA',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '4rem',
                      color: '#13312A',
                      border: '2px solid #155446'
                    }}>
                      <i className="bi bi-book"></i>
                    </div>
                  )}
                </div>
                
                <div style={{ flex: 1 }}>
                  <h4 style={{
                    color: '#F6E9CA',
                    fontWeight: '600',
                    marginBottom: '8px'
                  }}>{selectedBook.title}</h4>
                  <p style={{
                    color: '#C69A72',
                    fontSize: '16px',
                    marginBottom: '20px'
                  }}>by {selectedBook.author}</p>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '15px',
                    marginBottom: '20px'
                  }}>
                    <div>
                      <strong style={{ color: '#F6E9CA' }}>ISBN:</strong>
                      <span style={{ color: '#C69A72', marginLeft: '8px' }}>{selectedBook.isbn}</span>
                    </div>
                    <div>
                      <strong style={{ color: '#F6E9CA' }}>Category:</strong>
                      <span style={{ color: '#C69A72', marginLeft: '8px' }}>{selectedBook.categoryName}</span>
                    </div>
                    <div>
                      <strong style={{ color: '#F6E9CA' }}>Total Copies:</strong>
                      <span style={{ color: '#C69A72', marginLeft: '8px' }}>{selectedBook.totalCopies}</span>
                    </div>
                    <div>
                      <strong style={{ color: '#F6E9CA' }}>Available:</strong>
                      <span style={{ color: '#C69A72', marginLeft: '8px' }}>{selectedBook.availableCopies}</span>
                    </div>
                  </div>
                  
                  {selectedBook.description && (
                    <div style={{ marginBottom: '20px' }}>
                      <strong style={{ color: '#F6E9CA' }}>Description:</strong>
                      <p style={{
                        color: '#C69A72',
                        marginTop: '8px',
                        lineHeight: '1.5'
                      }}>{selectedBook.description}</p>
                    </div>
                  )}
                  
                  <div style={{ marginBottom: '20px' }}>
                    <span style={{
                      background: selectedBook.availableCopies > 0 ? '#C69A72' : '#13312A',
                      color: '#F6E9CA',
                      padding: '8px 16px',
                      borderRadius: '20px',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}>
                      {selectedBook.availableCopies > 0 ? 'Available for Request' : 'Currently Unavailable'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
              
            <div style={{
              padding: '20px',
              borderTop: '1px solid #155446',
              display: 'flex',
              gap: '10px',
              justifyContent: 'flex-end'
            }}>
              <button 
                onClick={() => setSelectedBook(null)}
                style={{
                  background: '#155446',
                  color: '#F6E9CA',
                  border: '1px solid #C69A72',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  transition: 'all 0.3s ease'
                }}
              >
                Close
              </button>
              {getStyledButtonForBook(selectedBook)}
            </div>
          </div>
        </div>
      )}

      {/* Custom Dialog */}
      {dialog.show && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          backdropFilter: 'blur(5px)'
        }}>
          <div style={{
            background: '#13312A',
            borderRadius: '15px',
            border: `2px solid ${dialog.type === 'success' ? '#155446' : dialog.type === 'error' ? '#C69A72' : '#155446'}`,
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{
              padding: '20px',
              borderBottom: '1px solid #155446',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: dialog.type === 'success' ? '#155446' : dialog.type === 'error' ? '#C69A72' : '#155446',
              borderRadius: '13px 13px 0 0'
            }}>
              <div style={{
                fontSize: '20px',
                color: dialog.type === 'error' ? '#13312A' : '#F6E9CA'
              }}>
                {dialog.type === 'success' ? '✅' : dialog.type === 'error' ? '⚠️' : '❓'}
              </div>
              <h5 style={{
                color: dialog.type === 'error' ? '#13312A' : '#F6E9CA',
                fontWeight: '600',
                margin: 0
              }}>{dialog.title}</h5>
            </div>
            
            <div style={{ padding: '20px' }}>
              <p style={{
                color: '#F6E9CA',
                margin: 0,
                lineHeight: '1.5',
                whiteSpace: 'pre-line'
              }}>{dialog.message}</p>
            </div>
            
            <div style={{
              padding: '20px',
              borderTop: '1px solid #155446',
              display: 'flex',
              gap: '10px',
              justifyContent: 'flex-end'
            }}>
              {dialog.type === 'confirm' ? (
                <>
                  <button 
                    onClick={hideDialog}
                    style={{
                      background: '#155446',
                      color: '#F6E9CA',
                      border: '1px solid #C69A72',
                      borderRadius: '8px',
                      padding: '10px 20px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      hideDialog();
                      dialog.onConfirm?.();
                    }}
                    style={{
                      background: '#C69A72',
                      color: '#13312A',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '10px 20px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}
                  >
                    Confirm
                  </button>
                </>
              ) : (
                <button 
                  onClick={hideDialog}
                  style={{
                    background: '#C69A72',
                    color: '#13312A',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 20px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                >
                  OK
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookCatalog;