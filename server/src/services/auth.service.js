/**
 * auth.service.js — Updated to save all registration fields
 * Place: server/src/services/auth.service.js
 */
import { supabase } from '../config/supabase.js';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/jwt.js';
import { encryptUserFields, decryptUserFields } from '../utils/crypto.js';

// ── Send OTP ──────────────────────────────────────────────────────────────────
export const sendOTPService = async (phone) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  const { error } = await supabase.from('otp_sessions').upsert(
    { mobile: phone, otp_code: otp, verified: false, expires_at: expiresAt },
    { onConflict: 'mobile' }
  );
  if (error) throw new Error('Failed to store OTP: ' + error.message);
  return otp;
};

// ── Verify OTP ────────────────────────────────────────────────────────────────
export const verifyOTPService = async (phone, otp) => {
  const { data, error } = await supabase
    .from('otp_sessions').select('*').eq('mobile', phone).maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error('No OTP found. Please request a new one.');
  if (data.verified) throw new Error('OTP already used. Please request a new one.');
  if (new Date(data.expires_at) < new Date()) throw new Error('OTP expired. Please request a new one.');
  if (data.otp_code !== otp) throw new Error('Invalid OTP');

  await supabase.from('otp_sessions').update({ verified: true }).eq('mobile', phone);

  const { data: user } = await supabase
    .from('users').select('*').eq('phone', phone).maybeSingle();

  if (!user) return { user: null, token: null, phoneVerified: true };

  const token = generateToken({ userId: user.id, role: 'citizen' });
  return { user: decryptUserFields(user), token };
};

// ── Register User — saves ALL profile fields ──────────────────────────────────
export const registerUserService = async (phone, data) => {
  const { data: existing } = await supabase
    .from('users').select('id').eq('phone', phone).maybeSingle();
  if (existing) throw new Error('User already exists with this number');

  // Fields that need AES-256-GCM encryption
  const toEncrypt = {
    full_name: data.full_name,
    date_of_birth: data.date_of_birth,
    annual_income: data.annual_income,
    land_acres: data.land_acres,
    aadhaar_number: data.aadhaar_number,
    voter_id: data.voter_id,
  };
  const encrypted = encryptUserFields(toEncrypt);

  // Build full insert row — all fields from registration form
  const row = {
    phone,
    // encrypted fields
    ...encrypted,
    // plain fields (not sensitive)
    gender: data.gender || null,
    state: data.state || null,
    district: data.district || null,
    ward: data.ward || null,
    village: data.village || null,
    pincode: data.pincode || null,
    category: data.category || null,
    occupation: data.occupation || null,
    religion: data.religion || null,
    marital_status: data.marital_status || null,
    disability: data.disability || 'no',
    area_type: data.area_type || 'rural',
    bpl_card: data.bpl_card || 'no',
    profile_complete: true,
  };

  const { data: user, error } = await supabase
    .from('users').insert(row).select().single();
  if (error) throw new Error(error.message);

  // Auto-run scheme matching after registration
  try {
    const { runMatchingForUser } = await import('./scheme.service.js');
    await runMatchingForUser(user.id);
  } catch { /* non-fatal — matcher runs lazily */ }

  const token = generateToken({ userId: user.id, role: 'citizen' });
  return { user: decryptUserFields(user), token };
};

// ── Admin Login ───────────────────────────────────────────────────────────────
export const adminLoginService = async (email, password) => {
  const { data: admin } = await supabase
    .from('admins').select('*').eq('email', email).single();
  if (!admin) throw new Error('Admin not found');

  const isMatch = await bcrypt.compare(password, admin.password_hash);
  if (!isMatch) throw new Error('Invalid credentials');

  const token = generateToken({ adminId: admin.id, role: admin.role });
  return { admin, token };
};