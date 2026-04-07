import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Supabase接続情報が未設定の場合のフラグ
export const isDemoMode = !supabaseUrl || !supabaseAnonKey ||
  supabaseUrl === 'https://your-project.supabase.co';

// ダミークライアント（環境変数未設定時用）
const dummyClient = {
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    signInWithPassword: async () => ({ data: { session: null }, error: { message: 'デモモードです。Supabase接続情報を設定してください。' } }),
    signOut: async () => ({ error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
  },
  from: () => ({
    select: () => ({ eq: () => ({ eq: () => ({ order: () => ({ data: null, error: null }) }) }), order: () => ({ data: null, error: null }), data: null, error: null }),
    insert: () => ({ select: () => ({ single: () => ({ data: null, error: null }) }) }),
    update: () => ({ eq: () => ({ select: () => ({ single: () => ({ data: null, error: null }) }) }) }),
    delete: () => ({ eq: () => ({ data: null, error: null }) }),
    upsert: () => ({ data: null, error: null }),
  }),
};

export const supabase = isDemoMode
  ? dummyClient
  : createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
