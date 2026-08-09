require('dotenv').config();
const dns = require('dns');
const dnsPromises = require('dns').promises;
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
app.get('/api/auth/ping', (req, res) => res.json({ status: 'ok' }));

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

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Internal Server Error' });
});

// Keep-alive for MongoDB connection
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected, reconnecting...');
  mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000, socketTimeoutMS: 45000, family: 4 });
});

const PORT = process.env.PORT || 5000;

if (!process.env.MONGO_URI) {
  console.error('ERROR: MONGO_URI environment variable is not set!');
  process.exit(1);
} else {
  mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    family: 4,
  })
    .then(() => {
      console.log('MongoDB connected');
      app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch(err => {
      console.error('DB Error:', err);
      process.exit(1);
    });
}
