# 🆘 TROUBLESHOOTING GUIDE

## ❌ ERROR: "Failed to fetch"

This is the most common error. It means the frontend cannot connect to the backend.

### 🔍 DIAGNOSIS

Open your browser console (Press F12) and look for this error:

```
TypeError: Failed to fetch
  at apiCall (api-client.js:XX:XX)
```

This means:

- ❌ Backend server is NOT running on `http://localhost:5000`
- ❌ MongoDB connection is failing
- ❌ Network communication is blocked

---

## ✅ SOLUTION (Step by Step)

### STEP 1: Check Backend Server

#### Is the backend running?

Open **Command Prompt/Terminal** and check for this output:

**Expected:**

```
✅ Server Status: RUNNING
🚀 Server URL: http://localhost:5000
✅ MongoDB Connected Successfully
```

**If you see this, SKIP TO STEP 2**

**If NOT, do this:**

```bash
cd backend
npm start
```

Wait for the green messages. Keep this terminal open!

---

### STEP 2: Check MongoDB

If backend shows error: `❌ MongoDB Connection Failed`

You need to start MongoDB:

#### Windows:

1. Open Command Prompt (new window)
2. Type: `mongod`
3. Keep it running

#### Mac:

```bash
brew services start mongodb-community
```

#### Linux:

```bash
sudo service mongod start
```

**Then restart backend:**

```bash
cd backend
npm start
```

---

### STEP 3: Check .env File

Make sure `backend/.env` exists and has:

```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/crop_app
JWT_SECRET=your_secret_key_change_this_in_production_12345
OTP_EXPIRY=5
OTP_LENGTH=6
```

**If not, create it!**

---

### STEP 4: Test Connection

Open this page in browser:

```
http://localhost:8000/test-connection.html
```

Click "RUN ALL TESTS" and check which tests fail.

---

## 🔧 DETAILED FIXES

### Issue: "Cannot connect to MongoDB"

Error in backend terminal:

```
❌ MongoDB Connection Failed
```

**Fix:**

1. Is MongoDB installed?
   - Windows: Download from https://www.mongodb.com/try/download/community
   - Mac: `brew install mongodb-community`
   - Linux: `sudo apt-get install mongodb`

2. Start MongoDB:
   - Windows: `mongod`
   - Mac: `brew services start mongodb-community`
   - Linux: `sudo service mongod start`

3. Check if MongoDB is running:
   - Mac/Linux: `lsof | grep mongod`
   - Windows: Task Manager → look for "mongod.exe"

4. Restart backend:
   ```bash
   cd backend
   npm start
   ```

---

### Issue: "Cannot install dependencies"

Error:

```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**Fix:**

```bash
cd backend
npm install --legacy-peer-deps
```

---

### Issue: "Port 5000 already in use"

Error:

```
Error: listen EADDRINUSE: address already in use :::5000
```

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

**Or change port in `backend/.env`:**

```
PORT=5001
```

Then update `api-client.js`:

```javascript
const BACKEND_URL = "http://localhost:5001";
```

---

### Issue: Form submission doesn't work

**Check 1: Browser Console**

1. Press F12
2. Click "Console" tab
3. Look for red errors
4. Screenshot and check

**Check 2: Network Tab**

1. Press F12
2. Click "Network" tab
3. Submit form
4. Look for failed requests
5. Red error = API call failed

**Check 3: Form Validation**
Make sure you fill ALL fields correctly:

- **Name**: Any text
- **Address**: Any text
- **City**: Any text
- **Contact**: EXACTLY 10 digits (no letters!)
- **Email**: Valid email format (example@test.com)
- **Password**: At least 6 characters
- **Confirm Password**: Must match password

---

### Issue: "Email already exists" error

You already registered with that email.

**Solutions:**

1. Use different email: `test2@example.com`
2. Try to login with that email
3. Clear MongoDB database (delete collection)

---

### Issue: "Database error" on signup

**Possible causes:**

1. MongoDB not running
2. Database connection string wrong
3. Network issue

**Fix:**

```bash
# Check MongoDB
mongod

# Restart backend
cd backend
npm start

# Retry signup
```

---

### Issue: Frontend loads but buttons don't work

**Check:**

1. Is `api-client.js` loaded?
   - Press F12 → Console
   - Should see: `🚀 API Client Initialized`
   - Should see: `📍 Backend URL: http://localhost:5000`

2. If NOT loaded:
   - Check HTML has: `<script src="api-client.js"></script>`
   - Reload page (Ctrl+Shift+R)

3. If still not working:
   - Check browser console for JavaScript errors
   - Make sure `api-client.js` is in same folder as HTML

---

### Issue: "Network error" in browser console

Your browser cannot reach the backend server.

**Causes:**

1. Backend not running
2. Wrong URL in `api-client.js`
3. Firewall blocking port 5000
4. Backend crashed

**Fix:**

1. Check backend is running: `npm start`
2. Check port 5000 is correct
3. Check firewall allows port 5000
4. Check backend logs for errors

---

## 🧪 COMPLETE DIAGNOSIS FLOW

### Do this in order:

**Terminal 1 - MongoDB:**

```bash
mongod
# Should show: "Waiting for connections on port 27017"
```

**Terminal 2 - Backend:**

```bash
cd backend
npm install
npm start
# Should show: "🚀 Server URL: http://localhost:5000"
```

**Terminal 3 - Frontend:**

```bash
# Option A: Python
python -m http.server 8000

# Option B: Node
npm install -g http-server && http-server
```

**Browser:**

1. Open: `http://localhost:8000/test-connection.html`
2. Click "RUN ALL TESTS"
3. All should be green ✅
4. If not, check which one failed

**Then test:**

1. Open: `http://localhost:8000/form.html`
2. Fill form completely
3. Click "Create Account"
4. Should see success message in green

---

## ✅ VERIFICATION CHECKLIST

Before saying "it doesn't work":

- [ ] MongoDB is running (`mongod` showing "Waiting for connections")
- [ ] Backend is running (`npm start` showing green checkmarks)
- [ ] Frontend is served (`http://localhost:8000` loads page)
- [ ] All 3 are running simultaneously
- [ ] None of the terminal windows are closed
- [ ] .env file exists in `backend/` folder
- [ ] Filled ALL form fields correctly
- [ ] Contact is EXACTLY 10 digits
- [ ] Email hasn't been used before
- [ ] Password is at least 6 characters

---

## 🆘 LAST RESORT

If nothing works:

1. **Close everything**
   - Close all terminal windows
   - Close all browser tabs with your app
   - Close VS Code

2. **Start fresh**

   ```bash
   cd backend
   rm -rf node_modules package-lock.json
   npm install
   npm start
   ```

3. **Check ports**

   ```bash
   # Windows
   netstat -ano | findstr :5000
   netstat -ano | findstr :27017

   # Mac/Linux
   lsof -i :5000
   lsof -i :27017
   ```

4. **Restart computer**
   - Sometimes port caching causes issues
   - Restart OS completely

5. **Reinstall MongoDB**
   - Uninstall completely
   - Restart computer
   - Reinstall fresh

---

## 📞 GET HELP

When asking for help, provide:

1. **Backend terminal output** (screenshot)
   - Copy-paste what you see
2. **Browser console error** (F12 → Console)
   - Take screenshot

3. **Network error details** (F12 → Network)
   - Take screenshot

4. **What did you do?**
   - Step by step

5. **What happened?**
   - Exact error message

6. **What should happen?**
   - Expected result

---

## ✅ SYMPTOM → SOLUTION MAP

| You see...                   | You should...                                    |
| ---------------------------- | ------------------------------------------------ |
| Black terminal with nothing  | Type `npm start` in backend folder               |
| "Cannot connect MongoDB"     | Start MongoDB with `mongod`                      |
| "Port 5000 in use"           | Kill process or change PORT in .env              |
| "Failed to fetch" in browser | Check backend is running                         |
| Form won't submit            | Check F12 console for errors                     |
| Blank page on signup         | Check backend logs for errors                    |
| Email already exists         | Use different email or clear database            |
| Button doesn't respond       | Check api-client.js is loaded (F12 console)      |
| No success message           | Check browser network tab - what's the response? |

---

## 🎯 REAL EXAMPLE

**Problem:** Got "Failed to fetch" error

**My steps:**

1. ❌ Backend not running → I typed `npm start`
2. ❌ MongoDB error → I opened new terminal and typed `mongod`
3. ✅ Backend connects → Green message appears
4. ✅ Open test page → http://localhost:8000/test-connection.html
5. ✅ All tests pass → Green checkmarks
6. ✅ Try signup → Works!
7. ✅ Try login → Works!
8. ✅ Try forgot password → Works!

**Total time: 10 minutes**

---

## 💪 YOU GOT THIS!

Most people solve it in less than 5 minutes.

The main thing: Keep all 3 terminals open (MongoDB, Backend, Frontend)

Good luck! 🍀
