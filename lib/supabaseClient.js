import { createClient } from "@supabase/supabase-js";

// Hardcoded fallbacks (will be overridden by env vars if available)
const FALLBACK_URL = 'https://dfurfmrwpyotjfrryatn.supabase.co';
const FALLBACK_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmdXJmbXJ3cHlvdGpmcnJ5YXRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NjE1NjUsImV4cCI6MjA3MzEzNzU2NX0.CWqPfeTmrXLNM_S6lWxbTqnMzJTdZFeIZMco7JCubT0';

// Get environment variables with fallbacks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_KEY;

// Log status (only errors)
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.warn('⚠️ Using fallback Supabase URL');
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn('⚠️ Using fallback Supabase key');
}

// Frontend (browser)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server (build/runtime). Fallback to public creds if service creds missing
export const supabaseServer = () => {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_KEY;

  return createClient(url, key);
};

