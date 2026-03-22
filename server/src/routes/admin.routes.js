import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { supabase } from '../config/supabase.js';
import { decryptUserFields } from '../utils/crypto.js';

const router = express.Router();

// middleware to check admin role
const adminOnly = (req, res, next) => {
  if (!req.user?.adminId && req.user?.role !== 'admin' && req.user?.role !== 'district' && req.user?.role !== 'state' && req.user?.role !== 'central') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// 👥 GET ALL USERS (for district admin verification table)
router.get('/users', protect, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, phone, full_name, gender, state, district, ward, category, occupation, profile_complete, created_at')
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    // Decrypt names for display
    const decrypted = (data || []).map(u => decryptUserFields(u));
    res.json(decrypted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📊 GET STATS
router.get('/stats', protect, async (req, res) => {
  try {
    const { count: totalUsers } = await supabase.from('users').select('*', { count: 'exact', head: true });
    res.json({ totalUsers, deliveryRate: 87, openComplaints: 14, fundsUtilized: 247000000 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ APPROVE / REJECT USER DOCUMENT
router.post('/verify/:userId', protect, async (req, res) => {
  try {
    const { action } = req.body; // "approve" | "reject"
    const { error } = await supabase
      .from('users')
      .update({ verified: action === 'approve', verified_at: new Date().toISOString() })
      .eq('id', req.params.userId);
    if (error) throw new Error(error.message);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📢 GET COMPLAINTS
router.get('/complaints', protect, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('complaints')
      .select('*')
      .order('filed_at', { ascending: false });
    if (error) throw new Error(error.message);
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;