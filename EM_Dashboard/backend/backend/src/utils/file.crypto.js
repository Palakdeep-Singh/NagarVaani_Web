/**
 * file.crypto.js — AES-256-GCM file encryption/decryption
 * Place: server/src/utils/file.crypto.js
 *
 * Uses the same FIELD_ENCRYPTION_KEY from .env — no new key needed.
 * Encrypted files stored as: [12-byte IV][16-byte authTag][ciphertext]
 */
import crypto from 'crypto';

const getKey = () => {
  const hex = process.env.FIELD_ENCRYPTION_KEY;
  if (!hex || hex.length !== 64) throw new Error('FIELD_ENCRYPTION_KEY missing or invalid in .env');
  return Buffer.from(hex, 'hex');
};

/**
 * encryptBuffer — encrypts a file buffer
 * Returns a single Buffer: [iv(12)][authTag(16)][ciphertext]
 */
export const encryptBuffer = (plainBuffer) => {
  const key = getKey();
  const iv = crypto.randomBytes(12);         // 96-bit IV for GCM
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plainBuffer),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();           // 16-byte authentication tag

  // Pack everything into one buffer: IV + authTag + ciphertext
  return Buffer.concat([iv, authTag, encrypted]);
};

/**
 * decryptBuffer — decrypts a buffer produced by encryptBuffer
 * Throws if the file was tampered with (authTag mismatch)
 */
export const decryptBuffer = (encryptedBuffer) => {
  const key = getKey();
  const iv = encryptedBuffer.subarray(0, 12);
  const authTag = encryptedBuffer.subarray(12, 28);
  const data = encryptedBuffer.subarray(28);

  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);

  return Buffer.concat([
    decipher.update(data),
    decipher.final(),   // throws ERR_CRYPTO_GCM_AUTH_TAG_MISMATCH if tampered
  ]);
};