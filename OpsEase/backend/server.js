require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/forms', require('./routes/forms'));
app.use('/api/users', require('./routes/users'));
app.use('/api/submissions', require('./routes/submissions'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'OpsEase API Running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});