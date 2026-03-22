import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { getDashboardService } from '../services/user.service.js';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// 📊 DASHBOARD
router.get('/dashboard', protect, async (req, res) => {
  try {
    const data = await getDashboardService(req.user.userId);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📢 SUBMIT COMPLAINT
router.post('/complaints', protect, async (req, res) => {
  try {
    const { title, category, description } = req.body;
    const { data, error } = await supabase
      .from('complaints')
      .insert({
        user_id: req.user.userId,
        title,
        category,
        description,
        status: 'district',
        filed_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📁 UPLOAD DOCUMENT
router.post('/upload', protect, async (req, res) => {
  try {
    // Placeholder - integrate with Supabase Storage
    res.json({ success: true, message: 'Document uploaded' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;