/**
 * milestones.routes.js — FIXED
 *
 * ROOT CAUSE FIXES:
 * 1. Documents join was WRONG (fetching by progress.id instead of documents.milestone_id)
 * 2. Citizen submit now sets status to 'applied' for admin review
 * 3. Admin response shape matches { records, counts, total }
 * 4. PII Decryption included for Full Name, Phone, etc.
 */
import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { supabase } from '../config/supabase.js';
import { decryptUserFields } from '../utils/crypto.js';

const router = express.Router();

// ─────────────────────────────────────────────────────────────────────────────
// CITIZEN: GET /api/milestones/my
// ─────────────────────────────────────────────────────────────────────────────
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
      .eq('user_id', req.user.userId);

    if (error) throw new Error(error.message);

    // Attach documents for each milestone progress record
    const enriched = await Promise.all((data || []).map(async (mp) => {
      const { data: docs } = await supabase
        .from('documents')
        .select('id, doc_name, doc_type, file_path, file_url, mime_type, status, created_at')
        .eq('user_id', req.user.userId)
        .eq('milestone_id', mp.id)
        .order('created_at', { ascending: false });
      return { ...mp, documents: docs || [] };
    }));

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// CITIZEN: GET /api/milestones/scheme/:schemeId
// ─────────────────────────────────────────────────────────────────────────────
router.get('/scheme/:schemeId', protect, async (req, res) => {
  try {
    const { data: milestones } = await supabase
      .from('scheme_milestones')
      .select('*')
      .eq('scheme_id', req.params.schemeId)
      .order('step_number');

    const { data: progress } = await supabase
      .from('user_milestone_progress')
      .select('*')
      .eq('scheme_id', req.params.schemeId)
      .eq('user_id', req.user.userId);

    const progressMap = {};
    (progress || []).forEach(p => { progressMap[p.milestone_id] = p; });

    // Attach documents
    const progressIds = (progress || []).map(p => p.id);
    let docsByProgress = {};
    if (progressIds.length) {
      const { data: docs } = await supabase
        .from('documents')
        .select('id, doc_name, doc_type, mime_type, status, milestone_id, created_at')
        .eq('user_id', req.user.userId)
        .in('milestone_id', progressIds);
      (docs || []).forEach(d => {
        if (!docsByProgress[d.milestone_id]) docsByProgress[d.milestone_id] = [];
        docsByProgress[d.milestone_id].push(d);
      });
    }

    const merged = (milestones || []).map(m => {
      const prog = progressMap[m.id] || { status: 'not_started' };
      return {
        ...m,
        progress: { ...prog, documents: docsByProgress[prog.id] || [] },
      };
    });

    res.json(merged);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// CITIZEN: POST /api/milestones/:progressId/submit
// Called when citizen uploads a document for a milestone.
// Sets user_milestone_progress.status = 'applied' so admin can see it.
// ─────────────────────────────────────────────────────────────────────────────
router.post('/:progressId/submit', protect, async (req, res) => {
  try {
    const { progressId } = req.params;
    const { doc_id, doc_name, file_path, file_url, mime_type } = req.body;

    // Verify this progress record belongs to the logged-in citizen
    const { data: prog, error: fetchErr } = await supabase
      .from('user_milestone_progress')
      .select('*, scheme_milestones(title), schemes(name, id)')
      .eq('id', progressId)
      .eq('user_id', req.user.userId)
      .single();

    if (fetchErr || !prog) return res.status(404).json({ error: 'Milestone not found' });
    if (prog.status === 'completed') return res.status(400).json({ error: 'Milestone already completed' });

    // If a new document was uploaded inline (not pre-existing), save it
    let documentId = doc_id;
    if (!documentId && file_path) {
      const { data: newDoc, error: docErr } = await supabase
        .from('documents')
        .insert({
          user_id:      req.user.userId,
          doc_type:     'milestone_proof',
          doc_name:     doc_name || 'Milestone Proof',
          file_path,
          file_url:     file_url || null,
          mime_type:    mime_type || 'application/octet-stream',
          status:       'available',
          milestone_id: progressId,
          scheme_id:    prog.scheme_id,
        })
        .select('id')
        .single();
      if (!docErr && newDoc) documentId = newDoc.id;
    } else if (documentId) {
      // Link existing document to this milestone
      await supabase
        .from('documents')
        .update({ milestone_id: progressId, scheme_id: prog.scheme_id, status: 'available' })
        .eq('id', documentId)
        .eq('user_id', req.user.userId);
    }

    // Update status to 'applied' so admin can see it
    const updatePayload = {
      status:       'applied',
      error_count:  0,     // reset error count on resubmit
      admin_notes:  null,  // clear previous rejection notes
    };
    if (documentId) {
      updatePayload.document_id = documentId;
    }

    const { data: updated, error: updErr } = await supabase
      .from('user_milestone_progress')
      .update(updatePayload)
      .eq('id', progressId)
      .select()
      .single();

    if (updErr) throw new Error(updErr.message);

    // Sync status back to user_scheme_matches if this is the first submission
    // This ensures Scheme Analytics shows "Applied" correctly
    await supabase.from('user_scheme_matches')
      .update({ status: 'applied', applied_at: new Date().toISOString() })
      .eq('user_id', req.user.userId)
      .eq('scheme_id', prog.scheme_id)
      .eq('status', 'matched'); // only if it was just a match before

    // Notify citizen of submission
    await supabase.from('notifications').insert({
      user_id:  req.user.userId,
      type:     'info',
      title:    'Documents Submitted',
      message:  `Your documents for "${prog.scheme_milestones?.title}" have been submitted for review. Admin will verify within 2-3 working days.`,
      link:     'p-active',
      is_read:  false,
    });

    res.json({ success: true, progress: updated, document_id: documentId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN: GET /api/milestones/admin/district
// Returns paginated milestone progress records with documents CORRECTLY fetched.
// Includes PII Decryption.
// Response: { records, counts, total, page, pages }
// ─────────────────────────────────────────────────────────────────────────────
router.get('/admin/district', protect, async (req, res) => {
  try {
    const { scheme_id, status, district, state, page = 1, limit = 500 } = req.query;
    const pageNum  = parseInt(page)  || 1;
    const pageSize = parseInt(limit) || 500;
    const from     = (pageNum - 1) * pageSize;
    const to       = from + pageSize - 1;

    const role = req.user?.role;

    // ── 1. Get progress counts per status (for tab badges) ────────────────────
    // (Filtering them based on admin jurisdiction)
    let countsQuery = supabase
      .from('user_milestone_progress')
      .select('status, users:user_id!inner(district, state), schemes!inner(level)');

    if (role === 'district' && req.user.district) countsQuery = countsQuery.eq('users.district', req.user.district);
    if (role === 'state' && req.user.state) countsQuery = countsQuery.eq('users.state', req.user.state);
    
    // REMOVED: query.eq('schemes.level', role.toLowerCase()) 
    // District admins should see all schemes (including central) for citizens in their district.

    // Only count statuses that are actionable (exclude pending/locked which citizen hasn't submitted)
    const { data: allStatuses } = await countsQuery.in('status', ['applied', 'error', 'completed', 'blocked']).limit(5000);
    const counts = { applied: 0, completed: 0, error: 0, blocked: 0 };
    (allStatuses || []).forEach(r => {
      if (counts[r.status] !== undefined) counts[r.status]++;
    });

    // ── 2. Build main paginated query ─────────────────────────────────────────
    let query = supabase
      .from('user_milestone_progress')
      .select(`
        id, user_id, scheme_id, milestone_id, status,
        error_count, completed_at, admin_notes, document_id, updated_at,
        users:user_id!inner (
          id, full_name, phone, district, state, gender, category,
          date_of_birth, total_benefits, pincode, ward
        ),
        scheme_milestones (
          id, step_number, title, description, amount, expected_days
        ),
        schemes!inner (
          id, name, category, ministry, level
        )
      `, { count: 'exact' })
      .range(from, to);

    // Apply Jurisdiction & Level Filters to Query
    if (role === 'district' && req.user.district) query = query.eq('users.district', req.user.district);
    if (role === 'state' && req.user.state) query = query.eq('users.state', req.user.state);
    
    // REMOVED: query.eq('schemes.level', role.toLowerCase())
    // Allows cross-level verification (e.g. district admin verifying central scheme docs)

    // Apply specific filters from query params
    if (status && status !== 'all') {
      query = query.eq('status', status);
    } else if (status === 'all') {
      // Exclude future/locked AND unsubmitted pending milestones — only action-needed records
      query = query.in('status', ['applied', 'error', 'completed', 'blocked']);
    } else {
      // Default view: ONLY milestones citizen has actually submitted (applied) or that were rejected (error)
      // 'pending' = citizen hasn't submitted yet — should NOT appear in admin queue
      query = query.in('status', ['applied', 'error']);
    }

    if (scheme_id) {
      query = query.eq('scheme_id', scheme_id);
    }

    const { data: records, error, count } = await query;

    if (error) throw new Error(error.message);

    // ── 3. Fetch documents for each progress record (TEMPLATE-BASED JOIN) ──
    const templateIds = (records || []).map(r => r.milestone_id).filter(Boolean);
    const userIds = (records || []).map(r => r.user_id).filter(Boolean);

    let docsByProgress = {};
    if (templateIds.length > 0) {
      const { data: docs } = await supabase
        .from('documents')
        .select('id, doc_name, doc_type, file_path, file_url, mime_type, status, milestone_id, created_at, user_id')
        .in('milestone_id', templateIds) 
        .in('user_id', userIds)
        .order('created_at', { ascending: false });

      (records || []).forEach(r => {
        // Find documents that belong to this user AND this milestone template
        const userDocs = (docs || []).filter(d => d.milestone_id === r.milestone_id && d.user_id === r.user_id);
        docsByProgress[r.id] = userDocs;
      });
    }

    // ── 4. Decrypt PII & Attach Documents ─────────────────────────────────────
    const enriched = (records || []).map(r => {
      // Decrypt user fields for standard PII visibility
      const decryptedUser = decryptUserFields(r.users);
      return {
        ...r,
        users: decryptedUser,
        documents: docsByProgress[r.id] || [],
      };
    });

    res.json({
      records:  enriched,
      counts,
      total:    count  || 0,
      page:     pageNum,
      pages:    Math.ceil((count || 0) / pageSize),
    });
  } catch (err) {
    console.error('[milestones/admin]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN: PATCH /api/milestones/admin/:id
// Approve or reject a milestone. Sends notification + unlocks next.
// ─────────────────────────────────────────────────────────────────────────────
router.patch('/admin/:id', protect, async (req, res) => {
  try {
    const { status, admin_notes } = req.body;

    const validStatuses = ['pending', 'completed', 'error', 'blocked', 'locked'];
    if (!validStatuses.includes(status))
      return res.status(400).json({ error: `Status must be: ${validStatuses.join(', ')}` });

    const { data: currentProg } = await supabase
      .from('user_milestone_progress')
      .select('error_count')
      .eq('id', req.params.id)
      .single();

    const updates = {
      status,
      admin_notes: admin_notes || null,
    };
    if (status === 'completed') {
      updates.completed_at = new Date().toISOString();
    } else if (status === 'error') {
      updates.error_count = (currentProg?.error_count || 0) + 1;
    }

    const { data: prog, error } = await supabase
      .from('user_milestone_progress')
      .update(updates)
      .eq('id', req.params.id)
      .select(`*, users:user_id(total_benefits), schemes(name, benefit_amount), scheme_milestones(title, amount, step_number)`)
      .single();

    if (error) throw new Error(error.message);

    // Credit beneficiary for THIS specific milestone if it has an amount
    if (status === 'completed') {
      const milestoneAmount = prog.scheme_milestones?.amount || 0;
      if (milestoneAmount > 0) {
        const currentBenefits = prog.users?.total_benefits || 0;
        await supabase.from('users').update({
          total_benefits: currentBenefits + milestoneAmount,
          last_benefit_received_at: new Date().toISOString(),
          last_benefit_amount: milestoneAmount,
        }).eq('id', prog.user_id);

        // Transaction log
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
        }).catch(() => {});
      }
    }

    // Notification messages
    const msgs = {
      completed: `✅ Milestone "${prog.scheme_milestones?.title}" completed!${prog.scheme_milestones?.amount ? ` ₹${prog.scheme_milestones.amount.toLocaleString('en-IN')} has been credited.` : ''}`,
      error:     `⚠️ Documents for "${prog.scheme_milestones?.title}" were rejected. Reason: ${admin_notes || 'Please re-upload a clearer copy.'}`,
      blocked:   `🔒 Milestone "${prog.scheme_milestones?.title}" is blocked. ${admin_notes || 'Contact support.'}`,
    };

    if (msgs[status]) {
      await supabase.from('notifications').insert({
        user_id: prog.user_id,
        type:    status === 'completed' ? 'success' : 'warning',
        title:   status === 'completed' ? '🎉 Milestone Approved!' : 'Milestone Update',
        message: msgs[status],
        link:    'p-active',
        is_read: false,
      });
    }

    // Unlock next milestone on completion
    if (status === 'completed') {
      const { data: nextMs } = await supabase
        .from('scheme_milestones')
        .select('id, title')
        .eq('scheme_id', prog.scheme_id)
        .gt('step_number', prog.scheme_milestones?.step_number || 0)
        .order('step_number')
        .limit(1);

      if (nextMs?.[0]) {
        await supabase
          .from('user_milestone_progress')
          .update({ status: 'pending' })
          .eq('user_id', prog.user_id)
          .eq('milestone_id', nextMs[0].id);
        
        // Notify about next step
        await supabase.from('notifications').insert({
           user_id: prog.user_id,
           type: 'info',
           title: 'Next Step Unlocked',
           message: `You can now proceed to the next milestone: "${nextMs[0].title}".`,
           link: 'p-active'
        });
      } else {
        // Mark scheme as completed in user_scheme_matches
        await supabase.from('user_scheme_matches')
          .update({ status: 'completed', updated_at: new Date().toISOString() })
          .eq('user_id', prog.user_id)
          .eq('scheme_id', prog.scheme_id);
          
        // FULL SCHEME DISBURSEMENT LOGIC
        const schemeAmount = prog.schemes?.benefit_amount || 0;
        if (schemeAmount > 0) {
          const { data: userRecord } = await supabase.from('users').select('total_benefits').eq('id', prog.user_id).single();
          const currentBenefits = userRecord?.total_benefits || 0;
          
          await supabase.from('users').update({
            total_benefits: currentBenefits + schemeAmount,
            last_benefit_received_at: new Date().toISOString(),
            last_benefit_amount: schemeAmount,
          }).eq('id', prog.user_id);

          await supabase.from('benefit_transactions').insert({
            user_id: prog.user_id,
            scheme_id: prog.scheme_id,
            milestone_id: prog.milestone_id,
            amount: schemeAmount,
            type: 'cash_transfer',
            milestone_title: 'Full Scheme Disbursed',
            scheme_name: prog.schemes?.name,
            approved_by: req.user.adminId || req.user.userId,
            disbursed_at: new Date().toISOString(),
          }).catch(() => {});
          
          await supabase.from('notifications').insert({
             user_id: prog.user_id,
             type: 'success',
             title: 'Scheme Fully Disbursed 💰',
             message: `₹${schemeAmount.toLocaleString('en-IN')} has been direct-credited for completing "${prog.schemes?.name}".`,
             link: 'p-completed'
          });
        }
      }
    }

    res.json(prog);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;