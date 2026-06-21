import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// src/config/ is 2 levels inside server/ — so ../../ reaches server/.env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    `\n❌ Supabase env vars missing!\n` +
    `  SUPABASE_URL      → ${supabaseUrl ?? 'MISSING'}\n` +
    `  SUPABASE_SERVICE_KEY → ${supabaseKey ? supabaseKey.slice(0, 20) + '...' : 'MISSING'}\n`
  );
}

const decoded = JSON.parse(Buffer.from(supabaseKey.split('.')[1], 'base64').toString());
console.log(`✅ Supabase initialized with role: ${decoded.role}`);

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});