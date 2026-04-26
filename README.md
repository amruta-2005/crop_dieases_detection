<<<<<<< HEAD
# 🌾 CropCare - Crop Disease Detection System

A full-stack web application for crop disease detection and farmer authentication.

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Troubleshooting](#troubleshooting)
- [Features](#features)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v14+ ([Download](https://nodejs.org/))
- **MongoDB** ([Download](https://www.mongodb.com/try/download/community) or use [Atlas](https://www.mongodb.com/cloud/atlas))
- **Browser** (Chrome, Firefox, Safari, Edge)

### Installation & Running (3 Steps)

#### Step 1: Start MongoDB

**Windows:**

```bash
mongod
```

**Mac (with Homebrew):**

```bash
brew services start mongodb-community
```

**Linux:**

```bash
sudo service mongod start
```

#### Step 2: Start Backend Server

```bash
cd backend
npm install
npm start
```

**Expected Output:**

```
✅ Server Status: RUNNING
🚀 Server URL: http://localhost:5000
✅ MongoDB Connected Successfully
```

#### Step 3: Open Frontend

Choose one method:

**Method A: Live Server (Easiest)**

- Install "Live Server" extension in VS Code
- Right-click `index.html` → "Open with Live Server"

**Method B: Python HTTP Server**

```bash
python -m http.server 8000
# Then open http://localhost:8000
```

**Method C: Node HTTP Server**

```bash
npm install -g http-server
http-server
# Then open http://localhost:8080
```

---

## 🆘 Troubleshooting

### ❌ "Failed to fetch" Error

This means the backend is not running or MongoDB is not connected.

**Solution Checklist:**

- [ ] Is MongoDB running? (Should say "Waiting for connections")
- [ ] Is backend running? (Should show "Server running on port 5000")
- [ ] Is .env file in backend folder?
- [ ] Are both in same folder structure?

**Quick Fix:**

```bash
# Terminal 1: Start MongoDB
mongod

# Terminal 2: Start Backend
cd backend
npm install
npm start

# Terminal 3: Start Frontend (choose one)
python -m http.server 8000
```

Keep all 3 terminals open!

### ❌ "Cannot connect to MongoDB"

Error: `connect ECONNREFUSED 127.0.0.1:27017`

**Solution:**

1. Make sure MongoDB is installed
2. Run `mongod` in a separate terminal
3. Keep it running

### ❌ "Port 5000 already in use"

**Windows:**

```bash
netstat -ano | findstr :5000
taskkill /PID [PID_NUMBER] /F
```

**Mac/Linux:**

```bash
lsof -i :5000
kill -9 [PID_NUMBER]
```

Or change PORT in `backend/.env`

### ❌ "Cannot find module" Error

```bash
cd backend
npm install
```

### ❌ Form submission doesn't work

1. Open Browser Console (F12)
2. Check for red errors
3. Fill ALL required fields
4. Contact must be exactly 10 digits
5. Check network tab for API calls

### Test Connection

Open [http://localhost:8000/test-connection.html](http://localhost:8000/test-connection.html)

This will test:

- ✅ Backend server connection
- ✅ MongoDB connection
- ✅ API endpoints
- ✅ Authentication

---

## ✨ Features

### Authentication System

- ✅ User Registration (Signup)
- ✅ User Login with JWT
- ✅ Forgot Password (3-step flow)
- ✅ OTP Verification
- ✅ Password Reset
- ✅ Protected Routes

### Frontend

- ✅ Responsive Design
- ✅ Form Validation
- ✅ Error Messages
- ✅ Loading States
- ✅ Toast Notifications
- ✅ Multi-language Support (EN, Marathi, Hindi, Tamil)

### Backend

- ✅ Express.js REST API
- ✅ MongoDB Database
- ✅ JWT Authentication
- ✅ Bcrypt Password Hashing
- ✅ CORS Enabled
- ✅ Error Handling

---

## 📁 Project Structure

```
pro/
├── 📄 README.md                    (This file)
├── 📄 QUICK_START.md               (Quick setup guide)
├── 📄 SETUP.bat                    (Windows setup script)
├── 📄 test-connection.html         (Connection test page)
├── 📄 index.html                   (Home page)
├── 📄 login.html                   (Login page)
├── 📄 form.html                    (Signup page)
├── 📄 forgot-password.html         (Password reset)
├── 📄 api-client.js                (API communication)
├── 📄 about.html                   (About page)
├── 📄 contactus.html               (Contact page)
├── 📄 yojana.html                  (Schemes page)
├── 📄 detect_details.html          (Disease detection page)
├── 📄 weather.html                 (Weather page)
│
└── backend/
    ├── 📄 server.js                (Main server)
    ├── 📄 package.json             (Dependencies)
    ├── 📄 .env                     (Configuration)
    ├── 📄 BACKEND_SETUP_GUIDE.md   (Backend guide)
    ├── routes/
    │   └── 📄 auth.js              (Auth endpoints)
    ├── models/
    │   └── 📄 User.js              (User schema)
    ├── middleware/
    │   └── 📄 authmiddleware.js    (JWT verification)
    ├── uploads/                    (File uploads)
    └── node_modules/               (Dependencies)
```

---

## 🔌 API Documentation

### Base URL: `http://localhost:5000/api/auth`

### 1. Signup

```
POST /signup
Content-Type: application/json

{
  "name": "John Farmer",
  "address": "123 Village Lane",
  "city": "Mumbai",
  "contact": "9876543210",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}

Response:
{
  "message": "Account created successfully! You can now login."
}
```

### 2. Login

```
POST /login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Farmer",
    "email": "john@example.com"
  }
}
```

### 3. Forgot Password

```
POST /forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}

Response:
{
  "message": "OTP sent to your email",
  "expiresIn": "5 minutes"
}
```

### 4. Verify OTP

```
POST /verify-otp
Content-Type: application/json

{
  "email": "john@example.com",
  "otp": "123456"
}

Response:
{
  "message": "OTP verified successfully"
}
```

### 5. Reset Password

```
POST /reset-password
Content-Type: application/json

{
  "email": "john@example.com",
  "otp": "123456",
  "newPassword": "newpassword123",
  "confirmPassword": "newpassword123"
}

Response:
{
  "message": "Password reset successful"
}
```

### 6. Get Profile

```
GET /profile
Headers:
  Authorization: Bearer [JWT_TOKEN]

Response:
{
  "message": "Profile retrieved successfully",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Farmer",
    "email": "john@example.com",
    "address": "123 Village Lane",
    "city": "Mumbai",
    "contact": "9876543210"
  }
}
```

---

## 📊 Testing Workflow

### Test 1: Signup

1. Open `http://localhost:8000/form.html`
2. Fill all fields with valid data
3. Click "Create Account"
4. ✅ Should redirect to login

### Test 2: Login

1. Open `http://localhost:8000/login.html`
2. Use email/password from signup
3. Click "Sign In"
4. ✅ Should redirect to home

### Test 3: Forgot Password

1. Open `http://localhost:8000/forgot-password.html`
2. Enter registered email
3. Check backend console for OTP
4. Enter OTP and new password
5. ✅ Should show success

### Test 4: Test Connection

1. Open `http://localhost:8000/test-connection.html`
2. Click "RUN ALL TESTS"
3. ✅ Should show all green

---

## 🔐 Security Features

- ✅ Passwords hashed with bcrypt (10 rounds)
- ✅ JWT token authentication
- ✅ Token expiry (7 days)
- ✅ OTP verified before password reset
- ✅ CORS protection
- ✅ Request validation
- ✅ Error handling (no sensitive data exposed)

---

## 🛠️ Development

### Making Changes

**Frontend:**

- Edit HTML files directly
- Edit JavaScript in `api-client.js`
- Changes auto-reload with Live Server

**Backend:**

- Edit files in `backend/` folder
- Backend auto-restarts with nodemon
- Changes require code modification

### Adding New Routes

```javascript
// In backend/routes/auth.js
router.post("/new-route", async (req, res) => {
  try {
    // Your logic here
    res.status(200).json({ message: "Success" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
```

### Adding New API Calls

```javascript
// In frontend/api-client.js
async function newFunction(data) {
  return apiCall("/auth/new-route", "POST", data);
}
```

---

## 🚀 Deployment

### Deploy Backend

**Option 1: Heroku**

```bash
heroku create your-app-name
git push heroku main
```

**Option 2: AWS/DigitalOcean**

1. Set up server
2. Install Node.js
3. Upload code
4. Use PM2 to run: `pm2 start server.js`

### Deploy Frontend

**Option 1: Netlify**

1. Drag and drop `pro/` folder to Netlify

**Option 2: Vercel**

```bash
npm install -g vercel
vercel
```

**Option 3: GitHub Pages**

1. Push to GitHub
2. Enable Pages in settings
3. Select main branch

### Update API URL

Change in `api-client.js`:

```javascript
const API_BASE_URL = "https://your-production-url.com/api";
```

---

## 📞 Support & Help

### Check These First:

1. Is MongoDB running?
2. Is backend running on port 5000?
3. Are you using correct email/password?
4. Check browser console (F12) for errors
5. Open `test-connection.html` to diagnose

### Common Error Messages:

| Error                         | Fix                         |
| ----------------------------- | --------------------------- |
| "Failed to fetch"             | Start backend server        |
| "Cannot connect ECONNREFUSED" | Start MongoDB               |
| "Port 5000 in use"            | Kill process or change port |
| "Email already exists"        | Use different email         |
| "Contact must be 10 digits"   | Enter exactly 10 numbers    |

---

## 📝 License

MIT License - Feel free to use and modify

---

## 👨‍💻 Author

Crop Disease Detection System - Agricultural IoT Project

---

## ✅ Checklist Before Going Live

- [ ] MongoDB connection tested
- [ ] Backend server running smoothly
- [ ] Frontend loads without errors
- [ ] Signup works (creates new user)
- [ ] Login works (with correct credentials)
- [ ] Forgot password flow works
- [ ] All form validations work
- [ ] Error messages display correctly
- [ ] Load time is acceptable
- [ ] No console errors (F12)

---

**Happy Farming! 🌾**
=======
# crop_dieases_detection
>>>>>>> 0265354f6e20facf9f045633d90734b7a58b9217
