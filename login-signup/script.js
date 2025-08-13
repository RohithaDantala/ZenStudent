// Form switching functionality
function showSignUpForm() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    
    loginForm.classList.add('hidden');
    signupForm.classList.remove('hidden');
    clearValidationStates();
    signupForm.querySelector('.input-field').focus();
}

function showSignInForm() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    
    signupForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
    clearValidationStates();
    loginForm.querySelector('.input-field').focus();
}

function clearValidationStates() {
    document.querySelectorAll('.input-field').forEach(field => {
        field.classList.remove('error');
        field.value = '';
    });
    document.querySelectorAll('.error-message').forEach(msg => {
        msg.style.display = 'none';
    });
}

function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

function validateField(field) {
    const value = field.value.trim();
    const label = field.parentNode.querySelector('.input-label').textContent.toLowerCase();
    const errorMsg = field.parentNode.querySelector('.error-message');
    
    let isValid = true;
    let message = '';

    field.classList.remove('error');
    errorMsg.style.display = 'none';

    if (!value) {
        isValid = false;
        message = `${label.charAt(0).toUpperCase() + label.slice(1)} is required`;
    } else {
        switch (field.type) {
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    isValid = false;
                    message = 'Please enter a valid email address';
                }
                break;
            case 'password':
                if (label.includes('confirm')) {
                    const originalPassword = field.form.querySelector('input[type="password"]:not([class*="confirm"])').value;
                    if (value !== originalPassword) {
                        isValid = false;
                        message = 'Passwords do not match';
                    }
                } else if (value.length < 6) {
                    isValid = false;
                    message = 'Password must be at least 6 characters';
                }
                break;
            case 'text':
                if (label.includes('name') && value.length < 2) {
                    isValid = false;
                    message = 'Name must be at least 2 characters';
                }
                break;
        }
    }

    if (!isValid) {
        field.classList.add('error');
        errorMsg.textContent = message;
        errorMsg.style.display = 'block';
    }

    return isValid;
}

// Real-time validation
document.querySelectorAll('.input-field').forEach(field => {
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', () => {
        if (field.classList.contains('error')) {
            validateField(field);
        }
    });
});

// Login form submission
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const fields = this.querySelectorAll('.input-field');
    let allValid = true;
    
    fields.forEach(field => {
        if (!validateField(field)) {
            allValid = false;
        }
    });
    
    if (!allValid) {
        return;
    }

    const submitBtn = this.querySelector('.submit-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Signing In...';
    
    setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sign In';
        showNotification('Login successful! Redirecting...', 'success');
        
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
    }, 1500);
});

// Signup form submission
document.getElementById('signupForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const fields = this.querySelectorAll('.input-field');
    let allValid = true;
    
    fields.forEach(field => {
        if (!validateField(field)) {
            allValid = false;
        }
    });
    
    if (!allValid) {
        return;
    }

    const submitBtn = this.querySelector('.submit-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating Account...';
    
    setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sign Up';
        showNotification('Account created successfully!', 'success');
        
        setTimeout(() => {
            showSignInForm();
            showNotification('You can now sign in with your new account', 'success');
        }, 1500);
    }, 1500);
});

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('.input-field').focus();
});
