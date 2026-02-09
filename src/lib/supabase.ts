import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
}

if (supabaseAnonKey.includes('\n') || supabaseAnonKey.includes(' ')) {
  console.error('Supabase anon key contains whitespace. Check .env.local formatting.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database Types
export interface ClientProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  state: string;
  country: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface ArtistProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  state: string;
  country: string;
  experience: string;
  specialties: string[];
  custom_specialty?: string;
  languages: string;
  phone?: string;
  bio: string;
  created_at: string;
  updated_at: string;
}
