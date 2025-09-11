// server.js - Main Express Server
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { initSocket } = require('./utils/socket');

const app = express();
const server = http.createServer(app);

// CORS Configuration
const allowedOrigins = [
  process.env.FRONTEND_URL || 'https://swapcell.shop', // Netlify frontend
  'http://localhost:3000' // local dev
];

app.use(cors({
  origin: function(origin, callback){
    // allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/phonemarket', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Socket.IO
initSocket(server);

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/phones', require('./routes/phoneRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/favorites', require('./routes/favoriteRoutes'));

// Search Suggestions Route (no auth)
app.use('/api/search/suggestions', require('./routes/searchRoutes'));

// 404 Handler
app.use('*', (req, res) => res.status(404).json({ message: 'Route not found' }));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    mongoose.connection.close();
    process.exit(0);
  });
});
