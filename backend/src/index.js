const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Firebase Admin
let firebaseInitialized = false;
try {
  const serviceAccountPath = path.join(__dirname, '../config/serviceAccountKey.json');
  
  // Check if the service account file exists and is accessible
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('Firebase Admin initialized successfully');
    firebaseInitialized = true;
  } else {
    console.error('Service account file not found at:', serviceAccountPath);
    console.log('Running in limited mode without Firebase Admin');
  }
} catch (error) {
  console.error('Error initializing Firebase Admin:', error);
  console.log('Running in limited mode without Firebase Admin');
}

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to Smart Cart API');
});

// Only set up routes if Firebase is initialized
if (firebaseInitialized) {
  // Routes
  app.use('/api/products', require('./routes/products'));
  app.use('/api/users', require('./routes/users'));
  app.use('/api/cart', require('./routes/cart'));
} else {
  // Fallback routes for when Firebase is not initialized
  app.get('/api/*', (req, res) => {
    res.status(503).json({ 
      error: 'Service unavailable', 
      message: 'Firebase Admin is not properly initialized. Please check your configuration.' 
    });
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  if (!firebaseInitialized) {
    console.log('Warning: Running without Firebase Admin. API functionality will be limited.');
  }
});

module.exports = app;