import React, { useState, useEffect } from 'react';
import { useLibrarianDashboardContext } from '../../context/LibrarianDashboardContext';

interface BookCopy {
  id: string;
  copyNumber: number;
  barcode: string;
  qrCode: string;
  status: 'Available' | 'Issued' | 'Reserved' | 'Lost' | 'Maintenance';
  condition: string;
}

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
  copies?: BookCopy[];
}

interface BookCategory {
  id: string;
  name: string;
}

interface BooksTabProps {
  books: Book[];
  categories: BookCategory[];
  selectedCategory: BookCategory | null;
  searchTerm: string;
  onCategorySelect: (category: BookCategory | null) => void;
  onSearchChange: (term: string) => void;
  onAddBook: () => void;
  onAddCategory: () => void;
  onBookSelect: (book: Book) => void;
  onDeleteBook: (bookId: string) => void;
  onEditBook: (book: Book) => void;
  onViewCopies: (book: Book) => void;
  onEditCategory: (category: BookCategory) => void;
  onDeleteCategory: (categoryId: string) => void;
}

const BooksTab: React.FC<BooksTabProps> = ({
  books,
  categories,
  selectedCategory,
  searchTerm,
  onCategorySelect,
  onSearchChange,
  onAddBook,
  onAddCategory,
  onBookSelect,
  onDeleteBook,
  onEditBook,
  onViewCopies,
  onEditCategory,
  onDeleteCategory
}) => {
  const { getBooksInCategory } = useLibrarianDashboardContext();
  const [categoryBooks, setCategoryBooks] = useState<Book[]>([]);
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    if (openMenuId) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openMenuId]);

  const getCategoryBookCount = (categoryId: string) => {
    return books.filter(book => book.categoryId === categoryId).length;
  };

  useEffect(() => {
    const fetchCategoryBooks = async () => {
      if (selectedCategory) {
        setLoadingBooks(true);
        try {
          const apiBooks = await getBooksInCategory(selectedCategory.id);
          setCategoryBooks(apiBooks);
        } catch (error) {
          setCategoryBooks([]);
        } finally {
          setLoadingBooks(false);
        }
      } else {
        setCategoryBooks([]);
      }
    };

    fetchCategoryBooks();
    
    // Auto-refresh every 30 seconds when viewing a category
    const intervalId = selectedCategory ? setInterval(fetchCategoryBooks, 30000) : null;
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [selectedCategory, getBooksInCategory]);

  const filteredBooks = categoryBooks.filter(book => 
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.isbn.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!selectedCategory) {
    return (
      <div style={{ padding: '20px 0' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '15px'
        }}>
          <h3 style={{ color: '#333', margin: 0 }}>Book Categories</h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={onAddBook}
              style={{
                background: '#4A7FA7',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 18px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              <i className="fas fa-plus"></i> Add Book
            </button>
            <button 
              onClick={onAddCategory}
              style={{
                background: 'transparent',
                color: '#4A7FA7',
                border: '2px solid #4A7FA7',
                borderRadius: '8px',
                padding: '8px 16px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              <i className="fas fa-plus"></i> Add Category
            </button>
          </div>
        </div>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '15px'
        }}>
          {categories.map((category) => {
            const bookCount = getCategoryBookCount(category.id);
            return (
              <div 
                key={category.id}
                style={{
                  background: 'white',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  padding: '20px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'transform 0.2s ease',
                  position: 'relative'
                }}
                onClick={() => onCategorySelect(category)}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 10 }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId(openMenuId === category.id ? null : category.id);
                    }}
                    style={{
                      background: 'transparent',
                      color: '#000000',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      fontSize: '18px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '700'
                    }}
                    title="Options"
                  >
                    ⋮
                  </button>
                  {openMenuId === category.id && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      right: '0',
                      background: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      minWidth: '120px',
                      zIndex: 1000,
                      marginTop: '4px'
                    }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(null);
                          onEditCategory(category);
                        }}
                        style={{
                          width: '100%',
                          background: 'transparent',
                          color: '#059669',
                          border: 'none',
                          padding: '10px 16px',
                          fontSize: '14px',
                          cursor: 'pointer',
                          textAlign: 'left',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          borderRadius: '8px 8px 0 0'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = '#f3f4f6'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(null);
                          onDeleteCategory(category.id);
                        }}
                        style={{
                          width: '100%',
                          background: 'transparent',
                          color: '#dc2626',
                          border: 'none',
                          padding: '10px 16px',
                          fontSize: '14px',
                          cursor: 'pointer',
                          textAlign: 'left',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          borderRadius: '0 0 8px 8px'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = '#f3f4f6'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
                
                <div style={{
                  background: '#4A7FA7',
                  borderRadius: '50%',
                  width: '50px',
                  height: '50px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '15px'
                }}>
                  <span style={{
                    fontSize: '1.4rem',
                    color: 'white',
                    fontWeight: 'bold'
                  }}>{
                    (() => {
                      const name = category.name.toLowerCase();
                      if (name.includes('science') || name.includes('biology') || name.includes('physics') || name.includes('chemistry')) return '⚗';
                      if (name.includes('fiction') || name.includes('novel') || name.includes('story')) return '✦';
                      if (name.includes('history') || name.includes('historical')) return '⛩';
                      if (name.includes('programming') || name.includes('computer') || name.includes('tech')) return '⌨';
                      if (name.includes('language') || name.includes('english') || name.includes('grammar')) return '◉';
                      if (name.includes('math') || name.includes('algebra') || name.includes('geometry')) return '∑';
                      if (name.includes('art') || name.includes('design') || name.includes('creative')) return '◈';
                      if (name.includes('music') || name.includes('song')) return '♪';
                      if (name.includes('sport') || name.includes('fitness') || name.includes('health')) return '⚡';
                      if (name.includes('cook') || name.includes('recipe') || name.includes('food')) return '◐';
                      if (name.includes('travel') || name.includes('geography')) return '◯';
                      if (name.includes('business') || name.includes('finance') || name.includes('economy')) return '▲';
                      if (name.includes('philosophy') || name.includes('religion') || name.includes('spiritual')) return '◎';
                      if (name.includes('medical') || name.includes('medicine') || name.includes('doctor')) return '✚';
                      if (name.includes('law') || name.includes('legal') || name.includes('court')) return '⚖';
                      if (name.includes('classic') || name.includes('literature')) return '◈';
                      if (name.includes('children') || name.includes('kids') || name.includes('young')) return '◉';
                      if (name.includes('motivational') || name.includes('self-help') || name.includes('inspiration')) return '◆';
                      if (name.includes('neet') || name.includes('exam') || name.includes('test')) return '◓';
                      return '◐';
                    })()
                  }</span>
                </div>
                
                <h6 style={{
                  color: '#000000',
                  fontWeight: '700',
                  marginBottom: '5px',
                  textTransform: 'capitalize',
                  fontSize: '15px'
                }}>{category.name}</h6>
                
                <p style={{
                  color: '#666',
                  fontSize: '12px',
                  marginBottom: '10px'
                }}>{bookCount} books available</p>
                
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <span style={{
                    background: bookCount > 0 ? '#FEF3C7' : '#f8f9fa',
                    color: bookCount > 0 ? '#D97706' : '#6c757d',
                    borderRadius: '12px',
                    padding: '4px 8px',
                    fontSize: '11px',
                    fontWeight: '600'
                  }}>
                    {bookCount === 0 ? 'Empty' : `${bookCount} Book${bookCount !== 1 ? 's' : ''}`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        
        {categories.length === 0 && (
          <div style={{
            background: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #ddd',
            padding: '40px 20px',
            textAlign: 'center'
          }}>
            <i className="fas fa-folder-open" style={{
              fontSize: '3rem',
              color: '#6c757d',
              marginBottom: '20px'
            }}></i>
            <h5 style={{
              color: '#333',
              marginBottom: '10px'
            }}>No Categories Found</h5>
            <p style={{
              color: '#666',
              marginBottom: '20px'
            }}>Create your first category to organize books.</p>
            <button 
              onClick={onAddCategory}
              style={{
                background: '#4A7FA7',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 18px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              Add Category
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ padding: '20px 0' }}>
      <div style={{ marginBottom: '25px' }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <div>
            <button 
              onClick={() => onCategorySelect(null)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#4A7FA7',
                fontSize: '16px',
                cursor: 'pointer',
                padding: '0',
                marginBottom: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: '600'
              }}
            >
              ← Back
            </button>
            <h3 style={{
              color: '#4A7FA7',
              fontWeight: '700',
              margin: '0'
            }}>{selectedCategory.name} Books</h3>
          </div>
          
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            alignItems: 'center'
          }}>
            <select 
              style={{
                background: 'white',
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '14px',
                minWidth: '120px',
                flex: '0 0 auto'
              }}
            >
              <option value="">All Status</option>
              <option value="available">Available</option>
              <option value="issued">Issued</option>
              <option value="reserved">Reserved</option>
            </select>
            
            <input
              type="text"
              placeholder="Search books..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              style={{
                background: 'white',
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '14px',
                minWidth: '200px',
                flex: '1 1 auto'
              }}
            />
            
            <button 
              onClick={onAddBook}
              style={{
                background: '#4A7FA7',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 18px',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                flex: '0 0 auto',
                whiteSpace: 'nowrap',
                fontWeight: '600'
              }}
            >
              <i className="fas fa-plus"></i> Add Book
            </button>
          </div>
        </div>
      </div>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '15px'
      }}>
        {filteredBooks.map((book) => (
          <div key={book.id}>
            <div style={{
              background: 'white',
              borderRadius: '12px',
              border: '1px solid #ddd',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              fontSize: '0.85rem',
              height: '100%',
              transition: 'all 0.3s ease'
            }} 
            onClick={() => onBookSelect(book)}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
            }}>
              <div style={{ position: 'relative' }}>
                {book.coverImageUrl && book.coverImageUrl.trim() && !book.coverImageUrl.startsWith('blob:') && !book.coverImageUrl.startsWith('data:') ? (
                  <img 
                    src={book.coverImageUrl.startsWith('http') 
                      ? book.coverImageUrl
                      : book.coverImageUrl.startsWith('/') 
                        ? `https://localhost:7020${book.coverImageUrl}` 
                        : book.coverImageUrl
                    } 
                    alt={book.title} 
                    style={{ 
                      width: '100%',
                      height: '150px', 
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
                    height: '150px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#f8f9fa',
                    borderRadius: '12px 12px 0 0',
                    fontSize: '2rem',
                    color: '#6c757d'
                  }}>
                    <i className="fas fa-book"></i>
                  </div>
                )}
                <span style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  background: book.availableCopies > 0 ? '#28a745' : '#dc3545',
                  color: 'white',
                  borderRadius: '12px',
                  padding: '2px 6px',
                  fontSize: '0.6rem',
                  fontWeight: '600'
                }}>
                  {book.availableCopies > 0 ? <i className="fas fa-check"></i> : <i className="fas fa-times"></i>}
                </span>
              </div>
              <div style={{ padding: '12px' }}>
                <h6 style={{
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  marginBottom: '4px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  color: '#333'
                }} title={book.title}>{book.title}</h6>
                <p style={{
                  fontSize: '0.75rem',
                  color: '#666',
                  marginBottom: '8px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>{book.author}</p>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <small style={{
                    fontSize: '0.7rem',
                    color: '#666',
                    fontWeight: '500'
                  }}>{book.availableCopies}/{book.totalCopies}</small>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button 
                      style={{
                        background: '#17a2b8',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '4px 6px',
                        fontSize: '0.7rem',
                        cursor: 'pointer'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewCopies(book);
                      }}
                      title="View Copies"
                    >
                      <i className="fas fa-chart-bar"></i>
                    </button>
                    <button 
                      style={{
                        background: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '4px 6px',
                        fontSize: '0.7rem',
                        cursor: 'pointer'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditBook(book);
                      }}
                      title="Edit Book"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button 
                      style={{
                        background: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '4px 6px',
                        fontSize: '0.7rem',
                        cursor: 'pointer'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteBook(book.id);
                      }}
                      title="Delete Book"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {filteredBooks.length === 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #4A7FA7 0%, #B3CFE5 100%)',
          borderRadius: '20px',
          border: '2px solid #B3CFE5',
          padding: '60px 40px',
          textAlign: 'center',
          boxShadow: '0 10px 30px rgba(74, 127, 167, 0.3)',
          margin: '40px 0'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            width: '120px',
            height: '120px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '30px',
            border: '3px solid rgba(255, 255, 255, 0.3)'
          }}>
            <i className="fas fa-book-open" style={{
              fontSize: '3.5rem',
              color: '#FFFFFF'
            }}></i>
          </div>
          <h4 style={{
            color: '#FFFFFF',
            fontWeight: '700',
            marginBottom: '15px',
            fontSize: '1.8rem'
          }}>No Books Found</h4>
          <p style={{
            color: '#FFFFFF',
            fontSize: '16px',
            marginBottom: '30px',
            lineHeight: '1.6',
            maxWidth: '400px',
            margin: '0 auto 30px'
          }}>
            {searchTerm 
              ? `No books match your search "${searchTerm}" in ${selectedCategory.name} category.`
              : `The ${selectedCategory.name} category is currently empty. Add some books to get started!`
            }
          </p>
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              onClick={onAddBook}
              style={{
                background: '#FFFFFF',
                color: '#4A7FA7',
                border: '2px solid #FFFFFF',
                borderRadius: '25px',
                padding: '12px 25px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#B3CFE5';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = '#FFFFFF';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <i className="fas fa-plus"></i>
              Add First Book
            </button>
            {searchTerm && (
              <button 
                onClick={() => onSearchChange('')}
                style={{
                  background: 'transparent',
                  color: '#FFFFFF',
                  border: '2px solid #FFFFFF',
                  borderRadius: '25px',
                  padding: '12px 25px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <i className="fas fa-times"></i>
                Clear Search
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BooksTab;