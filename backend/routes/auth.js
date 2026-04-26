const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middleware/authmiddleware");
const rateLimit = require("express-rate-limit");
const nodemailer = require("nodemailer");

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// RATE LIMITERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Login limiter: max 5 attempts per 15 minutes per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Max 5 attempts
  message: "❌ Too many login attempts. Please try again after 15 minutes.",
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
});

// Forgot password limiter: max 3 attempts per hour per IP
const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Max 3 attempts
  message: "❌ Too many password reset attempts. Please try again after 1 hour.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Verify OTP limiter: max 5 attempts per 15 minutes per IP
const verifyOtpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Max 5 attempts
  message: "❌ Too many OTP verification attempts. Please try again after 15 minutes.",
  standardHeaders: true,
  legacyHeaders: false,
});

function createMailTransporter() {
  const {
    EMAIL_SERVICE,
    EMAIL_HOST,
    EMAIL_PORT,
    EMAIL_SECURE,
    EMAIL_USER,
    EMAIL_PASSWORD
  } = process.env;

  const hasPlaceholderUser = !EMAIL_USER || EMAIL_USER.includes("your-email");
  const hasPlaceholderPassword = !EMAIL_PASSWORD || EMAIL_PASSWORD.includes("your-app-password");

  if (hasPlaceholderUser || hasPlaceholderPassword) {
    throw new Error("OTP email sender is not configured. Add a real sender email and app password in backend/.env or root .env.");
  }

  if (EMAIL_SERVICE) {
    return nodemailer.createTransport({
      service: EMAIL_SERVICE,
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASSWORD
      }
    });
  }

  if (!EMAIL_HOST || !EMAIL_PORT) {
    throw new Error("Email sender is not configured. Set EMAIL_SERVICE or EMAIL_HOST and EMAIL_PORT in backend/.env.");
  }

  return nodemailer.createTransport({
    host: EMAIL_HOST,
    port: Number(EMAIL_PORT),
    secure: EMAIL_SECURE === "true" || Number(EMAIL_PORT) === 465,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASSWORD
    }
  });
}

function isOtpEmailConfigured() {
  const { EMAIL_USER, EMAIL_PASSWORD } = process.env;

  const hasPlaceholderUser = !EMAIL_USER || EMAIL_USER.includes("your-email");
  const hasPlaceholderPassword = !EMAIL_PASSWORD || EMAIL_PASSWORD.includes("your-app-password");

  return !hasPlaceholderUser && !hasPlaceholderPassword;
}

async function sendOtpEmail(recipientEmail, otp) {
  const shouldAllowConsoleFallback = process.env.NODE_ENV !== "production";

  if (!isOtpEmailConfigured()) {
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
    console.warn("⚠️ OTP email sender is not configured. Falling back to console OTP for local testing.");
    console.log("📮 OTP for", recipientEmail, ":", otp);
    console.log("⏱️  OTP expires at:", otpExpiry);

    return {
      delivery: "console",
      previewOtp: otp,
      expiresAt: otpExpiry.toISOString()
    };
  }

  const transporter = createMailTransporter();
  const fromAddress = process.env.EMAIL_FROM || process.env.EMAIL_USER;

  try {
    await transporter.sendMail({
      from: fromAddress,
      to: recipientEmail,
      subject: "CropCare password reset OTP",
      text: `Your CropCare password reset OTP is ${otp}. It will expire in 5 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
          <h2 style="color: #0f6b46;">CropCare Password Reset</h2>
          <p>Use the OTP below to reset your password:</p>
          <div style="display: inline-block; padding: 12px 20px; font-size: 28px; font-weight: 700; letter-spacing: 6px; background: #f3f4f6; border-radius: 8px; color: #0f6b46;">
            ${otp}
          </div>
          <p style="margin-top: 16px;">This OTP will expire in 5 minutes.</p>
          <p>If you did not request this, you can ignore this email.</p>
        </div>
      `
    });
    return {
      delivery: "email"
    };
  } catch (error) {
    if (error.code === "EAUTH" && shouldAllowConsoleFallback) {
      const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
      console.warn("⚠️ OTP email login failed. Falling back to console OTP for local testing.");
      console.log("📮 OTP for", recipientEmail, ":", otp);
      console.log("⏱️  OTP expires at:", otpExpiry);
      return {
        delivery: "console",
        previewOtp: otp,
        expiresAt: otpExpiry.toISOString()
      };
    }

    if (error.code === "EAUTH") {
      throw new Error("OTP email login failed. Check EMAIL_USER and use a valid mail app password.");
    }

    if ((error.code === "ESOCKET" || error.code === "ECONNECTION" || error.code === "ETIMEDOUT") && shouldAllowConsoleFallback) {
      const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
      console.warn("⚠️ OTP email connection failed. Falling back to console OTP for local testing.");
      console.log("📮 OTP for", recipientEmail, ":", otp);
      console.log("⏱️  OTP expires at:", otpExpiry);
      return {
        delivery: "console",
        previewOtp: otp,
        expiresAt: otpExpiry.toISOString()
      };
    }

    if (error.code === "ESOCKET" || error.code === "ECONNECTION" || error.code === "ETIMEDOUT") {
      throw new Error("OTP email server connection failed. Check your internet connection and SMTP settings.");
    }

    throw new Error(`OTP email could not be sent: ${error.message}`);
  }
}

/**
 * 📚 AUTHENTICATION ROUTES
 * 
 * This file contains all authentication-related routes:
 * 1. Signup - User registration
 * 2. Login - User authentication with JWT
 * 3. Forgot Password - OTP generation and verification
 * 4. Reset Password - Password change using OTP
 * 5. Profile - Protected route (requires JWT)
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 1️⃣ SIGNUP ROUTE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * POST /api/auth/signup
 * 
 * Register a new user
 * 
 * REQUEST BODY:
 * {
 *   "name": "Farmer Name",
 *   "address": "123 Village Lane",
 *   "city": "Village City",
 *   "contact": "9876543210",
 *   "email": "farmer@example.com",
 *   "password": "securepass123",
 *   "confirmPassword": "securepass123"
 * }
 * 
 * VALIDATION STEPS:
 * 1. Check if all fields are provided
 * 2. Verify password and confirmPassword match
 * 3. Check if email is already registered (unique constraint)
 * 4. Hash password using bcrypt (one-way encryption)
 * 5. Store user data in MongoDB
 * 
 * RESPONSE: {"message": "Account created successfully"}
 */

router.post("/signup", async (req, res) => {
  try {
    const { name, address, city, contact, email, password, confirmPassword } = req.body;

    // ✅ VALIDATION 1: Check if all fields are provided
    if (!name || !address || !city || !contact || !email || !password || !confirmPassword) {
      return res.status(400).json({ 
        message: "❌ All fields are required" 
      });
    }

    // ✅ VALIDATION 2: Check if password and confirmPassword match
    if (password !== confirmPassword) {
      return res.status(400).json({ 
        message: "❌ Passwords do not match" 
      });
    }

    // ✅ VALIDATION 3: Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ 
        message: "❌ Email already registered. Please login or use different email." 
      });
    }

    // ✅ VALIDATION 4: Hash password using bcrypt
    // bcrypt.hash(password, saltRounds)
    // saltRounds = 10 = number of times password is hashed (more rounds = more secure but slower)
    // Example: "password123" → "$2a$10$x8Ks8.vH2.pQ5.rJ9x.K2euJ5vA3B8c7D0e9f5gH2iJ3k4L5m6N7o8P9q"
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ VALIDATION 5: Create new user object
    const user = new User({
      name: name.trim(),
      address: address.trim(),
      city: city.trim(),
      contact: contact.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword
    });

    // Save user to MongoDB
    await user.save();

    // Return success message
    res.status(201).json({ 
      message: "✅ Account created successfully! You can now login." 
    });

  } catch (error) {
    console.error("Signup Error:", error);
    
    // Handle validation errors from schema
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: "❌ Validation error", 
        errors: messages 
      });
    }

    // Don't expose sensitive error details to client
    res.status(500).json({ 
      message: "❌ Signup failed. Please try again." 
    });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 2️⃣ LOGIN ROUTE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * POST /api/auth/login
 * 
 * Authenticate user and generate JWT token
 * 
 * REQUEST BODY:
 * {
 *   "email": "farmer@example.com",
 *   "password": "securepass123"
 * }
 * 
 * PROCESS:
 * 1. Find user by email in database
 * 2. Compare provided password with hashed password using bcrypt.compare()
 * 3. If match → generate JWT token with user ID
 * 4. Return token to frontend
 * 
 * RESPONSE: {"message": "Login successful", "token": "eyJhbGc..."}
 * 
 * FRONTEND NEXT STEPS:
 * - Store token in localStorage or sessionStorage
 * - Send token in "Authorization" header for future requests
 */

router.post("/login", loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    // ✅ VALIDATION 1: Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({ 
        message: "❌ Email and password are required" 
      });
    }

    // ✅ VALIDATION 2: Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ 
        message: "❌ Invalid email or password" 
      });
    }

    // ✅ VALIDATION 3: Compare password with hashed password
    // bcrypt.compare(plainPassword, hashedPassword) returns true/false
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        message: "❌ Invalid email or password" 
      });
    }

    // ✅ VALIDATION 4: Generate JWT token
    // jwt.sign(payload, secret, options)
    // payload = {id: user._id} (stored in token)
    // secret = process.env.JWT_SECRET (known only to server)
    // options = {expiresIn: "7d"} (token valid for 7 days)
    const token = jwt.sign(
      { id: user._id }, 
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Return success with token
    res.status(200).json({ 
      message: "✅ Login successful",
      token: token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ 
      message: "❌ Login failed. Please try again." 
    });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 3️⃣ FORGOT PASSWORD - GENERATE OTP
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * POST /api/auth/forgot-password
 * 
 * Generate and send OTP for password reset
 * 
 * REQUEST BODY:
 * {
 *   "email": "farmer@example.com"
 * }
 * 
 * OTP FLOW:
 * 1. Find user by email
 * 2. Generate random 6-digit OTP
 * 3. Set OTP expiry to 5 minutes from now
 * 4. Save OTP and expiry in database
 * 5. Send OTP to the user's email
 * 
 * RESPONSE: {"message": "OTP sent to your email"}
 */

router.post("/forgot-password", forgotPasswordLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    // ✅ VALIDATION 1: Check if email is provided
    if (!email) {
      return res.status(400).json({ 
        message: "❌ Email is required" 
      });
    }

    // ✅ VALIDATION 2: Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ 
        message: "❌ Email not registered with us" 
      });
    }

    // ✅ VALIDATION 3: Generate 6-digit OTP
    // Math.floor(100000 + Math.random() * 900000)
    // Generates number between 100000 and 999999
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // ✅ VALIDATION 4: Hash OTP before storing (for security)
    // Use bcrypt to hash the OTP so plain text is never stored
    const hashedOtp = await bcrypt.hash(otp, 10);

    // ✅ VALIDATION 5: Calculate OTP expiry time
    // Date.now() = current timestamp in milliseconds
    // 5 * 60 * 1000 = 5 minutes in milliseconds
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    // ✅ VALIDATION 6: Update user with hashed OTP and expiry
    user.otp = hashedOtp;
    user.otpExpiry = otpExpiry;
    await user.save();

    const deliveryResult = await sendOtpEmail(user.email, otp);

    if (deliveryResult.delivery === "email") {
      console.log("📮 OTP email sent to", user.email);
    }
    console.log("⏱️  OTP expires at:", otpExpiry);

    const isConsoleDelivery = deliveryResult.delivery === "console";

    res.status(200).json({
      message: isConsoleDelivery
        ? "✅ OTP generated for local testing. Check the backend console because email is not configured yet."
        : "✅ OTP sent to your email",
      delivery: deliveryResult.delivery,
      previewOtp: deliveryResult.previewOtp,
      emailConfigured: deliveryResult.delivery === "email",
      expiresAt: otpExpiry.toISOString(),
      expiresIn: "5 minutes"
    });

  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ 
      message: error.message || "❌ Failed to send OTP. Please try again." 
    });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 4️⃣ FORGOT PASSWORD - VERIFY OTP
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * POST /api/auth/verify-otp
 * 
 * Verify OTP provided by user
 * 
 * REQUEST BODY:
 * {
 *   "email": "farmer@example.com",
 *   "otp": "123456"
 * }
 * 
 * VERIFICATION STEPS:
 * 1. Find user by email
 * 2. Check if OTP matches
 * 3. Check if OTP has not expired
 * 4. If valid → allow password reset
 * 
 * RESPONSE: {"message": "OTP verified. You can now reset password"}
 */

router.post("/verify-otp", verifyOtpLimiter, async (req, res) => {
  try {
    const { email, otp } = req.body;

    // ✅ VALIDATION 1: Check if email and OTP are provided
    if (!email || !otp) {
      return res.status(400).json({ 
        message: "❌ Email and OTP are required" 
      });
    }

    // ✅ VALIDATION 2: Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ 
        message: "❌ User not found" 
      });
    }

    // ✅ VALIDATION 3: Check if OTP exists
    if (!user.otp) {
      return res.status(400).json({ 
        message: "❌ No OTP requested for this email. Please request OTP first." 
      });
    }

    // ✅ VALIDATION 4: Check if OTP has expired (before comparing)
    if (new Date() > user.otpExpiry) {
      // Clear expired OTP from database
      user.otp = null;
      user.otpExpiry = null;
      await user.save();

      return res.status(401).json({ 
        message: "❌ OTP has expired. Please request a new OTP." 
      });
    }

    // ✅ VALIDATION 5: Compare OTP with hashed OTP using bcrypt
    // bcrypt.compare(plainOtp, hashedOtp) returns true/false
    const isOtpValid = await bcrypt.compare(otp, user.otp);
    if (!isOtpValid) {
      return res.status(401).json({ 
        message: "❌ Invalid OTP" 
      });
    }

    // If all validations pass, return success
    res.status(200).json({ 
      message: "✅ OTP verified successfully. You can now reset your password." 
    });

  } catch (error) {
    console.error("Verify OTP Error:", error);
    res.status(500).json({ 
      message: "❌ OTP verification failed. Please try again." 
    });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 5️⃣ RESET PASSWORD
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * POST /api/auth/reset-password
 * 
 * Reset password after OTP verification
 * 
 * REQUEST BODY:
 * {
 *   "email": "farmer@example.com",
 *   "otp": "123456",
 *   "newPassword": "newSecurePass123",
 *   "confirmPassword": "newSecurePass123"
 * }
 * 
 * PROCESS:
 * 1. Find user by email
 * 2. Verify OTP (same checks as verify-otp route)
 * 3. Check if passwords match
 * 4. Hash new password
 * 5. Update password in database
 * 6. Clear OTP and OTP expiry
 * 
 * RESPONSE: {"message": "Password reset successful"}
 */

router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body;

    // ✅ VALIDATION 1: Check if all fields are provided
    if (!email || !otp || !newPassword || !confirmPassword) {
      return res.status(400).json({ 
        message: "❌ All fields are required" 
      });
    }

    // ✅ VALIDATION 2: Check if passwords match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ 
        message: "❌ Passwords do not match" 
      });
    }

    // ✅ VALIDATION 3: Find user and verify OTP
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ 
        message: "❌ User not found" 
      });
    }

    if (!user.otp || !user.otpExpiry) {
      return res.status(400).json({
        message: "❌ No OTP requested for this email. Please request OTP first."
      });
    }

    // ✅ VALIDATION 4: Verify OTP validity (expiry check first)
    if (new Date() > user.otpExpiry) {
      user.otp = null;
      user.otpExpiry = null;
      await user.save();
      
      return res.status(401).json({ 
        message: "❌ OTP has expired. Please request a new OTP." 
      });
    }

    // ✅ VALIDATION 5: Compare OTP using bcrypt
    const isOtpValid = await bcrypt.compare(otp, user.otp);
    if (!isOtpValid) {
      return res.status(401).json({ 
        message: "❌ Invalid OTP" 
      });
    }

    // ✅ VALIDATION 6: Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // ✅ VALIDATION 7: Update password and clear OTP
    user.password = hashedPassword;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    res.status(200).json({ 
      message: "✅ Password reset successful! You can now login with your new password." 
    });

  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ 
      message: "❌ Password reset failed. Please try again." 
    });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 6️⃣ GET USER PROFILE (PROTECTED ROUTE)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * GET /api/auth/profile
 * 
 * Get logged-in user's profile (PROTECTED ROUTE)
 * 
 * HEADERS REQUIRED:
 * {
 *   "Authorization": "Bearer <JWT_TOKEN>"
 * }
 * 
 * HOW IT WORKS:
 * 1. Request comes with JWT token in Authorization header
 * 2. authMiddleware verifies the token
 * 3. If valid, req.user.id contains user ID
 * 4. Fetch user from database using that ID
 * 5. Return user data (without password)
 * 
 * RESPONSE: {
 *   "_id": "507f1f77bcf86cd799439011",
 *   "name": "Farmer Name",
 *   "email": "farmer@example.com",
 *   "city": "Village City",
 *   "contact": "9876543210",
 *   "address": "123 Village Lane"
 * }
 */

router.get("/profile", authMiddleware, async (req, res) => {
  try {
    // req.user.id is set by authMiddleware after verifying JWT token
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ 
        message: "❌ User not found" 
      });
    }

    res.status(200).json({
      message: "✅ Profile retrieved successfully",
      user: user
    });

  } catch (error) {
    console.error("Profile Error:", error);
    res.status(500).json({ 
      message: "❌ Failed to fetch profile" 
    });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 7️⃣ UPDATE USER PROFILE (PROTECTED ROUTE) - OPTIONAL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * PUT /api/auth/profile
 * 
 * Update user's profile information
 * 
 * REQUEST BODY:
 * {
 *   "name": "Updated Name",
 *   "city": "Updated City",
 *   "address": "Updated Address",
 *   "contact": "9876543210"
 * }
 */

router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const { name, city, address, contact } = req.body;

    // Find and update user
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { 
        name: name?.trim() || undefined,
        city: city?.trim() || undefined,
        address: address?.trim() || undefined,
        contact: contact?.trim() || undefined
      },
      { new: true, runValidators: true } // Return updated user and run schema validations
    ).select("-password");

    res.status(200).json({
      message: "✅ Profile updated successfully",
      user: user
    });

  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ 
      message: "❌ Failed to update profile" 
    });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 8️⃣ LOGOUT ROUTE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * POST /api/auth/logout
 * 
 * Logout user and destroy session/token
 * 
 * HOW IT WORKS:
 * 1. Frontend sends request with JWT token in Authorization header
 * 2. Token is verified by authMiddleware
 * 3. Backend returns success message
 * 4. Frontend clears token from localStorage/sessionStorage
 * 5. Frontend redirects to login page
 * 
 * NOTE: JWT logout is stateless - no server-side session to destroy
 * Token becomes unusable when:
 * - Frontend removes it from storage
 * - Token expiry time passes (7 days)
 * 
 * RESPONSE: {"message": "Logout successful"}
 */

router.post("/logout", authMiddleware, async (req, res) => {
  try {
    // Token is already verified by authMiddleware
    // Simply return success message
    // Frontend is responsible for clearing the token
    
    res.status(200).json({
      message: "✅ Logout successful! Session destroyed."
    });

  } catch (error) {
    console.error("Logout Error:", error);
    res.status(500).json({
      message: "❌ Logout failed. Please try again."
    });
  }
});

module.exports = router;
