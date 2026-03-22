/**
 * scheme.routes.js
 * Place at: server/src/routes/scheme.routes.js
 */
import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import {
  getMatchedSchemes,
  applyToScheme,
  runMatchingForUser,
  getSchemeStats,
} from '../services/scheme.service.js';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// GET /api/schemes/matched — get all schemes matched to logged-in user
router.get('/matched', protect, async (req, res) => {
  try {
    const schemes = await getMatchedSchemes(req.user.userId);
    res.json(schemes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/schemes/all — get all active schemes (for browse/explore)
router.get('/all', protect, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('schemes').select('*').eq('is_active', true).order('match_score_base', { ascending: false });
    if (error) throw new Error(error.message);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/schemes/:id — get single scheme with milestones
router.get('/:id', protect, async (req, res) => {
  try {
    const { data: scheme, error } = await supabase
      .from('schemes').select('*').eq('id', req.params.id).single();
    if (error) throw new Error(error.message);

    const { data: milestones } = await supabase
      .from('scheme_milestones')
      .select('*').eq('scheme_id', req.params.id).order('step_number');

    const { data: progress } = await supabase
      .from('user_milestone_progress')
      .select('*')
      .eq('scheme_id', req.params.id)
      .eq('user_id', req.user.userId);

    res.json({ ...scheme, milestones: milestones || [], progress: progress || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/schemes/:id/apply — apply to a scheme
router.post('/:id/apply', protect, async (req, res) => {
  try {
    const result = await applyToScheme(req.user.userId, req.params.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/schemes/rematch — re-run matching engine for user
router.post('/rematch', protect, async (req, res) => {
  try {
    const matches = await runMatchingForUser(req.user.userId);
    res.json({ matched: matches.length, schemes: matches.map(m => m.scheme.name) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/schemes/admin/stats — admin: scheme stats
router.get('/admin/stats', protect, async (req, res) => {
  try {
    const stats = await getSchemeStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;