# 📁 PROJECT STRUCTURE & FILE GUIDE

## 🎯 Quick File Reference

| File                         | Purpose                       | Read If...                     |
| ---------------------------- | ----------------------------- | ------------------------------ |
| **START_HERE.txt**           | 4-step setup guide            | You want to start immediately  |
| **QUICK_START.md**           | Detailed setup with 3 options | You need detailed instructions |
| **README.md**                | Complete documentation        | You want full project info     |
| **TROUBLESHOOTING_GUIDE.md** | Error fixes                   | Something doesn't work         |
| **FIXES_APPLIED.md**         | What was fixed                | You want to know what changed  |
| **test-connection.html**     | Connection tester             | You want to diagnose issues    |
| **SETUP.bat**                | Windows auto-setup            | You're on Windows              |
| **SETUP.sh**                 | Mac/Linux auto-setup          | You're on Mac/Linux            |

---

## 📂 FOLDER STRUCTURE

```
pro/  (Project Root)
│
├── 📋 DOCUMENTATION & GUIDES
│   ├── START_HERE.txt ⭐           👈 BEGIN HERE
│   ├── QUICK_START.md              Setup guide
│   ├── README.md                   Full docs
│   ├── TROUBLESHOOTING_GUIDE.md    Error fixes
│   ├── FIXES_APPLIED.md            What was fixed
│   ├── FRONTEND_SETUP_GUIDE.md     Frontend info
│   ├── PROJECT_STRUCTURE.md         This file
│   └── BACKEND_SETUP_GUIDE.md      Backend info (in backend/)
│
├── 📄 SETUP SCRIPTS
│   ├── SETUP.bat                   Windows setup
│   └── SETUP.sh                    Mac/Linux setup
│
├── 🌐 FRONTEND (Web Pages)
│   ├── index.html                  Home page
│   ├── login.html ✅               Login page (API connected)
│   ├── form.html ✅                Signup page (API connected)
│   ├── forgot-password.html ✅     Password reset (new)
│   ├── test-connection.html ✅     Connection tester (new)
│   ├── about.html                  About page
│   ├── contactus.html              Contact page
│   ├── yojana.html                 Schemes page
│   ├── detect_details.html         Disease detection page
│   ├── weather.html                Weather page
│   ├── pattern.html                Pattern page
│   ├── api-client.js ✅            API communication (improved)
│   ├── card1.avif                  Image asset
│   ├── farm.avif                   Image asset
│   ├── log.avif                    Image asset
│   └── package.json                Frontend dependencies
│
└── 🖥️ BACKEND (Server)
    └── backend/
        ├── 📄 BACKEND_SETUP_GUIDE.md  Backend documentation
        ├── 📄 server.js                Main server file
        ├── 📄 analyze.py               Python analysis script
        ├── 📄 package.json             Dependencies list
        ├── 📄 .env                     Configuration (created)
        │
        ├── 📁 routes/
        │   └── auth.js                 Authentication endpoints
        │       - POST /signup
        │       - POST /login
        │       - POST /forgot-password
        │       - POST /verify-otp
        │       - POST /reset-password
        │       - GET /profile
        │
        ├── 📁 models/
        │   └── User.js                 Database schema
        │
        ├── 📁 middleware/
        │   └── authmiddleware.js       JWT verification
        │
        ├── 📁 uploads/                 Uploaded files storage
        │   └── (Generated at runtime)
        │
        ├── 📁 node_modules/            NPM packages (generated)
        │
        └── 📄 test.jpg                 Test image
```

---

## 🌐 FRONTEND FILES EXPLAINED

### Core Application Files

#### **index.html** - Home Page

- Main landing page
- Navigation bar
- Links to all features
- Not API dependent

#### **login.html** ✅ (UPDATED)

- Email login form
- Password input
- "Forgot Password?" link
- API: POST `/api/auth/login`
- Stores JWT token in localStorage
- Auto-redirects if already logged in

#### **form.html** ✅ (UPDATED)

- User registration form
- Fields: Name, Address, City, Contact, Email, Password, Confirm
- Form validation (email format, phone 10-digits, password match)
- API: POST `/api/auth/signup`
- Auto-redirects to login on success
- Multi-language support (EN, Marathi, Hindi, Tamil)

#### **forgot-password.html** ✅ (NEW)

- 3-step password reset flow
- Step 1: Enter email → Send OTP
- Step 2: Verify 6-digit OTP (with timer)
- Step 3: Set new password
- API calls: forgot-password, verify-otp, reset-password
- Interactive OTP input boxes
- Full error handling

#### **test-connection.html** ✅ (NEW)

- Connection diagnostic tool
- Tests 4 things:
  1. Backend server status
  2. MongoDB connection
  3. API accessibility
  4. Authentication API
- Shows which tests pass/fail
- Open: http://localhost:8000/test-connection.html

#### **api-client.js** ✅ (IMPROVED)

- Centralized API communication
- All 6 endpoint functions:
  - `signup()`
  - `login()`
  - `forgotPassword()`
  - `verifyOTP()`
  - `resetPassword()`
  - `getUserProfile()`
- JWT token management
- Health check before calls
- Better error messages
- Console logging for debugging
- Utility functions:
  - `isLoggedIn()`
  - `getCurrentUser()`
  - `logout()`
  - `showMessage()`
  - `validateEmail()`
  - `validatePhone()`

### Other Pages

- **about.html** - About company
- **contactus.html** - Contact form
- **yojana.html** - Government schemes
- **detect_details.html** - Disease detection
- **weather.html** - Weather info
- **pattern.html** - Pattern page

---

## 🖥️ BACKEND FILES EXPLAINED

### **server.js** - Main Server

- Express.js application setup
- CORS enabled (allows frontend to connect)
- MongoDB connection
- Routes registration
- Middleware setup
- Error handling
- Runs on: `http://localhost:5000`

### **routes/auth.js** - Authentication

Contains 6 endpoints:

```
POST /api/auth/signup
  Input: name, address, city, contact, email, password, confirmPassword
  Output: Success message

POST /api/auth/login
  Input: email, password
  Output: JWT token, user data

POST /api/auth/forgot-password
  Input: email
  Output: OTP sent message

POST /api/auth/verify-otp
  Input: email, otp
  Output: Verification success

POST /api/auth/reset-password
  Input: email, otp, newPassword, confirmPassword
  Output: Password reset success

GET /api/auth/profile
  Header: Authorization: Bearer [TOKEN]
  Output: User profile data
```

### **models/User.js** - Database Schema

Defines user document structure:

- name (String, required)
- address (String, required)
- city (String, required)
- contact (String, 10 digits, required)
- email (String, unique, required)
- password (String, hashed, required)
- otp (String, for reset flow)
- otpExpiry (Date, 5 minutes from generation)
- createdAt (Timestamp, auto)
- updatedAt (Timestamp, auto)

### **middleware/authmiddleware.js** - JWT Verification

- Checks Authorization header for JWT token
- Validates token signature
- Adds `req.user.id` to request
- Used by protected routes (GET /profile)

### **.env** - Configuration

```
PORT=5000                                    # Server port
MONGO_URI=mongodb://127.0.0.1:27017/crop_app # Database URI
JWT_SECRET=your_secret_key                  # Token signing key
OTP_EXPIRY=5                                 # OTP duration (minutes)
OTP_LENGTH=6                                 # OTP digits
```

### **package.json** - Dependencies

```json
{
  "dependencies": {
    "bcryptjs": "^2.4.3", // Password hashing
    "cors": "^2.8.5", // Cross-origin requests
    "dotenv": "^16.3.1", // Environment variables
    "express": "^4.18.2", // Web framework
    "jsonwebtoken": "^9.0.0", // JWT tokens
    "mongoose": "^7.5.0", // MongoDB driver
    "multer": "^1.4.5", // File uploads
    "body-parser": "^1.20.2" // Request parsing
  }
}
```

---

## 📊 DATA FLOW

### User Signup

```
form.html
  ↓ User fills form
  ↓ JavaScript validates
  ↓ api-client.js → signup()
  ↓ fetch POST /api/auth/signup
  ↓ server.js receives
  ↓ routes/auth.js processes
  ↓ User.js creates document
  ↓ MongoDB stores user
  ↓ Returns success message
  ↓ Frontend shows green message
  ↓ Redirects to login.html
```

### User Login

```
login.html
  ↓ User fills email/password
  ↓ JavaScript validates
  ↓ api-client.js → login()
  ↓ fetch POST /api/auth/login
  ↓ server.js receives
  ↓ routes/auth.js checks email
  ↓ bcryptjs compares password
  ↓ JWT token generated
  ↓ localStorage.setItem('authToken', token)
  ↓ Frontend shows success
  ↓ Redirects to index.html
```

### Get Profile (Protected)

```
JavaScript calls → getUserProfile()
  ↓ api-client.js reads token from localStorage
  ↓ Adds Authorization header
  ↓ fetch GET /api/auth/profile
  ↓ server.js receives with token
  ↓ authmiddleware verifies token
  ↓ routes/auth.js fetches user from MongoDB
  ↓ Returns user data (without password)
  ↓ Frontend displays user info
```

---

## 🔄 API Response Cycle

### Success Response Example:

```
Frontend Request:
  POST /api/auth/login
  {"email": "test@example.com", "password": "pass123"}

Backend Response:
  {
    "message": "Login successful",
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "507f...",
      "name": "Test User",
      "email": "test@example.com"
    }
  }

Frontend Action:
  - Store token in localStorage
  - Show success message
  - Redirect to home
```

### Error Response Example:

```
Frontend Request:
  POST /api/auth/login
  {"email": "test@example.com", "password": "wrong"}

Backend Response (401):
  {
    "message": "Invalid email or password"
  }

Frontend Action:
  - Show error toast message
  - Keep user on login page
  - Log error to console
```

---

## 🔐 Security Flow

1. **Signup:**
   - Password validated (6+ chars)
   - Password hashed with bcrypt (10 rounds)
   - Email checked for duplicates
   - Stored securely in MongoDB

2. **Login:**
   - Email found in database
   - bcryptjs.compare() checks password without decryption
   - JWT token generated with user ID
   - Token valid for 7 days

3. **Forgot Password:**
   - Email verified in database
   - Random 6-digit OTP generated
   - OTP stored (expires in 5 minutes)
   - OTP sent to console (demo mode)

4. **Reset Password:**
   - OTP verified
   - OTP timestamp checked (not expired)
   - New password hashed
   - Old password replaced
   - OTP cleared from database

---

## 📱 How Everything Connects

```
BROWSER (http://localhost:8000)
    ↓
Frontend HTML Files
    ↓
JavaScript (api-client.js)
    ↓                                    EXAMPLE FLOW:
Fetch API (HTTP POST/GET)          User types email & password
    ↓                                    ↓
CORS Headers                        JavaScript validates
    ↓                                    ↓
Network Request                     Calls api-client.login()
    ↓                                    ↓
Backend (http://localhost:5000)     fetch() to /api/auth/login
    ↓                                    ↓
Express.js Router                   Backend receives request
    ↓                                    ↓
routes/auth.js Handler              Checks email in MongoDB
    ↓                                    ↓
models/User.js Query                Compares password with bcrypt
    ↓                                    ↓
MongoDB (127.0.0.1:27017)          Generates JWT token
    ↓                                    ↓
Database Document Retrieved         Returns token + user data
    ↓                                    ↓
Response Sent Back                  Frontend stores token
    ↓                                    ↓
Browser Receives JSON               Shows success message
    ↓                                    ↓
JavaScript Processes                Redirects home
    ↓
User Experience Updated
```

---

## ✅ File Checklist

### MUST EXIST:

- [ ] backend/server.js
- [ ] backend/.env
- [ ] backend/package.json
- [ ] backend/routes/auth.js
- [ ] backend/models/User.js
- [ ] backend/middleware/authmiddleware.js
- [ ] login.html
- [ ] form.html
- [ ] forgot-password.html
- [ ] api-client.js
- [ ] index.html

### SHOULD EXIST (Documentation):

- [ ] START_HERE.txt
- [ ] README.md
- [ ] QUICK_START.md
- [ ] TROUBLESHOOTING_GUIDE.md

### NICE TO HAVE:

- [ ] test-connection.html
- [ ] SETUP.bat
- [ ] FIXES_APPLIED.md

---

## 🚀 File Deployment Guide

When moving to production:

### Upload These Frontend Files:

- All .html files
- api-client.js
- asset images (.avif, .jpg, etc)
- Update API_BASE_URL in api-client.js

### upload These Backend Files:

- server.js
- routes/auth.js
- models/User.js
- middleware/authmiddleware.js
- package.json
- .env (with production values)
- analyze.py (if using image analysis)

### DO NOT Upload:

- node_modules/ (reinstall with npm install)
- uploads/ (create fresh)
- test files

---

## 📞 Finding Specific Features

| Feature         | File                   | Line    |
| --------------- | ---------------------- | ------- |
| Signup API      | backend/routes/auth.js | ~50     |
| Login API       | backend/routes/auth.js | ~140    |
| OTP Generation  | backend/routes/auth.js | ~240    |
| JWT Creation    | backend/routes/auth.js | ~160    |
| Password Hash   | backend/models/User.js | ~signup |
| Form Validation | api-client.js          | ~400    |
| Toast Messages  | api-client.js          | ~350    |
| Auto-redirect   | form.html              | ~script |

---

**That's the complete project structure!**

All files work together to provide full authentication with API integration.
