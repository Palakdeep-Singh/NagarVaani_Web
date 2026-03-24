/**
 * auth.service.js — Fixed
 *
 * FIX: verifyOTPService now checks if the phone belongs to an admin account.
 *      If yes → throws error with clear message instead of creating a citizen session.
 *      Admins must use email+password login, not OTP.
 *
 * Place: server/src/services/auth.service.js
 */
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';
import { encryptUserFields, decryptUserFields } from '../utils/crypto.js';

const JWT_SECRET = process.env.JWT_SECRET || 'nagarikconnect_dev_secret';
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || '7d';

const signJWT = (payload) => jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });

// ── OTP Send ──────────────────────────────────────────────────────────────────
export const sendOTPService = async (phone) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  const { error } = await supabase.from('otp_sessions').upsert(
    { mobile: phone, otp_code: otp, verified: false, expires_at: expires },
    { onConflict: 'mobile' }
  );

  if (error) {
    console.error('[OTP Send]', error.message);
    throw new Error('Failed to store OTP: ' + error.message);
  }

  console.log(`[OTP] ${phone} → ${otp}`);

  // Return OTP in dev mode only — REMOVE IN PRODUCTION
  return process.env.NODE_ENV !== 'production' ? otp : null;
};

// ── OTP Verify ────────────────────────────────────────────────────────────────
export const verifyOTPService = async (phone, otp) => {
  // 1. Validate OTP
  const { data: session, error } = await supabase
    .from('otp_sessions').select('*').eq('mobile', phone).single();

  if (error || !session) throw new Error('OTP not found. Please request again.');
  if (session.verified) throw new Error('OTP already used. Request a new one.');
  if (new Date(session.expires_at) < new Date()) throw new Error('OTP expired. Request a new one.');
  if (session.otp_code !== otp.toString().trim()) throw new Error('Invalid OTP.');

  // 2. Mark OTP as used immediately (one-time-use)
  await supabase.from('otp_sessions').update({ verified: true }).eq('mobile', phone);

  // 3. FIX: Check if this phone belongs to an admin account
  //    Admins must use email+password login — not OTP
  const { data: admin } = await supabase
    .from('admins')
    .select('id, role, name, is_active')
    .eq('phone', phone)
    .single();

  if (admin) {
    if (!admin.is_active) {
      throw new Error('This account has been deactivated. Contact Central Admin.');
    }
    throw new Error(
      'This phone number is registered as a Government Official account. ' +
      'Please use Admin Login with your official email and password.'
    );
  }

  // 4. Check if citizen exists
  const { data: user } = await supabase
    .from('users').select('*').eq('phone', phone).single();

  if (!user) {
    // Phone verified but no citizen account → send to registration
    return { success: true, phoneVerified: true, phone, needsRegister: true };
  }

  // 5. Return citizen session
  const decUser = decryptUserFields(user);
  const token = signJWT({ userId: user.id, role: 'citizen' });
  return { success: true, token, user: decUser, role: 'citizen' };
};

// ── Admin Login ───────────────────────────────────────────────────────────────
export const adminLoginService = async (email, password) => {
  const { data: admin, error } = await supabase
    .from('admins')
    .select('id, email, name, password_hash, role, state, district, designation, phone, is_active')
    .eq('email', email.toLowerCase().trim())
    .single();

  if (error || !admin) throw new Error('Invalid admin credentials');
  if (!admin.is_active) throw new Error('This admin account has been deactivated. Contact Central Admin.');

  const ok = await bcrypt.compare(password, admin.password_hash);
  if (!ok) throw new Error('Invalid admin credentials');

  // Update last_login (fire and forget)
  supabase.from('admins')
    .update({ last_login: new Date().toISOString() })
    .eq('id', admin.id)
    .then(() => { }).catch(() => { });

  const token = signJWT({
    adminId: admin.id,
    role: admin.role,
    state: admin.state || null,
    district: admin.district || null,
  });

  const { password_hash, ...safeAdmin } = admin;

  return {
    success: true,
    token,
    admin: safeAdmin,
    role: admin.role,
  };
};

// ── User Registration ─────────────────────────────────────────────────────────
export const registerUserService = async (phone, data) => {
  const {
    full_name, gender, date_of_birth, state, district, ward, village, pincode, booth,
    category, occupation, annual_income, land_acres, voter_id,
    religion, marital_status, disability, area_type, bpl_card,
  } = data;

  if (!full_name?.trim()) throw new Error('Full name is required');

  // Check phone not already registered as citizen
  const { data: existing } = await supabase
    .from('users').select('id').eq('phone', phone).single();
  if (existing) throw new Error('Phone number already registered. Please login with OTP.');

  // Double-check: also block if phone is an admin account
  const { data: adminCheck } = await supabase
    .from('admins').select('id').eq('phone', phone).single();
  if (adminCheck) throw new Error('This phone is registered as a Government Official account.');

  // Voter ID cross-check against electoral dataset (if provided)
  if (voter_id?.trim()) {
    const { data: voter } = await supabase
      .from('synthetic_electoral_dataset')
      .select('*')
      .eq('voter_id', voter_id.trim().toUpperCase())
      .single();

    if (!voter) throw new Error(`Voter ID ${voter_id.toUpperCase()} not found in Electoral Roll.`);

    const submittedFirst = full_name.trim().toLowerCase().split(' ')[0];
    const electoralName = (voter.name || '').toLowerCase();
    if (!electoralName.includes(submittedFirst) && !submittedFirst.includes(electoralName.split(' ')[0])) {
      throw new Error(`Name "${full_name}" does not match the electoral record for Voter ID ${voter_id}.`);
    }
  }

  // Encrypt sensitive fields
  const raw = {
    full_name: full_name.trim(),
    gender, date_of_birth, state, district, ward, village, pincode, booth,
    category, occupation,
    annual_income: annual_income ? Number(annual_income) : null,
    land_acres: land_acres ? Number(land_acres) : null,
    voter_id: voter_id ? voter_id.trim().toUpperCase() : null,
    religion, marital_status, disability, area_type, bpl_card,
  };
  const encrypted = encryptUserFields(raw);

  const { data: newUser, error } = await supabase
    .from('users')
    .insert({
      phone,
      ...encrypted,
      profile_complete: true,
      active_schemes: 0,
      total_benefits: 0,
      civic_score: 60,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') throw new Error('Phone already registered.');
    throw new Error(error.message);
  }

  const token = signJWT({ userId: newUser.id, role: 'citizen' });
  return { success: true, token, user: decryptUserFields(newUser), role: 'citizen' };
};