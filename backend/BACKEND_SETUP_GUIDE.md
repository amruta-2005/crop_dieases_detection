# 🌾 CROP DISEASE DETECTION SYSTEM - COMPLETE BACKEND SETUP GUIDE

## ✅ PART 1: INSTALLATION & SETUP

### Step 1: Install MongoDB (Local Database)

**For Windows:**
1. Download MongoDB Community Server from: https://www.mongodb.com/try/download/community
2. Run the installer (MongoDB-Community-Server-7.0.0-windows-x86_64.msi)
3. Choose "Install as a Service" option during setup
4. MongoDB will run automatically after installation
5. Default data location: `C:\Program Files\MongoDB\Server\7.0\data\`

**For Linux (Ubuntu/Debian):**
```bash
sudo apt-get install mongodb
sudo systemctl start mongodb
```

**For Mac:**
```bash
brew install mongodb-community
brew services start mongodb-community
```

**Verify MongoDB is Running:**
```bash
mongosh
# Or older version
mongo
```
If you see `>` prompt, MongoDB is running. Type `exit` to quit.

---

### Step 2: Install Node.js & NPM

Download from https://nodejs.org/ (LTS version recommended)

Verify installation:
```bash
node --version
npm --version
```

---

### Step 3: Project Setup

**Already Done:**
- ✅ Dependencies installed in `backend/package.json`
- ✅ Environment file created: `backend/.env`
- ✅ Database schema created: `backend/models/User.js`
- ✅ Middleware configured: `backend/middleware/authmiddleware.js`
- ✅ Routes created: `backend/routes/auth.js`
- ✅ Server setup: `backend/server.js`

---

## ✅ PART 2: START THE BACKEND SERVER

```bash
cd backend
npm start
```

**Expected Output:**
```
╔═══════════════════════════════════════════════════════╗
║  🌾 CROP DISEASE DETECTION SYSTEM - BACKEND 🌾      ║
╚═══════════════════════════════════════════════════════╝

✅ Server Status: RUNNING
🚀 Server URL: http://localhost:5000
📍 API Base URL: http://localhost:5000/api/auth
🔍 Health Check: http://localhost:5000/health

📚 AVAILABLE ENDPOINTS:
  Authentication:
    POST   /api/auth/signup
    POST   /api/auth/login
    POST   /api/auth/forgot-password
    POST   /api/auth/verify-otp
    POST   /api/auth/reset-password
    GET    /api/auth/profile (Protected)
    PUT    /api/auth/profile (Protected)
  Image Analysis:
    POST   /analyze

💾 Database: MongoDB (crop_app)
🔒 Authentication: JWT
```

Server is now running! Keep this terminal open.

---

## ✅ PART 3: COMPLETE API ENDPOINTS REFERENCE

### 1️⃣ USER REGISTRATION (SIGNUP)

**Endpoint:** `POST /api/auth/signup`

**Request Body:**
```json
{
  "name": "Farmer Name",
  "address": "123 Village Lane",
  "city": "Village City",
  "contact": "9876543210",
  "email": "farmer@example.com",
  "password": "securepass123",
  "confirmPassword": "securepass123"
}
```

**Required Fields:**
- `name`: User's full name (string)
- `address`: User's address (string)
- `city`: User's city (string)
- `contact`: 10-digit mobile number (string)
- `email`: Valid email address (unique)
- `password`: At least 6 characters (string)
- `confirmPassword`: Must match password (string)

**Validation Rules:**
- No empty fields allowed
- Email must be unique (not already registered)
- Contact must be exactly 10 digits
- Password and confirmPassword must match
- Password must be at least 6 characters

**Success Response (201):**
```json
{
  "message": "✅ Account created successfully! You can now login."
}
```

**Error Response (400/409):**
```json
{
  "message": "❌ Email already registered. Please login or use different email."
}
```

**Example using CURL:**
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Farmer Name",
    "address": "123 Lane",
    "city": "City",
    "contact": "9876543210",
    "email": "farmer@example.com",
    "password": "pass123",
    "confirmPassword": "pass123"
  }'
```

---

### 2️⃣ USER LOGIN

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "farmer@example.com",
  "password": "securepass123"
}
```

**Required Fields:**
- `email`: Registered email (string)
- `password`: User's password (string)

**Success Response (200):**
```json
{
  "message": "✅ Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjUwN2YxZjc3YmNmODZjZDc5OTQzOTAxMSIsImlhdCI6MTcwNzA5MDAwMH0.x8Ks8vH2pQ5rJ9xK2euJ5vA3B8c7D0e9f5gH2iJ3k4L",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Farmer Name",
    "email": "farmer@example.com"
  }
}
```

**Error Response (401):**
```json
{
  "message": "❌ Invalid email or password"
}
```

**⭐ IMPORTANT: Save this token!**
Use this token for all protected routes in Authorization header:
```
Authorization: Bearer <token>
```

**Token Validity:**
- Expires in 7 days
- Delete from client-side storage to logout

---

### 3️⃣ FORGOT PASSWORD (STEP 1 - REQUEST OTP)

**Endpoint:** `POST /api/auth/forgot-password`

**Request Body:**
```json
{
  "email": "farmer@example.com"
}
```

**What Happens:**
1. Backend generates 6-digit OTP (e.g., 123456)
2. OTP is valid for 5 minutes
3. OTP is printed in backend console (for demo)
4. In production: OTP would be sent via SMS/Email

**Success Response (200):**
```json
{
  "message": "✅ OTP sent to your email (check console for demo)",
  "expiresIn": "5 minutes"
}
```

**Error Response (404):**
```json
{
  "message": "❌ Email not registered with us"
}
```

**🔴 DEMO STEP:**
Check your backend console to see OTP:
```
📮 OTP for farmer@example.com : 123456
⏱️  OTP expires at: 2026-04-05T14:35:00.000Z
```

---

### 4️⃣ VERIFY OTP (STEP 2)

**Endpoint:** `POST /api/auth/verify-otp`

**Request Body:**
```json
{
  "email": "farmer@example.com",
  "otp": "123456"
}
```

**Validation:**
- OTP must be exactly 6 digits
- OTP must not be expired (5 minutes from generation)
- OTP must match the one sent

**Success Response (200):**
```json
{
  "message": "✅ OTP verified successfully. You can now reset your password."
}
```

**Error Response (401):**
```json
{
  "message": "❌ OTP has expired. Please request a new OTP."
}
```

---

### 5️⃣ RESET PASSWORD (STEP 3)

**Endpoint:** `POST /api/auth/reset-password`

**Request Body:**
```json
{
  "email": "farmer@example.com",
  "otp": "123456",
  "newPassword": "newSecurePass123",
  "confirmPassword": "newSecurePass123"
}
```

**Required Fields:**
- `email`: User's email (string)
- `otp`: 6-digit OTP from previous step (string)
- `newPassword`: New password (string)
- `confirmPassword`: Must match newPassword (string)

**Validation:**
- OTP must be valid and not expired
- newPassword === confirmPassword
- Password must be at least 6 characters

**Success Response (200):**
```json
{
  "message": "✅ Password reset successful! You can now login with your new password."
}
```

**Complete Forgot Password Flow:**
```
1. User clicks "Forgot Password"
2. User enters email → Backend generates OTP
3. [Demo] Check console for OTP
4. User enters OTP → Backend verifies
5. User enters new password → Backend updates
6. User logs in with new password
```

---

### 6️⃣ GET USER PROFILE (PROTECTED)

**Endpoint:** `GET /api/auth/profile`

**⭐ REQUIRED HEADER:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Example Request:**
```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Success Response (200):**
```json
{
  "message": "✅ Profile retrieved successfully",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Farmer Name",
    "email": "farmer@example.com",
    "address": "123 Village Lane",
    "city": "Village City",
    "contact": "9876543210",
    "createdAt": "2026-04-05T10:00:00.000Z"
  }
}
```

**Error Response (401):**
```json
{
  "message": "❌ No token provided. Please login first."
}
```

---

### 7️⃣ UPDATE USER PROFILE (PROTECTED)

**Endpoint:** `PUT /api/auth/profile`

**⭐ REQUIRED HEADER:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Request Body:**
```json
{
  "name": "Updated Name",
  "city": "Updated City",
  "address": "Updated Address",
  "contact": "9876543210"
}
```

**Fields:** All fields are optional (send only what you want to update)

**Success Response (200):**
```json
{
  "message": "✅ Profile updated successfully",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Updated Name",
    "email": "farmer@example.com",
    "address": "Updated Address",
    "city": "Updated City",
    "contact": "9876543210"
  }
}
```

---

## ✅ PART 4: HOW JWT AUTHENTICATION WORKS

### JWT Token Structure
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjUwN2YxZjc3YmNmODZjZDc5OTQzOTAxMSIsImlhdCI6MTcwNzA5MDAwMH0.x8Ks8vH2pQ5rJ9xK2euJ5vA3B8c7D0e9f5gH2iJ3k4L
│                                                 │                                                              │
│                          Header                 │                     Payload                                  │      Signature
└─────────────────────────────────────────────────┴──────────────────────────────────────────────────────────────┴───────────────────────────
```

### How It Works

**1. User Logs In:**
```
Request: POST /api/auth/login
Body: { email, password }
       ↓
Server: Verify password with bcrypt
       ↓
Server: Create JWT token with user ID
token = jwt.sign({ id: user._id }, JWT_SECRET)
       ↓
Response: Return token to frontend
```

**2. Frontend Stores Token:**
```javascript
// After login
const token = response.data.token;
localStorage.setItem('token', token); // Store in browser
```

**3. Frontend Sends Token for Protected Routes:**
```javascript
// For any protected request
const token = localStorage.getItem('token');
fetch('/api/auth/profile', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
```

**4. Backend Verifies Token:**
```
Request: GET /api/auth/profile
Headers: Authorization: Bearer <token>
       ↓
Middleware: Extract token from header
       ↓
Middleware: jwt.verify(token, JWT_SECRET)
       ↓
If valid: Extract user ID from token payload
          Set req.user = { id: user._id }
          Continue to route handler
       ↓
If invalid/expired: Return 401 Unauthorized
```

### Key Benefits

- **Stateless**: No session storage needed on server
- **Scalable**: Works with multiple servers
- **Secure**: Token is signed with secret key (attacker cannot fake)
- **Expirable**: Token expires after 7 days (forces re-login)

---

## ✅ PART 5: PASSWORD SECURITY WITH BCRYPT

### How Password Hashing Works

**Signup:**
```
User enters: password123
       ↓
bcrypt.hash(password123, 10)  ← 10 = salt rounds
       ↓
Database stores: $2a$10$x8Ks8.vH2.pQ5.rJ9x.K2euJ5vA3B8c7D0e9f5g...
(Not reversible! Cannot decrypt)
```

**Login:**
```
User enters: password123
       ↓
Retrieve hashed from database: $2a$10$x8Ks8.vH2.pQ5...
       ↓
bcrypt.compare(password123, hashed)
       ↓
Returns: true or false
       ↓
If true: Passwords match! Generate JWT token
If false: Wrong password! Invalid login
```

### Why Bcrypt is Secure

- **One-way**: Cannot decrypt hashed password
- **Salted**: Random salt added before hashing (prevents rainbow table attacks)
- **Slow**: Takes time to hash (prevents brute force attacks)
- **10 iterations**: Default rounds = 10 (adjustable for security/speed trade-off)

---

## ✅ PART 6: FRONTEND INTEGRATION EXAMPLES

### Example 1: Complete Signup Flow (JavaScript)

```javascript
// 1. Get form data
const formData = {
  name: document.getElementById('name').value,
  address: document.getElementById('address').value,
  city: document.getElementById('city').value,
  contact: document.getElementById('contact').value,
  email: document.getElementById('email').value,
  password: document.getElementById('password').value,
  confirmPassword: document.getElementById('confirmPassword').value
};

// 2. Send to backend
const response = await fetch('http://localhost:5000/api/auth/signup', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(formData)
});

// 3. Handle response
const data = await response.json();
if (response.ok) {
  alert(data.message); // Success!
  window.location.href = 'login.html'; // Redirect to login
} else {
  alert(data.message); // Error message
}
```

### Example 2: Complete Login Flow (JavaScript)

```javascript
// 1. Get form data
const loginData = {
  email: document.getElementById('email').value,
  password: document.getElementById('password').value
};

// 2. Send to backend
const response = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(loginData)
});

// 3. Handle response
const data = await response.json();
if (response.ok) {
  // Save token
  localStorage.setItem('token', data.token);
  localStorage.setItem('userName', data.user.name);
  
  // Redirect to profile/dashboard
  window.location.href = 'profile.html';
} else {
  alert(data.message); // Error message
}
```

### Example 3: Access Protected Route (JavaScript)

```javascript
// Get token from storage
const token = localStorage.getItem('token');

if (!token) {
  // No token = not logged in
  window.location.href = 'login.html';
}

// Fetch profile with token
const response = await fetch('http://localhost:5000/api/auth/profile', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Handle response
if (response.ok) {
  const data = await response.json();
  // Display user profile
  document.getElementById('userName').textContent = data.user.name;
  document.getElementById('userCity').textContent = data.user.city;
  // ... etc
} else {
  // Token invalid/expired
  localStorage.removeItem('token');
  window.location.href = 'login.html';
}
```

### Example 4: Logout (JavaScript)

```javascript
function logout() {
  // Client-side only
  localStorage.removeItem('token');
  localStorage.removeItem('userName');
  
  // Redirect to login
  window.location.href = 'login.html';
}

// Note: No API call needed!
// JWT tokens don't need server-side logout
// (unlike sessions which need to be cleared)
```

---

## ✅ PART 7: DATABASE STRUCTURE

### MongoDB Collections

**Database Name:** `crop_app`

**Collection:** `users`

**Document Structure:**
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "name": "Farmer Name",
  "address": "123 Village Lane",
  "city": "Village City",
  "contact": "9876543210",
  "email": "farmer@example.com",
  "password": "$2a$10$x8Ks8.vH2.pQ5.rJ9x.K2euJ5vA3B8c7D0e9f5g...",
  "otp": null,
  "otpExpiry": null,
  "createdAt": ISODate("2026-04-05T10:00:00.000Z"),
  "updatedAt": ISODate("2026-04-05T10:00:00.000Z")
}
```

### View Data in MongoDB

**Using MongoDB Compass (GUI):**
1. Open MongoDB Compass
2. Connect to: `mongodb://localhost:27017`
3. Navigate to: `crop_app` → `users`
4. See all user documents

**Using MongoDB Shell:**
```bash
mongosh
use crop_app
db.users.find()
db.users.find({email: "farmer@example.com"})
db.users.deleteOne({email: "farmer@example.com"}) // Delete a user
```

---

## ✅ PART 8: TROUBLESHOOTING

### Problem: "MongoDB Connection Failed"

**Solution:**
```bash
# Check if MongoDB is running
mongosh

# Windows only: Start MongoDB service
net start MongoDB

# Or check MongoDB status
# Look for "mongod" process in Task Manager
```

### Problem: "Cannot find module 'jsonwebtoken'"

**Solution:**
```bash
cd backend
npm install jsonwebtoken
npm install
```

### Problem: Server not responding on port 5000

**Check:**
1. Is server running? (npm start)
2. Is port 5000 in use? (Change PORT in .env)
3. Firewall blocking? (Allow Node.js in firewall)

### Problem: "OTP verification failed"

**Possible Causes:**
- OTP expired (check console for expiry time)
- OTP doesn't match (copy correctly from console)
- Wrong email used

---

## ✅ PART 9: SECURITY BEST PRACTICES

### In Development (Current Setup):
- ✅ Passwords hashed with bcrypt
- ✅ JWT tokens for stateless auth
- ✅ OTP for password reset
- ✅ MongoDB local (no external access)

### For Production (TODO):
- Send OTP via SMS (use Twilio)
- Use HTTPS (SSL certificates)
- Add rate limiting (prevent brute force)
- Implement CORS with specific origins
- Store JWT_SECRET in secure vault
- Add email verification for signup
- Implement 2FA (two-factor authentication)
- Add request validation/sanitization
- Log all authentication attempts
- Regular security audits

---

## ✅ PART 10: ENVIRONMENT VARIABLES

**File:** `backend/.env`

```
# Server Port
PORT=5000

# MongoDB Connection
MONGO_URI=mongodb://127.0.0.1:27017/crop_app

# JWT Secret (Change this! Use random string)
JWT_SECRET=your_secret_key_change_this_in_production_12345

# OTP Configuration
OTP_EXPIRY=5              # 5 minutes
OTP_LENGTH=6              # 6 digits
```

**Never commit .env to Git!** (Contains secrets)

---

## ✅ NEXT STEPS

1. ✅ Install MongoDB
2. ✅ Start MongoDB service
3. ✅ Run `npm install` in backend folder
4. ✅ Run `npm start` to start server
5. ✅ Test all endpoints using provided examples
6. ✅ Integrate frontend with backend using provided code samples
7. ✅ Deploy to production when ready

---

## 📞 SUPPORT

If you face any issues:

1. **Check Console Logs:** Look at server console for error messages
2. **MongoDB Check:** `mongosh` to verify database
3. **API Testing:** Use tools like Postman or cURL to test endpoints
4. **Code Comments:** Each file has detailed comments explaining logic

---

**🎉 Backend is ready to use! Start building your crop disease detection system.**
