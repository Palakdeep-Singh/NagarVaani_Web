/**
 * seed_central_admin.js
 * Place: server/ (same folder as server.js)
 *
 * Run ONCE to create your first Central Admin account.
 * After this, all other admins are created through the dashboard.
 *
 * Usage:
 *   node seed_central_admin.js
 *
 * Prerequisites:
 *   - server/.env must have SUPABASE_URL and SUPABASE_SERVICE_KEY
 *   - admins table must already exist (run admins_table.sql first)
 */

import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';
import readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';

// ── Supabase client ──────────────────────────────────────────────────────────
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// ── Interactive prompts ──────────────────────────────────────────────────────
const rl = readline.createInterface({ input, output });

const ask = async (question, fallback = '') => {
  const answer = (await rl.question(question)).trim();
  return answer || fallback;
};

// ── Main ─────────────────────────────────────────────────────────────────────
console.log('\n╔════════════════════════════════════════════════════════╗');
console.log('║   NagarikConnect — Central Admin Bootstrap Setup       ║');
console.log('╚════════════════════════════════════════════════════════╝\n');

// Check if central admin already exists
const { data: existing } = await supabase
  .from('admins')
  .select('id, email, name')
  .eq('role', 'central')
  .limit(5);

if (existing?.length > 0) {
  console.log('⚠️  Central admin(s) already exist:\n');
  existing.forEach(a => console.log(`   • ${a.name} — ${a.email}`));
  console.log('\n   Use the Admin Dashboard to create more admins.');
  console.log('   Run with --force to add another central admin anyway.\n');
  if (!process.argv.includes('--force')) {
    rl.close();
    process.exit(0);
  }
}

console.log('Enter details for the Central Admin account:\n');

const name = await ask('Full Name         : ');
const email = await ask('Official Email    : ');
const designation = await ask('Designation       : ', 'Secretary, Ministry of Rural Development');
const phone = await ask('Phone (optional)  : ', '');
const useDefault = await ask('Use default password "Central@India25"? (Y/n): ', 'y');

let plainPassword;
if (useDefault.toLowerCase() === 'y' || useDefault === '') {
  plainPassword = 'Central@India25';
} else {
  plainPassword = await ask('Custom Password   : ');
  if (!plainPassword || plainPassword.length < 8) {
    console.error('\n❌ Password must be at least 8 characters.\n');
    rl.close();
    process.exit(1);
  }
}

rl.close();

if (!name || !email) {
  console.error('\n❌ Name and email are required.\n');
  process.exit(1);
}

if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error('\n❌ Invalid email format.\n');
  process.exit(1);
}

// Hash password
console.log('\n⏳ Hashing password...');
const password_hash = await bcrypt.hash(plainPassword, 12);

// Insert into DB
console.log('⏳ Inserting into Supabase...\n');
const { data, error } = await supabase
  .from('admins')
  .insert({
    email: email.toLowerCase().trim(),
    password_hash,
    name: name.trim(),
    designation: designation.trim(),
    phone: phone || null,
    role: 'central',
    state: null,
    district: null,
    is_active: true,
  })
  .select('id, email, name, role, designation')
  .single();

if (error) {
  if (error.message.includes('unique') || error.message.includes('duplicate')) {
    console.error(`❌ An admin with email "${email}" already exists.\n`);
  } else {
    console.error('❌ Database error:', error.message, '\n');
  }
  process.exit(1);
}

// Success output — formatted like an official credential slip
console.log('╔════════════════════════════════════════════════════════╗');
console.log('║   ✅ Central Admin Account Created Successfully!        ║');
console.log('╠════════════════════════════════════════════════════════╣');
console.log(`║   Name        : ${data.name.padEnd(40)}║`);
console.log(`║   Email       : ${data.email.padEnd(40)}║`);
console.log(`║   Password    : ${plainPassword.padEnd(40)}║`);
console.log(`║   Role        : ${data.role.padEnd(40)}║`);
console.log(`║   Designation : ${(data.designation || '—').padEnd(40)}║`);
console.log('╠════════════════════════════════════════════════════════╣');
console.log('║   ⚠  IMPORTANT:                                         ║');
console.log('║   • Note this password — it will not be shown again.   ║');
console.log('║   • Login at: /admin                                   ║');
console.log('║   • Use the Admin Dashboard to create State/District   ║');
console.log('║     admins. Only then share their credentials.         ║');
console.log('╚════════════════════════════════════════════════════════╝\n');