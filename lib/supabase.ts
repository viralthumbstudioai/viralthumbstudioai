
import { createClient } from '@supabase/supabase-js';

// Using placeholders to prevent the 'supabaseUrl is required' error during initialization
// if environment variables are not yet set in the deployment environment.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
