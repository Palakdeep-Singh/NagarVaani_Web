import express from 'express';
import {
  sendOTPService,
  verifyOTPService,
  adminLoginService,
  registerUserService,
} from '../services/auth.service.js';

const router = express.Router();

const validatePhone = (phone) => /^[6-9]\d{9}$/.test(phone);
const validateOTP = (otp) => /^\d{6}$/.test(otp);

// 📱 Send OTP
router.post('/otp/send', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!validatePhone(phone))
      return res.status(400).json({ error: 'Invalid phone number' });
    const otp = await sendOTPService(phone);
    res.json({ success: true, otp });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Verify OTP
router.post('/otp/verify', async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!validatePhone(phone) || !validateOTP(otp))
      return res.status(400).json({ error: 'Invalid input' });
    const result = await verifyOTPService(phone, otp);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 📝 Register
router.post('/register', async (req, res) => {
  try {
    const { phone, ...data } = req.body;
    if (!phone) return res.status(400).json({ error: 'Phone required' });
    const result = await registerUserService(phone, data);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 🔐 Admin Login
router.post('/admin', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password || password.length < 6)
      return res.status(400).json({ error: 'Invalid credentials' });
    const result = await adminLoginService(email, password);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 🔍 Debug
router.get('/debug', async (req, res) => {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  const role = key ? JSON.parse(Buffer.from(key.split('.')[1], 'base64').toString()).role : 'missing';
  res.json({ status: 'OK', supabase_url: url ? '✓' : '✗ MISSING', key_role: role });
});

export default router;