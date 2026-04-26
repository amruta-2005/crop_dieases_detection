# ⚡ QUICK START GUIDE - CropCare Project

## 🎯 The Issue You're Facing

**"Failed to fetch"** error usually means:

- ❌ Backend server is NOT running
- ❌ MongoDB is NOT running
- ❌ Frontend is trying to connect to `http://localhost:5000` but nothing is there

## ✅ SOLUTION: Follow These 3 Steps

---

## STEP 1️⃣: Install & Start MongoDB

### Option A: If you have MongoDB installed locally

**Windows:**

1. Open Command Prompt
2. Run: `mongod`
3. Keep this window open (MongoDB runs in foreground)
4. You should see: `"Waiting for connections"`

**Mac:**

```bash
brew services start mongodb-community
```

**Linux:**

```bash
sudo service mongod start
```

### Option B: If you DON'T have MongoDB

You have 2 choices:

**Choice 1: Use MongoDB Atlas (Cloud - Recommended for beginners)**

1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create a cluster
4. Copy connection string
5. Update `backend/.env`:
   ```
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/crop_app
   ```

**Choice 2: Install MongoDB locally**

- Download from: https://www.mongodb.com/try/download/community
- Install and run `mongod`

---

## STEP 2️⃣: Start Backend Server

### Windows:

```batch
cd backend
npm install
npm start
```

### Mac/Linux:

```bash
cd backend
npm install
npm start
```

**Expected Output:**

```
✅ Server Status: RUNNING
🚀 Server URL: http://localhost:5000
📍 API Base URL: http://localhost:5000/api/auth
✅ MongoDB Connected Successfully
```

**⚠️ IMPORTANT:** Keep this terminal window OPEN!

---

## STEP 3️⃣: Run Frontend (Choose Option A or B)

### Option A: Using Live Server (Easiest)

1. Install "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Click "Open with Live Server"
4. Browser opens automatically at `http://127.0.0.1:5500`

### Option B: Using Python

```bash
python -m http.server 8000
```

Then open browser: `http://localhost:8000`

### Option C: Using Node HTTP Server

```bash
npm install -g http-server
http-server
```

Then open browser: `http://localhost:8080`

---

## 🧪 Testing the Application

### Test 1: Create Account

1. Open `http://localhost:8000/form.html`
2. Fill form:
   - Name: `Test User`
   - Address: `123 Test Lane`
   - City: `Test City`
   - Contact: `9876543210` (must be 10 digits)
   - Email: `test@example.com`
   - Password: `password123`
   - Confirm: `password123`
3. Click "Create Account"
4. ✅ Should see "Account created successfully"
5. ✅ Should redirect to login page

### Test 2: Login

1. Open `http://localhost:8000/login.html`
2. Enter email: `test@example.com`
3. Enter password: `password123`
4. Click "Sign In"
5. ✅ Should see "Login successful"
6. ✅ Should redirect to home page

### Test 3: Forgot Password

1. Open `http://localhost:8000/forgot-password.html`
2. Enter email: `test@example.com`
3. Click "Send OTP"
4. ✅ Check backend terminal - you'll see OTP printed
5. Example: `📮 OTP for test@example.com : 123456`
6. Enter that OTP code in the form
7. Click "Verify OTP"
8. ✅ Should move to password reset step
9. Enter new password and confirm
10. Click "Reset Password"
11. ✅ Should show success message

---

## 🆘 TROUBLESHOOTING

### ❌ "Failed to fetch" error

**Check 1: Is backend running?**

- Terminal should show "Server running on port 5000"
- If not: `cd backend && npm start`

**Check 2: Is MongoDB running?**

- Check if MongoDB logs show "Waiting for connections"
- If not: Start MongoDB with `mongod`

**Check 3: Are they on same network?**

- Backend and frontend can be on different ports (that's OK)
- But they must be able to communicate
- Check browser Console (F12) for exact error

### ❌ "Cannot find module" in backend

```bash
cd backend
npm install
```

### ❌ "Error: connect ECONNREFUSED 127.0.0.1:27017"

MongoDB is not running!

- Windows: Open Command Prompt and run `mongod`
- Mac: Run `brew services start mongodb-community`
- Linux: Run `sudo service mongod start`

### ❌ "Port 5000 already in use"

Another process is using port 5000:

- Windows: `netstat -ano | findstr :5000`
- Mac/Linux: `lsof -i :5000`
- Then kill the process or change PORT in `.env`

### ❌ "Email already exists" error

You already have that email in database!

- Change email to: `test2@example.com`
- Or clear database (delete all documents)

### ❌ Form won't submit / no error message

- Open Browser Console (F12)
- Look for red errors
- Check that all fields are filled
- Contact must be exactly 10 digits

---

## 📊 File Structure

```
pro/
├── 📄 QUICK_START.md          👈 You are here
├── 📄 index.html              (Home page)
├── 📄 login.html              (Login page)
├── 📄 form.html               (Signup page)
├── 📄 forgot-password.html    (Password reset)
├── 📄 api-client.js           (API calls)
│
└── backend/
    ├── 📄 server.js           (Main server)
    ├── 📄 package.json        (Dependencies)
    ├── 📄 .env                (Configuration)
    ├── routes/
    │   └── 📄 auth.js         (Auth endpoints)
    ├── models/
    │   └── 📄 User.js         (Database model)
    └── middleware/
        └── 📄 authmiddleware.js
```

---

## 🚀 FINAL CHECKLIST

Before reporting issues, verify:

- [ ] MongoDB is running (check terminal for "Waiting for connections")
- [ ] Backend is running on http://localhost:5000 (check terminal output)
- [ ] Frontend is served on http://localhost:8000 or similar
- [ ] Browser Console (F12) shows no errors
- [ ] .env file exists in backend folder
- [ ] MONGO_URI in .env is correct (local or Atlas)
- [ ] All dependencies installed (`npm install` in backend)

---

## 💡 COMMON MISTAKES

1. **Running frontend without starting backend**
   - Fix: `cd backend && npm start`

2. **Running backend without MongoDB**
   - Fix: Start MongoDB first (`mongod`)

3. **Closing terminal with backend**
   - Fix: Keep terminal open while using app

4. **Using wrong email after signup**
   - Fix: Use same email for login as signup

5. **Contact number not 10 digits**
   - Fix: Must be exactly 10 numbers

6. **Cleared terminal history**
   - Fix: Backend is still running if you didn't close window

---

## ✅ SUCCESS INDICATORS

When everything works, you should see:

- ✅ Backend: Green text "Server running on port 5000"
- ✅ Frontend: Page loads with navigation bar
- ✅ Login: Can fill form and click button
- ✅ Response: Success message in green toast
- ✅ Database: New user appears in MongoDB

---

## 📞 STILL HAVING ISSUES?

1. Check browser Console (F12) → Console tab
2. Check backend terminal for errors
3. Verify MongoDB is running
4. Check .env file has correct values
5. Delete backend/node_modules and run `npm install` again

---

## 🎉 THAT'S IT!

You now have a fully functional authentication system!

**Time to complete:** ~10 minutes

---

**Happy Coding! 🌾**
