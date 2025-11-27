import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axiosClient from '../api/axiosClient';
import '../assets/styles/landing-variables.css';

const PasswordReset: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: searchParams.get('email') || '',
    resetToken: searchParams.get('token') || '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!formData.email || !formData.resetToken) {
      navigate('/login');
    }
  }, [formData.email, formData.resetToken, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      await axiosClient.post('/api/Profile/confirm-reset-password', formData);
      toast.success('Password reset successfully! You can now login with your new password.');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error resetting password');
    } finally {
      setLoading(false);
    }
  };

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
              Reset Password
            </h2>
            <p style={{
              fontSize: '14px',
              color: 'var(--subtext-gray)',
              margin: '0',
              fontFamily: 'Inter'
            }}>
              Enter your new password below
            </p>
          </div>
          
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: 'var(--text-dark)', fontFamily: 'Inter' }}>Email</label>
              <input
                type="email"
                value={formData.email}
                disabled
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid var(--line)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: 'Inter',
                  backgroundColor: 'var(--bg-ivory)',
                  color: 'var(--subtext-gray)'
                }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: 'var(--text-dark)', fontFamily: 'Inter' }}>New Password *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                  required
                  minLength={6}
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
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--subtext-gray)'
                  }}
                >
                  <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                </button>
              </div>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: 'var(--text-dark)', fontFamily: 'Inter' }}>Confirm New Password *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  required
                  minLength={6}
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
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--subtext-gray)'
                  }}
                >
                  <i className={`bi ${showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                </button>
              </div>
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
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PasswordReset;