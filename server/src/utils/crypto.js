/**
 * crypto.js — Field-level encryption for sensitive PII
 *
 * Strategy:
 *  - AES-256-GCM  → encrypt sensitive values stored in DB
 *  - SHA-256 HMAC → blind index for searching (e.g. find by aadhaar)
 *
 * Each encrypted value is stored as a single string:
 *   "iv_hex:authTag_hex:ciphertext_hex"
 *
 * Required env vars:
 *   FIELD_ENCRYPTION_KEY  — 64 hex chars (32 bytes) — used for AES-256-GCM
 *   FIELD_HMAC_KEY        — 64 hex chars (32 bytes) — used for HMAC blind index
 *
 * Generate keys (run once, save to .env):
 *   node -e "const c=require('crypto'); console.log(c.randomBytes(32).toString('hex')); console.log(c.randomBytes(32).toString('hex'));"
 */

import crypto from 'crypto';

// ─── Key loading ─────────────────────────────────────────────────────────────

const getEncKey = () => {
  const hex = process.env.FIELD_ENCRYPTION_KEY;
  if (!hex || hex.length !== 64) {
    throw new Error(
      'FIELD_ENCRYPTION_KEY must be 64 hex characters (32 bytes).\n' +
      'Generate with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
    );
  }
  return Buffer.from(hex, 'hex');
};

const getHmacKey = () => {
  const hex = process.env.FIELD_HMAC_KEY;
  if (!hex || hex.length !== 64) {
    throw new Error(
      'FIELD_HMAC_KEY must be 64 hex characters (32 bytes).\n' +
      'Generate with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
    );
  }
  return Buffer.from(hex, 'hex');
};

// ─── AES-256-GCM Encrypt ─────────────────────────────────────────────────────

/**
 * Encrypts a plaintext string.
 * Returns "iv:authTag:ciphertext" (all hex).
 */
export const encrypt = (plaintext) => {
  if (plaintext === null || plaintext === undefined || plaintext === '') return null;

  const key = getEncKey();
  const iv = crypto.randomBytes(12); // 96-bit IV recommended for GCM

  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  const encrypted = Buffer.concat([
    cipher.update(String(plaintext), 'utf8'),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag(); // 16-byte GCM authentication tag

  return [
    iv.toString('hex'),
    authTag.toString('hex'),
    encrypted.toString('hex'),
  ].join(':');
};

// ─── AES-256-GCM Decrypt ─────────────────────────────────────────────────────

/**
 * Decrypts a value produced by encrypt().
 * Returns the original plaintext string.
 */
export const decrypt = (stored) => {
  if (!stored) return null;

  const parts = stored.split(':');
  if (parts.length !== 3) throw new Error('Invalid encrypted value format');

  const [ivHex, authTagHex, ciphertextHex] = parts;

  const key = getEncKey();
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const ciphertext = Buffer.from(ciphertextHex, 'hex');

  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(), // throws if auth tag doesn't match (tamper detection)
  ]);

  return decrypted.toString('utf8');
};

// ─── SHA-256 HMAC Blind Index ─────────────────────────────────────────────────

/**
 * Creates a deterministic HMAC-SHA256 blind index.
 * Use this to search for a user by aadhaar/voter_id without decrypting all rows.
 *
 * Store this alongside the encrypted value as a separate column: e.g. aadhaar_index
 * Then query: .eq('aadhaar_index', blindIndex(rawAadhaar))
 */
export const blindIndex = (plaintext) => {
  if (!plaintext) return null;
  const key = getHmacKey();
  return crypto
    .createHmac('sha256', key)
    .update(String(plaintext).trim())
    .digest('hex');
};

// ─── Helpers for field sets ───────────────────────────────────────────────────

/**
 * Fields that get AES-256-GCM encrypted before storage.
 * These are stored encrypted in the DB and decrypted on read.
 */
export const ENCRYPTED_FIELDS = [
  'aadhaar_number',
  'voter_id',
  'annual_income',
  'land_acres',
  'date_of_birth',
  'full_name',
  'booth',
];

/**
 * Fields that get a blind index for searchability.
 * Column name in DB: <field>_index
 */
export const INDEXED_FIELDS = [
  'aadhaar_number',
  'voter_id',
];

/**
 * Encrypt all sensitive fields in a user data object.
 * Returns new object safe to insert into DB.
 */
export const encryptUserFields = (data) => {
  const out = { ...data };

  for (const field of ENCRYPTED_FIELDS) {
    if (out[field] !== undefined && out[field] !== null && out[field] !== '') {
      out[field] = encrypt(out[field]);
    }
  }

  // Add blind indexes alongside encrypted values
  for (const field of INDEXED_FIELDS) {
    if (data[field]) {
      out[`${field}_index`] = blindIndex(data[field]);
    }
  }

  return out;
};

/**
 * Decrypt all sensitive fields in a user row from DB.
 * Returns new object safe to send to client.
 */
export const decryptUserFields = (row) => {
  if (!row) return null;
  const out = { ...row };

  for (const field of ENCRYPTED_FIELDS) {
    if (out[field]) {
      try {
        out[field] = decrypt(out[field]);
      } catch {
        // If decryption fails, field may be stored as plaintext (migration case)
        // Leave as-is rather than crashing
      }
    }
  }

  // Strip internal index columns — never send to client
  for (const field of INDEXED_FIELDS) {
    delete out[`${field}_index`];
  }

  return out;
};