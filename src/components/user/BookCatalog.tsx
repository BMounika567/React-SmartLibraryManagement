import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../../store';
import { fetchBooks, fetchCategories } from '../../store/slices/booksSlice';
import { fetchUserBooks, fetchUserReservations, reserveBook, fetchUserRequests, fetchReturnRequests } from '../../store/slices/bookIssuesSlice';
import axiosClient from '../../api/axiosClient';
import Dialog from '../common/Dialog';

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



const BookCatalog: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Redux selectors
  const { books, categories, loading } = useSelector((state: RootState) => state.books);
  const { user } = useSelector((state: RootState) => state.auth);
  const { userBooks, reservations, userRequests: reduxUserRequests, returnRequests: reduxReturnRequests } = useSelector((state: RootState) => state.bookIssues);
  
  // Local state
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [showCategories, setShowCategories] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [reserving, setReserving] = useState(false);
  const [localReturnRequests, setLocalReturnRequests] = useState<string[]>([]);
  // Use Redux data instead of local state
  const userRequestIds = reduxUserRequests?.map((req: any) => req.bookId) || [];
  // Match return requests by bookIssueId since API doesn't provide bookId directly
  const returnRequestBookIssueIds = reduxReturnRequests?.filter((req: any) => req.status === 'Pending')
    .map((req: any) => req.bookIssueId).filter(Boolean) || [];
  
  // Get book IDs from userBooks that have pending return requests
  const booksWithReturnRequests = userBooks?.filter((book: any) => 
    returnRequestBookIssueIds.includes(book.id) // Match by bookIssue ID
  ).map((book: any) => book.bookCopy?.bookId || book.bookId).filter(Boolean) || [];
  
  // Combine with local state
  const allReturnRequestIds = [...new Set([...booksWithReturnRequests, ...localReturnRequests])];
  
  // Derived data from Redux
  const userReservations = reservations?.map((res: any) => res?.bookId).filter(Boolean) || [];
  const userBorrowedBooks = userBooks?.filter((book: any) => !book?.returnDate).map((book: any) => book?.bookCopy?.bookId || book?.bookId).filter(Boolean) || [];
  const [cardStyle, setCardStyle] = useState<'vertical' | 'horizontal' | 'magazine' | 'compact'>('vertical');
  const [showDialog, setShowDialog] = useState(false);
  const [dialogConfig, setDialogConfig] = useState<{
    title: string;
    message: string;
    type: 'success' | 'error' | 'info';
    showConfirm?: boolean;
    onConfirm?: () => void;
  }>({ title: '', message: '', type: 'success', showConfirm: false });

  const showCustomDialog = (title: string, message: string, type: 'success' | 'error' | 'confirm', onConfirm?: () => void) => {
    setDialogConfig({ 
      title, 
      message, 
      type: type === 'confirm' ? 'info' : type, 
      showConfirm: type === 'confirm',
      onConfirm 
    });
    setShowDialog(true);
  };

  const hideCustomDialog = () => {
    setShowDialog(false);
  };

  useEffect(() => {
    // Fetch user requests and return requests from Redux
    if ((user as any)?.userId) {
      dispatch(fetchUserRequests());
      dispatch(fetchReturnRequests());
      dispatch(fetchUserBooks((user as any).userId));
    }
  }, [(user as any)?.userId, dispatch]);

  // Force refresh return requests when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      if ((user as any)?.userId) {
        dispatch(fetchReturnRequests());
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, []);



  const handleRequestBook = async (bookId: string) => {
    setRequesting(true);
    try {
      const response = await axiosClient.post('/api/BookRequest', {
        BookId: bookId
      });
      
      // Always show success dialog if we get a response (API might not return success field)
      if (response.status === 200 || response.status === 201) {
        // Show dialog immediately
        showCustomDialog('Success', 'Book request submitted successfully! You will be notified when it\'s ready for pickup.', 'success');
        
        // Refresh Redux data
        setTimeout(() => {
          dispatch(fetchUserRequests());
          if ((user as any)?.userId) {
            dispatch(fetchUserBooks((user as any).userId));
          }
          dispatch(fetchBooks());
        }, 500);
      } else {
        showCustomDialog('Error', response.data?.message || 'Unable to request this book', 'error');
      }
    } catch (error: any) {
      if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.message || 
                           (error.response?.data?.errors ? 
                            Object.values(error.response.data.errors).flat().join(', ') : 
                            'Unable to request this book');
        showCustomDialog('Error', errorMessage, 'error');
      } else if (error.response?.status === 401) {
        showCustomDialog('Login Required', 'Please log in to request books.', 'error');
      } else {
        showCustomDialog('Error', 'Error submitting request. Please try again.', 'error');
      }
    } finally {
      setRequesting(false);
    }
  };

  const handleRequestReturn = async (bookId: string) => {
    try {
      if (!(user as any)?.userId) {
        showCustomDialog('Login Required', 'Please log in to request returns.', 'error');
        return;
      }
      
      if (allReturnRequestIds.includes(bookId)) {
        showCustomDialog('Info', 'Return request already exists for this book.', 'error');
        return;
      }
      
      const activeIssue = userBooks.find((book: any) => 
        !book.returnDate && (book.bookCopy?.bookId === bookId || book.bookId === bookId)
      );
      
      if (!activeIssue) {
        showCustomDialog('Error', 'No active issue found for this book.', 'error');
        return;
      }
      
      await axiosClient.post('/api/BookReturnRequest', {
        BookIssueId: activeIssue.id,
        Reason: 'User requested return'
      });
      
      showCustomDialog('Success', 'Return request submitted successfully!', 'success');
      
      // Immediately update local state
      setLocalReturnRequests(prev => [...prev, bookId]);
      
      // Refresh Redux data
      setTimeout(() => {
        dispatch(fetchReturnRequests());
        if ((user as any)?.userId) {
          dispatch(fetchUserBooks((user as any).userId));
        }
      }, 500);
    } catch (error: any) {
      if (error.response?.data?.message?.includes('already an active return request')) {
        // If backend says request already exists, add to local state and refresh data
        setLocalReturnRequests(prev => [...prev, bookId]);
        dispatch(fetchReturnRequests()); // Force refresh to get latest data
        showCustomDialog('Info', 'Return request already exists for this book.', 'error');
      } else {
        showCustomDialog('Error', 'Error requesting return: ' + (error.response?.data?.message || error.message), 'error');
      }
    }
  };

  const handleReserveBook = async (bookId: string, bookTitle: string) => {
    showCustomDialog('Confirm Reservation', `Reserve "${bookTitle}" for when it becomes available?`, 'confirm', () => {
      performReservation(bookId, bookTitle);
    });
  };

  const performReservation = async (bookId: string, _bookTitle: string) => {
    setReserving(true);
    try {
      if (!(user as any)?.userId) {
        showCustomDialog('Login Required', 'Please log in to reserve books.', 'error');
        return;
      }
      
      await dispatch(reserveBook(bookId)).unwrap();
      showCustomDialog('Success', 'Book reserved successfully! You will be notified when it becomes available for pickup.', 'success');
    } catch (error: any) {
      const errorMessage = error.message || 'Unable to reserve this book';
      showCustomDialog('Error', errorMessage, 'error');
    } finally {
      setReserving(false);
    }
  };

  const getStyledButtonForBook = (book: Book) => {
    const baseStyle = {
      border: 'none',
      borderRadius: '6px',
      padding: '6px 10px',
      fontSize: '11px',
      cursor: 'pointer',
      flex: '1',
      transition: 'all 0.3s ease',
      fontWeight: '500'
    };

    if (userBorrowedBooks.includes(book.id)) {
      // Check if return request already exists for this book
      if (allReturnRequestIds.includes(book.id)) {
        return (
          <button 
            disabled
            style={{
              ...baseStyle,
              background: '#155446',
              color: '#F6E9CA',
              cursor: 'not-allowed'
            }}
          >
            <i className="bi bi-check-circle"></i> Return Requested
          </button>
        );
      }
      
      return (
        <button 
          onClick={() => handleRequestReturn(book.id)}
          style={{
            ...baseStyle,
            background: '#C69A72',
            color: '#13312A'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#F6E9CA';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#C69A72';
          }}
        >
          <i className="bi bi-box-arrow-up"></i> Return
        </button>
      );
    }
    
    // Check if user has an Available reservation for this book
    const availableReservation = reservations?.find((res: any) => 
      res?.bookId === book.id && res?.status === 'Available'
    );
    
    if (book.availableCopies > 0 || availableReservation) {
      if (userRequestIds.includes(book.id)) {
        return (
          <button 
            disabled
            style={{
              ...baseStyle,
              background: '#155446',
              color: '#F6E9CA',
              cursor: 'not-allowed'
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
              background: '#13312A',
              color: '#F6E9CA'
            }}
            onMouseEnter={(e) => {
              if (!requesting) {
                e.currentTarget.style.background = '#C69A72';
                e.currentTarget.style.color = '#13312A';
              }
            }}
            onMouseLeave={(e) => {
              if (!requesting) {
                e.currentTarget.style.background = '#13312A';
                e.currentTarget.style.color = '#F6E9CA';
              }
            }}
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
              background: '#155446',
              color: '#F6E9CA',
              cursor: 'not-allowed'
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
              background: '#C69A72',
              color: '#13312A'
            }}
            onMouseEnter={(e) => {
              if (!reserving) {
                e.currentTarget.style.background = '#F6E9CA';
              }
            }}
            onMouseLeave={(e) => {
              if (!reserving) {
                e.currentTarget.style.background = '#C69A72';
              }
            }}
          >
            <i className="bi bi-bookmark-plus"></i> {reserving ? 'Reserving...' : 'Reserve'}
          </button>
        );
      }
    }
  };



  const filteredBooks = books.filter((book: Book) => {
    const matchesCategory = !selectedCategory || book.categoryId === selectedCategory;
    const matchesSearch = !searchTerm || 
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.isbn.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  const handleCategorySelect = (categoryId: string, _categoryName: string) => {
    setSelectedCategory(categoryId);
    setShowCategories(false);
  };

  const handleBackToCategories = () => {
    setSelectedCategory('');
    setSearchTerm('');
    setShowCategories(true);
  };

  const getCategoryBookCount = (categoryId: string) => {
    return books.filter((book: Book) => book.categoryId === categoryId).length;
  };

  if (loading) {
    return <div className="text-center py-4">Loading books...</div>;
  }

  return (
    <div>
      <div className="row mb-4">
        <div className="col-md-6">
          <h4 style={{
            color: '#F6E9CA',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <i className="bi bi-book-half" style={{ color: '#C69A72' }}></i>
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
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#C69A72';
                  e.currentTarget.style.color = '#13312A';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#155446';
                  e.currentTarget.style.color = '#F6E9CA';
                }}
              >
                <i className="bi bi-arrow-left"></i> Back to Categories
              </button>
            )}
            {!showCategories && (
              <>
                <select
                  value={cardStyle}
                  onChange={(e) => setCardStyle(e.target.value as any)}
                  style={{
                    background: '#F6E9CA',
                    border: '1px solid #C69A72',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    color: '#13312A',
                    fontSize: '14px',
                    marginRight: '8px'
                  }}
                >
                  <option value="vertical">📚 Vertical</option>
                  <option value="horizontal">📖 Horizontal</option>
                  <option value="magazine">📰 Magazine</option>
                  <option value="compact">🔲 Compact</option>
                </select>
                <input
                  type="text"
                  placeholder="Search books by title, author, or ISBN..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    background: '#F6E9CA',
                    border: '1px solid #C69A72',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    color: '#13312A',
                    fontSize: '14px',
                    flex: '1'
                  }}
                />
              </>
            )}
            <button 
              onClick={() => {
                dispatch(fetchBooks());
                dispatch(fetchCategories());
                if ((user as any)?.userId) {
                  dispatch(fetchUserBooks((user as any).userId));
                  dispatch(fetchUserReservations());
                  dispatch(fetchUserRequests());
                  dispatch(fetchReturnRequests());
                }
              }}
              title="Refresh data"
              style={{
                background: '#C69A72',
                color: '#F6E9CA',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 12px',
                cursor: 'pointer',
                fontSize: '16px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#155446';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#C69A72';
              }}
            >
              <i className="bi bi-arrow-clockwise"></i>
            </button>
          </div>
        </div>
      </div>

      {showCategories ? (
        <div className="row g-3">
          {categories.map((category: any) => (
            <div key={category.id} className="col-md-6 col-lg-4 col-xl-3">
              <div 
                onClick={() => handleCategorySelect(category.id, category.name)}
                style={{
                  background: '#155446',
                  borderRadius: '12px',
                  border: '1px solid #C69A72',
                  cursor: 'pointer',
                  height: '180px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(19, 49, 42, 0.3)',
                  textAlign: 'center',
                  padding: '20px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(198, 154, 114, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(19, 49, 42, 0.3)';
                }}
              >
                <div style={{
                  background: '#F6E9CA',
                  borderRadius: '50%',
                  width: '60px',
                  height: '60px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '15px',
                  fontSize: '24px',
                  color: '#13312A'
                }}>
                  <i className="bi bi-collection"></i>
                </div>
                <h6 style={{
                  color: '#F6E9CA',
                  fontWeight: '600',
                  fontSize: '16px',
                  marginBottom: '8px',
                  textAlign: 'center'
                }}>{category.name}</h6>
                <p style={{
                  color: '#C69A72',
                  fontSize: '12px',
                  margin: '0',
                  fontWeight: '500'
                }}>{getCategoryBookCount(category.id)} books</p>
                {category.description && (
                  <p style={{
                    color: '#C69A72',
                    fontSize: '11px',
                    marginTop: '8px',
                    textAlign: 'center',
                    opacity: 0.8
                  }}>{category.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
        {cardStyle === 'vertical' && (
          <div className="row g-3">
            {filteredBooks.map((book: Book) => (
              <div key={book.id} className="col-md-6 col-lg-4 col-xl-3">
                <div style={{
                  background: '#155446',
                  borderRadius: '12px',
                  border: '1px solid #C69A72',
                  cursor: 'pointer',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(19, 49, 42, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(198, 154, 114, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(19, 49, 42, 0.3)';
                }}
                >
                  <div style={{ position: 'relative' }}>
                    {book.coverImageUrl && book.coverImageUrl.trim() ? (
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
                        background: '#F6E9CA',
                        borderRadius: '12px 12px 0 0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '3rem',
                        color: '#13312A'
                      }}>
                        <i className="bi bi-book"></i>
                      </div>
                    )}
                    <span style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      background: book.availableCopies > 0 ? '#C69A72' : '#13312A',
                      color: '#F6E9CA',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: '600'
                    }}>
                      {book.availableCopies > 0 ? 'Available' : 'Out of Stock'}
                    </span>
                  </div>
                  
                  <div style={{
                    padding: '15px',
                    display: 'flex',
                    flexDirection: 'column',
                    flexGrow: 1
                  }}>
                    <h6 style={{
                      color: '#F6E9CA',
                      fontWeight: '600',
                      fontSize: '14px',
                      marginBottom: '8px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }} title={book.title}>
                      {book.title}
                    </h6>
                    <p style={{
                      color: '#C69A72',
                      fontSize: '12px',
                      marginBottom: '8px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>by {book.author}</p>
                    
                    <div style={{
                      marginBottom: '6px',
                      fontSize: '11px',
                      color: '#C69A72'
                    }}>
                      <strong>Category:</strong> {book.categoryName || 'Unknown'}
                    </div>
                    
                    <div style={{
                      marginBottom: '6px',
                      fontSize: '11px',
                      color: '#C69A72'
                    }}>
                      <strong>Available:</strong> {book.availableCopies}/{book.totalCopies} copies
                    </div>

                    {book.publishYear && (
                      <div style={{
                        marginBottom: '12px',
                        fontSize: '11px',
                        color: '#C69A72'
                      }}>
                        <strong>Published:</strong> {book.publishYear}
                      </div>
                    )}
                    
                    <div style={{ marginTop: 'auto' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button 
                          onClick={() => setSelectedBook(book)}
                          style={{
                            background: 'transparent',
                            color: '#F6E9CA',
                            border: '1px solid #C69A72',
                            borderRadius: '6px',
                            padding: '6px 10px',
                            fontSize: '11px',
                            cursor: 'pointer',
                            flex: '1',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#C69A72';
                            e.currentTarget.style.color = '#13312A';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = '#F6E9CA';
                          }}
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

        {cardStyle === 'horizontal' && (
          <div className="row g-3">
            {filteredBooks.map((book: Book) => (
              <div key={book.id} className="col-12">
                <div style={{
                  background: '#155446',
                  borderRadius: '15px',
                  border: '1px solid #C69A72',
                  cursor: 'pointer',
                  display: 'flex',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(19, 49, 42, 0.3)',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateX(5px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(198, 154, 114, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateX(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(19, 49, 42, 0.3)';
                }}
                >
                  <div style={{ position: 'relative', minWidth: '150px' }}>
                    {book.coverImageUrl && book.coverImageUrl.trim() ? (
                      <img 
                        src={book.coverImageUrl.startsWith('/') 
                          ? `https://localhost:7020${book.coverImageUrl}` 
                          : book.coverImageUrl
                        } 
                        alt={book.title}
                        style={{
                          width: '150px',
                          height: '200px',
                          objectFit: 'cover'
                        }}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div style={{
                        width: '150px',
                        height: '200px',
                        background: '#F6E9CA',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '3rem',
                        color: '#13312A'
                      }}>
                        <i className="bi bi-book"></i>
                      </div>
                    )}
                    <span style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      background: book.availableCopies > 0 ? '#C69A72' : '#13312A',
                      color: '#F6E9CA',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: '600'
                    }}>
                      {book.availableCopies > 0 ? 'Available' : 'Out of Stock'}
                    </span>
                  </div>
                  
                  <div style={{
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    flex: 1
                  }}>
                    <div>
                      <h5 style={{
                        color: '#F6E9CA',
                        fontWeight: '600',
                        fontSize: '18px',
                        marginBottom: '8px'
                      }}>{book.title}</h5>
                      <p style={{
                        color: '#C69A72',
                        fontSize: '14px',
                        marginBottom: '12px'
                      }}>by {book.author}</p>
                      
                      <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
                        <div style={{ fontSize: '12px', color: '#C69A72' }}>
                          <strong>Category:</strong> {book.categoryName || 'Unknown'}
                        </div>
                        <div style={{ fontSize: '12px', color: '#C69A72' }}>
                          <strong>Available:</strong> {book.availableCopies}/{book.totalCopies}
                        </div>
                        {book.publishYear && (
                          <div style={{ fontSize: '12px', color: '#C69A72' }}>
                            <strong>Published:</strong> {book.publishYear}
                          </div>
                        )}
                      </div>
                      
                      {book.description && (
                        <p style={{
                          color: '#C69A72',
                          fontSize: '13px',
                          lineHeight: '1.4',
                          marginBottom: '15px',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>{book.description}</p>
                      )}
                    </div>
                    
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button 
                        onClick={() => setSelectedBook(book)}
                        style={{
                          background: 'transparent',
                          color: '#F6E9CA',
                          border: '1px solid #C69A72',
                          borderRadius: '8px',
                          padding: '8px 16px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#C69A72';
                          e.currentTarget.style.color = '#13312A';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = '#F6E9CA';
                        }}
                      >
                        <i className="bi bi-eye"></i> Details
                      </button>
                      {getStyledButtonForBook(book)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {cardStyle === 'magazine' && (
          <div className="row g-4">
            {filteredBooks.map((book: Book, index: number) => (
              <div key={book.id} className={index % 3 === 0 ? "col-md-8" : "col-md-4"}>
                <div style={{
                  background: index % 3 === 0 ? 'linear-gradient(135deg, #155446 0%, #13312A 100%)' : '#155446',
                  borderRadius: '20px',
                  border: '1px solid #C69A72',
                  cursor: 'pointer',
                  height: index % 3 === 0 ? '300px' : '250px',
                  display: 'flex',
                  flexDirection: index % 3 === 0 ? 'row' : 'column',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 6px 20px rgba(19, 49, 42, 0.4)',
                  overflow: 'hidden',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 12px 35px rgba(198, 154, 114, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(19, 49, 42, 0.4)';
                }}
                >
                  <div style={{
                    position: 'relative',
                    width: index % 3 === 0 ? '40%' : '100%',
                    height: index % 3 === 0 ? '100%' : '60%'
                  }}>
                    {book.coverImageUrl && book.coverImageUrl.trim() ? (
                      <img 
                        src={book.coverImageUrl.startsWith('/') 
                          ? `https://localhost:7020${book.coverImageUrl}` 
                          : book.coverImageUrl
                        } 
                        alt={book.title}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          borderRadius: index % 3 === 0 ? '20px 0 0 20px' : '20px 20px 0 0'
                        }}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div style={{
                        width: '100%',
                        height: '100%',
                        background: '#F6E9CA',
                        borderRadius: index % 3 === 0 ? '20px 0 0 20px' : '20px 20px 0 0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: index % 3 === 0 ? '4rem' : '3rem',
                        color: '#13312A'
                      }}>
                        <i className="bi bi-book"></i>
                      </div>
                    )}
                    <span style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      background: book.availableCopies > 0 ? '#C69A72' : '#13312A',
                      color: '#F6E9CA',
                      padding: '6px 12px',
                      borderRadius: '15px',
                      fontSize: '12px',
                      fontWeight: '600',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                    }}>
                      {book.availableCopies > 0 ? 'Available' : 'Out of Stock'}
                    </span>
                  </div>
                  
                  <div style={{
                    padding: index % 3 === 0 ? '25px' : '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    flex: 1
                  }}>
                    <div>
                      <h5 style={{
                        color: '#F6E9CA',
                        fontWeight: '700',
                        fontSize: index % 3 === 0 ? '20px' : '16px',
                        marginBottom: '8px',
                        lineHeight: '1.2'
                      }}>{book.title}</h5>
                      <p style={{
                        color: '#C69A72',
                        fontSize: index % 3 === 0 ? '15px' : '13px',
                        marginBottom: '12px',
                        fontWeight: '500'
                      }}>by {book.author}</p>
                      
                      {index % 3 === 0 && book.description && (
                        <p style={{
                          color: '#C69A72',
                          fontSize: '13px',
                          lineHeight: '1.4',
                          marginBottom: '15px',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>{book.description}</p>
                      )}
                      
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '8px',
                        marginBottom: '15px'
                      }}>
                        <span style={{
                          background: 'rgba(246, 233, 202, 0.2)',
                          color: '#F6E9CA',
                          padding: '4px 8px',
                          borderRadius: '8px',
                          fontSize: '11px',
                          fontWeight: '500'
                        }}>{book.categoryName}</span>
                        <span style={{
                          background: 'rgba(198, 154, 114, 0.2)',
                          color: '#C69A72',
                          padding: '4px 8px',
                          borderRadius: '8px',
                          fontSize: '11px',
                          fontWeight: '500'
                        }}>{book.availableCopies}/{book.totalCopies} copies</span>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => setSelectedBook(book)}
                        style={{
                          background: 'rgba(246, 233, 202, 0.1)',
                          color: '#F6E9CA',
                          border: '1px solid #C69A72',
                          borderRadius: '10px',
                          padding: '8px 12px',
                          fontSize: '11px',
                          cursor: 'pointer',
                          flex: '1',
                          transition: 'all 0.3s ease',
                          backdropFilter: 'blur(10px)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#C69A72';
                          e.currentTarget.style.color = '#13312A';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(246, 233, 202, 0.1)';
                          e.currentTarget.style.color = '#F6E9CA';
                        }}
                      >
                        <i className="bi bi-eye"></i> Details
                      </button>
                      {getStyledButtonForBook(book)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {cardStyle === 'compact' && (
          <div className="row g-2">
            {filteredBooks.map((book: Book) => (
              <div key={book.id} className="col-md-6 col-lg-3 col-xl-2">
                <div style={{
                  background: '#155446',
                  borderRadius: '10px',
                  border: '1px solid #C69A72',
                  cursor: 'pointer',
                  height: '280px',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 8px rgba(19, 49, 42, 0.3)',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px) rotate(1deg)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(198, 154, 114, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) rotate(0deg)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(19, 49, 42, 0.3)';
                }}
                >
                  <div style={{ position: 'relative', height: '140px' }}>
                    {book.coverImageUrl && book.coverImageUrl.trim() ? (
                      <img 
                        src={book.coverImageUrl.startsWith('/') 
                          ? `https://localhost:7020${book.coverImageUrl}` 
                          : book.coverImageUrl
                        } 
                        alt={book.title}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div style={{
                        width: '100%',
                        height: '100%',
                        background: '#F6E9CA',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2rem',
                        color: '#13312A'
                      }}>
                        <i className="bi bi-book"></i>
                      </div>
                    )}
                    <span style={{
                      position: 'absolute',
                      top: '6px',
                      right: '6px',
                      background: book.availableCopies > 0 ? '#C69A72' : '#13312A',
                      color: '#F6E9CA',
                      padding: '2px 6px',
                      borderRadius: '8px',
                      fontSize: '9px',
                      fontWeight: '600'
                    }}>
                      {book.availableCopies > 0 ? '✓' : '✗'}
                    </span>
                  </div>
                  
                  <div style={{
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    flexGrow: 1
                  }}>
                    <h6 style={{
                      color: '#F6E9CA',
                      fontWeight: '600',
                      fontSize: '12px',
                      marginBottom: '6px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }} title={book.title}>
                      {book.title}
                    </h6>
                    <p style={{
                      color: '#C69A72',
                      fontSize: '10px',
                      marginBottom: '8px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>by {book.author}</p>
                    
                    <div style={{
                      marginBottom: '8px',
                      fontSize: '9px',
                      color: '#C69A72'
                    }}>
                      {book.categoryName} • {book.availableCopies}/{book.totalCopies}
                    </div>
                    
                    <div style={{ marginTop: 'auto' }}>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button 
                          onClick={() => setSelectedBook(book)}
                          style={{
                            background: 'transparent',
                            color: '#F6E9CA',
                            border: '1px solid #C69A72',
                            borderRadius: '4px',
                            padding: '4px 6px',
                            fontSize: '9px',
                            cursor: 'pointer',
                            flex: '1',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#C69A72';
                            e.currentTarget.style.color = '#13312A';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = '#F6E9CA';
                          }}
                        >
                          <i className="bi bi-eye"></i>
                        </button>
                        <div style={{ flex: '2' }}>
                          {getStyledButtonForBook(book)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        </>
      )}

      {!showCategories && filteredBooks.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: '#C69A72'
        }}>
          <div style={{
            fontSize: '4rem',
            marginBottom: '20px',
            color: '#155446'
          }}>
            <i className="bi bi-search"></i>
          </div>
          <h5 style={{
            color: '#F6E9CA',
            fontWeight: '600',
            marginBottom: '10px'
          }}>No books found</h5>
          <p style={{
            color: '#C69A72',
            fontSize: '14px'
          }}>Try adjusting your search criteria</p>
        </div>
      )}

      {showCategories && categories.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: '#C69A72'
        }}>
          <div style={{
            fontSize: '4rem',
            marginBottom: '20px',
            color: '#155446'
          }}>
            <i className="bi bi-collection"></i>
          </div>
          <h5 style={{
            color: '#F6E9CA',
            fontWeight: '600',
            marginBottom: '10px'
          }}>No categories found</h5>
          <p style={{
            color: '#C69A72',
            fontSize: '14px'
          }}>Categories will appear here when available</p>
        </div>
      )}

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
                  {selectedBook.coverImageUrl && selectedBook.coverImageUrl.trim() ? (
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
                      <strong style={{ color: '#F6E9CA' }}>Publisher:</strong>
                      <span style={{ color: '#C69A72', marginLeft: '8px' }}>{selectedBook.publisher || 'N/A'}</span>
                    </div>
                    <div>
                      <strong style={{ color: '#F6E9CA' }}>Edition:</strong>
                      <span style={{ color: '#C69A72', marginLeft: '8px' }}>{selectedBook.edition || 'N/A'}</span>
                    </div>
                    <div>
                      <strong style={{ color: '#F6E9CA' }}>Language:</strong>
                      <span style={{ color: '#C69A72', marginLeft: '8px' }}>{selectedBook.language || 'N/A'}</span>
                    </div>
                    <div>
                      <strong style={{ color: '#F6E9CA' }}>Pages:</strong>
                      <span style={{ color: '#C69A72', marginLeft: '8px' }}>{selectedBook.pageCount || 'N/A'}</span>
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
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#C69A72';
                  e.currentTarget.style.color = '#13312A';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#155446';
                  e.currentTarget.style.color = '#F6E9CA';
                }}
              >
                Close
              </button>
              {userBorrowedBooks.includes(selectedBook.id) ? (
                allReturnRequestIds.includes(selectedBook.id) ? (
                  <button 
                    disabled
                    style={{
                      background: '#155446',
                      color: '#F6E9CA',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '10px 20px',
                      cursor: 'not-allowed',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}
                  >
                    <i className="bi bi-check-circle"></i> Return Requested
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                      handleRequestReturn(selectedBook.id);
                      setSelectedBook(null);
                    }}
                    style={{
                      background: '#C69A72',
                      color: '#13312A',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '10px 20px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#F6E9CA';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#C69A72';
                    }}
                  >
                    <i className="bi bi-box-arrow-up"></i> Request Return
                  </button>
                )
              ) : (selectedBook.availableCopies > 0 || reservations?.find((res: any) => res?.bookId === selectedBook.id && res?.status === 'Available')) ? (
                userRequestIds.includes(selectedBook.id) ? (
                  <button 
                    disabled
                    style={{
                      background: '#155446',
                      color: '#F6E9CA',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '10px 20px',
                      cursor: 'not-allowed',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}
                  >
                    <i className="bi bi-check-circle"></i> Already Requested
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                      handleRequestBook(selectedBook.id);
                      setSelectedBook(null);
                    }}
                    disabled={requesting}
                    style={{
                      background: '#13312A',
                      color: '#F6E9CA',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '10px 20px',
                      cursor: requesting ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!requesting) {
                        e.currentTarget.style.background = '#C69A72';
                        e.currentTarget.style.color = '#13312A';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!requesting) {
                        e.currentTarget.style.background = '#13312A';
                        e.currentTarget.style.color = '#F6E9CA';
                      }
                    }}
                  >
                    <i className="bi bi-clipboard-plus"></i> {requesting ? 'Requesting...' : 'Request This Book'}
                  </button>
                )
              ) : (
                userReservations.includes(selectedBook.id) ? (
                  <button 
                    disabled
                    style={{
                      background: '#155446',
                      color: '#F6E9CA',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '10px 20px',
                      cursor: 'not-allowed',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}
                  >
                    <i className="bi bi-bookmark-check"></i> Already Reserved
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                      handleReserveBook(selectedBook.id, selectedBook.title);
                      setSelectedBook(null);
                    }}
                    disabled={reserving}
                    style={{
                      background: '#C69A72',
                      color: '#13312A',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '10px 20px',
                      cursor: reserving ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!reserving) {
                        e.currentTarget.style.background = '#F6E9CA';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!reserving) {
                        e.currentTarget.style.background = '#C69A72';
                      }
                    }}
                  >
                    <i className="bi bi-bookmark-plus"></i> {reserving ? 'Reserving...' : 'Reserve This Book'}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* Dialog */}
      <Dialog
        isOpen={showDialog}
        onClose={hideCustomDialog}
        title={dialogConfig.title}
        message={dialogConfig.message}
        type={dialogConfig.type}
        theme="library"
        showConfirm={dialogConfig.showConfirm}
        onConfirm={dialogConfig.onConfirm}
      />
    </div>
  );
};

export default BookCatalog;
