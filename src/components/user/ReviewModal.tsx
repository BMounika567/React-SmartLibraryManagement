import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import axiosClient from '../../api/axiosClient';

interface ReviewModalProps {
  show: boolean;
  onClose: () => void;
  reviewBook: any;
  books: any[];
  onSuccess: () => void;
  onError: (message: string) => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ 
  show, 
  onClose, 
  reviewBook, 
  books, 
  onSuccess, 
  onError 
}) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  if (!show || !reviewBook) return null;

  const handleSubmit = async () => {
    if (rating === 0) {
      onError('Please select a rating before submitting your review.');
      return;
    }
    
    try {
      const foundBook = books.find(b => b.title === reviewBook.bookTitle);
      const bookId = foundBook?.id;
      
      if (!bookId) {
        onError('Book not found in catalog. Please try again.');
        return;
      }
      
      const reviewData = {
        bookId: bookId,
        userId: (user as any)?.id || (user as any)?.userId,
        rating: rating,
        comment: comment.trim() || null
      };
      
      await axiosClient.post('/api/Review/create', reviewData);
      
      onClose();
      setRating(0);
      setComment('');
      onSuccess();
    } catch (error: any) {
      onError('Failed to submit review: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
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
      zIndex: 1000,
      backdropFilter: 'blur(5px)'
    }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: '12px',
        border: '2px solid #000000',
        maxWidth: '450px',
        width: '90%',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '15px 20px',
          borderBottom: '1px solid #155446',
          background: 'linear-gradient(135deg, #155446 0%, #13312A 100%)'
        }}>
          <h4 style={{
            color: '#F6E9CA',
            fontWeight: '600',
            margin: '0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '16px'
          }}>
            <i className="bi bi-star-fill" style={{ color: '#FFD700' }}></i>
            Write Review
          </h4>
          <p style={{
            color: '#C69A72',
            margin: '4px 0 0 0',
            fontSize: '13px'
          }}>Share your thoughts about "{reviewBook.bookTitle}"</p>
        </div>
        
        <div style={{ padding: '20px' }}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{
              color: '#000000',
              fontSize: '13px',
              fontWeight: '600',
              marginBottom: '8px',
              display: 'block'
            }}>Rating *</label>
            <div style={{ display: 'flex', gap: '5px' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '22px',
                    color: star <= rating ? '#FFD700' : '#CCCCCC',
                    cursor: 'pointer',
                    transition: 'color 0.2s ease'
                  }}
                >
                  <i className="bi bi-star-fill"></i>
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label style={{
              color: '#000000',
              fontSize: '13px',
              fontWeight: '600',
              marginBottom: '8px',
              display: 'block'
            }}>Review Comment (Optional)</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your thoughts about this book..."
              maxLength={500}
              style={{
                width: '100%',
                height: '80px',
                background: '#FFFFFF',
                border: '2px solid #000000',
                borderRadius: '8px',
                padding: '10px',
                color: '#000000',
                fontSize: '13px',
                resize: 'vertical',
                fontFamily: 'Inter, sans-serif'
              }}
            />
          </div>
        </div>
        
        <div style={{
          padding: '15px 20px',
          borderTop: '1px solid #155446',
          display: 'flex',
          gap: '10px',
          justifyContent: 'flex-end',
          background: 'rgba(21, 84, 70, 0.2)'
        }}>
          <button 
            onClick={onClose}
            style={{
              background: 'transparent',
              color: '#C69A72',
              border: '1px solid #C69A72',
              borderRadius: '8px',
              padding: '10px 16px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '600'
            }}
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={rating === 0}
            style={{
              background: rating === 0 ? '#155446' : '#C69A72',
              color: rating === 0 ? '#C69A72' : '#13312A',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 16px',
              cursor: rating === 0 ? 'not-allowed' : 'pointer',
              fontSize: '13px',
              fontWeight: '600'
            }}
          >
            Submit Review
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;