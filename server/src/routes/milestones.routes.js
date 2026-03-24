/**
 * milestones.routes.js — Fixed
 * 
 * KEY FIX: Admin endpoint now only joins documents that have scheme_id or milestone_id set.
 * Personal Document Locker files (no scheme_id, no milestone_id) are EXCLUDED from admin view.
 * Admins should only see documents submitted as part of a scheme application.
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
          name, category, level, ministry, required_docs
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
      .select(`*, documents(id, doc_name, doc_type, status, file_url, mime_type, scheme_id, milestone_id)`)
      .eq('scheme_id', req.params.schemeId)
      .eq('user_id', req.user.userId);

    const progressMap = {};
    (progress || []).forEach(p => { progressMap[p.milestone_id] = p; });

    const { data: scheme } = await supabase
      .from('schemes').select('required_docs').eq('id', req.params.schemeId).single();
    const schemeDocs = scheme?.required_docs?.split(',').filter(Boolean) || [];

    const merged = (milestones || []).map(m => ({
      ...m,
      progress: progressMap[m.id] || { status: 'not_started' },
      // documents_required is handled via scheme-level required_docs or similar
      documents_required: m.step_number === 1 ? schemeDocs : [],
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
      .eq('id', req.params.id).single();

    if (!prog || prog.user_id !== req.user.userId)
      return res.status(403).json({ error: 'Not your milestone' });

    await supabase.from('user_milestone_progress').update({
      status: 'applied',
      document_id: document_id || prog.document_id,
      error_count: (prog.error_count || 0),
      admin_notes: null,
      updated_at: new Date().toISOString(),
    }).eq('id', req.params.id);

    if (document_id) {
      // Link this document to the scheme/milestone so admin can see it
      await supabase.from('documents')
        .update({
          milestone_id: req.params.id,
          scheme_id: prog.scheme_id,  // Also set scheme_id so admin can filter
          status: 'pending_review',
        })
        .eq('id', document_id)
        .eq('user_id', req.user.userId);
    }

    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Admin: get milestone progress scoped by role ──────────────────────────────
// IMPORTANT: Only returns documents that have scheme_id or milestone_id set
// (i.e., documents submitted as part of a scheme, NOT personal Document Locker files)
router.get('/admin/district', protect, async (req, res) => {
  try {
    const { scheme_id, status } = req.query;
    const role = req.user?.role;

    // ── Build Base Jurisdiction Filter ──
    const jurisdictionFilter = (q) => {
      if (role === 'district' && req.user.district) return q.eq('users.district', req.user.district);
      if (role === 'state' && req.user.state) return q.eq('users.state', req.user.state);
      return q;
    };

    // ── 1. Fetch Status Counts for the Jurisdiction ──
    const countsQuery = supabase
      .from('user_milestone_progress')
      .select('status, users!inner(district, state)');
    
    let { data: allStatuses, error: countErr } = await jurisdictionFilter(countsQuery);
    if (countErr) console.error('[milestones/admin] Count fetch error:', countErr.message);

    const counts = (allStatuses || []).reduce((acc, curr) => {
      acc[curr.status] = (acc[curr.status] || 0) + 1;
      return acc;
    }, { applied: 0, pending: 0, completed: 0, error: 0, blocked: 0, locked: 0 });

    // ── 2. Fetch Records with Enriched Profile Data ──
    let query = supabase
      .from('user_milestone_progress')
      .select(`
        *,
        users!inner (
          id, full_name, phone, district, ward, state, pincode, 
          date_of_birth, gender, category, total_benefits
        ),
        scheme_milestones (step_number, title, amount),
        schemes (name, category, level)
      `)
      .order('updated_at', { ascending: false })
      .limit(300);

    query = jurisdictionFilter(query);

    // Apply status filtering for the records being returned
    if (status && status !== 'all') {
      query = query.eq('status', status);
    } else if (!status && (role === 'district' || role === 'state')) {
      // Default to "Review Needed" if no status specified
      query = query.in('status', ['applied', 'pending', 'error']);
    }

    if (scheme_id) query = query.eq('scheme_id', scheme_id);

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    if (!data || data.length === 0) {
      return res.json({ records: [], counts, total: 0 });
    }

    // Extract IDs for batch document fetching
    const userIds = [...new Set(data.map(r => r.user_id))];
    const schemeIds = [...new Set(data.map(r => r.scheme_id).filter(Boolean))];
    const milestoneIds = [...new Set(data.map(r => r.milestone_id).filter(Boolean))];

    // Batch fetch documents for all milestones in this page
    // We fetch documents that match user_id AND (scheme_id OR milestone_id)
    let docQuery = supabase
      .from('documents')
      .select('id, user_id, scheme_id, milestone_id, doc_name, doc_type, status, file_url, mime_type, created_at')
      .in('user_id', userIds);

    const orFilters = [];
    if (schemeIds.length > 0) orFilters.push(`scheme_id.in.(${schemeIds.join(',')})`);
    if (milestoneIds.length > 0) orFilters.push(`milestone_id.in.(${milestoneIds.join(',')})`);

    if (orFilters.length > 0) {
      docQuery = docQuery.or(orFilters.join(','));
    }

    const { data: allDocs, error: docErr } = await docQuery.order('created_at', { ascending: false });

    if (docErr) console.error('[milestones/admin] Doc fetch error:', docErr.message);

    // Group documents by [user_id + scheme_id] or [user_id + milestone_id]
    const docMap = {};
    (allDocs || []).forEach(doc => {
      // Map to both scheme and milestone buckets if applicable
      if (doc.scheme_id) {
        const key = `s_${doc.user_id}_${doc.scheme_id}`;
        if (!docMap[key]) docMap[key] = [];
        docMap[key].push(doc);
      }
      if (doc.milestone_id) {
        const key = `m_${doc.user_id}_${doc.milestone_id}`;
        if (!docMap[key]) docMap[key] = [];
        docMap[key].push(doc);
      }
    });

    const enriched = data.map(row => {
      const decryptedUser = decryptUserFields(row.users);
      
      // Get documents for this specific milestone or scheme
      const sKey = `s_${row.user_id}_${row.scheme_id}`;
      const mKey = `m_${row.user_id}_${row.milestone_id}`;
      
      // Combine and remove duplicates by ID
      const docs = [...(docMap[sKey] || []), ...(docMap[mKey] || [])];
      const uniqueDocs = Array.from(new Map(docs.map(d => [d.id, d])).values());

      return {
        ...row,
        users: decryptedUser,
        documents: uniqueDocs,
      };
    });

    res.json({ 
      records: enriched, 
      counts, 
      total: status === 'all' || !status ? Object.values(counts).reduce((a,b)=>a+b,0) : (counts[status] || 0)
    });
  } catch (err) {
    console.error('[milestones/admin] 500 Error:', err.message, err.stack);
    res.status(500).json({ error: err.message });
  }
});

// ── Admin: update milestone status + disbursement + beneficiary credit ────────
router.patch('/admin/:id', protect, async (req, res) => {
  try {
    const { status, admin_notes } = req.body;
    const validStatuses = ['applied', 'pending', 'completed', 'error', 'blocked', 'locked'];
    if (!validStatuses.includes(status))
      return res.status(400).json({ error: 'Invalid status' });

    const { data: prog, error: fetchErr } = await supabase
      .from('user_milestone_progress')
      .select(`
        *,
        users(id, total_benefits, phone, full_name),
        schemes(name, level),
        scheme_milestones(title, amount, step_number)
      `)
      .eq('id', req.params.id)
      .single();

    if (fetchErr) throw new Error(fetchErr.message);

    const updates = {
      status,
      admin_notes: admin_notes || null,
      updated_at: new Date().toISOString(),
      approved_by: req.user.adminId || req.user.userId,
      approved_at: status === 'completed' ? new Date().toISOString() : null,
      completed_at: status === 'completed' ? new Date().toISOString() : null,
    };

    const { error: updErr } = await supabase
      .from('user_milestone_progress')
      .update(updates)
      .eq('id', req.params.id);

    if (updErr) throw new Error(updErr.message);

    if (status === 'completed') {
      const milestoneAmount = prog.scheme_milestones?.amount || 0;

      // Credit beneficiary
      if (milestoneAmount > 0) {
        const currentBenefits = prog.users?.total_benefits || 0;
        await supabase.from('users').update({
          total_benefits: currentBenefits + milestoneAmount,
          last_benefit_received_at: new Date().toISOString(),
          last_benefit_amount: milestoneAmount,
        }).eq('id', prog.user_id);

        // Log disbursement transaction
        await supabase.from('benefit_transactions').insert({
          user_id: prog.user_id,
          scheme_id: prog.scheme_id,
          milestone_id: prog.milestone_id,
          amount: milestoneAmount,
          type: 'cash_transfer',
          milestone_title: prog.scheme_milestones?.title,
          scheme_name: prog.schemes?.name,
          approved_by: req.user.adminId || req.user.userId,
          disbursed_at: new Date().toISOString(),
        }).catch(() => { }); // non-fatal if table doesn't exist
      }

      // Unlock next milestone
      const { data: nextMs } = await supabase
        .from('scheme_milestones')
        .select('id, title, step_number')
        .eq('scheme_id', prog.scheme_id)
        .gt('step_number', prog.scheme_milestones?.step_number || 0)
        .order('step_number')
        .limit(1);

      if (nextMs?.[0]) {
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
          message: `"${prog.scheme_milestones?.title}" has been verified.${milestoneAmount > 0 ? ` ₹${milestoneAmount.toLocaleString('en-IN')} is being credited to your bank account.` : ''} Next step: "${nextMs[0].title}" is now unlocked.`,
          link: 'p-active',
        });
      } else {
        // Last milestone — mark scheme complete
        await supabase.from('user_scheme_matches').update({
          status: 'completed',
          updated_at: new Date().toISOString(),
        }).eq('user_id', prog.user_id).eq('scheme_id', prog.scheme_id);

        await supabase.from('notifications').insert({
          user_id: prog.user_id,
          type: 'success',
          title: '🎉 Scheme Fully Completed!',
          message: `Congratulations! All milestones for "${prog.schemes?.name}" are complete.${milestoneAmount > 0 ? ` Final payment of ₹${milestoneAmount.toLocaleString('en-IN')} processed.` : ''} Thank you for participating.`,
          link: 'p-active',
        });
      }
    } else if (status === 'error') {
      await supabase.from('notifications').insert({
        user_id: prog.user_id,
        type: 'error',
        title: '⚠️ Action Required — Document Issue',
        message: `Your document for "${prog.scheme_milestones?.title}" (${prog.schemes?.name}) was rejected. Reason: ${admin_notes || 'Document unclear or invalid. Please re-upload a clear, valid copy.'}`,
        link: 'p-active',
      });
    }

    res.json({
      success: true,
      status,
      amount_disbursed: status === 'completed' ? (prog.scheme_milestones?.amount || 0) : 0,
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Admin: bulk update milestones ─────────────────────────────────────────────
router.post('/admin/bulk', protect, async (req, res) => {
  try {
    const { ids, status, admin_notes } = req.body;
    if (!ids?.length) return res.status(400).json({ error: 'No IDs provided' });

    const results = [];
    const { data: records } = await supabase
      .from('user_milestone_progress')
      .select('*, scheme_milestones(*), schemes(*), users(*)')
      .in('id', ids);

    for (const record of records || []) {
      try {
        const milestoneAmount = record.scheme_milestones?.amount || 0;
        await supabase.from('user_milestone_progress').update({
          status,
          admin_notes: admin_notes || 'Bulk verified',
          updated_at: new Date().toISOString(),
          approved_by: req.user.adminId || req.user.userId,
          approved_at: status === 'completed' ? new Date().toISOString() : null,
          completed_at: status === 'completed' ? new Date().toISOString() : null,
        }).eq('id', record.id);

        if (status === 'completed' && milestoneAmount > 0) {
          const newTotal = (record.users?.total_benefits || 0) + milestoneAmount;
          await supabase.from('users').update({
            total_benefits: newTotal,
            last_benefit_received_at: new Date().toISOString(),
            last_benefit_amount: milestoneAmount,
          }).eq('id', record.user_id);

          await supabase.from('benefit_transactions').insert({
            user_id: record.user_id,
            scheme_id: record.scheme_id,
            milestone_id: record.milestone_id,
            amount: milestoneAmount,
            type: 'cash_transfer',
            milestone_title: record.scheme_milestones?.title,
            scheme_name: record.schemes?.name,
            approved_by: req.user.adminId || req.user.userId,
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