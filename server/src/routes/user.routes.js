/**
 * user.routes.js — Complete with profile update
 * Place: server/src/routes/user.routes.js
 */
import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { getDashboardService } from '../services/user.service.js';
import { supabase } from '../config/supabase.js';
import { encryptUserFields, decryptUserFields } from '../utils/crypto.js';

const router = express.Router();

// ── Dashboard ─────────────────────────────────────────────────────────────────
router.get('/dashboard', protect, async (req, res) => {
  try {
    const data = await getDashboardService(req.user.userId);
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Get profile ───────────────────────────────────────────────────────────────
router.get('/profile', protect, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users').select('*').eq('id', req.user.userId).single();
    if (error) throw new Error(error.message);
    res.json(decryptUserFields(data));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Update profile ────────────────────────────────────────────────────────────
router.put('/profile', protect, async (req, res) => {
  try {
    const ALLOWED = [
      'full_name', 'gender', 'date_of_birth', 'state', 'district', 'ward', 'village',
      'pincode', 'category', 'occupation', 'annual_income', 'land_acres', 'voter_id',
      'religion', 'marital_status', 'disability', 'area_type', 'bpl_card',
    ];
    const raw = {};
    ALLOWED.forEach(f => {
      if (req.body[f] !== undefined) raw[f] = req.body[f] || null;
    });

    // Encrypt sensitive fields
    const encrypted = encryptUserFields(raw);
    encrypted.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('users').update(encrypted).eq('id', req.user.userId).select().single();
    if (error) throw new Error(error.message);

    // Re-run scheme matching after profile update
    try {
      const { runMatchingForUser } = await import('../services/scheme.service.js');
      await runMatchingForUser(req.user.userId);
    } catch { /* non-fatal */ }

    res.json(decryptUserFields(data));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Notifications ─────────────────────────────────────────────────────────────
router.get('/notifications', protect, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('notifications').select('*')
      .eq('user_id', req.user.userId)
      .order('created_at', { ascending: false }).limit(30);
    if (error) throw new Error(error.message);
    res.json(data || []);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Mark all read ─────────────────────────────────────────────────────────────
router.post('/notifications/read-all', protect, async (req, res) => {
  try {
    await supabase.from('notifications')
      .update({ is_read: true })
      .eq('user_id', req.user.userId).eq('is_read', false);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;