/**
 * milestones.routes.js
 * Place: server/src/routes/milestones.routes.js
 */
import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// ── Citizen: get all milestone progress ──────────────────────────────────────
router.get('/my', protect, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('user_milestone_progress')
      .select(`
        *,
        scheme_milestones (
          step_number, title, description, expected_days, amount
        ),
        schemes (
          name, category, benefit_type
        )
      `)
      .eq('user_id', req.user.userId)
      .order('created_at', { ascending: true });

    if (error) throw new Error(error.message);
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Citizen: get milestones for a specific scheme ────────────────────────────
router.get('/scheme/:schemeId', protect, async (req, res) => {
  try {
    // Get scheme milestones
    const { data: milestones } = await supabase
      .from('scheme_milestones')
      .select('*')
      .eq('scheme_id', req.params.schemeId)
      .order('step_number');

    // Get user progress
    const { data: progress } = await supabase
      .from('user_milestone_progress')
      .select('*')
      .eq('scheme_id', req.params.schemeId)
      .eq('user_id', req.user.userId);

    const progressMap = {};
    (progress || []).forEach(p => { progressMap[p.milestone_id] = p; });

    const merged = (milestones || []).map(m => ({
      ...m,
      progress: progressMap[m.id] || { status: 'not_started' },
    }));

    res.json(merged);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Admin: get all milestone progress across district ────────────────────────
router.get('/admin/district', protect, async (req, res) => {
  try {
    const { scheme_id, status } = req.query;

    let query = supabase
      .from('user_milestone_progress')
      .select(`
        *,
        users (full_name, phone, district, ward),
        scheme_milestones (step_number, title, amount),
        schemes (name, category),
        documents (doc_name, file_url, status, doc_type)
      `)
      .order('updated_at', { ascending: false })
      .limit(100);

    if (scheme_id) query = query.eq('scheme_id', scheme_id);
    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Admin: update milestone status ───────────────────────────────────────────
router.patch('/admin/:id', protect, async (req, res) => {
  try {
    const { status, admin_notes, error_count } = req.body;
    const validStatuses = ['pending', 'completed', 'error', 'blocked', 'locked'];
    if (!validStatuses.includes(status))
      return res.status(400).json({ error: `Status must be one of: ${validStatuses.join(', ')}` });

    const updates = {
      status,
      admin_notes: admin_notes || null,
      updated_at: new Date().toISOString(),
    };
    if (status === 'completed') updates.completed_at = new Date().toISOString();
    if (error_count !== undefined) updates.error_count = error_count;

    const { data: prog, error } = await supabase
      .from('user_milestone_progress')
      .update(updates)
      .eq('id', req.params.id)
      .select(`*, schemes(name), scheme_milestones(title, amount)`)
      .single();

    if (error) throw new Error(error.message);

    // Notify citizen
    const notifType = { completed: 'success', error: 'error', blocked: 'warning' };
    const notifMsg = {
      completed: `✅ Milestone "${prog.scheme_milestones?.title}" completed!${prog.scheme_milestones?.amount ? ` ₹${prog.scheme_milestones.amount.toLocaleString('en-IN')} will be credited.` : ''}`,
      error: `⚠️ Issue at milestone "${prog.scheme_milestones?.title}" in ${prog.schemes?.name}. ${admin_notes || 'Please check and re-upload document.'}`,
      blocked: `🔒 Milestone "${prog.scheme_milestones?.title}" is blocked. ${admin_notes || 'Please contact support.'}`,
    };

    if (notifMsg[status]) {
      await supabase.from('notifications').insert({
        user_id: prog.user_id,
        type: notifType[status] || 'info',
        title: status === 'completed' ? 'Milestone Completed! 🎉' : 'Milestone Update',
        message: notifMsg[status],
        link: 'p-active',
      });
    }

    // If completed — unlock next milestone
    if (status === 'completed') {
      const { data: nextMs } = await supabase
        .from('scheme_milestones')
        .select('id')
        .eq('scheme_id', prog.scheme_id)
        .gt('step_number', prog.scheme_milestones?.step_number || 0)
        .order('step_number')
        .limit(1);

      if (nextMs?.[0]) {
        await supabase
          .from('user_milestone_progress')
          .update({ status: 'pending', updated_at: new Date().toISOString() })
          .eq('user_id', prog.user_id)
          .eq('milestone_id', nextMs[0].id);
      }
    }

    res.json(prog);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;