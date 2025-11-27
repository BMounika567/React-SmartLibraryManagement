import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../../store';
import { loginUser, clearError } from '../../store/slices/authSlice';
import { toast } from 'react-toastify';
import './AuthLayout.css';

interface FormData {
  email: string;
  password: string;
  libraryCode: string;
}

const Login: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    libraryCode: '',
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear error when user starts typing
    if (touched[name] && errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Validate on blur
    if (!value.trim()) {
      setErrors(prev => ({ ...prev, [name]: 'This field is required' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors: {[key: string]: string} = {};
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.password.trim()) newErrors.password = 'Password is required';
    if (!formData.libraryCode.trim()) newErrors.libraryCode = 'Library code is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setTouched({ email: true, password: true, libraryCode: true });
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await dispatch(loginUser(formData)).unwrap();
      toast.success('Login successful! Welcome back.');
      navigate('/welcome');
    } catch (err: any) {
      toast.error(err.message || 'Login failed');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-wrapper" style={{ maxWidth: '500px' }}>
        <div className="auth-form-panel">
          <h1 className="auth-title">Smart Library Login</h1>
          
          {error && (
            <div className="alert alert-danger" style={{ marginBottom: '20px' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
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
                style={{
                  borderColor: touched.email && errors.email ? 'red' : undefined
                }}
              />
              {touched.email && errors.email && <div style={{ color: 'red', fontSize: '10px', marginTop: '3px' }}>{errors.email}</div>}
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#155446', fontWeight: '500' }}>
                Password <span style={{ color: 'red' }}>*</span>
              </label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="pill-input"
                  required
                  style={{
                    borderColor: touched.password && errors.password ? 'red' : undefined
                  }}
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
                style={{
                  borderColor: touched.libraryCode && errors.libraryCode ? 'red' : undefined
                }}
              />
              {touched.libraryCode && errors.libraryCode && <div style={{ color: 'red', fontSize: '10px', marginTop: '3px' }}>{errors.libraryCode}</div>}
            </div>

            <button 
              type="submit" 
              className="login-btn"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="auth-links">
            <span>Don't have an account? </span>
            <Link to="/user-register" className="register-link">
              Register Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;