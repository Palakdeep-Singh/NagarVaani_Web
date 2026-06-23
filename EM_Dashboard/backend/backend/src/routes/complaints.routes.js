/**
 * complaints.routes.js — Fixed
 *
 * KEY FIXES:
 *  - When complaint is marked resolved/closed, it is written to complaint_resolved_log table
 *  - complaint_resolved_log keeps full audit trail: ticket_no, title, resolution notes,
 *    admin who resolved it, timestamp, SLA adherence
 *  - The main complaints table still has the record (for history), 
 *    but frontend filters active vs resolved on client side
 *  - Added proper SLA due_at assignment on complaint creation
 */
import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { supabase } from '../config/supabase.js';
import { decryptUserFields } from '../utils/crypto.js';

const router = express.Router();

// Helper: write resolved complaint to log table
const logResolvedComplaint = async (complaint, adminNotes, resolvedBy) => {
  try {
    const slaBreached = complaint.due_at && new Date(complaint.due_at) < new Date();
    await supabase.from('complaint_resolved_log').insert({
      complaint_id: complaint.id,
      ticket_no: complaint.ticket_no,
      title: complaint.title,
      category: complaint.category,
      district: complaint.district,
      state: complaint.state,
      user_id: complaint.user_id,
      filed_at: complaint.filed_at || complaint.created_at,
      resolved_at: new Date().toISOString(),
      resolution_notes: adminNotes || 'Resolved by admin',
      resolved_by: resolvedBy,
      sla_breached: slaBreached,
      days_taken: complaint.filed_at
        ? Math.round((new Date() - new Date(complaint.filed_at)) / 86400000)
        : null,
    });
  } catch (_e) {
    // Non-fatal — log table may not exist yet. Complaint still resolves.
    console.warn('[COMPLAINT LOG] Could not write to complaint_resolved_log:', _e.message);
  }
};

// ── Citizen: file new complaint ──────────────────────────────────────────────
router.post('/', protect, async (req, res) => {
  try {
    const { title, category, description, location } = req.body;
    if (!title || !category)
      return res.status(400).json({ error: 'Title and category required' });

    const { data: user } = await supabase
      .from('users').select('district,state,full_name').eq('id', req.user.userId).single();
    const decUser = decryptUserFields(user);

    // SLA: 14 days from filing
    const dueAt = new Date();
    dueAt.setDate(dueAt.getDate() + 14);

    const { data: complaint, error } = await supabase
      .from('complaints')
      .insert({
        user_id: req.user.userId,
        title, category, description, location,
        district: decUser?.district || '',
        state: decUser?.state || '',
        status: 'open',
        priority: 'normal',
        filed_at: new Date().toISOString(),
        due_at: dueAt.toISOString(),
      })
      .select().single();

    if (error) throw new Error(error.message);

    // Timeline: initial entry
    await supabase.from('complaint_timeline').insert({
      complaint_id: complaint.id,
      action: 'filed',
      actor: decUser?.full_name || 'Citizen',
      actor_role: 'citizen',
      message: `Complaint filed: ${title}`,
      old_status: null,
      new_status: 'open',
    });

    // Notify citizen
    await supabase.from('notifications').insert({
      user_id: req.user.userId,
      type: 'info',
      title: 'Complaint Filed Successfully',
      message: `Your complaint #${complaint.ticket_no || complaint.id.slice(0, 8)} has been registered. The district office will respond within 14 days.`,
      link: 'p-complaints',
    });

    res.json(complaint);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Citizen: get my complaints with timeline ─────────────────────────────────
router.get('/my', protect, async (req, res) => {
  try {
    const { data: complaints, error } = await supabase
      .from('complaints')
      .select('*')
      .eq('user_id', req.user.userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    const enriched = await Promise.all((complaints || []).map(async (c) => {
      const { data: timeline } = await supabase
        .from('complaint_timeline')
        .select('*')
        .eq('complaint_id', c.id)
        .order('created_at', { ascending: true });
      return { ...c, timeline: timeline || [] };
    }));

    res.json(enriched);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Citizen: get single complaint ────────────────────────────────────────────
router.get('/:id', protect, async (req, res) => {
  try {
    const { data: complaint, error } = await supabase
      .from('complaints').select('*').eq('id', req.params.id).single();
    if (error) throw new Error(error.message);

    const { data: timeline } = await supabase
      .from('complaint_timeline').select('*')
      .eq('complaint_id', req.params.id).order('created_at', { ascending: true });

    res.json({ ...complaint, timeline: timeline || [] });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Admin: get district complaints (active + resolved) ────────────────────────
router.get('/admin/district', protect, async (req, res) => {
  try {
    const { district, state, status, priority } = req.query;

    let query = supabase.from('complaints')
      .select(`*, complaint_timeline(*)`)
      .order('filed_at', { ascending: false });

    // Role-based scoping (strict)
    if (req.user?.role === 'district') {
      query = query.eq('district', req.user.district);
    } else if (req.user?.role === 'state') {
      query = query.eq('state', req.user.state);
    }
    // Central sees all

    if (district && req.user?.role !== 'district') query = query.eq('district', district);
    if (state && req.user?.role === 'central') query = query.eq('state', state);
    if (status) query = query.eq('status', status);
    if (priority) query = query.eq('priority', priority);

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    res.json(data || []);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Admin: get resolved complaint log ─────────────────────────────────────────
// Separate endpoint for the resolved log table
router.get('/admin/resolved-log', protect, async (req, res) => {
  try {
    let query = supabase
      .from('complaint_resolved_log')
      .select('*')
      .order('resolved_at', { ascending: false })
      .limit(200);

    if (req.user?.role === 'district') query = query.eq('district', req.user.district);
    else if (req.user?.role === 'state') query = query.eq('state', req.user.state);

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    res.json(data || []);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Admin: update complaint status ────────────────────────────────────────────
router.patch('/admin/:id', protect, async (req, res) => {
  try {
    const { status, assigned_to, admin_notes, priority } = req.body;

    const { data: old } = await supabase
      .from('complaints')
      .select('status,user_id,ticket_no,title,filed_at,due_at,district,state,category')
      .eq('id', req.params.id).single();

    const updates = { updated_at: new Date().toISOString() };
    if (status) updates.status = status;
    if (assigned_to) updates.assigned_to = assigned_to;
    if (admin_notes) updates.admin_notes = admin_notes;
    if (priority) updates.priority = priority;
    if (['resolved', 'closed'].includes(status)) {
      updates.resolved_at = new Date().toISOString();
    }
    // If escalating to next level, set new SLA
    if (status === 'state_escalated' && !old.state_due_at) {
      const stateDue = new Date();
      stateDue.setDate(stateDue.getDate() + 14);
      updates.state_due_at = stateDue.toISOString();
    }

    const { data: upData, error: upErr } = await supabase
      .from('complaints').update(updates).eq('id', req.params.id).select().single();
    if (upErr) throw new Error(upErr.message);

    // Timeline entry
    const actionMap = { resolved: 'resolved', closed: 'closed', state_escalated: 'escalated', district_assigned: 'assigned', central_escalated: 'escalated' };
    await supabase.from('complaint_timeline').insert({
      complaint_id: req.params.id,
      action: actionMap[status] || 'comment',
      actor: assigned_to || (req.user.name || 'Admin'),
      actor_role: 'admin',
      message: admin_notes || `Status changed to: ${status.replace(/_/g, ' ')}`,
      old_status: old?.status,
      new_status: status,
    });

    // If resolved/closed — write to log table
    if (['resolved', 'closed'].includes(status)) {
      await logResolvedComplaint(
        old,
        admin_notes,
        req.user.name || req.user.adminId || 'Admin'
      );
    }

    // Notify citizen
    const notifMsg = {
      resolved: `✅ Your complaint #${old?.ticket_no || ''} has been resolved. ${admin_notes || 'Thank you for raising this.'}`,
      closed: `🔒 Your complaint #${old?.ticket_no || ''} has been closed. ${admin_notes || ''}`,
      state_escalated: `📢 Your complaint #${old?.ticket_no || ''} has been escalated to State-level authorities for expedited resolution.`,
      central_escalated: `🏛 Your complaint #${old?.ticket_no || ''} has been escalated to the Central Government for review.`,
      district_assigned: `🏙 Your complaint #${old?.ticket_no || ''} has been assigned to ${assigned_to || 'a district officer'} for processing.`,
    };
    if (notifMsg[status]) {
      await supabase.from('notifications').insert({
        user_id: old.user_id,
        type: ['resolved', 'closed'].includes(status) ? 'success' : 'info',
        title: ['resolved', 'closed'].includes(status) ? 'Complaint Resolved!' : 'Complaint Update',
        message: notifMsg[status],
        link: 'p-complaints',
      });
    }

    res.json(upData);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Admin: bulk action ────────────────────────────────────────────────────────
router.post('/admin/bulk', protect, async (req, res) => {
  try {
    const { ids, action, assigned_to, admin_notes } = req.body;
    if (!ids?.length) return res.status(400).json({ error: 'No complaint IDs provided' });

    const updates = {
      status: action,
      updated_at: new Date().toISOString(),
    };
    if (assigned_to) updates.assigned_to = assigned_to;
    if (['resolved', 'closed'].includes(action)) {
      updates.resolved_at = new Date().toISOString();
    }

    // Get old records for logging
    const { data: oldRecords } = await supabase
      .from('complaints')
      .select('id,ticket_no,title,category,district,state,user_id,filed_at,due_at')
      .in('id', ids);

    const { error } = await supabase.from('complaints').update(updates).in('id', ids);
    if (error) throw new Error(error.message);

    // Timeline entries
    await supabase.from('complaint_timeline').insert(
      ids.map(id => ({
        complaint_id: id,
        action: action === 'resolved' ? 'resolved' : 'assigned',
        actor: assigned_to || (req.user.name || 'Admin'),
        actor_role: 'admin',
        message: admin_notes || `Bulk action: ${action.replace(/_/g, ' ')}`,
        new_status: action,
      }))
    );

    // Log resolved complaints
    if (['resolved', 'closed'].includes(action)) {
      for (const old of (oldRecords || [])) {
        await logResolvedComplaint(old, admin_notes, req.user.name || 'Admin');
      }
    }

    res.json({ updated: ids.length });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;