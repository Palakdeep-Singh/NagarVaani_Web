/**
 * admin.routes.js
 * Place: server/src/routes/admin.routes.js
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

const generatePassword = (role, district, state) => {
  const c = s => (s || '').replace(/\s+/g, '');
  if (role === 'district') return `DC@${c(district)}25`;
  if (role === 'state') return `State@${c(state)}25`;
  return 'Central@India25';
};

const ALL_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal',
  'Andaman and Nicobar Islands','Chandigarh','Dadra and Nagar Haveli and Daman and Diu',
  'Delhi','Jammu and Kashmir','Ladakh','Lakshadweep','Puducherry'
];

// ── GET /api/admin/users ──────────────────────────────────────────────────────
router.get('/users', protect, requireRole('central', 'state', 'district'), async (req, res) => {
  try {
    let query = supabase
      .from('users')
      .select('id,phone,full_name,gender,state,district,category,occupation,profile_complete,created_at')
      .order('created_at', { ascending: false })
      .limit(200);

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
    const role = req.user.role;
    const adminState = req.user.state;
    const adminDistrict = req.user.district;

    // Build base queries
    const filters = {};
    if (role === 'district') filters.district = adminDistrict;
    if (role === 'state') filters.state = adminState;

    // Build base queries
    let uq = supabase.from('users').select('*', { count: 'exact', head: true });
    let sq = supabase.from('schemes').select('*', { count: 'exact', head: true }).eq('is_active', true);
    let pq = supabase.from('user_scheme_matches').select('id, users!inner(id)', { count: 'exact', head: true }).eq('status', 'pending');
    let cqo = supabase.from('complaints').select('*', { count: 'exact', head: true }).not('status', 'in', '("resolved","closed")');
    let cqr = supabase.from('complaints').select('*', { count: 'exact', head: true }).in('status', ['resolved', 'closed']);
    
    // For sums and complex counts, we limit what we fetch to essential fields only
    let eq = supabase.from('user_scheme_matches').select('user_id, users!inner(id)');
    let fq = supabase.from('user_milestone_progress').select('scheme_milestones(amount), users!inner(id)').eq('status', 'completed');
    let fcq = supabase.from('user_scheme_matches').select('schemes(benefit_amount), users!inner(id)');

    // Apply role-based filters
    if (role === 'district') {
      uq = uq.eq('district', adminDistrict);
      pq = pq.eq('users.district', adminDistrict);
      cqo = cqo.eq('district', adminDistrict);
      cqr = cqr.eq('district', adminDistrict);
      eq = eq.eq('users.district', adminDistrict);
      fq = fq.eq('users.district', adminDistrict);
      fcq = fcq.eq('users.district', adminDistrict);
    } else if (role === 'state') {
      uq = uq.eq('state', adminState);
      pq = pq.eq('users.state', adminState);
      cqo = cqo.eq('state', adminState);
      cqr = cqr.eq('state', adminState);
      eq = eq.eq('users.state', adminState);
      fq = fq.eq('users.state', adminState);
      fcq = fcq.eq('users.state', adminState);
    }

    // Execute all queries in parallel
    const [
      { count: totalUsers },
      { count: activeSchemes },
      { count: pendingApplications },
      { count: openComplaints },
      { count: resolvedComplaints },
      { data: enrolledData },
      { data: fundData },
      { data: commitData }
    ] = await Promise.all([
      uq, sq, pq, cqo, cqr, eq, fq, fcq
    ]);

    const citizensEnrolled = new Set((enrolledData || []).map(m => m.user_id)).size;
    const fundsDisbursed = (fundData || []).reduce((s, r) => s + (r.scheme_milestones?.amount || 0), 0);
    const fundsCommitted = (commitData || []).reduce((s, r) => s + (r.schemes?.benefit_amount || 0), 0);

    const deliveryRate = (resolvedComplaints || 0) + (openComplaints || 0) > 0
      ? Math.round(((resolvedComplaints || 0) / ((openComplaints || 0) + (resolvedComplaints || 0))) * 100)
      : 87;

    res.json({
      totalUsers: totalUsers || 0,
      activeSchemes: activeSchemes || 0,
      citizensEnrolled,
      pendingApplications: pendingApplications || 0,
      openComplaints: openComplaints || 0,
      resolvedComplaints: resolvedComplaints || 0,
      fundsCommitted,
      fundsDisbursed,
      deliveryRate,
    });
  } catch (err) {
    console.error('[admin/stats]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/admin/dashboard/states ──────────────────────────────────────────
router.get('/dashboard/states', protect, requireRole('central'), async (req, res) => {
  try {
    const { data: users } = await supabase.from('users').select('state,district,date_of_birth,occupation');
    const { data: matches } = await supabase.from('user_scheme_matches').select('user_id,status,users(state),schemes(benefit_amount)');
    const { data: complaints } = await supabase.from('complaints').select('state,status');
    const { data: milestones } = await supabase.from('user_milestone_progress')
      .select('status,scheme_milestones(amount),users(state)').eq('status', 'completed');

    const stateMap = {};
    ALL_STATES.forEach(s => {
      stateMap[s] = {
        state: s, citizens: 0, enrolled: 0, pending: 0, seniorCount: 0, pensionerCount: 0,
        openComplaints: 0, resolvedComplaints: 0, fundsCommitted: 0, fundsDisbursed: 0, districts: new Set()
      };
    });

    (users || []).forEach(u => {
      const s = u.state;
      if (stateMap[s]) {
        stateMap[s].citizens++;
        if (u.district) stateMap[s].districts.add(u.district);
        const dec = decryptUserFields(u);
        if (dec.date_of_birth) {
          const age = Math.floor((new Date() - new Date(dec.date_of_birth)) / (365.25 * 86400000));
          if (age >= 60) stateMap[s].seniorCount++;
        }
        if (dec.occupation === 'Retired / Pensioner') stateMap[s].pensionerCount++;
      }
    });

    const enrolledSets = {};
    (matches || []).forEach(m => {
      const s = m.users?.state;
      if (s && stateMap[s]) {
        if (!enrolledSets[s]) enrolledSets[s] = new Set();
        enrolledSets[s].add(m.user_id);
        if (m.status === 'pending') stateMap[s].pending++;
        stateMap[s].fundsCommitted += (m.schemes?.benefit_amount || 0);
      }
    });
    Object.keys(stateMap).forEach(s => stateMap[s].enrolled = enrolledSets[s]?.size || 0);

    (complaints || []).forEach(c => {
      const s = c.state;
      if (s && stateMap[s]) {
        if (['resolved', 'closed'].includes(c.status)) stateMap[s].resolvedComplaints++;
        else stateMap[s].openComplaints++;
      }
    });

    (milestones || []).forEach(m => {
      const s = m.users?.state;
      if (s && stateMap[s]) stateMap[s].fundsDisbursed += (m.scheme_milestones?.amount || 0);
    });

    res.json(Object.values(stateMap).map(s => ({ ...s, districtCount: s.districts.size, districts: undefined })));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── GET /api/admin/dashboard/districts ───────────────────────────────────────
router.get('/dashboard/districts', protect, requireRole('central', 'state'), async (req, res) => {
  try {
    const targetState = req.user.role === 'state' ? req.user.state : req.query.state;
    if (!targetState) return res.status(400).json({ error: 'state req' });

    const { data: users } = await supabase.from('users').select('district,date_of_birth,occupation').eq('state', targetState);
    const { data: matches } = await supabase.from('user_scheme_matches').select('user_id,status,users!inner(district,state),schemes(benefit_amount)').eq('users.state', targetState);
    const { data: complaints } = await supabase.from('complaints').select('district,status').eq('state', targetState);
    const { data: milestones } = await supabase.from('user_milestone_progress').select('status,scheme_milestones(amount),users!inner(district,state)').eq('users.state', targetState).eq('status', 'completed');

    const dMap = {};
    (users || []).forEach(u => {
      const d = u.district || 'Unknown';
      if (!dMap[d]) dMap[d] = { district: d, citizens: 0, enrolled: 0, pending: 0, seniorCount: 0, pensionerCount: 0, openComplaints: 0, resolvedComplaints: 0, fundsCommitted: 0, fundsDisbursed: 0 };
      dMap[d].citizens++;
      const dec = decryptUserFields(u);
      if (dec.date_of_birth) {
        const age = Math.floor((new Date() - new Date(dec.date_of_birth)) / (365.25 * 86400000));
        if (age >= 60) dMap[d].seniorCount++;
      }
      if (dec.occupation === 'Retired / Pensioner') dMap[d].pensionerCount++;
    });

    const dEnrolled = {};
    (matches || []).forEach(m => {
      const d = m.users?.district || 'Unknown';
      if (dMap[d]) {
        if (!dEnrolled[d]) dEnrolled[d] = new Set();
        dEnrolled[d].add(m.user_id);
        if (m.status === 'pending') dMap[d].pending++;
        dMap[d].fundsCommitted += (m.schemes?.benefit_amount || 0);
      }
    });
    Object.keys(dMap).forEach(d => dMap[d].enrolled = dEnrolled[d]?.size || 0);

    (complaints || []).forEach(c => {
      const d = c.district || 'Unknown';
      if (dMap[d]) {
        if (['resolved', 'closed'].includes(c.status)) dMap[d].resolvedComplaints++;
        else dMap[d].openComplaints++;
      }
    });

    (milestones || []).forEach(m => {
      const d = m.users?.district || 'Unknown';
      if (dMap[d]) dMap[d].fundsDisbursed += (m.scheme_milestones?.amount || 0);
    });

    res.json(Object.values(dMap));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── GET /api/admin/dashboard/demographics ────────────────────────────────────
router.get('/dashboard/demographics', protect, requireRole('central', 'state', 'district'), async (req, res) => {
  try {
    let q = supabase.from('users').select('date_of_birth,category,occupation,state,district');
    if (req.user.role === 'district') q = q.eq('district', req.user.district);
    else if (req.user.role === 'state') q = q.eq('state', req.user.state);
    const { data } = await q;

    const ages = { under18: 0, youth: 0, working: 0, senior: 0 };
    const categories = {};
    const occupations = {};

    (data || []).forEach(u => {
      const dec = decryptUserFields(u);
      if (dec.date_of_birth) {
        const age = Math.floor((new Date() - new Date(dec.date_of_birth)) / (365.25 * 86400000));
        if (age < 18) ages.under18++; else if (age <= 25) ages.youth++; else if (age <= 59) ages.working++; else ages.senior++;
      } else ages.working++;

      const cat = dec.category || 'General';
      categories[cat] = (categories[cat] || 0) + 1;
      const occ = dec.occupation || 'Other';
      occupations[occ] = (occupations[occ] || 0) + 1;
    });

    res.json({
      total: (data || []).length,
      ageGroups: [
        { label: 'Under 18', value: ages.under18, color: '#6366F1' },
        { label: 'Youth (18-25)', value: ages.youth, color: '#F59E0B' },
        { label: 'Working (26-59)', value: ages.working, color: '#10B981' },
        { label: 'Senior (60+)', value: ages.senior, color: '#EF4444' },
      ],
      categories: Object.entries(categories).map(([label, value]) => ({ label, value })),
      occupations: Object.entries(occupations).slice(0, 10).map(([label, value]) => ({ label, value })),
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── GET /api/admin/dashboard/fund-history ────────────────────────────────────
router.get('/dashboard/fund-history', protect, requireRole('central', 'state', 'district'), async (req, res) => {
  try {
    const { year } = req.query; // optional year filter
    let q = supabase.from('user_milestone_progress')
      .select('completed_at,scheme_milestones(amount),users!inner(state,district)')
      .eq('status', 'completed').not('completed_at', 'is', null);

    if (req.user.role === 'district') q = q.eq('users.district', req.user.district);
    else if (req.user.role === 'state') q = q.eq('users.state', req.user.state);

    if (year) {
      q = q.gte('completed_at', `${year}-01-01T00:00:00Z`).lte('completed_at', `${year}-12-31T23:59:59Z`);
    }

    const { data } = await q;
    const monthMap = {};
    (data || []).forEach(r => {
      const d = new Date(r.completed_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!monthMap[key]) monthMap[key] = { month: key, disbursed: 0 };
      monthMap[key].disbursed += (r.scheme_milestones?.amount || 0);
    });

    const months = Object.values(monthMap).sort((a, b) => a.month.localeCompare(b.month));
    const predicted = [];
    if (months.length >= 2) {
      const lastVal = months[months.length - 1].disbursed;
      // Slightly more robust linear trend
      const avgGrowth = months.reduce((acc, m, i) => {
        if (i === 0) return acc;
        return acc + (m.disbursed - months[i - 1].disbursed);
      }, 0) / (months.length - 1);

      for (let i = 1; i <= 3; i++) {
        const nextMonth = new Date(months[months.length - 1].month + '-01');
        nextMonth.setMonth(nextMonth.getMonth() + i);
        const nextKey = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}`;
        predicted.push({ month: nextKey, disbursed: Math.max(0, Math.round(lastVal + avgGrowth * i)), predicted: true });
      }
    }

    const change = months.length >= 2 ? {
      amount: months[months.length - 1].disbursed - months[months.length - 2].disbursed,
      percent: months[months.length - 2].disbursed > 0 ? Math.round(((months[months.length - 1].disbursed - months[months.length - 2].disbursed) / months[months.length - 2].disbursed) * 100) : 0
    } : { amount: 0, percent: 0 };

    res.json({ actual: months, predicted, change });
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
    if (!email || !name || !role) return res.status(400).json({ error: 'email, name, role required' });
    if (!ROLES.includes(role)) return res.status(400).json({ error: 'Invalid role' });
    if (!canCreate(creator.role, role)) return res.status(403).json({ error: 'Deny' });

    const targetState = creator.role === 'state' ? creator.state : state;
    const plainPassword = generatePassword(role, district, targetState);
    const password_hash = await bcrypt.hash(plainPassword, 10);

    const { data, error } = await supabase.from('admins').insert({
      email: email.toLowerCase().trim(), password_hash, name, role,
      state: role === 'central' ? null : targetState, district: role === 'district' ? district : null,
      designation: designation || null, phone: phone || null, is_active: true, created_by: creator.adminId,
    }).select('*').single();

    if (error) throw new Error(error.message);
    res.json({ success: true, admin: data, credentials: { email: data.email, password: plainPassword } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── GET /api/admin/list-admins ────────────────────────────────────────────────
router.get('/list-admins', protect, requireRole('central', 'state'), async (req, res) => {
  try {
    let q = supabase.from('admins').select('*').order('role').order('state').order('district');
    if (req.user.role === 'state') q = q.eq('state', req.user.state);
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    res.json(data || []);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── PATCH /api/admin/toggle-admin/:id ────────────────────────────────────────
router.patch('/toggle-admin/:id', protect, requireRole('central', 'state'), async (req, res) => {
  try {
    const { data, error } = await supabase.from('admins').update({ is_active: req.body.is_active }).eq('id', req.params.id).select('id,email,is_active').single();
    if (error) throw new Error(error.message);
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── PATCH /api/admin/reset-password/:id ──────────────────────────────────────
router.patch('/reset-password/:id', protect, requireRole('central', 'state'), async (req, res) => {
  try {
    const { data: admin } = await supabase.from('admins').select('*').eq('id', req.params.id).single();
    const plain = generatePassword(admin.role, admin.district, admin.state);
    const password_hash = await bcrypt.hash(plain, 10);
    await supabase.from('admins').update({ password_hash }).eq('id', req.params.id);
    res.json({ success: true, credentials: { email: admin.email, password: plain } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── DELETE /api/admin/delete-admin/:id ───────────────────────────────────────
router.delete('/delete-admin/:id', protect, requireRole('central', 'state'), async (req, res) => {
  try {
    await supabase.from('admins').delete().eq('id', req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;