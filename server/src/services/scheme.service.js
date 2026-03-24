/**
 * scheme.service.js — Fixed: apply-with-documents, payment disbursement, booth scoping
 */
import { supabase } from '../config/supabase.js';
import { decryptUserFields } from '../utils/crypto.js';
import { matchAllSchemes } from './scheme.matcher.js';

const getUser = async (userId) => {
  const { data, error } = await supabase.from('users').select('*').eq('id', userId).single();
  if (error) throw new Error('User not found: ' + error.message);
  return decryptUserFields(data);
};

const getSchemes = async () => {
  const { data, error } = await supabase.from('schemes').select('*')
    .eq('is_active', true).order('match_score_base', { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
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

export const getMatchedSchemes = async (userId) => {
  const [user, schemes, appMap] = await Promise.all([
    getUser(userId), getSchemes(), getAppMap(userId)
  ]);
  const results = matchAllSchemes(user, schemes, false);
  return mergeResults(results, appMap, false);
};

export const getAllSchemesWithScores = async (userId) => {
  const [user, schemes, appMap] = await Promise.all([
    getUser(userId), getSchemes(), getAppMap(userId)
  ]);
  const results = matchAllSchemes(user, schemes, true);
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
    const { data: seeded } = await supabase.from('scheme_milestones').insert(defaultMs).select();
    milestones = seeded || [];
  }

  if (milestones?.length) {
    // Create progress records for each milestone
    const progressRows = milestones.map((m, idx) => ({
      user_id: userId,
      scheme_id: schemeId,
      milestone_id: m.id,
      status: idx === 0 ? 'pending' : 'locked',   // first milestone = upload docs, rest locked
      document_ids: idx === 0 ? document_ids : [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    await supabase.from('user_milestone_progress')
      .upsert(progressRows, { onConflict: 'user_id,milestone_id' });
  }

  // Link uploaded documents to this scheme's application
  if (document_ids.length > 0) {
    // Determine target admin level for document routing
    const adminLevel = scheme.level?.toLowerCase() === 'state' ? 'state' :
      scheme.level?.toLowerCase() === 'central' ? 'central' : 'district';

    await supabase.from('documents')
      .update({
        scheme_id: schemeId,
        doc_scope: adminLevel,          // routes to correct admin level
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

export const getSchemeStats = async (district, state, role) => {
  let query = supabase
    .from('user_scheme_matches')
    .select('scheme_id, status, score, users!inner(state, district), schemes(name, category, benefit_amount)');

  if (role === 'district') query = query.eq('users.district', district);
  else if (role === 'state') query = query.eq('users.state', state);

  const { data: enrollments } = await query;

  const byScheme = {};
  (enrollments || []).forEach(e => {
    const s = e.schemes;
    if (!s) return;
    const sid = e.scheme_id;
    if (!byScheme[sid]) {
      byScheme[sid] = {
        id: sid,
        name: s.name,
        category: s.category,
        benefit_amount: s.benefit_amount || 0,
        total_matched: 0,
        total_applied: 0,
        total_completed: 0,
        scores: [],
      };
    }
    const m = byScheme[sid];
    m.total_matched++;
    if (['applied', 'active', 'completed'].includes(e.status)) m.total_applied++;
    if (e.status === 'completed') m.total_completed++;
    if (e.score) m.scores.push(e.score);
  });

  return Object.values(byScheme).map(m => {
    const avg = m.scores.length > 0 ? Math.round(m.scores.reduce((a, b) => a + b, 0) / m.scores.length) : 0;
    return { ...m, avg_score: avg, scores: undefined };
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