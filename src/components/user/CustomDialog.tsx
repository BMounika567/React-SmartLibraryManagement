import React from 'react';

interface CustomDialogProps {
  show: boolean;
  config: {
    title: string;
    message: string;
    type: 'success' | 'error' | 'confirm';
    onConfirm?: () => void;
  };
  onClose: () => void;
}

const CustomDialog: React.FC<CustomDialogProps> = ({ show, config, onClose }) => {
  if (!show) return null;

  const handleConfirm = () => {
    onClose();
    config.onConfirm?.();
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
      zIndex: 2000,
      backdropFilter: 'blur(5px)'
    }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: '15px',
        border: `2px solid ${config.type === 'success' ? '#155446' : config.type === 'error' ? '#C69A72' : '#155446'}`,
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
          background: config.type === 'success' ? '#155446' : config.type === 'error' ? '#C69A72' : '#155446',
          borderRadius: '13px 13px 0 0'
        }}>
          <div style={{
            fontSize: '20px',
            color: config.type === 'error' ? '#13312A' : '#F6E9CA'
          }}>
            {config.type === 'success' ? '✅' : config.type === 'error' ? '⚠️' : '❓'}
          </div>
          <h5 style={{
            color: config.type === 'error' ? '#13312A' : '#F6E9CA',
            fontWeight: '600',
            margin: 0
          }}>{config.title}</h5>
        </div>
        
        <div style={{ padding: '20px' }}>
          <p style={{
            color: '#000000',
            margin: 0,
            lineHeight: '1.5',
            whiteSpace: 'pre-line'
          }}>{config.message}</p>
        </div>
        
        <div style={{
          padding: '20px',
          borderTop: '1px solid #155446',
          display: 'flex',
          gap: '10px',
          justifyContent: 'flex-end'
        }}>
          {config.type === 'confirm' ? (
            <>
              <button 
                onClick={onClose}
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
                onClick={handleConfirm}
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
              onClick={onClose}
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
  );
};

export default CustomDialog;