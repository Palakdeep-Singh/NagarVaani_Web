#!/usr/bin/env node
/**
 * Run this ONCE to generate your encryption keys.
 * Add the output to your server/.env file.
 *
 * Usage: node generate_keys.js
 */
import crypto from 'crypto';

const encKey = crypto.randomBytes(32).toString('hex');
const hmacKey = crypto.randomBytes(32).toString('hex');

console.log('\n# Add these to your server/.env file:\n');
console.log(`FIELD_ENCRYPTION_KEY=${encKey}`);
console.log(`FIELD_HMAC_KEY=${hmacKey}`);
console.log('\n⚠️  IMPORTANT:');
console.log('  - Back these up securely. Losing them = losing all encrypted data.');
console.log('  - Never commit them to git.');
console.log('  - These keys must stay the same forever for existing data to decrypt.\n');