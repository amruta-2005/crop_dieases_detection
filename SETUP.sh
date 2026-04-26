#!/bin/bash

# ============================================
# COMPLETE PROJECT SETUP SCRIPT
# ============================================
# This script will set everything up for you

echo "=========================================="
echo "🚀 CropCare Project Setup"
echo "=========================================="

# Step 1: Check Node.js
echo ""
echo "✓ Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js from https://nodejs.org/"
    exit 1
fi
echo "✓ Node.js found: $(node -v)"

# Step 2: Check npm
echo ""
echo "✓ Checking npm..."
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi
echo "✓ npm found: $(npm -v)"

# Step 3: Install backend dependencies
echo ""
echo "✓ Installing backend dependencies..."
cd backend
npm install

# Step 4: Check .env file
echo ""
echo "✓ Checking .env file..."
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating one..."
    cat > .env << EOF
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/crop_app
JWT_SECRET=your_secret_key_change_this_in_production_12345
OTP_EXPIRY=5
OTP_LENGTH=6
EOF
    echo "✓ .env file created"
else
    echo "✓ .env file found"
fi

cd ..

echo ""
echo "=========================================="
echo "✅ Setup Complete!"
echo "=========================================="
echo ""
echo "📋 Next Steps:"
echo ""
echo "1️⃣  Start MongoDB (if not running):"
echo "   - Windows: mongod"
echo "   - Mac: brew services start mongodb-community"
echo "   - Linux: sudo service mongod start"
echo ""
echo "2️⃣  Start Backend Server:"
echo "   cd backend"
echo "   npm start"
echo ""
echo "3️⃣  Open Frontend in Browser:"
echo "   - Open index.html with Live Server"
echo "   OR"
echo "   - python -m http.server 8000"
echo ""
echo "4️⃣  Test the app:"
echo "   - http://localhost:8000"
echo ""
echo "=========================================="
