require("dotenv").config();
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
const db = require('./connections/mongoose');
const session = require("express-session");
const path = require('path');

// CORS Configuration - Must be before all other middleware
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'https://shivamstores.vercel.app',
];

// Enhanced CORS configuration with manual header setting for reliability
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Log all requests for debugging
  console.log(`🌐 ${req.method} ${req.url} from origin: ${origin || 'no-origin'}`);
  
  // Always set CORS headers manually for maximum compatibility
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    console.log(`✅ CORS: Allowed origin ${origin}`);
  } else if (!origin) {
    // Allow requests with no origin (Postman, mobile apps, etc.)
    res.setHeader('Access-Control-Allow-Origin', '*');
    console.log(`✅ CORS: Allowed no-origin request`);
  } else {
    // For production: still allow but log for monitoring
    res.setHeader('Access-Control-Allow-Origin', origin);
    console.log(`⚠️ CORS: Allowing unknown origin ${origin} for debugging`);
  }
  
  // Always set these headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Range, X-Content-Range');
  res.setHeader('Access-Control-Max-Age', '3600');
  
  // Handle preflight OPTIONS requests immediately
  if (req.method === 'OPTIONS') {
    console.log(`✅ CORS: Preflight request handled for ${req.url}`);
    return res.status(200).end();
  }
  
  next();
});

// Also keep the cors package as backup
app.use(cors({
  origin: function (origin, callback) {
    callback(null, true); // Allow all origins as backup
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  optionsSuccessStatus: 200
}));

// Increase body parser limits to handle large file uploads
// This is crucial for multipart/form-data requests with multiple files
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

//connect all routes
app.get("/welcome", async (req, res) => {
  res.send("welcome to the server of shivam store");
})

const user = require('./Router/userRoutes');
const category = require('./Router/categoryRoutes');
const subCategory = require('./Router/subCategoryRoutes');
const product = require('./Router/productRoutes');
const favorite = require('./Router/favoriteRoutes');
const teaserVideo = require('./Router/teaserVideoRoutes');

app.use('/api/v1', user);
app.use('/api/v1', category);
app.use('/api/v1', subCategory);
app.use('/api/v1', product);
app.use('/api/v1', favorite);
app.use('/api/v1', teaserVideo);

// Error handling middleware for Multer errors (file upload errors)
app.use((error, req, res, next) => {
  // Set CORS headers even on error - ensure headers are set for all error responses
  // The CORS package should handle this, but we set it manually as a fallback
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');

  // Handle Multer errors (file upload errors)
  if (error instanceof require('multer').MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum file size is 100MB per file.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum 50 files per request.'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field. Please check your file upload field name.'
      });
    }
    return res.status(400).json({
      success: false,
      message: `File upload error: ${error.message}`
    });
  }

  // Handle other errors
  if (error) {
    console.error('Error:', error);
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }

  next();
});

// 404 handler
app.use((req, res) => {
  // Set CORS headers for 404 responses - ensure headers are set for all responses
  // The CORS package should handle this, but we set it manually as a fallback
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// server connections
app.listen(port, (err) => {
  if (err) {
    console.log(err);
  }
  console.log("server connected successfully :- " + port);
})