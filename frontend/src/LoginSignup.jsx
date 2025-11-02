import React, { useState, useEffect, useRef } from 'react';
import logo from './assets/logo.png';
import { useNavigate } from 'react-router-dom';
import { authAPI } from './api';

const ZenStudentAuth = () => {
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const firstInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, [isSignUpMode]);

  const showSignUpForm = () => {
    setIsSignUpMode(true);
    clearValidationStates();
  };

  const showSignInForm = () => {
    setIsSignUpMode(false);
    clearValidationStates();
  };

  const clearValidationStates = () => {
    setFieldErrors({});
    setFormData({
      fullName: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  const validateField = (name, value, currentFormData) => {
    let isValid = true;
    let message = '';
    const label = name.charAt(0).toUpperCase() + name.slice(1);

    if (!value.trim()) {
      isValid = false;
      message = `${label} is required`;
    } else {
      switch (name) {
        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            isValid = false;
            message = 'Please enter a valid email address';
          }
          break;
        case 'password':
          if (value.length < 6) {
            isValid = false;
            message = 'Password must be at least 6 characters';
          }
          break;
        case 'confirmPassword':
          if (value !== currentFormData.password) {
            isValid = false;
            message = 'Passwords do not match';
          }
          break;
        case 'fullName':
          if (value.length < 2) {
            isValid = false;
            message = 'Name must be at least 2 characters';
          }
          break;
      }
    }

    if (!isValid) {
      setFieldErrors(prev => ({ ...prev, [name]: message }));
    } else {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    return isValid;
  };

  const handleInputChange = (name, value) => {
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);
    
    if (fieldErrors[name]) {
      validateField(name, value, newFormData);
    }
  };

  const handleInputBlur = (name, value) => {
    validateField(name, value, formData);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    const loginData = {
      email: formData.email,
      password: formData.password
    };

    let allValid = true;
    Object.keys(loginData).forEach(key => {
      if (!validateField(key, loginData[key], formData)) {
        allValid = false;
      }
    });

    if (!allValid) return;

    setIsLoading(true);
    try {
      const response = await authAPI.login(loginData);
      showNotification('Login successful! Redirecting...', 'success');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (error) {
      showNotification(error.message || 'Login failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    
    let allValid = true;
    Object.keys(formData).forEach(key => {
      if (!validateField(key, formData[key], formData)) {
        allValid = false;
      }
    });

    if (!allValid) return;

    setIsLoading(true);
    try {
      await authAPI.register({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password
      });
      
      showNotification('Account created successfully!', 'success');
      setTimeout(() => {
        showSignInForm();
        showNotification('You can now sign in with your new account', 'success');
      }, 1500);
    } catch (error) {
      showNotification(error.message || 'Registration failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const inputFieldClass = (name) => {
    return `input-field ${fieldErrors[name] ? 'error' : ''}`;
  };

  return (
    <div style={{ 
      margin: 0,
      boxSizing: 'border-box',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      backgroundColor: '#f5f5f5',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        padding: '60px 50px',
        borderRadius: '10px',
        boxShadow: '0 2px 20px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '450px',
        textAlign: 'center'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '30px'
        }}>
          <img 
            src={logo} 
            alt="ZenStudent Logo" 
            style={{
              width: '30vw',
              maxWidth: '250px',
              height: 'auto'
            }}
          />
        </div>

        <h1 style={{
          fontSize: '28px',
          color: '#333',
          marginBottom: '40px',
          fontWeight: '400'
        }}>
          Welcome to ZenStudent
        </h1>

        {!isSignUpMode && (
          <div onSubmit={handleLogin} style={{ transition: 'opacity 0.3s ease' }}>
            <div style={{ marginBottom: '25px', textAlign: 'left' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#333',
                fontSize: '14px'
              }}>
                Email
              </label>
              <input
                ref={firstInputRef}
                type="email"
                value={formData.email}
                className={inputFieldClass('email')}
                style={{
                  width: '100%',
                  padding: '12px 0',
                  border: 'none',
                  borderBottom: fieldErrors.email ? '1px solid #dc3545' : '1px solid #ddd',
                  fontSize: '16px',
                  background: 'transparent',
                  transition: 'border-color 0.3s ease',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderBottomColor = '#007bff'}
                onBlur={(e) => {
                  e.target.style.borderBottomColor = fieldErrors.email ? '#dc3545' : '#ddd';
                  handleInputBlur('email', e.target.value);
                }}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
              />
              {fieldErrors.email && (
                <div style={{
                  color: '#dc3545',
                  fontSize: '12px',
                  marginTop: '5px'
                }}>
                  {fieldErrors.email}
                </div>
              )}
            </div>

            <div style={{ marginBottom: '25px', textAlign: 'left' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#333',
                fontSize: '14px'
              }}>
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                className={inputFieldClass('password')}
                style={{
                  width: '100%',
                  padding: '12px 0',
                  border: 'none',
                  borderBottom: fieldErrors.password ? '1px solid #dc3545' : '1px solid #ddd',
                  fontSize: '16px',
                  background: 'transparent',
                  transition: 'border-color 0.3s ease',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderBottomColor = '#007bff'}
                onBlur={(e) => {
                  e.target.style.borderBottomColor = fieldErrors.password ? '#dc3545' : '#ddd';
                  handleInputBlur('password', e.target.value);
                }}
                onChange={(e) => handleInputChange('password', e.target.value)}
                required
              />
              {fieldErrors.password && (
                <div style={{
                  color: '#dc3545',
                  fontSize: '12px',
                  marginTop: '5px'
                }}>
                  {fieldErrors.password}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              onClick={handleLogin}
              style={{
                width: 'auto',
                minWidth: '180px',
                padding: '12px 20px',
                background: isLoading ? 'rgba(0, 123, 255, 0.6)' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '16px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                marginTop: '20px',
                whiteSpace: 'nowrap',
                opacity: isLoading ? 0.6 : 1
              }}
              onMouseOver={(e) => {
                if (!isLoading) {
                  e.target.style.background = '#0056b3';
                }
              }}
              onMouseOut={(e) => {
                if (!isLoading) {
                  e.target.style.background = '#007bff';
                }
              }}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>

            <div style={{ marginTop: '30px', color: '#666' }}>
              <p>
                Don't have an account?{' '}
                <a
                  onClick={showSignUpForm}
                  style={{
                    color: '#007bff',
                    textDecoration: 'none',
                    cursor: 'pointer'
                  }}
                  onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
                  onMouseOut={(e) => e.target.style.textDecoration = 'none'}
                >
                  Sign Up
                </a>
              </p>
            </div>
          </div>
        )}

        {isSignUpMode && (
          <div onSubmit={handleSignUp} style={{ transition: 'opacity 0.3s ease' }}>
            <div style={{ marginBottom: '25px', textAlign: 'left' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#333',
                fontSize: '14px'
              }}>
                Full Name
              </label>
              <input
                ref={firstInputRef}
                type="text"
                value={formData.fullName}
                className={inputFieldClass('fullName')}
                style={{
                  width: '100%',
                  padding: '12px 0',
                  border: 'none',
                  borderBottom: fieldErrors.fullName ? '1px solid #dc3545' : '1px solid #ddd',
                  fontSize: '16px',
                  background: 'transparent',
                  transition: 'border-color 0.3s ease',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderBottomColor = '#007bff'}
                onBlur={(e) => {
                  e.target.style.borderBottomColor = fieldErrors.fullName ? '#dc3545' : '#ddd';
                  handleInputBlur('fullName', e.target.value);
                }}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                required
              />
              {fieldErrors.fullName && (
                <div style={{
                  color: '#dc3545',
                  fontSize: '12px',
                  marginTop: '5px'
                }}>
                  {fieldErrors.fullName}
                </div>
              )}
            </div>

            <div style={{ marginBottom: '25px', textAlign: 'left' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#333',
                fontSize: '14px'
              }}>
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                className={inputFieldClass('email')}
                style={{
                  width: '100%',
                  padding: '12px 0',
                  border: 'none',
                  borderBottom: fieldErrors.email ? '1px solid #dc3545' : '1px solid #ddd',
                  fontSize: '16px',
                  background: 'transparent',
                  transition: 'border-color 0.3s ease',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderBottomColor = '#007bff'}
                onBlur={(e) => {
                  e.target.style.borderBottomColor = fieldErrors.email ? '#dc3545' : '#ddd';
                  handleInputBlur('email', e.target.value);
                }}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
              />
              {fieldErrors.email && (
                <div style={{
                  color: '#dc3545',
                  fontSize: '12px',
                  marginTop: '5px'
                }}>
                  {fieldErrors.email}
                </div>
              )}
            </div>

            <div style={{ marginBottom: '25px', textAlign: 'left' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#333',
                fontSize: '14px'
              }}>
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                className={inputFieldClass('password')}
                style={{
                  width: '100%',
                  padding: '12px 0',
                  border: 'none',
                  borderBottom: fieldErrors.password ? '1px solid #dc3545' : '1px solid #ddd',
                  fontSize: '16px',
                  background: 'transparent',
                  transition: 'border-color 0.3s ease',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderBottomColor = '#007bff'}
                onBlur={(e) => {
                  e.target.style.borderBottomColor = fieldErrors.password ? '#dc3545' : '#ddd';
                  handleInputBlur('password', e.target.value);
                }}
                onChange={(e) => handleInputChange('password', e.target.value)}
                required
              />
              {fieldErrors.password && (
                <div style={{
                  color: '#dc3545',
                  fontSize: '12px',
                  marginTop: '5px'
                }}>
                  {fieldErrors.password}
                </div>
              )}
            </div>

            <div style={{ marginBottom: '25px', textAlign: 'left' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                color: '#333',
                fontSize: '14px'
              }}>
                Confirm Password
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                className={inputFieldClass('confirmPassword')}
                style={{
                  width: '100%',
                  padding: '12px 0',
                  border: 'none',
                  borderBottom: fieldErrors.confirmPassword ? '1px solid #dc3545' : '1px solid #ddd',
                  fontSize: '16px',
                  background: 'transparent',
                  transition: 'border-color 0.3s ease',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderBottomColor = '#007bff'}
                onBlur={(e) => {
                  e.target.style.borderBottomColor = fieldErrors.confirmPassword ? '#dc3545' : '#ddd';
                  handleInputBlur('confirmPassword', e.target.value);
                }}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                required
              />
              {fieldErrors.confirmPassword && (
                <div style={{
                  color: '#dc3545',
                  fontSize: '12px',
                  marginTop: '5px'
                }}>
                  {fieldErrors.confirmPassword}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              onClick={handleSignUp}
              style={{
                width: 'auto',
                minWidth: '180px',
                padding: '12px 20px',
                background: isLoading ? 'rgba(0, 123, 255, 0.6)' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '16px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                marginTop: '20px',
                whiteSpace: 'nowrap',
                opacity: isLoading ? 0.6 : 1
              }}
              onMouseOver={(e) => {
                if (!isLoading) {
                  e.target.style.background = '#0056b3';
                }
              }}
              onMouseOut={(e) => {
                if (!isLoading) {
                  e.target.style.background = '#007bff';
                }
              }}
            >
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </button>

            <div style={{ marginTop: '30px', color: '#666' }}>
              <p>
                Already have an account?{' '}
                <a
                  onClick={showSignInForm}
                  style={{
                    color: '#007bff',
                    textDecoration: 'none',
                    cursor: 'pointer'
                  }}
                  onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
                  onMouseOut={(e) => e.target.style.textDecoration = 'none'}
                >
                  Sign In
                </a>
              </p>
            </div>
          </div>
        )}
      </div>

      <div
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          padding: '15px 25px',
          borderRadius: '5px',
          color: 'white',
          fontWeight: '500',
          zIndex: 1000,
          transform: notification.show ? 'translateX(0)' : 'translateX(400px)',
          transition: 'transform 0.3s ease',
          background: notification.type === 'success' ? '#28a745' : '#dc3545'
        }}
      >
        {notification.message}
      </div>
    </div>
  );
};

export default ZenStudentAuth;