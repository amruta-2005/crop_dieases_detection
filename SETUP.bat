@echo off
cls
echo.
echo ==========================================
echo 🚀 CropCare Project Setup (Windows)
echo ==========================================
echo.

REM Check Node.js
echo ✓ Checking Node.js...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed!
    echo Please install from: https://nodejs.org/
    pause
    exit /b 1
)
echo ✓ Node.js installed
echo.

REM Check npm
echo ✓ Checking npm...
npm -v >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed!
    pause
    exit /b 1
)
echo ✓ npm installed
echo.

REM Install backend dependencies
echo ✓ Installing backend dependencies...
cd backend
call npm install
echo ✓ Backend dependencies installed
cd ..
echo.

REM Check .env file
echo ✓ Checking .env file...
if not exist "backend\.env" (
    echo Creating .env file...
    (
        echo PORT=5000
        echo MONGO_URI=mongodb://127.0.0.1:27017/crop_app
        echo JWT_SECRET=your_secret_key_change_this_in_production_12345
        echo OTP_EXPIRY=5
        echo OTP_LENGTH=6
    ) > "backend\.env"
    echo ✓ .env file created
) else (
    echo ✓ .env file already exists
)
echo.

echo ==========================================
echo ✅ Setup Complete!
echo ==========================================
echo.
echo 📋 NEXT STEPS:
echo.
echo 1️⃣  Start MongoDB (if installed locally)
echo   Open Command Prompt and run: mongod
echo.
echo 2️⃣  Start Backend Server
echo   Open Command Prompt in this folder:
echo   cd backend
echo   npm start
echo.
echo 3️⃣  Open Frontend in Browser
echo   Option A: Right-click index.html → Open with Live Server
echo   Option B: Open Command Prompt and run:
echo            python -m http.server 8000
echo            Then open http://localhost:8000
echo.
echo 4️⃣  Test Login
echo   - Create account on form.html
echo   - Login on login.html
echo   - Try forgot password
echo.
echo ==========================================
echo.
pause
