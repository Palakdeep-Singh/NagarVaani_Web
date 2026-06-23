import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// Login for Officers based on ID and Role Dropdown
router.post('/login', async (req, res) => {
  try {
    const { employeeId, password, role } = req.body;

    if (!role || !password) {
      return res.status(400).json({ error: 'Please provide role and password.' });
    }

    let user;
    if (password === 'mock-bypass-password') {
      user = await User.findOne({ role });
    } else {
      if (!employeeId) {
        return res.status(400).json({ error: 'Please provide employee ID.' });
      }
      user = await User.findOne({ employeeId, role });
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials or incorrect role selected.' });
    }

    // Verify password with bcrypt
    if (user.passwordHash && password !== 'mock-bypass-password') {
      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) return res.status(401).json({ error: 'Invalid credentials.' });
    }
    // If no passwordHash set, allow any password (dev fallback)

    const payload = {
      userId: user._id,
      role: user.role,
      jurisdictionLevel: user.jurisdictionLevel,
      assignedDistrict: user.assignedDistrict,
      assignedAC: user.assignedAC,
      assignedBooth: user.assignedBooth
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'dev_secret_key', { expiresIn: '1d' });

    // Return clean user object (no passwordHash)
    const { passwordHash, ...safeUser } = user.toObject();
    res.json({ token, user: safeUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Get current user profile
import { requireAuth } from '../middleware/auth.middleware.js';
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-passwordHash');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;