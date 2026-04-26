/**
 * API CLIENT
 * 
 * This file handles all API calls to the backend
 * Backend URL: http://localhost:5000
 * 
 * Available endpoints:
 * - POST /api/auth/signup
 * - POST /api/auth/login
 * - POST /api/auth/forgot-password
 * - POST /api/auth/verify-otp
 * - POST /api/auth/reset-password
 * - GET /api/auth/profile
 */

// ============================================
// CONFIGURATION
// ============================================
const API_BASE_URL = 'http://localhost:5000/api';
const BACKEND_URL = 'http://localhost:5000';

console.log('🚀 API Client Initialized');
console.log('📍 Backend URL:', BACKEND_URL);
console.log('📍 API Base URL:', API_BASE_URL);

// ============================================
// HELPER FUNCTION: Check Backend Health
// ============================================
async function checkBackendHealth() {
  try {
    console.log('🏥 Checking backend health...');
    const response = await fetch(`${BACKEND_URL}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      timeout: 5000
    });
    
    if (response.ok) {
      console.log('✅ Backend is healthy');
      return true;
    } else {
      console.warn('⚠️ Backend returned status:', response.status);
      return response.status === 200;
    }
  } catch (error) {
    console.error('❌ Backend health check failed:', error.message);
    console.log('⏳ Retrying without health check (will fail if backend is down)...');
    return true; // Allow request to proceed, will fail at API call if backend is down
  }
}

// ============================================
// HELPER FUNCTION: Fetch with error handling
// ============================================
async function apiCall(endpoint, method = 'GET', body = null) {
  try {
    console.log(`📡 API Call: ${method} ${endpoint}`);

    // Check if backend is running
    const healthCheck = await checkBackendHealth();
    if (!healthCheck) {
      const errorMsg = `❌ Backend server is not responding. 
Make sure to:
1. Start MongoDB: mongod
2. Start Backend: cd backend && npm start
3. Keep both running while using the app`;
      
      console.error(errorMsg);
      throw new Error(errorMsg);
    }

    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    // Add token to headers if it exists
    const token = localStorage.getItem('authToken');
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    // Add body if it's POST/PUT/PATCH
    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    
    // Handle non-JSON responses
    let data;
    try {
      data = await response.json();
    } catch (e) {
      data = { message: 'Invalid response from server' };
    }

    if (!response.ok) {
      const errorMessage = data.message || `API Error: ${response.status} ${response.statusText}`;
      console.error('❌ API Error:', errorMessage);
      throw new Error(errorMessage);
    }

    console.log('✅ API Success:', endpoint);
    return data;

  } catch (error) {
    console.error('❌ API Error:', error.message);
    
    // Provide helpful error messages
    if (error.message.includes('Failed to fetch')) {
      throw new Error(`Cannot connect to backend at ${BACKEND_URL}. Make sure:
1. Backend is running (npm start in backend folder)
2. MongoDB is running (mongod)
3. Port 5000 is available`);
    }
    
    throw error;
  }
}

// ============================================
// SIGNUP
// ============================================
async function signup(formData) {
  /**
   * POST /api/auth/signup
   * 
   * Required fields:
   * - name: Full name
   * - address: Address
   * - city: City
   * - contact: 10-digit mobile number
   * - email: Email address
   * - password: Password (min 6 characters)
   * - confirmPassword: Must match password
   */
  return apiCall('/auth/signup', 'POST', formData);
}

// ============================================
// LOGIN
// ============================================
async function login(email, password) {
  /**
   * POST /api/auth/login
   * 
   * Returns:
   * - token: JWT token (save to localStorage)
   * - user: User object with id, name, email
   */
  const response = await apiCall('/auth/login', 'POST', {
    email: email,
    password: password
  });

  // Save token to localStorage for future requests
  if (response.token) {
    localStorage.setItem('authToken', response.token);
    localStorage.setItem('currentUser', JSON.stringify(response.user));
  }

  return response;
}

// ============================================
// FORGOT PASSWORD - SEND OTP
// ============================================
async function forgotPassword(email) {
  /**
   * POST /api/auth/forgot-password
   * 
   * Generates and sends OTP to email
   * OTP expires in 5 minutes
   */
  return apiCall('/auth/forgot-password', 'POST', {
    email: email
  });
}

// ============================================
// VERIFY OTP
// ============================================
async function verifyOTP(email, otp) {
  /**
   * POST /api/auth/verify-otp
   * 
   * Verifies the OTP sent to email
   */
  return apiCall('/auth/verify-otp', 'POST', {
    email: email,
    otp: otp
  });
}

// ============================================
// RESET PASSWORD
// ============================================
async function resetPassword(email, otp, newPassword, confirmPassword) {
  /**
   * POST /api/auth/reset-password
   * 
   * Resets password after OTP verification
   */
  return apiCall('/auth/reset-password', 'POST', {
    email: email,
    otp: otp,
    newPassword: newPassword,
    confirmPassword: confirmPassword
  });
}

// ============================================
// GET USER PROFILE
// ============================================
async function getUserProfile() {
  /**
   * GET /api/auth/profile
   * 
   * Requires: Valid JWT token in localStorage
   */
  return apiCall('/auth/profile', 'GET');
}

// ============================================
// LOGOUT
// ============================================
function logout() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('currentUser');
  console.log('✅ Logged out successfully');
  window.location.href = 'login.html';
}

// ============================================
// UTILITY FUNCTION: Check if user is logged in
// ============================================
function isLoggedIn() {
  return localStorage.getItem('authToken') !== null;
}

// ============================================
// UTILITY FUNCTION: Get current user
// ============================================
function getCurrentUser() {
  const user = localStorage.getItem('currentUser');
  return user ? JSON.parse(user) : null;
}

// ============================================
// UTILITY FUNCTION: Show message
// ============================================
function showMessage(message, type = 'success') {
  /**
   * type: 'success', 'error', 'info', 'warning'
   */
  const msgDiv = document.createElement('div');
  msgDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 20px 25px;
    border-radius: 8px;
    z-index: 99999;
    font-weight: 600;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
    animation: slideIn 0.3s ease;
    max-width: 400px;
    font-size: 14px;
    line-height: 1.5;
    word-wrap: break-word;
    white-space: pre-wrap;
  `;

  const colors = {
    success: { bg: '#d4edda', text: '#155724', border: '#c3e6cb' },
    error: { bg: '#f8d7da', text: '#721c24', border: '#f5c6cb' },
    info: { bg: '#d1ecf1', text: '#0c5460', border: '#bee5eb' },
    warning: { bg: '#fff3cd', text: '#856404', border: '#ffeeba' }
  };

  const color = colors[type] || colors['info'];
  msgDiv.style.backgroundColor = color.bg;
  msgDiv.style.color = color.text;
  msgDiv.style.border = `3px solid ${color.border}`;
  
  // Add icon based on type
  const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    warning: '⚠️'
  };
  
  msgDiv.textContent = (icons[type] || '📌') + ' ' + message;

  document.body.appendChild(msgDiv);

  // Auto remove after 5 seconds
  setTimeout(() => {
    msgDiv.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => msgDiv.remove(), 300);
  }, 5000);

  // Add animation styles if not already added
  if (!document.getElementById('messageAnimations')) {
    const style = document.createElement('style');
    style.id = 'messageAnimations';
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(500px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(500px); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
}

// ============================================
// UTILITY FUNCTION: Validate email
// ============================================
function validateEmail(email) {
  const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return regex.test(email);
}

// ============================================
// UTILITY FUNCTION: Validate phone
// ============================================
function validatePhone(phone) {
  const regex = /^\d{10}$/;
  return regex.test(phone);
}
