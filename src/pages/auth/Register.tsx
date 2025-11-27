import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../../store';
import { registerUser, clearError } from '../../store/slices/authSlice';
import { toast } from 'react-toastify';
import './AuthLayout.css';

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  libraryCode: string;
  studentId: string;
}

const Register: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    libraryCode: '',
    studentId: '',
  });
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [touched, setTouched] = useState<{[key: string]: boolean}>({});
  
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    // Clear any existing errors when component mounts
    if (error) {
      dispatch(clearError());
    }
  }, [dispatch, error]);

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Please enter your full name.';
        if (value.length < 2) return 'Name must be at least 2 characters.';
        if (!/[a-zA-Z]/.test(value)) return 'Name must contain letters.';
        return '';
      case 'email':
        if (!value.trim()) return 'Please enter your email address.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email address.';
        return '';
      case 'studentId':
        if (!value.trim()) return 'Please enter your student ID.';
        if (value.length < 3) return 'Student ID must be at least 3 characters.';
        return '';
      case 'libraryCode':
        if (!value.trim()) return 'Please enter the library code.';
        if (value.length < 3) return 'Library code must be at least 3 characters.';
        return '';
      case 'password':
        if (!value) return 'Please enter a password.';
        if (value.length < 6) return 'Password must be at least 6 characters.';
        if (!/[A-Z]/.test(value)) return 'Password must contain at least one uppercase letter.';
        if (!/\d/.test(value)) return 'Password must contain at least one number.';
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) return 'Password must contain at least one special character.';
        return '';
      case 'confirmPassword':
        if (!value) return 'Please confirm your password.';
        if (value !== formData.password) return 'Passwords do not match.';
        return '';
      default:
        return '';
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Only validate if field has been touched
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Validate field on blur
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    // Validate all fields
    const fieldErrors: {[key: string]: string} = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key as keyof FormData]);
      if (error) fieldErrors[key] = error;
    });
    
    setErrors(fieldErrors);
    
    // If there are validation errors, don't submit
    if (Object.keys(fieldErrors).length > 0) {
     
      setTouched({
        name: true,
        email: true,
        studentId: true,
        libraryCode: true,
        password: true,
        confirmPassword: true
      });
      return;
    }

    try {
      await dispatch(registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        studentId: formData.studentId,
        libraryCode: formData.libraryCode,
      } as any)).unwrap();
      setShowSuccessModal(true);
    } catch (err: any) {
      toast.error(err.message || 'Registration failed');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-wrapper" style={{ maxWidth: '600px' }}>
        <div className="auth-form-panel">
          <h1 className="auth-title">Smart Library Register</h1>
          
          {error && (
            <div className="alert alert-danger" style={{ marginBottom: '20px' }}>
              {error}
            </div>
          )}
          
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.9)', 
            padding: '10px 15px', 
            borderRadius: '8px', 
            border: '1px solid #E0E0E0',
            marginBottom: '15px',
            textAlign: 'center'
          }}>
            <div style={{ color: '#155446', fontSize: '12px', lineHeight: '1.4' }}>
              Fill out the form to create your library account. Your registration will be reviewed by the administrator.
            </div>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px' }}>
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#155446', fontWeight: '500' }}>
                  Full Name <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="pill-input"
                  required
                />
                {touched.name && errors.name && <div style={{ color: 'red', fontSize: '10px', marginTop: '3px' }}>{errors.name}</div>}
              </div>

              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#155446', fontWeight: '500' }}>
                  Email <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="pill-input"
                  required
                />
                {touched.email && errors.email && <div style={{ color: 'red', fontSize: '10px', marginTop: '3px' }}>{errors.email}</div>}
              </div>

              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#155446', fontWeight: '500' }}>
                  Student ID <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="text"
                  name="studentId"
                  placeholder="Enter your student ID"
                  value={formData.studentId}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="pill-input"
                  required
                />
                {touched.studentId && errors.studentId && <div style={{ color: 'red', fontSize: '10px', marginTop: '3px' }}>{errors.studentId}</div>}
              </div>

              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#155446', fontWeight: '500' }}>
                  Library Code <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="text"
                  name="libraryCode"
                  placeholder="Enter library code"
                  value={formData.libraryCode}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="pill-input"
                  required
                />
                {touched.libraryCode && errors.libraryCode && <div style={{ color: 'red', fontSize: '10px', marginTop: '3px' }}>{errors.libraryCode}</div>}
              </div>

              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#155446', fontWeight: '500' }}>
                  Password <span style={{ color: 'red' }}>*</span>
                </label>
                <div className="password-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="pill-input"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i className={showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'}></i>
                  </button>
                </div>
                {touched.password && errors.password && <div style={{ color: 'red', fontSize: '10px', marginTop: '3px' }}>{errors.password}</div>}
              </div>

              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#155446', fontWeight: '500' }}>
                  Confirm Password <span style={{ color: 'red' }}>*</span>
                </label>
                <div className="password-wrapper">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="pill-input"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <i className={showConfirmPassword ? 'bi bi-eye-slash' : 'bi bi-eye'}></i>
                  </button>
                </div>
                {touched.confirmPassword && errors.confirmPassword && <div style={{ color: 'red', fontSize: '10px', marginTop: '3px' }}>{errors.confirmPassword}</div>}
              </div>
            </div>

            <button 
              type="submit" 
              className="login-btn"
              disabled={loading}
              style={{ marginTop: '15px' }}
            >
              {loading ? 'Creating Account...' : 'Register Now'}
            </button>
          </form>

          <div className="auth-links">
            <span>Already have an account? </span>
            <Link to="/login" className="register-link">
              Login here
            </Link>
          </div>


        </div>
      </div>
      
      {/* Success Modal */}
      {showSuccessModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#F6E9CA',
            padding: '40px',
            borderRadius: '20px',
            border: '2px solid #C69A72',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
            maxWidth: '400px',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '4rem',
              marginBottom: '20px'
            }}>
              ✅
            </div>
            <div style={{
              color: '#13312A',
              fontSize: '24px',
              fontWeight: '700',
              marginBottom: '15px'
            }}>
              Registration Successful!
            </div>
            <div style={{
              color: '#155446',
              fontSize: '16px',
              marginBottom: '25px',
              lineHeight: '1.5'
            }}>
              Your account has been created successfully. <strong>Please wait for admin approval to login.</strong> You will be notified once your account is approved.
            </div>
            <button
              onClick={() => {
                setShowSuccessModal(false);
                navigate('/login');
              }}
              style={{
                background: 'linear-gradient(135deg, #13312A 0%, #155446 100%)',
                color: '#F6E9CA',
                border: '2px solid #C69A72',
                borderRadius: '25px',
                padding: '12px 30px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                transition: 'all 0.3s ease'
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;