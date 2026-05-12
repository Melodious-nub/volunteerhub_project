const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const initAdmin = require('./config/adminInit');

dotenv.config();
connectDB().then(() => {
  initAdmin();
});

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server running' });
});

// ===== ADD THIS LINE =====
app.use('/api/auth', require('./routes/auth'));
app.use('/api/campaigns', require('./routes/campaigns'));
app.use('/api/donations', require('./routes/donations'));
app.use('/api/sos', require('./routes/sos'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/contacts', require('./routes/contacts'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/volunteers', require('./routes/volunteers'));
app.use('/api/ngo', require('./routes/ngo'));
// =========================

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});