import { supabase } from '../config/supabase.js';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/jwt.js';
import { encryptUserFields, decryptUserFields, blindIndex } from '../utils/crypto.js';

// ─── Send OTP ─────────────────────────────────────────────────────────────────

export const sendOTPService = async (phone) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  const { error } = await supabase
    .from('otp_sessions')
    .upsert(
      { mobile: phone, otp_code: otp, verified: false, expires_at: expiresAt },
      { onConflict: 'mobile' }
    );

  if (error) throw new Error('Failed to store OTP: ' + error.message);
  return otp;
};

// ─── Verify OTP ───────────────────────────────────────────────────────────────

export const verifyOTPService = async (phone, otp) => {
  const { data, error } = await supabase
    .from('otp_sessions')
    .select('*')
    .eq('mobile', phone)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error('No OTP found. Please request a new one.');
  if (data.verified) throw new Error('OTP already used. Please request a new one.');
  if (new Date(data.expires_at) < new Date()) throw new Error('OTP expired. Please request a new one.');
  if (data.otp_code !== otp) throw new Error('Invalid OTP');

  // Invalidate immediately — one-time use
  await supabase
    .from('otp_sessions')
    .update({ verified: true })
    .eq('mobile', phone);

  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('phone', phone)
    .maybeSingle();

  if (!user) return { user: null, token: null, phoneVerified: true };

  const token = generateToken({ userId: user.id, role: 'citizen' });
  // Decrypt sensitive fields before sending to client
  return { user: decryptUserFields(user), token };
};

// ─── Register User ────────────────────────────────────────────────────────────

export const registerUserService = async (phone, data) => {
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('phone', phone)
    .maybeSingle();

  if (existing) throw new Error('User already exists');

  // Encrypt all sensitive fields before storing
  const safeData = encryptUserFields({
    full_name: data.full_name,
    gender: data.gender,
    date_of_birth: data.date_of_birth,
    state: data.state,
    district: data.district,
    ward: data.ward,
    village: data.village,
    pincode: data.pincode,
    category: data.category,
    occupation: data.occupation,
    annual_income: data.annual_income,
    land_acres: data.land_acres,
    aadhaar_number: data.aadhaar_number,
    voter_id: data.voter_id,
  });

  const { data: user, error } = await supabase
    .from('users')
    .insert({ phone, ...safeData, profile_complete: true })
    .select()
    .single();

  if (error) throw new Error(error.message);

  const token = generateToken({ userId: user.id, role: 'citizen' });
  // Decrypt before returning to client
  return { user: decryptUserFields(user), token };
};

// ─── Admin Login ──────────────────────────────────────────────────────────────

export const adminLoginService = async (email, password) => {
  const { data: admin } = await supabase
    .from('admins')
    .select('*')
    .eq('email', email)
    .single();

  if (!admin) throw new Error('Admin not found');

  const isMatch = await bcrypt.compare(password, admin.password_hash);
  if (!isMatch) throw new Error('Invalid credentials');

  const token = generateToken({ adminId: admin.id, role: admin.role });
  return { admin, token };
};