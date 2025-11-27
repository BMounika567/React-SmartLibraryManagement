import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const WelcomePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Mock user data for testing
  const mockUser = user || {
    name: 'Sita B',
    email: 'sita@gmail.com',
    role: 'Member',
    libraryName: 'Smart Library',
    libraryCode: 'LIB001',
    studentId: 'STU123'
  };

  const handleAccessDashboard = () => {
    if (user?.role === 'SuperAdmin') {
      navigate('/super-admin/dashboard');
    } else if (user?.role === 'LibraryAdmin') {
      navigate('/admin/dashboard');
    } else if (user?.role === 'Librarian') {
      navigate('/librarian/dashboard');
    } else {
      navigate('/user/dashboard');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      backgroundImage: 'url(/images/welcomeImage.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '5px 40px',
      margin: '0',
      fontFamily: 'Inter, sans-serif',
      overflow: 'hidden',
      position: 'fixed',
      top: '0',
      left: '0'
    }}>
      <div style={{
        background: 'rgba(0, 0, 0, 0.3)',
        borderRadius: '25px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        padding: '30px 40px',
        maxWidth: '700px',
        width: '90%',
        textAlign: 'center',
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.4)',
        overflow: 'hidden'
      }}>
        {/* Decorative elements */}
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '100px',
          height: '100px',
          background: 'linear-gradient(45deg, #667eea, #764ba2)',
          borderRadius: '50%',
          opacity: '0.1'
        }}></div>
        
        <h1 style={{
          fontSize: '28px',
          fontWeight: '700',
          color: 'rgba(255, 255, 255, 0.98)',
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
          marginBottom: '8px'
        }}>
          Welcome Back!
        </h1>
        
        <p style={{
          color: 'rgba(255, 255, 255, 0.7)',
          fontSize: '16px',
          marginBottom: '20px',
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
        }}>
          Great to see you again! Here are your details:
        </p>

        <div style={{
          textAlign: 'left',
          marginBottom: '25px'
        }}>
          <div className="field-row" style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '8px 0'
          }}>
            <span className="field-label" style={{
              color: 'rgba(255, 255, 255, 0.45)',
              fontWeight: '600',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
            }}>Name:</span>
            <span className="field-value" style={{
              color: 'rgba(255, 255, 255, 0.92)',
              fontWeight: '600',
              fontSize: '16px',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.4)'
            }}>{user?.name || 'N/A'}</span>
          </div>
          
          <div className="field-row" style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '8px 0'
          }}>
            <span className="field-label" style={{
              color: 'rgba(255, 255, 255, 0.45)',
              fontWeight: '600',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
            }}>Email:</span>
            <span className="field-value" style={{
              color: 'rgba(255, 255, 255, 0.92)',
              fontWeight: '600',
              fontSize: '16px',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.4)'
            }}>{user?.email || 'N/A'}</span>
          </div>
          
          <div className="field-row" style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '8px 0'
          }}>
            <span className="field-label" style={{
              color: 'rgba(255, 255, 255, 0.45)',
              fontWeight: '600',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
            }}>Role:</span>
            <span className="field-value strong" style={{
              color: 'rgba(255, 255, 255, 0.98)',
              fontWeight: '600',
              fontSize: '16px',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.4)'
            }}>{user?.role || 'N/A'}</span>
          </div>
          
          <div className="field-row" style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '8px 0'
          }}>
            <span className="field-label" style={{
              color: 'rgba(255, 255, 255, 0.45)',
              fontWeight: '600',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
            }}>Library Name:</span>
            <span className="field-value" style={{
              color: 'rgba(255, 255, 255, 0.92)',
              fontWeight: '600',
              fontSize: '16px',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.4)'
            }}>{user?.libraryName || 'Smart Library'}</span>
          </div>
          
          <div className="field-row" style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '8px 0'
          }}>
            <span className="field-label" style={{
              color: 'rgba(255, 255, 255, 0.45)',
              fontWeight: '600',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
            }}>Library Code:</span>
            <span className="field-value strong" style={{
              color: 'rgba(255, 255, 255, 0.98)',
              fontWeight: '600',
              fontSize: '16px',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.4)'
            }}>{user?.libraryCode || 'N/A'}</span>
          </div>
        </div>

        <button
          onClick={handleAccessDashboard}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            color: 'rgba(255, 255, 255, 0.98)',
            padding: '14px 32px',
            borderRadius: '15px',
            fontSize: '16px',
            fontWeight: '600',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            cursor: 'pointer',
            width: '100%',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.3s ease',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          Access Your Dashboard →
        </button>
      </div>
      
      <style>{`
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
          60% {
            transform: translateY(-5px);
          }
        }
      `}</style>
    </div>
  );
};

export default WelcomePage;