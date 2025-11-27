import React from 'react';

interface ReviewsTabProps {
  borrowedBooks: any[];
  userReviews: any[];
  onWriteReview: (book: any) => void;
  onRefreshReviews: () => void;
}

const ReviewsTab: React.FC<ReviewsTabProps> = ({ 
  borrowedBooks, 
  userReviews, 
  onWriteReview,
  onRefreshReviews
}) => {
  const returnedBooks = borrowedBooks.filter(b => b.status === 'Returned');

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
            <i className="bi bi-star-fill" style={{ color: '#FFD700' }}></i>
            Reviews & Ratings
          </h3>
          <p style={{
            color: '#000000',
            margin: '5px 0 0 0',
            fontSize: '14px'
          }}>Share your thoughts on books you've read</p>
        </div>
        <button 
          onClick={onRefreshReviews}
          style={{
            background: '#C69A72',
            color: '#13312A',
            border: 'none',
            borderRadius: '10px',
            padding: '12px 20px',
            fontSize: '14px',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
          <i className="bi bi-arrow-clockwise"></i>
          Refresh Reviews
        </button>
      </div>
      

      
      {/* Recent Books to Review */}
      <div style={{
        background: '#155446',
        borderRadius: '15px',
        border: '1px solid #C69A72',
        overflow: 'hidden'
      }}>
        <div style={{
          background: 'rgba(198, 154, 114, 0.2)',
          padding: '20px',
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
            <i className="bi bi-book-half"></i>
            Books You Can Review ({returnedBooks.length})
          </h5>
        </div>
        <div style={{ padding: '20px' }}>
          {returnedBooks.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {returnedBooks.map((book) => (
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
                    <i className="bi bi-book"></i>
                  </div>
                  
                  <div style={{ flex: 1, minWidth: 0 }}>
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
                    <span style={{
                      background: '#155446',
                      color: '#F6E9CA',
                      padding: '2px 6px',
                      borderRadius: '6px',
                      fontSize: '10px',
                      fontWeight: '500',
                      marginTop: '4px',
                      display: 'inline-block'
                    }}>Returned</span>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    flexShrink: 0
                  }}>
                    {(() => {
                      const hasReviewed = userReviews.some(review => review.bookId === book.bookId);
                      return hasReviewed ? (
                        <button disabled style={{
                          background: '#155446',
                          color: '#C69A72',
                          border: '1px solid #C69A72',
                          borderRadius: '8px',
                          padding: '8px 16px',
                          fontSize: '12px',
                          cursor: 'not-allowed',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          <i className="bi bi-check-circle"></i>
                          Already Reviewed
                        </button>
                      ) : (
                        <button 
                          onClick={() => onWriteReview(book)}
                          style={{
                            background: '#C69A72',
                            color: '#13312A',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '8px 16px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <i className="bi bi-star"></i>
                          Write Review
                        </button>
                      );
                    })()}
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
                <i className="bi bi-book"></i>
              </div>
              <h6 style={{
                color: '#000000',
                fontWeight: '700',
                marginBottom: '8px'
              }}>No books to review</h6>
              <p style={{
                color: '#000000',
                margin: '0',
                fontSize: '14px'
              }}>Return some borrowed books to start writing reviews</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewsTab;