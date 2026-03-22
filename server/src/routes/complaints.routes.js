/**
 * complaints.routes.js
 * Place: server/src/routes/complaints.routes.js
 */
import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { supabase } from '../config/supabase.js';
import { decryptUserFields } from '../utils/crypto.js';

const router = express.Router();

// ── Citizen: file new complaint ──────────────────────────────────────────────
router.post('/', protect, async (req, res) => {
  try {
    const { title, category, description, location } = req.body;
    if (!title || !category) return res.status(400).json({ error: 'Title and category required' });

    // Get user info for district/state
    const { data: user } = await supabase
      .from('users').select('district,state,full_name').eq('id', req.user.userId).single();
    const decUser = decryptUserFields(user);

    const { data: complaint, error } = await supabase
      .from('complaints')
      .insert({
        user_id: req.user.userId,
        title, category, description, location,
        district: decUser?.district || '',
        state: decUser?.state || '',
        status: 'open',
        priority: 'normal',
      })
      .select().single();

    if (error) throw new Error(error.message);

    // Add initial timeline entry
    await supabase.from('complaint_timeline').insert({
      complaint_id: complaint.id,
      action: 'filed',
      actor: decUser?.full_name || 'Citizen',
      actor_role: 'citizen',
      message: `Complaint filed: ${title}`,
      old_status: null,
      new_status: 'open',
    });

    // Create notification for citizen
    await supabase.from('notifications').insert({
      user_id: req.user.userId,
      type: 'info',
      title: 'Complaint Filed',
      message: `Your complaint #${complaint.ticket_no} has been registered. District will respond within 14 days.`,
      link: 'p-complaints',
    });

    res.json(complaint);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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

    // Attach timelines
    const enriched = await Promise.all((complaints || []).map(async (c) => {
      const { data: timeline } = await supabase
        .from('complaint_timeline')
        .select('*')
        .eq('complaint_id', c.id)
        .order('created_at', { ascending: true });
      return { ...c, timeline: timeline || [] };
    }));

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Admin: get district complaints ───────────────────────────────────────────
router.get('/admin/district', protect, async (req, res) => {
  try {
    const { district, status, priority } = req.query;
    let query = supabase.from('complaints').select(`
      *, complaint_timeline(*)
    `).order('filed_at', { ascending: false });

    if (district) query = query.eq('district', district);
    if (status) query = query.eq('status', status);
    if (priority) query = query.eq('priority', priority);

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Admin: update complaint status (resolve/escalate/assign) ─────────────────
router.patch('/admin/:id', protect, async (req, res) => {
  try {
    const { status, assigned_to, admin_notes, priority } = req.body;

    const { data: old } = await supabase
      .from('complaints').select('status,user_id,ticket_no,title').eq('id', req.params.id).single();

    const updates = { updated_at: new Date().toISOString() };
    if (status) updates.status = status;
    if (assigned_to) updates.assigned_to = assigned_to;
    if (admin_notes) updates.admin_notes = admin_notes;
    if (priority) updates.priority = priority;
    if (status === 'resolved') updates.resolved_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('complaints').update(updates).eq('id', req.params.id).select().single();
    if (error) throw new Error(error.message);

    // Add timeline entry
    const actionMap = {
      resolved: 'resolved',
      state_escalated: 'escalated',
      district_assigned: 'assigned',
    };
    await supabase.from('complaint_timeline').insert({
      complaint_id: req.params.id,
      action: actionMap[status] || 'comment',
      actor: assigned_to || 'District Admin',
      actor_role: 'admin',
      message: admin_notes || `Status changed to ${status}`,
      old_status: old?.status,
      new_status: status,
    });

    // Notify citizen
    const notifMsg = {
      resolved: `✅ Your complaint #${old?.ticket_no} has been resolved! ${admin_notes || ''}`,
      state_escalated: `📢 Your complaint #${old?.ticket_no} has been escalated to State authorities.`,
      district_assigned: `🏛 Your complaint #${old?.ticket_no} has been assigned to ${assigned_to}.`,
    };
    if (notifMsg[status]) {
      await supabase.from('notifications').insert({
        user_id: old.user_id,
        type: status === 'resolved' ? 'success' : 'info',
        title: status === 'resolved' ? 'Complaint Resolved!' : 'Complaint Update',
        message: notifMsg[status],
        link: 'p-complaints',
      });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Admin: bulk action ───────────────────────────────────────────────────────
router.post('/admin/bulk', protect, async (req, res) => {
  try {
    const { ids, action, assigned_to, admin_notes } = req.body;
    if (!ids?.length) return res.status(400).json({ error: 'No complaint IDs provided' });

    const updates = { status: action, updated_at: new Date().toISOString() };
    if (assigned_to) updates.assigned_to = assigned_to;
    if (action === 'resolved') updates.resolved_at = new Date().toISOString();

    const { error } = await supabase.from('complaints')
      .update(updates).in('id', ids);
    if (error) throw new Error(error.message);

    // Timeline entries for all
    await supabase.from('complaint_timeline').insert(
      ids.map(id => ({
        complaint_id: id,
        action: action === 'resolved' ? 'resolved' : 'assigned',
        actor: 'District Admin',
        actor_role: 'admin',
        message: admin_notes || `Bulk action: ${action}`,
        new_status: action,
      }))
    );

    res.json({ updated: ids.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;