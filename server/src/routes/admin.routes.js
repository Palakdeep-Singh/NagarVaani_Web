/**
 * admin.routes.js
 * Place: server/src/routes/admin.routes.js
 *
 * WHO CAN CREATE WHOM:
 *   central  → can create state + district admins (any state/district)
 *   state    → can create district admins in their own state only
 *   district → cannot create anyone
 */
import express from 'express';
import bcrypt from 'bcryptjs';
import { protect } from '../middleware/auth.middleware.js';
import { supabase } from '../config/supabase.js';
import { decryptUserFields } from '../utils/crypto.js';

const router = express.Router();

// ── helpers ───────────────────────────────────────────────────────────────────
const ROLES = ['central', 'state', 'district'];

const requireRole = (...allowed) => (req, res, next) => {
  if (!allowed.includes(req.user?.role))
    return res.status(403).json({ error: `Access denied. Requires: ${allowed.join(' or ')}` });
  next();
};

const canCreate = (creatorRole, targetRole) => {
  if (creatorRole === 'central') return ['state', 'district'].includes(targetRole);
  if (creatorRole === 'state') return targetRole === 'district';
  return false;
};

// Auto-generate password from role + jurisdiction
const generatePassword = (role, district, state) => {
  const c = s => (s || '').replace(/\s+/g, '');
  if (role === 'district') return `DC@${c(district)}25`;
  if (role === 'state') return `State@${c(state)}25`;
  return 'Central@India25';
};

// ── GET /api/admin/users ──────────────────────────────────────────────────────
router.get('/users', protect, requireRole('central', 'state', 'district'), async (req, res) => {
  try {
    let query = supabase
      .from('users')
      .select('id,phone,full_name,gender,state,district,category,occupation,profile_complete,created_at')
      .order('created_at', { ascending: false })
      .limit(200);

    // scope by role
    if (req.user.role === 'district')
      query = query.eq('district', req.user.district);
    else if (req.user.role === 'state')
      query = query.eq('state', req.user.state);

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    res.json((data || []).map(u => decryptUserFields(u)));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── GET /api/admin/stats ──────────────────────────────────────────────────────
router.get('/stats', protect, requireRole('central', 'state', 'district'), async (req, res) => {
  try {
    let q = supabase.from('users').select('*', { count: 'exact', head: true });
    if (req.user.role === 'district') q = q.eq('district', req.user.district);
    else if (req.user.role === 'state') q = q.eq('state', req.user.state);
    const { count } = await q;
    res.json({ totalUsers: count || 0, deliveryRate: 87, openComplaints: 14, fundsUtilized: 247000000 });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── GET /api/admin/complaints ─────────────────────────────────────────────────
router.get('/complaints', protect, requireRole('central', 'state', 'district'), async (req, res) => {
  try {
    let q = supabase.from('complaints').select('*').order('filed_at', { ascending: false });
    if (req.user.role === 'district') q = q.eq('district', req.user.district);
    else if (req.user.role === 'state') q = q.eq('state', req.user.state);
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    res.json(data || []);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── POST /api/admin/create-admin ──────────────────────────────────────────────
router.post('/create-admin', protect, requireRole('central', 'state'), async (req, res) => {
  try {
    const { email, name, role, district, state, designation, phone } = req.body;
    const creator = req.user;

    if (!email || !name || !role)
      return res.status(400).json({ error: 'email, name, role required' });

    if (!ROLES.includes(role))
      return res.status(400).json({ error: 'Invalid role. Use: state or district' });

    if (!canCreate(creator.role, role))
      return res.status(403).json({ error: `${creator.role} cannot create ${role} admins` });

    // state admin can only create district admins in their own state
    const targetState = creator.role === 'state' ? creator.state : state;
    if (!targetState && role !== 'central')
      return res.status(400).json({ error: 'state is required' });
    if (role === 'district' && !district)
      return res.status(400).json({ error: 'district is required' });

    const plainPassword = generatePassword(role, district, targetState);
    const password_hash = await bcrypt.hash(plainPassword, 10);

    const { data, error } = await supabase.from('admins').insert({
      email: email.toLowerCase().trim(),
      password_hash,
      name,
      role,
      state: role === 'central' ? null : targetState,
      district: role === 'district' ? district : null,
      designation: designation || null,
      phone: phone || null,
      is_active: true,
      created_by: creator.adminId,
    }).select('id,email,name,role,state,district,designation,created_at').single();

    if (error) {
      if (error.message.includes('unique') || error.message.includes('duplicate'))
        return res.status(409).json({ error: 'Admin with this email already exists' });
      throw new Error(error.message);
    }

    res.json({
      success: true,
      admin: data,
      credentials: {
        email: data.email,
        password: plainPassword,
        note: 'Password shown once only. Deliver to officer via official channel.',
      },
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── GET /api/admin/list-admins ────────────────────────────────────────────────
router.get('/list-admins', protect, requireRole('central', 'state'), async (req, res) => {
  try {
    let q = supabase.from('admins')
      .select('id,email,name,role,state,district,designation,phone,is_active,created_at,last_login')
      .order('role').order('state').order('district');

    // state can only see their own district admins
    if (req.user.role === 'state') q = q.eq('state', req.user.state);

    const { data, error } = await q;
    if (error) throw new Error(error.message);
    res.json(data || []);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── PATCH /api/admin/toggle-admin/:id ────────────────────────────────────────
router.patch('/toggle-admin/:id', protect, requireRole('central', 'state'), async (req, res) => {
  try {
    // state can only toggle district admins in their own state
    if (req.user.role === 'state') {
      const { data: target } = await supabase.from('admins').select('state,role').eq('id', req.params.id).single();
      if (!target || target.state !== req.user.state || target.role !== 'district')
        return res.status(403).json({ error: 'Can only manage district admins in your state' });
    }
    const { data, error } = await supabase.from('admins')
      .update({ is_active: req.body.is_active })
      .eq('id', req.params.id)
      .select('id,email,name,is_active').single();
    if (error) throw new Error(error.message);
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── PATCH /api/admin/reset-password/:id ──────────────────────────────────────
router.patch('/reset-password/:id', protect, requireRole('central', 'state'), async (req, res) => {
  try {
    const { data: admin, error: fe } = await supabase.from('admins')
      .select('role,district,state,email,name').eq('id', req.params.id).single();
    if (fe) throw new Error(fe.message);

    // state can only reset district admins in their own state
    if (req.user.role === 'state' && (admin.state !== req.user.state || admin.role !== 'district'))
      return res.status(403).json({ error: 'Can only reset district admins in your state' });

    const plain = generatePassword(admin.role, admin.district, admin.state);
    const password_hash = await bcrypt.hash(plain, 10);

    const { data, error } = await supabase.from('admins')
      .update({ password_hash }).eq('id', req.params.id)
      .select('id,email,name').single();
    if (error) throw new Error(error.message);

    res.json({
      success: true,
      admin: data,
      credentials: { email: admin.email, password: plain, note: 'Password reset. Send to officer.' },
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── DELETE /api/admin/delete-admin/:id ───────────────────────────────────────
router.delete('/delete-admin/:id', protect, requireRole('central', 'state'), async (req, res) => {
  try {
    if (req.user.role === 'state') {
      const { data: target } = await supabase.from('admins').select('state,role').eq('id', req.params.id).single();
      if (!target || target.state !== req.user.state || target.role !== 'district')
        return res.status(403).json({ error: 'Can only delete district admins in your state' });
    }
    const { error } = await supabase.from('admins').delete().eq('id', req.params.id);
    if (error) throw new Error(error.message);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;