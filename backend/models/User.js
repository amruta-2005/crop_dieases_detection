const mongoose = require("mongoose");

/**
 * 📋 USER SCHEMA / DATA MODEL
 * 
 * This defines the structure of user data in MongoDB
 * Each field has a type and validation rules
 * 
 * DATA STORAGE:
 * - MongoDB stores this as JSON documents in the "users" collection
 * - Location on your computer: C:\data\db\crop_app.users* (MongoDB system files)
 * - You can view data using MongoDB Compass or mongo shell
 */

const userSchema = new mongoose.Schema(
  {
    // User's full name
    name: {
      type: String,
      required: [true, "Name is required"], // Validation: cannot be empty
      trim: true // Remove whitespace from both ends
    },

    // User's address
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true
    },

    // User's city
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true
    },

    // User's mobile number (10 digits)
    contact: {
      type: String,
      required: [true, "Contact number is required"],
      match: [/^\d{10}$/, "Please enter a valid 10-digit mobile number"] // Validation
    },

    // User's email (unique, cannot have duplicates)
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: [true, "Email already exists"], // Ensures no duplicate emails
      lowercase: true, // Convert to lowercase for consistency
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"] // Email format validation
    },

    // User's password (hashed using bcrypt)
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"] // Validation
    },

    // OTP (One-Time Password) for forgot password feature
    otp: {
      type: String,
      default: null // Empty until user requests password reset
    },

    // OTP expiry time (5 minutes from generation)
    otpExpiry: {
      type: Date,
      default: null // Will be set when OTP is generated
    }
  },
  {
    timestamps: true // Automatically adds createdAt and updatedAt fields
  }
);

module.exports = mongoose.model("User", userSchema);