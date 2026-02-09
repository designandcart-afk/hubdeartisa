import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let supabaseClient: SupabaseClient | null = null;

function initSupabaseClient(): SupabaseClient {
  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
  const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables.');
  }

  if (!/^https?:\/\//i.test(supabaseUrl)) {
    throw new Error('Invalid supabaseUrl: Must be a valid HTTP or HTTPS URL.');
  }

  if (supabaseAnonKey.includes('\n') || supabaseAnonKey.includes(' ')) {
    throw new Error('Supabase anon key contains whitespace. Check .env.local formatting.');
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    if (!supabaseClient) {
      supabaseClient = initSupabaseClient();
    }

    const value = (supabaseClient as any)[prop];
    return typeof value === 'function' ? value.bind(supabaseClient) : value;
  },
});

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
