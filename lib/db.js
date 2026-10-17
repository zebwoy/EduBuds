import { createClient } from '@supabase/supabase-js';
import { neon } from '@neondatabase/serverless';

/**
 * EduBuds Database Adapter
 * Seamlessly supports Supabase or Neon PostgreSQL based on available environment variables.
 */

// Supabase client instance (lazy-loaded)
let supabaseClient = null;
export function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  if (!supabaseClient) {
    supabaseClient = createClient(url, key);
  }
  return supabaseClient;
}

// Neon SQL client instance (lazy-loaded)
let neonSql = null;
export function getNeon() {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!connectionString) return null;
  if (!neonSql) {
    neonSql = neon(connectionString);
  }
  return neonSql;
}

/**
 * Insert a newsletter subscriber into the database.
 * Supports Supabase, Neon PostgreSQL, or graceful development mode.
 */
export async function insertSubscriber(email, source = 'website') {
  const normalizedEmail = email.trim().toLowerCase();

  // 1. Try Supabase
  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .upsert({ email: normalizedEmail, source }, { onConflict: 'email' })
      .select();

    if (error) {
      console.error('Supabase error inserting subscriber:', error);
      throw new Error(error.message);
    }
    return { provider: 'supabase', data };
  }

  // 2. Try Neon PostgreSQL
  const sql = getNeon();
  if (sql) {
    const result = await sql`
      INSERT INTO newsletter_subscribers (email, source)
      VALUES (${normalizedEmail}, ${source})
      ON CONFLICT (email) DO NOTHING
      RETURNING *;
    `;
    return { provider: 'neon', data: result };
  }

  // 3. Fallback for staging/preview before env variables are linked
  console.warn(
    '[EduBuds DB Warning]: No SUPABASE_URL or DATABASE_URL found. Running in mock/preview mode. Add environment variables to Vercel.'
  );
  return { provider: 'mock', message: 'Simulated success (no database configured yet)' };
}
