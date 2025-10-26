const express = require('express');
const User = require('../models/User');
const { auth, checkRole } = require('../middleware/auth');

const router = express.Router();

// Get all users (filtered by role if specified)
router.get('/', auth, checkRole('admin', 'manager'), async (req, res) => {
  try {
    const { role } = req.query;
    let query = {};
    
    if (role) {
      query.role = role;
    }

    const users = await User.find(query).select('-password');
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

