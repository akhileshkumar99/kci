require('dotenv').config();
const dns = require('dns');
const dnsPromises = require('dns').promises;

// Configure DNS for fast IPv4 MongoDB Atlas resolution
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
dnsPromises.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
dns.setDefaultResultOrder('ipv4first');

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const compression = require('compression');

const app = express();

// Gzip compression — reduces response size by ~70%
app.use(compression());

app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// Cache static uploads for 7 days
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '7d',
  etag: true,
  lastModified: true,
}));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/admissions', require('./routes/admissions'));
app.use('/api/results', require('./routes/results'));
app.use('/api/certificates', require('./routes/certificates'));
app.use('/api/gallery', require('./routes/gallery'));
app.use('/api/staff', require('./routes/staff'));
app.use('/api/branches', require('./routes/branches'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/quiz', require('./routes/quiz'));
app.use('/api/study-material', require('./routes/studyMaterial'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/branch', require('./routes/branchLogin'));
app.use('/api/franchise', require('./routes/franchise'));

app.use('/api/exam-forms', require('./routes/examForms'));
app.use('/api/admit-card', require('./routes/admitCard'));
app.use('/api/test', require('./routes/test'));

app.get('/', (req, res) => res.json({ message: 'KCI API Running' }));
app.get('/api/auth/ping', (req, res) => res.json({ status: 'ok', db: mongoose.connection.readyState === 1 ? 'connected' : 'connecting' }));

// Self-ping every 14 minutes to prevent Render free tier sleep
const http = require('http');
const https = require('https');
setInterval(() => {
  const url = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;
  const client = url.startsWith('https') ? https : http;
  client.get(`${url}/api/auth/ping`, (res) => {
    console.log(`Keep-alive ping: ${res.statusCode}`);
  }).on('error', () => {});
}, 14 * 60 * 1000);

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error('Express Request Error:', err.stack || err);
  res.status(err.status || 500).json({ 
    success: false, 
    message: err.message || 'Internal Server Error' 
  });
});

// Process Safety - Prevent backend process from crashing on unhandled errors
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Promise Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception thrown:', err);
});

// ── BULLETPROOF MONGODB CONNECTION & AUTO-RECONNECT CONFIG ──
const mongoOptions = {
  maxPoolSize: 50,                  // Maintain up to 50 socket connections
  minPoolSize: 5,                   // Maintain at least 5 warm active connections
  serverSelectionTimeoutMS: 10000,  // Keep trying to send operations for 10s
  socketTimeoutMS: 45000,           // Close sockets after 45s of inactivity
  connectTimeoutMS: 10000,          // Give up initial connection after 10s
  heartbeatFrequencyMS: 10000,       // Ping MongoDB Atlas every 10s to keep TCP alive
  family: 4,                        // Use IPv4 first to avoid IPv6 dual-stack delays
};

mongoose.connection.on('connected', () => {
  console.log('✅ MongoDB connection established successfully.');
});

mongoose.connection.on('error', (err) => {
  console.error('⚠️ MongoDB connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB disconnected! Auto-reconnecting background worker active...');
});

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.error('❌ ERROR: MONGO_URI environment variable is not set!');
    return;
  }
  try {
    await mongoose.connect(process.env.MONGO_URI, mongoOptions);
  } catch (err) {
    console.error('❌ MongoDB Initial Connection Failed:', err.message);
    console.log('🔄 Retrying MongoDB connection in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
};

// Start Express Server immediately so Vite proxy never gets ECONNREFUSED
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 KCI Backend Server running on port ${PORT}`);
  connectDB();
});
