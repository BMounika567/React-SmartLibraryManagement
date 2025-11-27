// Styles for Librarian Dashboard Components

export const modalOverlayStyle = {
  position: 'fixed' as const,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000
};

export const modalContentStyle = {
  background: 'white',
  borderRadius: '15px',
  padding: '30px',
  maxWidth: '500px',
  width: '90%',
  maxHeight: '90vh',
  overflowY: 'auto' as const
};

export const modalTitleStyle = {
  color: '#333',
  fontWeight: '600',
  marginBottom: '20px'
};

export const formLabelStyle = {
  color: '#374151',
  fontSize: '14px',
  fontWeight: '600',
  marginBottom: '8px',
  display: 'block'
};

export const inputStyle = {
  background: 'white',
  color: '#333',
  border: '1px solid #ddd',
  borderRadius: '8px',
  padding: '12px 15px',
  fontSize: '14px',
  width: '100%'
};

export const textareaStyle = {
  ...inputStyle,
  resize: 'vertical' as const
};

export const primaryButtonStyle = {
  background: '#4A7FA7',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  padding: '12px 24px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '600'
};

export const secondaryButtonStyle = {
  background: 'transparent',
  color: '#666',
  border: '1px solid #ddd',
  borderRadius: '8px',
  padding: '12px 24px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '600'
};

export const deleteModalBoxStyle = {
  background: 'white',
  borderRadius: '12px',
  padding: '0',
  width: '400px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
  outline: 'none'
};

export const deleteModalHeaderStyle = {
  background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
  color: 'white',
  padding: '24px',
  borderRadius: '12px 12px 0 0',
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  boxShadow: '0 4px 12px rgba(220, 53, 69, 0.3)'
};

export const deleteModalIconContainerStyle = {
  background: 'rgba(255, 255, 255, 0.2)',
  borderRadius: '50%',
  width: '48px',
  height: '48px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backdropFilter: 'blur(10px)'
};

export const deleteModalContentStyle = {
  padding: '24px'
};

export const deleteModalTextStyle = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '1.5',
  margin: '0 0 16px 0'
};

export const muiButtonPrimaryStyle = {
  background: '#4A7FA7',
  color: 'white',
  borderRadius: '8px',
  padding: '10px 20px',
  fontSize: '14px',
  fontWeight: '600',
  textTransform: 'none' as const,
  '&:hover': { background: '#3A6B8A' }
};

export const muiButtonSecondaryStyle = {
  background: '#F3F4F6',
  color: '#374151',
  borderRadius: '8px',
  padding: '10px 20px',
  fontSize: '14px',
  fontWeight: '600',
  textTransform: 'none' as const,
  '&:hover': { background: '#E5E7EB' }
};

export const selectStyle = {
  ...inputStyle
};

export const fileInputStyle = {
  ...inputStyle
};

export const smallTextStyle = {
  color: '#666',
  fontSize: '12px'
};

export const gridTwoColumnsStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '20px',
  marginBottom: '20px'
};

export const fullWidthGridItemStyle = {
  gridColumn: '1 / -1'
};

export const flexEndStyle = {
  display: 'flex',
  gap: '15px',
  justifyContent: 'flex-end'
};

export const disabledButtonStyle = {
  background: '#ccc',
  color: 'white',
  border: 'none',
  borderRadius: '8px',
  padding: '12px 24px',
  cursor: 'not-allowed',
  fontSize: '14px',
  fontWeight: '600'
};

export const requiredAsteriskStyle = {
  color: '#dc3545',
  marginLeft: '4px'
};
