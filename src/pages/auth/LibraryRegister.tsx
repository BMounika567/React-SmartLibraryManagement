import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import '../../assets/styles/landing-variables.css';

// Custom validation functions
const validateLibraryName = (name: string): string => {
  if (!name.trim()) return 'Please enter the library name (2–150 characters).';
  if (name.length < 2 || name.length > 150) return 'Please enter the library name (2–150 characters).';
  if (/^[0-9\W]+$/.test(name)) return 'Please enter the library name (2–150 characters).';
  return '';
};

const validateLibraryCode = (code: string): string => {
  if (!code.trim()) return 'Library code must be 3–30 characters and use letters, numbers, hyphens (-), or underscores (_).';
  if (code.length < 3 || code.length > 30) return 'Library code must be 3–30 characters and use letters, numbers, hyphens (-), or underscores (_).';
  if (!/^[a-zA-Z0-9_-]+$/.test(code)) return 'Library code must be 3–30 characters and use letters, numbers, hyphens (-), or underscores (_).';
  return '';
};

const validatePhone = (phone: string): string => {
  if (!phone.trim()) return '';
  if (!/^\d{7,15}$/.test(phone)) return 'Enter a valid phone number (7–15 digits, numbers only).';
  return '';
};

const validateAdminName = (name: string): string => {
  if (!name.trim()) return 'Please enter the admin\'s full name.';
  if (name.length < 2) return 'Please enter the admin\'s full name.';
  if (!/[a-zA-Z]/.test(name)) return 'Please enter the admin\'s full name.';
  return '';
};

const validateAdminEmail = (email: string): string => {
  if (!email.trim()) return 'Enter a valid admin email (e.g. admin@example.com).';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid admin email (e.g. admin@example.com).';
  return '';
};

const validatePassword = (password: string): string => {
  if (!password) return 'Password must include at least one uppercase letter, one number, and one special symbol.';
  if (!/[A-Z]/.test(password)) return 'Password must include at least one uppercase letter, one number, and one special symbol.';
  if (!/\d/.test(password)) return 'Password must include at least one uppercase letter, one number, and one special symbol.';
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return 'Password must include at least one uppercase letter, one number, and one special symbol.';
  return '';
};

const validateConfirmPassword = (password: string, confirmPassword: string): string => {
  if (!confirmPassword) return 'Passwords do not match.';
  if (password !== confirmPassword) return 'Passwords do not match.';
  return '';
};

const validateAddress = (address: string): string => {
  if (!address.trim()) return 'Please enter the library address (5–200 characters).';
  if (address.length < 5 || address.length > 200) return 'Please enter the library address (5–200 characters).';
  if (!/[a-zA-Z]/.test(address)) return 'Please enter the library address (5–200 characters).';
  if (!/^[a-zA-Z0-9\s,.\-/#]+$/.test(address)) return 'Please enter the library address (5–200 characters).';
  return '';
};

const validateLogo = (file: File | null): string => {
  if (!file) return '';
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml'];
  if (!allowedTypes.includes(file.type)) return 'Please upload a valid image file (JPG, PNG, or SVG — max 5MB).';
  if (file.size > 5 * 1024 * 1024) return 'Please upload a valid image file (JPG, PNG, or SVG — max 5MB).';
  return '';
};

const LibraryRegister: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    libraryName: '',
    libraryCode: '',
    address: '',
    phone: '',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    confirmPassword: '',
    description: ''
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const validateField = (name: string, value: string | File | null) => {
    let error = '';
    switch (name) {
      case 'libraryName':
        error = validateLibraryName(value as string);
        break;
      case 'libraryCode':
        error = validateLibraryCode(value as string);
        break;
      case 'address':
        error = validateAddress(value as string);
        break;
      case 'phone':
        error = validatePhone(value as string);
        break;
      case 'adminName':
        error = validateAdminName(value as string);
        break;
      case 'adminEmail':
        error = validateAdminEmail(value as string);
        break;
      case 'adminPassword':
        error = validatePassword(value as string);
        break;
      case 'confirmPassword':
        error = validateConfirmPassword(formData.adminPassword, value as string);
        break;
      case 'logoFile':
        error = validateLogo(value as File);
        break;
    }
    setErrors(prev => ({ ...prev, [name]: error }));
    return error === '';
  };

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const error = validateLogo(file);
      if (error) {
        setErrors(prev => ({ ...prev, logoFile: error }));
        return;
      }
      
      setLogoFile(file);
      setErrors(prev => ({ ...prev, logoFile: '' }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const validations = [
      validateField('libraryName', formData.libraryName),
      validateField('libraryCode', formData.libraryCode),
      validateField('address', formData.address),
      validateField('phone', formData.phone),
      validateField('adminName', formData.adminName),
      validateField('adminEmail', formData.adminEmail),
      validateField('adminPassword', formData.adminPassword),
      validateField('confirmPassword', formData.confirmPassword),
      validateField('logoFile', logoFile)
    ];
    
    if (!isAuthorized) {
      setErrors(prev => ({ ...prev, authorization: 'Please confirm that you are authorized to register this library.' }));
      return;
    }
    
    if (!validations.every(Boolean)) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('libraryName', formData.libraryName);
      submitData.append('libraryCode', formData.libraryCode);
      submitData.append('address', formData.address);
      submitData.append('phone', formData.phone);
      submitData.append('adminName', formData.adminName);
      submitData.append('adminEmail', formData.adminEmail);
      submitData.append('adminPassword', formData.adminPassword);
      submitData.append('description', formData.description);
      
      if (logoFile) {
        submitData.append('logoFile', logoFile);
      }
      
      await axiosClient.post('/api/LibraryRegistration/submit', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setShowSuccessModal(true);
    } catch (error: any) {
      alert('Registration failed: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div style={{ backgroundColor: 'var(--bg-ivory)', minHeight: '100vh', padding: '40px 20px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{
            backgroundColor: 'var(--card-white)',
            borderRadius: 'var(--radius)',
            boxShadow: 'var(--shadow-card)',
            padding: '40px'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h2 style={{
                fontSize: '32px',
                fontWeight: '700',
                color: 'var(--primary-green)',
                margin: '0 0 12px 0',
                fontFamily: 'Inter'
              }}>
                🏛️ Register New Library
              </h2>
              <p style={{
                fontSize: '16px',
                color: 'var(--subtext-gray)',
                margin: '0',
                fontFamily: 'Inter'
              }}>
                Create your library management account
              </p>
            </div>
                
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-12 mb-3">
                      <h5 className="text-secondary">Library Information</h5>
                    </div>
                    
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Library Name *</label>
                      <input
                        type="text"
                        className={`form-control ${errors.libraryName ? 'is-invalid' : ''}`}
                        value={formData.libraryName}
                        onChange={(e) => handleInputChange('libraryName', e.target.value)}
                        maxLength={150}
                        required
                      />
                      {errors.libraryName && <div className="invalid-feedback">{errors.libraryName}</div>}
                    </div>
                    
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Library Code *</label>
                      <input
                        type="text"
                        className={`form-control ${errors.libraryCode ? 'is-invalid' : ''}`}
                        value={formData.libraryCode}
                        onChange={(e) => handleInputChange('libraryCode', e.target.value)}
                        maxLength={30}
                        placeholder="e.g. citylib01, greenwood_lib"
                        required
                      />
                      {errors.libraryCode && <div className="invalid-feedback">{errors.libraryCode}</div>}
                      <small className="text-muted">A unique ID for your library (letters, numbers, hyphens, underscores only)</small>
                    </div>
                    
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Address *</label>
                      <input
                        type="text"
                        className={`form-control ${errors.address ? 'is-invalid' : ''}`}
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        maxLength={200}
                        placeholder="123 Main St, City, State"
                        required
                      />
                      {errors.address && <div className="invalid-feedback">{errors.address}</div>}
                      <small className="text-muted">5-200 characters, letters/numbers/spaces/commas/periods/hyphens/#</small>
                    </div>
                    
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Phone</label>
                      <input
                        type="tel"
                        className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value.replace(/\D/g, ''))}
                        maxLength={15}
                        placeholder="9847512345"
                      />
                      {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
                      <small className="text-muted">7-15 digits, numbers only</small>
                    </div>
                    
                    <div className="col-12 mb-3">
                      <label className="form-label">Description</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        maxLength={500}
                        placeholder="Brief description of your library"
                      />
                    </div>
                    
                    <div className="col-12 mb-3">
                      <label className="form-label">Library Logo</label>
                      <input
                        type="file"
                        className={`form-control ${errors.logoFile ? 'is-invalid' : ''}`}
                        accept="image/jpeg,image/jpg,image/png,image/svg+xml"
                        onChange={handleLogoChange}
                      />
                      {errors.logoFile && <div className="invalid-feedback">{errors.logoFile}</div>}
                      <small className="text-muted">Upload JPG, PNG, or SVG - Max 5MB</small>
                      
                      {logoPreview && (
                        <div className="mt-3 text-center">
                          <img 
                            src={logoPreview} 
                            alt="Logo Preview" 
                            className="img-thumbnail"
                            style={{ maxWidth: '200px', maxHeight: '150px' }}
                          />
                          <p className="text-muted mt-2">Logo Preview</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="col-12 mb-3 mt-3">
                      <h5 className="text-secondary">Admin Account</h5>
                    </div>
                    
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Admin Name *</label>
                      <input
                        type="text"
                        className={`form-control ${errors.adminName ? 'is-invalid' : ''}`}
                        value={formData.adminName}
                        onChange={(e) => handleInputChange('adminName', e.target.value)}
                        required
                      />
                      {errors.adminName && <div className="invalid-feedback">{errors.adminName}</div>}
                    </div>
                    
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Admin Email *</label>
                      <input
                        type="email"
                        className={`form-control ${errors.adminEmail ? 'is-invalid' : ''}`}
                        value={formData.adminEmail}
                        onChange={(e) => handleInputChange('adminEmail', e.target.value)}
                        placeholder="admin@example.com"
                        required
                      />
                      {errors.adminEmail && <div className="invalid-feedback">{errors.adminEmail}</div>}
                    </div>
                    
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Password *</label>
                      <div className="position-relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          className={`form-control ${errors.adminPassword ? 'is-invalid' : ''}`}
                          value={formData.adminPassword}
                          onChange={(e) => handleInputChange('adminPassword', e.target.value)}
                          placeholder="Admin@1"
                          required
                        />
                        <button
                          type="button"
                          className="btn btn-link position-absolute end-0 top-50 translate-middle-y pe-3"
                          onClick={() => setShowPassword(!showPassword)}
                          style={{ border: 'none', background: 'none', zIndex: 10 }}
                        >
                          <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                        </button>
                      </div>
                      {errors.adminPassword && <div className="invalid-feedback">{errors.adminPassword}</div>}
                      <small className="text-muted">Must include: 1 uppercase, 1 number, 1 special symbol</small>
                    </div>
                    
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Confirm Password *</label>
                      <div className="position-relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          className="btn btn-link position-absolute end-0 top-50 translate-middle-y pe-3"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          style={{ border: 'none', background: 'none', zIndex: 10 }}
                        >
                          <i className={`bi ${showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                        </button>
                      </div>
                      {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
                    </div>
                  </div>
                  
                  <div className="col-12 mb-3">
                    <div className="form-check">
                      <input
                        className={`form-check-input ${errors.authorization ? 'is-invalid' : ''}`}
                        type="checkbox"
                        id="authorization"
                        checked={isAuthorized}
                        onChange={(e) => {
                          setIsAuthorized(e.target.checked);
                          if (e.target.checked) {
                            setErrors(prev => ({ ...prev, authorization: '' }));
                          }
                        }}
                        required
                      />
                      <label className="form-check-label" htmlFor="authorization">
                        I confirm that I am authorized to register this library and create an admin account.
                      </label>
                      {errors.authorization && <div className="invalid-feedback d-block">{errors.authorization}</div>}
                    </div>
                  </div>
                  
            <button 
              type="submit" 
              className="btn-hover focus-ring"
              disabled={loading}
              style={{
                backgroundColor: 'var(--primary-green)',
                color: 'white',
                padding: '14px 28px',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                width: '100%',
                marginBottom: '20px',
                fontFamily: 'Inter'
              }}
            >
              {loading ? 'Registering...' : 'Register Library'}
            </button>
          </form>
          
          <div style={{ textAlign: 'center' }}>
            <button 
              onClick={() => navigate('/')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary-green)',
                fontSize: '15px',
                cursor: 'pointer',
                textDecoration: 'none',
                fontFamily: 'Inter'
              }}
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
    
    {/* Success Modal */}
    {showSuccessModal && (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: 'var(--card-white)',
          borderRadius: 'var(--radius)',
          padding: '40px',
          maxWidth: '500px',
          width: '90%',
          textAlign: 'center',
          boxShadow: 'var(--shadow-hero)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>✓</div>
          <h3 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: 'var(--primary-green)',
            margin: '0 0 16px 0',
            fontFamily: 'Inter'
          }}>
            Library Registration Submitted!
          </h3>
          <p style={{
            fontSize: '16px',
            color: 'var(--subtext-gray)',
            margin: '0 0 24px 0',
            lineHeight: '1.5',
            fontFamily: 'Inter'
          }}>
            Your library registration has been submitted successfully. <strong>Please wait for Super Admin approval.</strong> You will be notified via email once your library is approved and you can login.
          </p>
          <button
            onClick={() => {
              setShowSuccessModal(false);
              navigate('/');
            }}
            style={{
              backgroundColor: 'var(--primary-green)',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'Inter'
            }}
          >
            OK
          </button>
        </div>
      </div>
    )}
  </>
  );
};

export default LibraryRegister;