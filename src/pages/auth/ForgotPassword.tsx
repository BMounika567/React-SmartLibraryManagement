import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { toast } from 'react-toastify';
import '../../assets/styles/landing-variables.css';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [libraryCode, setLibraryCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !libraryCode) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await axiosClient.post('/api/Profile/reset-password', {
        email,
        libraryCode
      });
      setSent(true);
      toast.success('Password reset email sent if account exists');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div style={{ backgroundColor: 'var(--bg-ivory)', minHeight: '100vh', padding: '40px 20px' }}>
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          <div style={{
            backgroundColor: 'var(--card-white)',
            borderRadius: 'var(--radius)',
            boxShadow: 'var(--shadow-card)',
            padding: '40px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>📧</div>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: 'var(--primary-green)',
              margin: '0 0 16px 0',
              fontFamily: 'Inter'
            }}>
              Check Your Email
            </h2>
            <p style={{
              fontSize: '14px',
              color: 'var(--subtext-gray)',
              margin: '0 0 24px 0',
              fontFamily: 'Inter',
              lineHeight: '1.5'
            }}>
              If an account with that email exists, we've sent you a password reset link.
            </p>
            <Link 
              to="/login"
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                backgroundColor: 'var(--primary-green)',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                fontFamily: 'Inter'
              }}
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'var(--bg-ivory)', minHeight: '100vh', padding: '40px 20px' }}>
      <div style={{ maxWidth: '500px', margin: '0 auto' }}>
        <div style={{
          backgroundColor: 'var(--card-white)',
          borderRadius: 'var(--radius)',
          boxShadow: 'var(--shadow-card)',
          padding: '40px'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: 'var(--primary-green)',
              margin: '0 0 8px 0',
              fontFamily: 'Inter'
            }}>
              Forgot Password?
            </h2>
            <p style={{
              fontSize: '14px',
              color: 'var(--subtext-gray)',
              margin: '0',
              fontFamily: 'Inter'
            }}>
              Enter your email and library code to reset your password
            </p>
          </div>
          
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: 'var(--text-dark)', fontFamily: 'Inter' }}>
                Email *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid var(--line)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'Inter',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: 'var(--text-dark)', fontFamily: 'Inter' }}>
                Library Code *
              </label>
              <input
                type="text"
                value={libraryCode}
                onChange={(e) => setLibraryCode(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid var(--line)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'Inter',
                  outline: 'none'
                }}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px 28px',
                backgroundColor: loading ? 'var(--subtext-gray)' : 'var(--primary-green)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'Inter'
              }}
            >
              {loading ? 'Sending...' : 'Send Reset Email'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <Link 
              to="/login" 
              style={{ 
                color: 'var(--primary-green)', 
                textDecoration: 'none', 
                fontSize: '14px',
                fontWeight: '500',
                fontFamily: 'Inter'
              }}
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;