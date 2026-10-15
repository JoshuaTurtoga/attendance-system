import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Retrieve environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-supabase-project.supabase.co' &&
  !supabaseUrl.includes('your-supabase-project')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const SUPABASE_CONFIG_HELP = {
  url: supabaseUrl || 'Not configured',
  isConfigured: isSupabaseConfigured,
  setupInstructions: `
To connect your live Supabase cloud backend:
1. Create a project at https://supabase.com
2. Copy your Project URL & Anon Key from Settings > API
3. Create a '.env.local' file in the root with:
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
4. Run the SQL schema from 'src/supabase/schema.sql' in the Supabase SQL Editor.
`
};
