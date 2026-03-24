/**
 * milestones.routes.js — Fixed with proper disbursement + beneficiary tracking
 */
import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { supabase } from '../config/supabase.js';
import { decryptUserFields } from '../utils/crypto.js';

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
          name, category, benefit_type, level, ministry, required_docs
        )
      `)
      .eq('user_id', req.user.userId)
      .order('created_at', { ascending: true });

    if (error) throw new Error(error.message);
    res.json(data || []);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Citizen: milestones for a specific scheme ────────────────────────────────
router.get('/scheme/:schemeId', protect, async (req, res) => {
  try {
    const { data: milestones } = await supabase
      .from('scheme_milestones')
      .select('*')
      .eq('scheme_id', req.params.schemeId)
      .order('step_number');

    const { data: progress } = await supabase
      .from('user_milestone_progress')
      .select(`*, documents(id, doc_name, doc_type, status, file_url, mime_type)`)
      .eq('scheme_id', req.params.schemeId)
      .eq('user_id', req.user.userId);

    const progressMap = {};
    (progress || []).forEach(p => { progressMap[p.milestone_id] = p; });

    // Fetch scheme-level required_docs as fallback
    const { data: scheme } = await supabase.from('schemes').select('required_docs').eq('id', req.params.schemeId).single();
    const schemeDocs = scheme?.required_docs?.split(',').filter(Boolean) || [];

    const merged = (milestones || []).map(m => ({
      ...m,
      progress: progressMap[m.id] || { status: 'not_started' },
      // Fallback: Use scheme's required_docs for the first milestone if missing
      documents_required: m.documents_required || (m.step_number === 1 ? schemeDocs : []),
    }));

    res.json(merged);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Citizen: resubmit milestone with new document ─────────────────────────────
router.patch('/:id/resubmit', protect, async (req, res) => {
  try {
    const { document_id } = req.body;

    const { data: prog } = await supabase
      .from('user_milestone_progress')
      .select('*, scheme_milestones(title), schemes(name)')
      .eq('id', req.params.id)
      .single();

    if (!prog || prog.user_id !== req.user.userId)
      return res.status(403).json({ error: 'Not your milestone' });

    await supabase.from('user_milestone_progress').update({
      status: 'applied',
      document_id: document_id || prog.document_id,
      error_count: (prog.error_count || 0),
      admin_notes: null,
      updated_at: new Date().toISOString(),
    }).eq('id', req.params.id);

    // Link document to this milestone
    if (document_id) {
      await supabase.from('documents')
        .update({ milestone_id: req.params.id, status: 'pending_review' })
        .eq('id', document_id)
        .eq('user_id', req.user.userId);
    }

    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Admin: get all milestone progress scoped by role ─────────────────────────
router.get('/admin/district', protect, async (req, res) => {
  try {
    const { scheme_id, status } = req.query;
    const role = req.user?.role;

    let query = supabase
      .from('user_milestone_progress')
      .select(`
        *,
        users!inner (id, full_name, phone, district, ward, state, booth, pincode, aadhaar_number, voter_id),
        scheme_milestones (*),
        schemes (name, category, level, benefit_amount),
        documents (id, doc_name, file_url, status, doc_type, mime_type)
      `)
      .order('updated_at', { ascending: false })
      .limit(300);

    if (role === 'district' && req.user.district) {
      query = query.eq('users.district', req.user.district);
      query = query.in('status', ['applied', 'pending', 'error']);
    } else if (role === 'state' && req.user.state) {
      query = query.eq('users.state', req.user.state);
      query = query.in('status', ['applied', 'pending', 'error']);
    }
    // central sees all

    if (scheme_id) query = query.eq('scheme_id', scheme_id);
    if (status && status !== 'all') query = query.eq('status', status);

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    const decrypted = (data || []).map(row => ({
      ...row,
      users: decryptUserFields(row.users),
    }));

    res.json(decrypted);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Admin: update milestone status + DISBURSEMENT + beneficiary credit ────────
router.patch('/admin/:id', protect, async (req, res) => {
  try {
    const { status, admin_notes } = req.body;
    const validStatuses = ['applied', 'pending', 'completed', 'error', 'blocked', 'locked'];
    if (!validStatuses.includes(status))
      return res.status(400).json({ error: 'Invalid status' });

    // Fetch full progress row
    const { data: prog, error: fetchErr } = await supabase
      .from('user_milestone_progress')
      .select(`
        *,
        users(id, total_benefits, phone, full_name),
        schemes(name, benefit_type, level),
        scheme_milestones(title, amount, step_number)
      `)
      .eq('id', req.params.id)
      .single();

    if (fetchErr) throw new Error(fetchErr.message);

    const updates = {
      status,
      admin_notes: admin_notes || null,
      updated_at: new Date().toISOString(),
      approved_by: req.user.userId,
      approved_at: status === 'completed' ? new Date().toISOString() : null,
    };
    if (status === 'completed') updates.completed_at = new Date().toISOString();

    const { error: updErr } = await supabase
      .from('user_milestone_progress')
      .update(updates)
      .eq('id', req.params.id);

    if (updErr) throw new Error(updErr.message);

    if (status === 'completed') {
      const milestoneAmount = prog.scheme_milestones?.amount || 0;

      // ── DISBURSEMENT: Credit beneficiary account ──────────────────────────
      if (milestoneAmount > 0) {
        const currentBenefits = prog.users?.total_benefits || 0;
        const newTotal = currentBenefits + milestoneAmount;

        // Update user's total benefits received
        await supabase.from('users')
          .update({
            total_benefits: newTotal,
            last_benefit_received_at: new Date().toISOString(),
            last_benefit_amount: milestoneAmount,
          })
          .eq('id', prog.user_id);

        // Record in transactions/disbursement log
        await supabase.from('benefit_transactions').insert({
          user_id: prog.user_id,
          scheme_id: prog.scheme_id,
          milestone_id: prog.milestone_id,
          amount: milestoneAmount,
          type: prog.schemes?.benefit_type || 'cash_transfer',
          milestone_title: prog.scheme_milestones?.title,
          scheme_name: prog.schemes?.name,
          approved_by: req.user.userId,
          disbursed_at: new Date().toISOString(),
        }).catch(() => { }); // non-fatal if table doesn't exist yet
      }

      // ── UNLOCK NEXT MILESTONE ──────────────────────────────────────────────
      const { data: nextMs } = await supabase
        .from('scheme_milestones')
        .select('id, title, step_number')
        .eq('scheme_id', prog.scheme_id)
        .gt('step_number', prog.scheme_milestones?.step_number || 0)
        .order('step_number')
        .limit(1);

      if (nextMs?.[0]) {
        // Unlock next milestone for this user
        await supabase.from('user_milestone_progress').upsert({
          user_id: prog.user_id,
          scheme_id: prog.scheme_id,
          milestone_id: nextMs[0].id,
          status: 'pending',
          updated_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        }, { onConflict: 'user_id,milestone_id' });

        await supabase.from('notifications').insert({
          user_id: prog.user_id,
          type: 'success',
          title: '✅ Milestone Cleared!',
          message: `"${prog.scheme_milestones?.title}" verified.${milestoneAmount > 0 ? ` ₹${milestoneAmount.toLocaleString('en-IN')} credited to your account.` : ''} Next: ${nextMs[0].title}.`,
          link: 'p-active',
        });
      } else {
        // Last milestone — scheme complete
        await supabase.from('user_scheme_matches').update({
          status: 'completed',
          updated_at: new Date().toISOString(),
        })
          .eq('user_id', prog.user_id)
          .eq('scheme_id', prog.scheme_id);

        const totalAmount = milestoneAmount;
        await supabase.from('notifications').insert({
          user_id: prog.user_id,
          type: 'success',
          title: '🎉 Scheme Completed!',
          message: `All milestones for "${prog.schemes?.name}" completed!${totalAmount > 0 ? ` Total benefit: ₹${totalAmount.toLocaleString('en-IN')}.` : ''} Thank you!`,
          link: 'p-active',
        });
      }
    } else if (status === 'error') {
      await supabase.from('notifications').insert({
        user_id: prog.user_id,
        type: 'error',
        title: '⚠️ Action Required',
        message: `Issue with "${prog.scheme_milestones?.title}": ${admin_notes || 'Document rejected. Please re-upload a clear copy.'}`,
        link: 'p-active',
      });
    }

    res.json({ success: true, status, amount_disbursed: status === 'completed' ? (prog.scheme_milestones?.amount || 0) : 0 });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Admin: bulk update ─────────────────────────────────────────────────────────
router.post('/admin/bulk', protect, async (req, res) => {
  try {
    const { ids, status, admin_notes } = req.body;
    if (!ids?.length) return res.status(400).json({ error: 'No IDs' });

    const results = [];
    const { data: records } = await supabase
      .from('user_milestone_progress')
      .select('*, scheme_milestones(*), schemes(*), users(*)')
      .in('id', ids);

    for (const record of records || []) {
      try {
        const milestoneAmount = record.scheme_milestones?.amount || 0;
        const updates = {
          status,
          admin_notes: admin_notes || 'Bulk verified',
          updated_at: new Date().toISOString(),
          approved_by: req.user.userId,
          approved_at: status === 'completed' ? new Date().toISOString() : null,
          completed_at: status === 'completed' ? new Date().toISOString() : null,
        };

        const { error: updErr } = await supabase
          .from('user_milestone_progress')
          .update(updates)
          .eq('id', record.id);

        if (updErr) throw updErr;

        if (status === 'completed' && milestoneAmount > 0) {
          // Benefit Credit
          const newTotal = (record.users?.total_benefits || 0) + milestoneAmount;
          await supabase.from('users').update({
            total_benefits: newTotal,
            last_benefit_received_at: new Date().toISOString(),
            last_benefit_amount: milestoneAmount,
          }).eq('id', record.user_id);

          // Log Transaction
          await supabase.from('benefit_transactions').insert({
            user_id: record.user_id,
            scheme_id: record.scheme_id,
            milestone_id: record.milestone_id,
            amount: milestoneAmount,
            type: record.schemes?.benefit_type || 'cash_transfer',
            milestone_title: record.scheme_milestones?.title,
            scheme_name: record.schemes?.name,
            approved_by: req.user.userId,
            disbursed_at: new Date().toISOString(),
          }).catch(() => { });
        }

        results.push({ id: record.id, ok: true });
      } catch (e) {
        results.push({ id: record.id, ok: false, error: e.message });
      }
    }
    res.json({ success: true, count: ids.length, results });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;