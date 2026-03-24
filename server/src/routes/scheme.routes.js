/**
 * scheme.routes.js — Fixed with proper application form + document routing
 */
import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import {
  getMatchedSchemes,
  getAllSchemesWithScores,
  applyToScheme,
  runMatchingForUser,
  getSchemeStats,
} from '../services/scheme.service.js';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// GET /api/schemes/matched
router.get('/matched', protect, async (req, res) => {
  try {
    const schemes = await getMatchedSchemes(req.user.userId);
    res.json(schemes);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/schemes/all — browse all with real user scores
router.get('/all', protect, async (req, res) => {
  try {
    const schemes = await getAllSchemesWithScores(req.user.userId);
    res.json(schemes);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/schemes/:id — single scheme detail + milestones + required docs
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

    // Get documents already uploaded for this scheme
    const { data: userDocs } = await supabase
      .from('documents')
      .select('id, doc_name, doc_type, status, file_url, mime_type, created_at')
      .eq('user_id', req.user.userId)
      .eq('scheme_id', req.params.id);

    res.json({
      ...scheme,
      milestones: milestones || [],
      progress: progress || [],
      uploaded_docs: userDocs || [],
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/schemes/:id/apply — FIXED: now accepts documents uploaded
router.post('/:id/apply', protect, async (req, res) => {
  try {
    const { document_ids } = req.body; // array of doc IDs already uploaded
    const result = await applyToScheme(req.user.userId, req.params.id, document_ids || []);
    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/schemes/rematch
router.post('/rematch', protect, async (req, res) => {
  try {
    const matches = await runMatchingForUser(req.user.userId);
    const top = matches.slice(0, 5).map(m => m.scheme?.name || m.name);
    res.json({ matched: matches.length, top });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/schemes/admin/stats
router.get('/admin/stats', protect, async (req, res) => {
  try {
    const stats = await getSchemeStats();
    res.json(stats);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;