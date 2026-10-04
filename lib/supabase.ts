import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  (supabaseAnonKey || supabaseServiceRoleKey) &&
  !supabaseUrl.includes("your-project.supabase.co")
);

// Standard client for public/anon access
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey || supabaseServiceRoleKey, {
      auth: { persistSession: false },
    })
  : null;

// Admin/Server client using service role key (bypasses RLS)
export const supabaseAdmin = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseServiceRoleKey || supabaseAnonKey, {
      auth: { persistSession: false },
    })
  : null;

/**
 * Returns the best available Supabase client for server-side queries.
 */
export function getDbClient(): SupabaseClient | null {
  return supabaseAdmin || supabase;
}
