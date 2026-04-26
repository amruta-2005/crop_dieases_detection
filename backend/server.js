const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
require("dotenv").config({ path: path.join(__dirname, "..", ".env"), override: false });
const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const { execFile } = require("child_process");
const crypto = require("crypto");
const UploadedImage = require("./models/UploadedImage");

const app = express();
let isMongoConnected = false;
const frontendRoot = path.join(__dirname, '..');
const oneDaySeconds = 24 * 60 * 60;
const oneYearSeconds = 365 * oneDaySeconds;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MIDDLEWARE SETUP
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }

    const isLocalhost =
      /^http:\/\/localhost:\d+$/.test(origin) ||
      /^http:\/\/127\.0\.0\.1:\d+$/.test(origin);

    if (isLocalhost) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true
}));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.disable("x-powered-by");

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SERVE FRONTEND STATIC FILES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.use((req, res, next) => {
  if (
    req.path === "/ml" ||
    req.path.startsWith("/ml/") ||
    req.path === "/node_modules" ||
    req.path.startsWith("/node_modules/") ||
    req.path === "/backend" ||
    req.path.startsWith("/backend/")
  ) {
    return res.status(404).end();
  }

  next();
});

app.use(express.static(frontendRoot, {
  index: false,
  etag: true,
  lastModified: true,
  maxAge: oneDaySeconds * 1000,
  setHeaders: (res, filePath) => {
    if (/\.(avif|webp|png|jpe?g|gif|svg|ico)$/i.test(filePath)) {
      res.setHeader("Cache-Control", `public, max-age=${oneYearSeconds}, immutable`);
      return;
    }

    if (/\.(js|css)$/i.test(filePath)) {
      res.setHeader("Cache-Control", `public, max-age=${oneDaySeconds}`);
      return;
    }

    if (/\.html$/i.test(filePath)) {
      res.setHeader("Cache-Control", "no-cache");
    }
  }
}));

// Serve root index page for frontend access
app.get('/', (req, res) => {
  res.sendFile(path.join(frontendRoot, 'index.html'), {
    headers: {
      "Cache-Control": "no-cache"
    }
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MONGODB CONNECTION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 3000,
})
.then(() => {
  isMongoConnected = true;
  console.log("✅ MongoDB Connected Successfully");
  console.log("📍 Database: crop_app");
})
.catch((err) => {
  isMongoConnected = false;
  console.error("❌ MongoDB Connection Failed:", err);
  console.warn("⚠️ Continuing without MongoDB. Auth features may fail, but image analysis can still work.");
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MULTER SETUP FOR FILE UPLOADS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const uploadsDir = path.join(__dirname, "uploads");
const uploadHistoryDir = path.join(uploadsDir, "history");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("Created uploads directory");
}

if (!fs.existsSync(uploadHistoryDir)) {
  fs.mkdirSync(uploadHistoryDir, { recursive: true });
  console.log("Created uploads history directory");
}

const upload = multer({ dest: uploadsDir });
const resultCache = new Map();
const NON_CROP_MESSAGE = 'Upload the image of the crop neatly.';

function extractJsonObject(text) {
  if (!text) return null;
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch (_) {
    const firstBrace = trimmed.indexOf("{");
    const lastBrace = trimmed.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const candidate = trimmed.slice(firstBrace, lastBrace + 1);
      try {
        return JSON.parse(candidate);
      } catch (__){ return null; }
    }
  }
  return null;
}

function runPythonJson(scriptPath, args = []) {
  return new Promise((resolve, reject) => {
    execFile('python', [scriptPath, ...args], { timeout: 120000 }, (error, stdout, stderr) => {
      if (error) {
        return reject(new Error(stderr || error.message));
      }

      const parsed = extractJsonObject(stdout);
      if (parsed) {
        return resolve(parsed);
      }

      reject(new Error(`Invalid JSON from ${path.basename(scriptPath)}`));
    });
  });
}

function sanitizeFileName(fileName) {
  return (fileName || "uploaded-image")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_+/g, "_");
}

async function saveUploadedImageRecord(file) {
  if (!file) return;

  try {
    const originalName = file.originalname || file.filename || "uploaded-image";
    const safeName = sanitizeFileName(originalName);
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const archiveFileName = `${timestamp}-${file.filename}-${safeName}`;
    const archivePath = path.join(uploadHistoryDir, archiveFileName);

    fs.copyFileSync(file.path, archivePath);

    await UploadedImage.create({
      name: originalName,
      time: new Date(),
      path: archivePath
    });
  } catch (error) {
    console.warn("Could not save uploaded image record:", error.message);
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ROUTES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Authentication Routes
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// IMAGE ANALYSIS ROUTE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

app.post('/analyze', upload.single('image'), (req, res) => {
  (async () => {
    try {
    if (!req.file) {
      return res.status(400).json({ error: '❌ No image uploaded' });
    }

    const imagePath = req.file.path;
    await saveUploadedImageRecord(req.file);
    const imageBuffer = fs.readFileSync(imagePath);
    const hash = crypto.createHash('sha256').update(imageBuffer).digest('hex');

    // Check cache
    if (resultCache.has(hash)) {
      console.log("📦 Returning cached result");
      fs.unlinkSync(imagePath);
      return res.json(resultCache.get(hash));
    }

    const percentageScript = path.join(__dirname, 'analyze.py');
    const result = await runPythonJson(percentageScript, [imagePath]);

    const response = {
      label: result.label,
      confidence: Number(result.confidence || 0),
      advice: result.advice,
      percentage: Number(result.percentage || 0),
      is_valid_crop_image: Boolean(result.is_valid_crop_image),
      validation_message: result.validation_message || ''
    };

    try {
      fs.unlinkSync(imagePath);
    } catch (e) {
      console.warn("Could not delete temp file");
    }

    resultCache.set(hash, response);
    res.json(response);
  } catch (error) {
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {
        console.warn("Could not delete temp file");
      }
    }
    console.error("Server error:", error);
    res.status(500).json({ error: 'Analysis failed' });
  }
  })();
});

app.post('/analyze-model', upload.single('image'), (req, res) => {
  (async () => {
    try {
    if (!req.file) {
      return res.status(400).json({ error: '❌ No image uploaded' });
    }

    const imagePath = req.file.path;
    await saveUploadedImageRecord(req.file);
    const pythonScript = path.join(__dirname, 'analyze_model.py');
    const result = await runPythonJson(pythonScript, [imagePath]);

    try {
      fs.unlinkSync(imagePath);
    } catch (e) {
      console.warn("Could not delete temp file");
    }

    if (result.error) {
      return res.status(500).json(result);
    }

    if (!result.is_valid_crop_image) {
      return res.status(400).json({
        error: NON_CROP_MESSAGE
      });
    }

    res.json(result);
  } catch (error) {
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {
        console.warn("Could not delete temp file");
      }
    }
    console.error("Model server error:", error);
    res.status(500).json({ error: 'Model analysis failed' });
  }
  })();
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HEALTH CHECK ROUTE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

app.get('/health', (req, res) => {
  res.json({ 
    status: "✅ Backend is running",
    mongoConnected: isMongoConnected,
    timestamp: new Date().toISOString()
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ERROR HANDLING
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

app.use((err, req, res, next) => {
  console.error("❌ Error:", err);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error"
  });
});

app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
    path: req.originalUrl
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// START SERVER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("\n╔═══════════════════════════════════════════════════════╗");
  console.log("║  🌾 CROP DISEASE DETECTION SYSTEM - BACKEND 🌾      ║");
  console.log("╚═══════════════════════════════════════════════════════╝\n");
  console.log("✅ Server Status: RUNNING");
  console.log(`🚀 Server URL: http://localhost:${PORT}`);
  console.log(`📍 API Base URL: http://localhost:${PORT}/api/auth`);
  console.log(`🔍 Health Check: http://localhost:${PORT}/health`);
  console.log("\n📚 AVAILABLE ENDPOINTS:");
  console.log("  Authentication:");
  console.log("    POST   /api/auth/signup");
  console.log("    POST   /api/auth/login");
  console.log("    POST   /api/auth/forgot-password");
  console.log("    POST   /api/auth/verify-otp");
  console.log("    POST   /api/auth/reset-password");
  console.log("    GET    /api/auth/profile (Protected)");
  console.log("    PUT    /api/auth/profile (Protected)");
  console.log("  Image Analysis:");
  console.log("    POST   /analyze");
  console.log("    POST   /analyze-model");
  console.log("\n💾 Database: MongoDB (crop_app)");
  console.log("🔒 Authentication: JWT\n");
  if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD && !process.env.EMAIL_USER.includes("your-email")) {
    console.log(`📧 OTP email sender configured: ${process.env.EMAIL_USER}`);
  } else {
    console.log("⚠️ OTP email sender is not configured. Forgot-password will fall back to printing the OTP in the backend console until EMAIL_USER and EMAIL_PASSWORD are set.");
  }
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err);
  process.exit(1);
});
