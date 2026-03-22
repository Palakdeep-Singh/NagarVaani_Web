/**
 * scheme.service.js — Production Service (fixes ALL tab bug)
 * Place: server/src/services/scheme.service.js
 *
 * KEY FIX: getAllSchemesWithScores now runs matcher against real user profile
 * instead of returning raw DB rows without scores.
 */
import { supabase } from '../config/supabase.js';
import { decryptUserFields } from '../utils/crypto.js';
import { matchAllSchemes, matchSchemeToUser } from './scheme.matcher.js';

// ─── Internal helpers ─────────────────────────────────────────────────────
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

// ─── Merge match results with application status ──────────────────────────
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

// ─── PUBLIC FUNCTIONS ─────────────────────────────────────────────────────

/** "Matched for Me" tab — only schemes user qualifies for */
export const getMatchedSchemes = async (userId) => {
  const [user, schemes, appMap] = await Promise.all([
    getUser(userId), getSchemes(), getAppMap(userId)
  ]);
  const results = matchAllSchemes(user, schemes, false);
  return mergeResults(results, appMap, false);
};

/** "All Schemes" tab — EVERY scheme with real match score computed against user */
export const getAllSchemesWithScores = async (userId) => {
  const [user, schemes, appMap] = await Promise.all([
    getUser(userId), getSchemes(), getAppMap(userId)
  ]);
  // KEY FIX: includeAll=true so non-matched schemes also get scores + reasons
  const results = matchAllSchemes(user, schemes, true);
  return mergeResults(results, appMap, true);
};

/** Re-run matcher and persist results to DB */
export const runMatchingForUser = async (userId) => {
  const [user, schemes] = await Promise.all([getUser(userId), getSchemes()]);
  const matched = matchAllSchemes(user, schemes, false);

  if (matched.length > 0) {
    await supabase.from('user_scheme_matches').upsert(
      matched.map(m => ({
        user_id: userId,
        scheme_id: m.scheme.id,
        score: m.score,
        status: 'eligible',
        reasons: m.reasons,
      })),
      { onConflict: 'user_id,scheme_id' }
    );
  }

  return { matched: matched.length, top: matched.slice(0, 5).map(m => m.scheme.name) };
};

/** Apply to a scheme — validates eligibility first */
export const applyToScheme = async (userId, schemeId) => {
  const [user, schemes] = await Promise.all([getUser(userId), getSchemes()]);
  const scheme = schemes.find(s => s.id === schemeId);
  if (!scheme) throw new Error('Scheme not found');

  const result = matchSchemeToUser(user, scheme);
  if (!result.matched)
    throw new Error(result.hard_fail_reason || 'Not eligible for this scheme');

  const { error } = await supabase.from('user_scheme_matches').upsert({
    user_id: userId,
    scheme_id: schemeId,
    score: result.score,
    status: 'applied',
    reasons: result.reasons,
    applied_at: new Date().toISOString(),
  }, { onConflict: 'user_id,scheme_id' });
  if (error) throw new Error(error.message);

  // Create milestone progress entries
  const { data: milestones } = await supabase.from('scheme_milestones')
    .select('id').eq('scheme_id', schemeId).order('step_number');

  if (milestones?.length) {
    await supabase.from('user_milestone_progress').upsert(
      milestones.map((m, i) => ({
        user_id: userId, scheme_id: schemeId, milestone_id: m.id,
        status: i === 0 ? 'pending' : 'locked',
      })),
      { onConflict: 'user_id,scheme_id,milestone_id' }
    );
  }

  return { success: true, score: result.score };
};

/** Single scheme detail with milestones and user progress */
export const getSchemeDetail = async (userId, schemeId) => {
  const [user, schRes, msRes, progRes] = await Promise.all([
    getUser(userId),
    supabase.from('schemes').select('*').eq('id', schemeId).single(),
    supabase.from('scheme_milestones').select('*').eq('scheme_id', schemeId).order('step_number'),
    supabase.from('user_milestone_progress').select('*').eq('scheme_id', schemeId).eq('user_id', userId),
  ]);
  if (schRes.error) throw new Error(schRes.error.message);
  const match = matchSchemeToUser(user, schRes.data);
  return { ...schRes.data, ...match, milestones: msRes.data || [], progress: progRes.data || [] };
};

/** Admin scheme analytics */
export const getSchemeStats = async () => {
  const [{ data: schemes }, { data: matches }] = await Promise.all([
    supabase.from('schemes').select('*').eq('is_active', true),
    supabase.from('user_scheme_matches').select('scheme_id, status, score'),
  ]);
  return (schemes || []).map(s => {
    const sm = (matches || []).filter(m => m.scheme_id === s.id);
    return {
      ...s,
      total_matched: sm.length,
      total_applied: sm.filter(m => m.status === 'applied').length,
      total_active: sm.filter(m => m.status === 'active').length,
      total_completed: sm.filter(m => m.status === 'completed').length,
      avg_score: sm.length ? Math.round(sm.reduce((a, b) => a + b.score, 0) / sm.length) : 0,
    };
  });
};