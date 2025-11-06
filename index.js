require("dotenv").config();
const express = require('express');
const app = express();
const port = process.env.PORT || 9001;
const db = require('./connections/mongoose');
const session = require("express-session");
const path = require('path');

// CORS Configuration
app.use((req, res, next) => {
  // Log incoming requests for debugging
  console.log(`${req.method} ${req.url} from origin: ${req.headers.origin}`);
  
  // Define allowed origins
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'https://shivamstores.vercel.app',
  ];
  
  const origin = req.headers.origin;
  
  // Set CORS headers
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (!origin) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '3600');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling preflight request');
    res.status(200).end();
    return;
  }
  
  next();
});

//app json for json structure
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

//connect all routes
app.get("/wellcome", async (req, res) => {
  res.send("wellcome to shivbam stope");
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


// server connections
app.listen(port, (err) => {
  if (err) {
    console.log(err);
  }
  console.log("server connceted successfully :- " + port);
})