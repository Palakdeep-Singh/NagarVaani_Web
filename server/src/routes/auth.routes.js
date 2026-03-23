/**
 * auth.routes.js
 * Place: server/src/routes/auth.routes.js
 */
import express from 'express';
import {
  sendOTPService,
  verifyOTPService,
  adminLoginService,
  registerUserService,
} from '../services/auth.service.js';
import { protect } from '../middleware/auth.middleware.js';
import { supabase } from '../config/supabase.js';
import { decryptUserFields } from '../utils/crypto.js';

const router = express.Router();

// ── Send OTP ──────────────────────────────────────────────────────────────────
router.post('/otp/send', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!/^[6-9]\d{9}$/.test(phone))
      return res.status(400).json({ error: 'Invalid phone number' });
    const otp = await sendOTPService(phone);
    res.json({ success: true, ...(otp && { otp }) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Verify OTP ────────────────────────────────────────────────────────────────
router.post('/otp/verify', async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) return res.status(400).json({ error: 'Phone and OTP required' });
    const result = await verifyOTPService(phone, otp);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ── Register ──────────────────────────────────────────────────────────────────
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

// ── Admin Login ───────────────────────────────────────────────────────────────
router.post('/admin', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password required' });
    const result = await adminLoginService(email, password);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ── Me — validate token + return profile ──────────────────────────────────────
// Called on page load to restore session
router.get('/me', protect, async (req, res) => {
  try {
    if (req.user.userId) {
      // Citizen
      const { data, error } = await supabase
        .from('users').select('*').eq('id', req.user.userId).single();
      if (error || !data) return res.status(404).json({ error: 'User not found' });
      return res.json({ ...decryptUserFields(data), role: 'citizen' });
    }

    if (req.user.adminId) {
      // Admin — return full admin record
      const { data, error } = await supabase
        .from('admins')
        .select('id, name, email, role, state, district, designation, phone, is_active')
        .eq('id', req.user.adminId)
        .single();
      if (error || !data) return res.status(404).json({ error: 'Admin not found' });
      if (!data.is_active) return res.status(403).json({ error: 'Account deactivated' });
      return res.json({ ...data });
    }

    return res.status(401).json({ error: 'Invalid token payload' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Debug (dev only) ──────────────────────────────────────────────────────────
router.get('/debug', async (req, res) => {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  let role = 'missing';
  try {
    role = key ? JSON.parse(Buffer.from(key.split('.')[1], 'base64').toString()).role : 'missing';
  } catch { }
  // Quick DB test
  const { error } = await supabase.from('otp_sessions').select('mobile').limit(1);
  res.json({
    status: error ? 'ERROR' : 'OK',
    supabase_url: url ? '✓' : '✗ MISSING',
    key_role: role,
    db_error: error?.message || null,
  });
});

export default router;