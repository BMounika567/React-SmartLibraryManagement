import React, { useState, useEffect } from 'react';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'info';
  theme?: 'library' | 'default';
  showConfirm?: boolean;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  showInput?: boolean;
  inputValue?: string;
  onInputChange?: (value: string) => void;
  inputPlaceholder?: string;
  showAnimation?: boolean;
}

const Dialog = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  theme = 'library',
  showConfirm = false,
  onConfirm,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  showInput = false,
  inputValue = '',
  onInputChange,
  inputPlaceholder = 'Enter text...',
  showAnimation = true
}: DialogProps) => {
  const [localInputValue, setLocalInputValue] = useState(inputValue);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      if (showAnimation) {
        setTimeout(() => setIsVisible(false), 200);
      } else {
        setIsVisible(false);
      }
    }
  }, [isOpen, showAnimation]);

  useEffect(() => {
    setLocalInputValue(inputValue);
  }, [inputValue]);

  if (!isOpen && !isVisible) return null;

  const getTypeColor = () => {
    if (theme === 'library') {
      switch (type) {
        case 'success': return 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
        case 'error': return 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
        default: return 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
      }
    }
    switch (type) {
      case 'success': return 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
      case 'error': return 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
      default: return 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
    }
  };

  const getTypeIcon = () => {
    switch (type) {
      case 'success': 
        return (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" fill="rgba(255,255,255,0.2)"/>
            <path d="M8 12l3 3 5-6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'error': 
        return (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" fill="rgba(255,255,255,0.2)"/>
            <path d="M15 9l-6 6M9 9l6 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      default: 
        return (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" fill="rgba(255,255,255,0.2)"/>
            <path d="M12 8v5M12 16h.01" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        );
    }
  };

  const handleInputConfirm = () => {
    if (showInput && onInputChange) {
      onInputChange(localInputValue);
    }
    onConfirm?.();
    onClose();
  };

  const handleClose = () => {
    if (showAnimation) {
      setIsVisible(false);
      setTimeout(() => onClose(), 200);
    } else {
      onClose();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    // Only close if clicking the backdrop, not the dialog content
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <div 
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        opacity: isVisible ? 1 : 0,
        transition: showAnimation ? 'opacity 0.2s ease' : 'none',
        pointerEvents: 'auto'
      }}>
      <div style={{
        background: 'white',
        borderRadius: '15px',
        padding: '0',
        minWidth: '400px',
        maxWidth: '500px',
        boxShadow: '0 10px 40px rgba(74, 127, 167, 0.3)',
        border: '2px solid rgba(179, 207, 229, 0.3)',
        transform: isVisible ? 'scale(1)' : 'scale(0.9)',
        transition: showAnimation ? 'all 0.2s ease' : 'none'
      }}>
        <div style={{
          background: getTypeColor(),
          color: 'white',
          padding: '24px',
          borderRadius: '15px 15px 0 0',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          boxShadow: type === 'success' ? '0 4px 12px rgba(16, 185, 129, 0.3)' : type === 'error' ? '0 4px 12px rgba(239, 68, 68, 0.3)' : '0 4px 12px rgba(59, 130, 246, 0.3)'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '50%',
            width: '48px',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(10px)'
          }}>{getTypeIcon()}</div>
          <h4 style={{ margin: 0, fontSize: '20px', fontWeight: '700', letterSpacing: '0.5px' }}>{title}</h4>
        </div>

        <div style={{ padding: '30px' }}>
          <p style={{
            color: '#333',
            fontSize: '16px',
            lineHeight: '1.5',
            margin: '0 0 20px 0',
            whiteSpace: 'pre-line',
            fontWeight: '500'
          }}>
            {message}
          </p>

          {showInput && (
            <input
              type="text"
              value={localInputValue}
              onChange={(e) => setLocalInputValue(e.target.value)}
              placeholder={inputPlaceholder}
              autoFocus
              style={{
                width: '100%',
                padding: '12px 15px',
                border: '2px solid #B3CFE5',
                borderRadius: '8px',
                fontSize: '14px',
                marginBottom: '20px',
                outline: 'none',
                backgroundColor: 'white',
                color: '#333'
              }}
            />
          )}

          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end'
          }}>
            {(showConfirm || showInput) && (
              <button
                onClick={showInput ? handleInputConfirm : () => { onConfirm?.(); onClose(); }}
                disabled={showInput && !localInputValue.trim()}
                style={{
                  background: getTypeColor(),
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: showInput && !localInputValue.trim() ? 'not-allowed' : 'pointer',
                  opacity: showInput && !localInputValue.trim() ? 0.5 : 1,
                  transition: 'all 0.2s ease'
                }}
              >
                {confirmText}
              </button>
            )}
            <button
              onClick={handleClose}
              style={{
                background: (showConfirm || showInput) ? '#B3CFE5' : getTypeColor(),
                color: (showConfirm || showInput) ? '#4A7FA7' : 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {(showConfirm || showInput) ? cancelText : 'OK'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dialog;