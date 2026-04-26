const jwt = require("jsonwebtoken");

/**
 * 🔐 JWT AUTHENTICATION MIDDLEWARE
 * 
 * PURPOSE: Verify JWT token in request headers and allow access to protected routes
 * 
 * HOW JWT WORKS:
 * 1. User logs in → Server creates JWT token with user ID
 * 2. Token = header.payload.signature (3 parts separated by dots)
 * 3. Token is sent to frontend → stored in browser/memory
 * 4. Frontend sends token in "Authorization" header for protected requests
 * 5. Server verifies token signature → if valid, allows access
 * 6. If token is invalid/expired → access denied
 * 
 * ADVANTAGES:
 * - Stateless: No need to store sessions on server
 * - Scalable: Works well with multiple servers
 * - Secure: Cannot be tampered with (signature verification)
 * 
 * EXAMPLE REQUEST:
 * GET /api/profile
 * Headers: {
 *   "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 * }
 */

const authMiddleware = (req, res, next) => {
  try {
    // Get token from Authorization header
    // Format: "Bearer <token>"
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ 
        message: "❌ No token provided. Please login first." 
      });
    }

    // Verify token using JWT secret
    // If signature is invalid or token expired → jwt.verify throws error
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // If valid, attach user ID to request object
    // This allows route handlers to access req.user.id
    req.user = decoded;

    // Move to next middleware/route handler
    next();

  } catch (error) {
    // Handle different JWT errors
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ 
        message: "❌ Token expired. Please login again." 
      });
    }
    
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ 
        message: "❌ Invalid token. Please login again." 
      });
    }

    return res.status(500).json({ 
      message: "❌ Authentication error", 
      error: error.message 
    });
  }
};

module.exports = authMiddleware;