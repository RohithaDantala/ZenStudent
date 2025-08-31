import React, { useState } from 'react';
import './AuthPage.css';

const AuthPage = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [loading, setLoading] = useState(false);

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  const validateField = (name, value) => {
    let error = '';
    
    if (!value.trim()) {
      error = `${name.charAt(0).toUpperCase() + name.slice(1)} is required`;
    } else {
      switch (name) {
        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            error = 'Please enter a valid email address';
          }
          break;
        case 'password':
          if (value.length < 6) {
            error = 'Password must be at least 6 characters';
          }
          break;
        case 'confirmPassword':
          if (value !== formData.password) {
            error = 'Passwords do not match';
          }
          break;
        case 'fullName':
          if (value.length < 2) {
            error = 'Name must be at least 2 characters';
          }
          break;
      }
    }
    
    return error;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error if field was previously invalid
    if (errors[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleInputBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = () => {
    // Validate all fields
    const newErrors = {};
    const fieldsToValidate = isSignup 
      ? ['fullName', 'email', 'password', 'confirmPassword']
      : ['email', 'password'];
    
    fieldsToValidate.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    
    setTimeout(() => {
      setLoading(false);
      
      if (isSignup) {
        showNotification('Account created successfully!', 'success');
        setTimeout(() => {
          setIsSignup(false);
          setFormData({ fullName: '', email: '', password: '', confirmPassword: '' });
          showNotification('You can now sign in with your new account', 'success');
        }, 1500);
      } else {
        showNotification('Login successful! Redirecting...', 'success');
        setTimeout(() => {
          // Here you would typically redirect to dashboard
          showNotification('Welcome to ZenStudent Dashboard!', 'success');
        }, 1500);
      }
    }, 1500);
  };

  const switchForm = () => {
    setIsSignup(!isSignup);
    setFormData({ fullName: '', email: '', password: '', confirmPassword: '' });
    setErrors({});
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Logo */}
        <div className="logo-container">
          <div className="logo-placeholder">ZenStudent</div>
        </div>

        {/* Welcome Title */}
        <h1 className="welcome-title">Welcome to ZenStudent</h1>

        {/* Form */}
        <div className={`form ${isSignup ? '' : 'hidden-signup'}`}>
          {isSignup && (
            <div className="input-group">
              <label className="input-label">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                className={`input-field ${errors.fullName ? 'error' : ''}`}
                required
              />
              {errors.fullName && (
                <div className="error-message">{errors.fullName}</div>
              )}
            </div>
          )}

          <div className="input-group">
            <label className="input-label">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              className={`input-field ${errors.email ? 'error' : ''}`}
              required
            />
            {errors.email && (
              <div className="error-message">{errors.email}</div>
            )}
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              className={`input-field ${errors.password ? 'error' : ''}`}
              required
            />
            {errors.password && (
              <div className="error-message">{errors.password}</div>
            )}
          </div>

          {isSignup && (
            <div className="input-group">
              <label className="input-label">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                className={`input-field ${errors.confirmPassword ? 'error' : ''}`}
                required
              />
              {errors.confirmPassword && (
                <div className="error-message">{errors.confirmPassword}</div>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="submit-btn"
          >
            {loading 
              ? (isSignup ? 'Creating Account...' : 'Signing In...') 
              : (isSignup ? 'Sign Up' : 'Sign In')
            }
          </button>

          <div className="form-switch">
            <p>
              {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
              <a onClick={switchForm}>
                {isSignup ? 'Sign In' : 'Sign Up'}
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Notification */}
      <div id="notification" className={`notification ${notification.type} ${notification.show ? 'show' : ''}`}>
        {notification.message}
      </div>
    </div>
  );
};

export default AuthPage;