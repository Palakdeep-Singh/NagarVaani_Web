/**
 * scheme.service.js — Fixed: apply-with-documents, payment disbursement, booth scoping
 */
import { supabase } from '../config/supabase.js';
import { decryptUserFields } from '../utils/crypto.js';
import { matchAllSchemes } from './scheme.matcher.js';

// ── Family helper ─────────────────────────────────────────────────────────────
const getFamilyMembers = async (userId) => {
  const { data } = await supabase.from('family_members')
    .select('*').eq('user_id', userId);
  return data || [];
};

const getUser = async (userId) => {
  const { data, error } = await supabase.from('users').select('*').eq('id', userId).single();
  if (error) throw new Error('User not found: ' + error.message);
  return decryptUserFields(data);
};

const getSchemes = async () => {
  // Fetch schemes
  const { data: schemes, error: schErr } = await supabase.from('schemes').select('*')
    .eq('is_active', true).order('match_score_base', { ascending: false });
  if (schErr) throw new Error(schErr.message);

  // Fetch enrollment counts using status filter
  const { data: enrollments, error: enrErr } = await supabase
    .from('user_scheme_matches')
    .select('scheme_id, status');
  
  if (enrErr) return schemes; // Fallback to raw schemes if enrollment fetch fails

  // Aggregate counts
  const counts = (enrollments || []).reduce((acc, curr) => {
    if (['applied', 'active', 'completed'].includes(curr.status)) {
      acc[curr.scheme_id] = (acc[curr.scheme_id] || 0) + 1;
    }
    return acc;
  }, {});

  const now = new Date();

  // Append count, calculate vacancies, and mark auto-offline
  return (schemes || []).map(s => {
    const enrolled = counts[s.id] || 0;
    const max = s.max_seats || 100;
    const vacancies = Math.max(0, max - enrolled);
    const isExpired = s.deadline && new Date(s.deadline) < now;

    return {
      ...s,
      enrolled_count: enrolled,
      vacancies,
      is_auto_offline: vacancies <= 0 || isExpired,
    };
  });
  // NOTE: We no longer filter here — filtering happens in getMatchedSchemes/getAllSchemesWithScores
};

const getAppMap = async (userId) => {
  const { data } = await supabase.from('user_scheme_matches')
    .select('scheme_id, status, score, applied_at').eq('user_id', userId);
  const map = {};
  (data || []).forEach(r => { map[r.scheme_id] = r; });
  return map;
};

const mergeResults = (results, appMap, includeUnmatched) =>
  results
    .filter(r => includeUnmatched || r.matched)
    .map(r => ({
      ...r.scheme,
      match_score: r.score,
      match_grade: r.grade,
      match_reasons: r.reasons,
      match_mismatches: r.mismatches,
      hard_fail_reason: r.hard_fail_reason,
      is_matched: r.matched,
      application_status: appMap[r.scheme.id]?.status || (r.matched ? 'eligible' : 'ineligible'),
      applied_at: appMap[r.scheme.id]?.applied_at || null,
    }));

/**
 * Persistence logic: keep schemes the user already applied to,
 * even if seats are full or deadline passed. Hide offline schemes
 * only from users who haven't applied.
 */
const applyPersistence = (schemes, appMap) => {
  return schemes.filter(s => {
    if (!s.is_auto_offline) return true;                        // still live → show
    const app = appMap[s.id];
    return app && ['applied', 'active', 'completed'].includes(app.status); // already enrolled → keep
  });
};

export const getMatchedSchemes = async (userId) => {
  const [user, allSchemes, appMap, family] = await Promise.all([
    getUser(userId), getSchemes(), getAppMap(userId), getFamilyMembers(userId)
  ]);
  const schemes = applyPersistence(allSchemes, appMap);
  const results = matchAllSchemes(user, schemes, false, family);
  return mergeResults(results, appMap, false);
};

export const getMatchedSchemesForFamilyMember = async (userId, memberId) => {
  const [user, allSchemes, appMap, family] = await Promise.all([
    getUser(userId), getSchemes(), getAppMap(userId), getFamilyMembers(userId)
  ]);
  
  const familyMember = family.find(f => f.id === memberId);
  if (!familyMember) throw new Error('Family member not found');

  const blendedUser = {
    ...user,
    full_name: familyMember.full_name,
    gender: familyMember.gender,
    date_of_birth: familyMember.date_of_birth,
    occupation: familyMember.occupation,
    disability: familyMember.is_disabled ? 'yes' : 'no',
    relation: familyMember.relation,
  };

  const schemes = applyPersistence(allSchemes, appMap);
  const results = matchAllSchemes(blendedUser, schemes, false, family);
  return mergeResults(results, appMap, false);
};

export const getAllSchemesWithScores = async (userId) => {
  const [user, allSchemes, appMap, family] = await Promise.all([
    getUser(userId), getSchemes(), getAppMap(userId), getFamilyMembers(userId)
  ]);
  const schemes = applyPersistence(allSchemes, appMap);
  const results = matchAllSchemes(user, schemes, true, family);
  return mergeResults(results, appMap, true);
};

export const runMatchingForUser = async (userId) => {
  const [user, schemes] = await Promise.all([getUser(userId), getSchemes()]);
  const matched = matchAllSchemes(user, schemes, false);

  if (matched.length > 0) {
    await supabase.from('user_scheme_matches').upsert(
      matched.map(m => ({
        user_id: userId,
        scheme_id: m.scheme.id,
        score: m.score,
        grade: m.grade,
        status: 'eligible',
        matched_at: new Date().toISOString(),
      })),
      { onConflict: 'user_id,scheme_id' }
    );
  }
  return matched;
};

/**
 * applyToScheme — Now accepts document_ids (already uploaded docs)
 * Routes documents to correct admin level based on scheme.level
 */
export const applyToScheme = async (userId, schemeId, document_ids = []) => {
  // Get scheme details
  const { data: scheme, error: schErr } = await supabase
    .from('schemes').select('*').eq('id', schemeId).single();
  if (schErr) throw new Error('Scheme not found');

  // Get user for routing
  const { data: user, error: userErr } = await supabase
    .from('users').select('id, district, state').eq('id', userId).single();
  if (userErr) throw new Error('User not found');

  // Upsert application record
  const { error: appErr } = await supabase.from('user_scheme_matches').upsert({
    user_id: userId,
    scheme_id: schemeId,
    status: 'applied',
    applied_at: new Date().toISOString(),
  }, { onConflict: 'user_id,scheme_id' });
  if (appErr) throw new Error(appErr.message);

  // Get scheme milestones
  let { data: milestones } = await supabase
    .from('scheme_milestones')
    .select('id, step_number, title')
    .eq('scheme_id', schemeId)
    .order('step_number');

  // Auto-seed default milestones if scheme has none
  if (!milestones?.length) {
    const defaultMs = [
      { scheme_id: schemeId, step_number: 1, title: 'Application & Document Verification',
        description: 'Submit required documents for initial verification.', amount: 0, expected_days: 15 },
      { scheme_id: schemeId, step_number: 2, title: 'Eligibility Review',
        description: 'Officials review eligibility and verify submitted documents.', amount: 0, expected_days: 30 },
      { scheme_id: schemeId, step_number: 3, title: 'Approval & Disbursement',
        description: 'Final approval and benefit transfer.', amount: scheme.benefit_amount || 0, expected_days: 15 },
    ];
    const { data: seeded, error: seedErr } = await supabase.from('scheme_milestones').insert(defaultMs).select();
    if (seedErr) {
      console.error('[applyToScheme] Milestone seeding failed:', seedErr.message);
      throw new Error(`Failed to initialize milestones: ${seedErr.message}`);
    }
    milestones = seeded || [];
  }

  if (milestones?.length) {
    // Create progress records for each milestone
    const progressRows = milestones.map((m, idx) => ({
      user_id:      userId,
      scheme_id:    schemeId,
      milestone_id: m.id,
      status:       idx === 0 ? 'pending' : 'locked',
      error_count:  0,
      updated_at:   new Date().toISOString(),
    }));

    console.log(`[applyToScheme] Inserting ${progressRows.length} milestones for scheme ${schemeId}`);
    
    // Fetch existing milestones for this user and scheme to avoid ON CONFLICT constraint errors
    const { data: existing } = await supabase
      .from('user_milestone_progress')
      .select('milestone_id')
      .eq('user_id', userId)
      .eq('scheme_id', schemeId);
      
    const existingIds = new Set((existing || []).map(e => e.milestone_id));
    const newRows = progressRows.filter(r => !existingIds.has(r.milestone_id));
    
    if (newRows.length > 0) {
      const { error: progErr } = await supabase
        .from('user_milestone_progress')
        .insert(newRows);
      
      if (progErr) {
        console.error('[applyToScheme] CRITICAL Milestone progress error:', progErr);
        // Fallback: try inserting one by one
        for (const row of newRows) {
          const { error: insErr } = await supabase.from('user_milestone_progress').insert(row);
          if (insErr) console.error('[applyToScheme] Individual insert failed:', insErr);
        }
      }
    }
  }

    // Link uploaded documents to this scheme's application (TEMPLATE-BASED LINKING)
    if (document_ids.length > 0) {
      // Find the template ID of the first milestone (step_number 1)
      const firstMs = milestones.find(m => m.step_number === 1 || m.step_number === '1');
      const templateMilestoneId = firstMs?.id;

      await supabase.from('documents')
        .update({
          scheme_id: schemeId,
          milestone_id: templateMilestoneId || null, // Link to TEMPLATE ID as per DB convention
          status: 'pending_review',
          updated_at: new Date().toISOString(),
        })
        .in('id', document_ids)
        .eq('user_id', userId);
    }

  // Send notification
  await supabase.from('notifications').insert({
    user_id: userId,
    type: 'info',
    title: `Applied: ${scheme.name}`,
    message: `Your application for "${scheme.name}" has been submitted with ${document_ids.length} document(s). Track milestones in Active Schemes.`,
    link: 'p-active',
  });

  return {
    scheme_name: scheme.name,
    milestones_created: milestones?.length || 0,
    documents_attached: document_ids.length,
    admin_level: scheme.level,
  };
};

export const withdrawFromScheme = async (userId, schemeId) => {
  // 1. Delete milestone progress
  const { error: progErr } = await supabase
    .from('user_milestone_progress')
    .delete()
    .eq('user_id', userId)
    .eq('scheme_id', schemeId);
  if (progErr) throw new Error(progErr.message);

  // 2. Delete match/application record (so they can re-apply via scheme finder)
  const { error: matchErr } = await supabase
    .from('user_scheme_matches')
    .delete()
    .eq('user_id', userId)
    .eq('scheme_id', schemeId);
  if (matchErr) throw new Error(matchErr.message);

  // 3. Unlink documents from this scheme
  const { error: docErr } = await supabase
    .from('documents')
    .update({ scheme_id: null, milestone_id: null, status: 'verified' })
    .eq('user_id', userId)
    .eq('scheme_id', schemeId);
  if (docErr) throw new Error(docErr.message);

  return { success: true };
};

// Helper: paginate through a supabase query to bypass the 1000-row default limit
const fetchAllPages = async (buildQuery) => {
  const PAGE = 1000;
  let page = 0;
  const all = [];
  while (true) {
    const { data, error } = await buildQuery(page * PAGE, page * PAGE + PAGE - 1);
    if (error || !data || data.length === 0) break;
    all.push(...data);
    if (data.length < PAGE) break;
    page++;
  }
  return all;
};

export const getSchemeStats = async (district, state, role) => {
  // Get ALL active schemes
  const { data: allSchemes } = await supabase
    .from('schemes')
    .select('id, name, category, benefit_amount, max_seats, enrolled_count')
    .eq('is_active', true);

  const byScheme = {};
  (allSchemes || []).forEach(s => {
    byScheme[s.id] = {
      id: s.id,
      name: s.name,
      category: s.category,
      benefit_amount: s.benefit_amount || 0,
      max_seats: s.max_seats || 1000,
      enrolled_count: s.enrolled_count || 0,
      total_matched: 0,
      total_applied: 0,
      total_completed: 0,
      scores: [],
    };
  });

  // Paginate through user_scheme_matches — scoped to admin's jurisdiction
  const enrollments = await fetchAllPages((from, to) => {
    let q = supabase
      .from('user_scheme_matches')
      .select('scheme_id, status, score, users:user_id!inner(id, district, state)')
      .range(from, to);
    if (role === 'district') q = q.eq('users.district', district);
    else if (role === 'state') q = q.eq('users.state', state);
    return q;
  });

  enrollments.forEach(e => {
    const sid = e.scheme_id;
    if (!byScheme[sid]) return;
    const m = byScheme[sid];
    m.total_matched++;
    if (['applied', 'active', 'completed'].includes(e.status)) m.total_applied++;
    if (e.status === 'completed') m.total_completed++;
    if (e.score) m.scores.push(e.score);
  });

  // Paginate through benefit_transactions — scoped to admin's jurisdiction
  const txs = await fetchAllPages((from, to) => {
    let q = supabase
      .from('benefit_transactions')
      .select('scheme_id, amount, users:user_id!inner(district, state)')
      .range(from, to);
    if (role === 'district') q = q.eq('users.district', district);
    else if (role === 'state') q = q.eq('users.state', state);
    return q;
  });

  const txByScheme = {};
  txs.forEach(tx => {
    txByScheme[tx.scheme_id] = (txByScheme[tx.scheme_id] || 0) + Number(tx.amount || 0);
  });

  return Object.values(byScheme).map(m => {
    const avg = m.scores.length > 0 ? Math.round(m.scores.reduce((a, b) => a + b, 0) / m.scores.length) : 0;
    return { ...m, avg_score: avg, total_disbursed: txByScheme[m.id] || 0, scores: undefined };
  }).sort((a, b) => b.total_matched - a.total_matched);
};

/**
 * getBoothAnalytics — Per-booth stats for admin dashboard
 * Shows: registrations, active schemes, complaints, satisfaction %
 */
export const getBoothAnalytics = async (district, state, role) => {
  let userQuery = supabase.from('users').select('id, ward, village');
  if (role === 'district') userQuery = userQuery.eq('district', district);
  else if (role === 'state') userQuery = userQuery.eq('state', state);

  const { data: users } = await userQuery;
  if (!users?.length) return [];

  const userIds = users.map(u => u.id);
  const boothMap = {};
  users.forEach(u => {
    const key = u.ward || u.village || 'Unknown';
    if (!boothMap[key]) boothMap[key] = { booth: key, userIds: [], citizens: 0 };
    boothMap[key].userIds.push(u.id);
    boothMap[key].citizens++;
  });

  // Get complaints per booth
  const { data: complaints } = await supabase
    .from('complaints')
    .select('user_id, status')
    .in('user_id', userIds);

  // Get scheme enrollments per booth
  const { data: enrollments } = await supabase
    .from('user_scheme_matches')
    .select('user_id, status')
    .in('user_id', userIds);

  // Get disbursements per booth
  const { data: disbursements } = await supabase
    .from('user_milestone_progress')
    .select('user_id, status, scheme_milestones(amount)')
    .in('user_id', userIds)
    .eq('status', 'completed');

  // Aggregate per booth
  return Object.values(boothMap).map(b => {
    const bIds = new Set(b.userIds);
    const bComplaints = (complaints || []).filter(c => bIds.has(c.user_id));
    const bEnrollments = (enrollments || []).filter(e => bIds.has(e.user_id));
    const bDisbursed = (disbursements || []).filter(d => bIds.has(d.user_id));
    const resolvedComplaints = bComplaints.filter(c => c.status === 'resolved').length;
    const totalDisburse = bDisbursed.reduce((sum, d) => sum + (d.scheme_milestones?.amount || 0), 0);

    return {
      booth: b.booth,
      citizens: b.citizens,
      registrations: b.citizens,
      total_complaints: bComplaints.length,
      resolved_complaints: resolvedComplaints,
      active_schemes: bEnrollments.filter(e => ['applied', 'active'].includes(e.status)).length,
      completed_schemes: bEnrollments.filter(e => e.status === 'completed').length,
      total_disbursed: totalDisburse,
      satisfaction_pct: bComplaints.length > 0
        ? Math.round((resolvedComplaints / bComplaints.length) * 100)
        : 100,  // no complaints = happy
      complaint_rate_pct: b.citizens > 0
        ? Math.round((bComplaints.length / b.citizens) * 100)
        : 0,
    };
  }).sort((a, b) => b.citizens - a.citizens);
};