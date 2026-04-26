# Frontend Setup & Integration Guide

## Overview

This guide will help you set up and run the frontend with the backend API integration.

## Project Structure

```
pro/
├── index.html                  (Home page)
├── login.html                  (Login page - with API integration)
├── form.html                   (Signup/Registration page - with API integration)
├── forgot-password.html        (Forgot Password flow - with API integration)
├── api-client.js              (API client library for all backend calls)
├── about.html
├── contactus.html
├── yojana.html
└── backend/
    ├── server.js              (Backend server running on http://localhost:5000)
    ├── routes/auth.js         (Authentication routes)
    ├── models/User.js         (User database model)
    ├── middleware/authmiddleware.js
    └── ... other files
```

## Prerequisites

### Backend

- Node.js installed
- MongoDB running locally
- `.env` file configured in backend folder with:
  ```
  MONGO_URI=mongodb://localhost:27017/crop_app
  JWT_SECRET=your_secret_key_here
  PORT=5000
  ```

### Frontend

- Any modern web browser (Chrome, Firefox, Safari, Edge)
- A text editor (VS Code recommended)

---

## HOW TO RUN

### Step 1: Start the Backend Server

```bash
cd backend
npm install  # Install dependencies if not already done
npm start    # Start the server on http://localhost:5000
```

You should see:

```
✅ Server Status: RUNNING
🚀 Server URL: http://localhost:5000
📍 API Base URL: http://localhost:5000/api/auth
```

### Step 2: Serve the Frontend

You have 2 options:

#### **Option A: Using VS Code Live Server (Recommended)**

1. Install **Live Server** extension in VS Code
2. Right-click on `index.html`
3. Click "Open with Live Server"
4. Frontend will open on `http://127.0.0.1:5500`

#### **Option B: Using Python's Simple HTTP Server**

```bash
# In the project root directory (where index.html is)
python -m http.server 8000
```

Then open: `http://localhost:8000`

#### **Option C: Using Node.js HTTP Server**

```bash
npm install -g http-server
http-server
```

---

## API Integration

All API calls are handled by **`api-client.js`**. It provides these functions:

### Authentication Endpoints

#### **1. Signup**

```javascript
const response = await signup({
  name: "John Farmer",
  address: "123 Village Lane",
  city: "Mumbai",
  contact: "9876543210",
  email: "john@example.com",
  password: "password123",
  confirmPassword: "password123",
});
```

#### **2. Login**

```javascript
const response = await login("john@example.com", "password123");
// Returns token and user data
// Token is automatically saved to localStorage
```

#### **3. Forgot Password**

```javascript
const response = await forgotPassword("john@example.com");
// OTP is sent (logged to console in development)
```

#### **4. Verify OTP**

```javascript
const response = await verifyOTP("john@example.com", "123456");
```

#### **5. Reset Password**

```javascript
const response = await resetPassword(
  "john@example.com",
  "123456",
  "newPassword123",
  "newPassword123",
);
```

#### **6. Get Current User Profile**

```javascript
const response = await getUserProfile();
// Requires valid JWT token in localStorage
```

---

## Features Implemented

### ✅ Login Page (`login.html`)

- Email and password fields
- Form validation
- API integration with `/api/auth/login`
- "Forgot Password?" link
- "Create new account" link
- Success/error messages
- Auto-redirect to home on successful login
- Prevents logged-in users from accessing login page

### ✅ Signup Page (`form.html`)

- Full Name, Address, City, Contact, Email, Password fields
- Form validation (email format, phone number, password match)
- API integration with `/api/auth/signup`
- Multi-language support (English, Marathi, Hindi, Tamil)
- Success/error messages
- Auto-redirect to login after successful signup
- Link to login page if already have account
- Prevents logged-in users from accessing signup page

### ✅ Forgot Password Page (`forgot-password.html`)

- **Step 1**: Enter email → Send OTP
- **Step 2**: Enter 6-digit OTP → Verify
- **Step 3**: Enter new password → Reset
- OTP auto-expires after 5 minutes
- Interactive OTP input boxes (auto-move to next box)
- Arrow key navigation for OTP inputs
- Backspace support for OTP correction
- Change email option if needed
- Success confirmation screen
- All validation and error handling

### ✅ API Client (`api-client.js`)

- Centralized API communication
- Automatic JWT token handling
- Error handling and user-friendly messages
- Toast/notification system
- Email and phone validation utilities
- Logout functionality
- Check if user is logged in

---

## Testing the Application

### Test Signup

1. Open `http://localhost:8000/form.html`
2. Fill in all fields:
   - Name: "Test Farmer"
   - Address: "123 Test Lane"
   - City: "Test City"
   - Contact: "9876543210"
   - Email: "test@example.com"
   - Password: "password123"
   - Confirm: "password123"
3. Click "Create Account"
4. Should see success message and redirect to login

### Test Login

1. Open `http://localhost:8000/login.html`
2. Use the email and password from signup
3. Click "Sign In"
4. Should see success message and redirect to home

### Test Forgot Password

1. Open `http://localhost:8000/forgot-password.html`
2. Step 1: Enter registered email → "Send OTP"
3. Check backend console for OTP (in development mode)
4. Step 2: Enter OTP → "Verify OTP"
5. Step 3: Enter new password → "Reset Password"
6. Should see success screen
7. Can now login with new password

---

## File Field Mappings

### Backend Expects (User Model):

- `name` - Full name
- `address` - Address
- `city` - City
- `contact` - 10-digit phone number
- `email` - Email address (unique)
- `password` - Password (min 6 characters)
- `confirmPassword` - Must match password

### Frontend Fields Match Backend:

✅ form.html signup fields match backend User model perfectly

---

## Error Handling

The application includes comprehensive error handling:

### Frontend Validation

- Email format validation
- Phone number (10 digits) validation
- Password length (min 6 characters)
- Password match validation
- All required fields validation
- User-friendly error messages in red notifications

### Backend Errors

- Duplicate email handling
- Validation errors from schema
- Database errors
- Authentication errors
- Token expiry handling

### User Feedback

- Toast/notification messages (success, error, warning)
- Field-level error messages
- Loading states on buttons
- Form disable during API calls

---

## Troubleshooting

### Issue: Frontend can't connect to backend

**Solution**:

- Ensure backend is running: `npm start` in backend folder
- Backend should be on `http://localhost:5000`
- Check CORS is enabled in server.js (it is by default)

### Issue: Login fails but user exists

**Solution**:

- Check MongoDB is running
- Verify JWT_SECRET in .env file is set
- Check email is stored correctly (should be lowercase)

### Issue: OTP not received

**Solution**:

- In development mode, OTP is logged to backend console
- Check the backend terminal for: "📮 OTP for [email] : [otp]"
- OTP expires after 5 minutes

### Issue: CORS errors in browser console

**Solution**:

- This is normal during development
- Backend has CORS enabled for all origins
- If persists, check that backend is running on port 5000

---

## Environment Variables (.env)

Create a `.env` file in the `backend/` folder:

```env
MONGO_URI=mongodb://localhost:27017/crop_app
JWT_SECRET=your_secret_jwt_key_change_this
PORT=5000
```

---

## Next Steps

### To deploy to production:

1. Move frontend files to a static hosting service (Netlify, Vercel, etc.)
2. Update `API_BASE_URL` in `api-client.js` to your production backend URL
3. Deploy backend to a server (Heroku, AWS, DigitalOcean, etc.)
4. Update MongoDB URI to production database
5. Use a proper email service for OTP instead of console logging

### To add more features:

1. Add API calls in `api-client.js` for new endpoints
2. Create HTML forms that call those functions
3. Handle responses and errors appropriately

---

## Support

For issues or questions:

1. Check browser console (F12) for errors
2. Check backend console for server logs
3. Verify MongoDB is running
4. Ensure backend server is on port 5000
5. Clear localStorage if issues persist: `localStorage.clear()`

---

## API Response Examples

### Successful Login

```json
{
  "message": "✅ Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Farmer",
    "email": "john@example.com"
  }
}
```

### Successful Signup

```json
{
  "message": "✅ Account created successfully! You can now login."
}
```

### OTP Sent

```json
{
  "message": "✅ OTP sent to your email (check console for demo)",
  "expiresIn": "5 minutes"
}
```

---

**Happy Coding! 🚀**
