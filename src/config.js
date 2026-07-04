// Supabase connection settings.
//
// While these are empty, the app runs in DEMO MODE: everything is stored in
// this browser only, and loan numbers are NOT shared between computers.
//
// To go live for the office (see README.md, "Connect the database"):
//   1. Create a free project at https://supabase.com
//   2. Run supabase/schema.sql in the Supabase SQL Editor
//   3. Paste your Project URL and anon public key below
//
// The anon key is safe to put in the code — it is designed to be public.

export const SUPABASE_URL = 'https://ipwshbmxnwtaaarexsje.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_3kJ6eF2R99qrAIf1UqGV4w__EEE32ID';

// The shared office account the password screen signs into. This "email" is
// just an identifier - no real inbox needed. It must match the user created
// in Supabase: Authentication -> Users -> Add user (Auto Confirm checked).
export const OFFICE_EMAIL = 'office@jrm-vouchers.app';
