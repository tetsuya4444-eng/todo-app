import { signal, effect } from '@preact/signals';
import { supabase, isDemoMode } from '../lib/supabase';

// 認証状態のシグナル
export const user = signal(null);
export const session = signal(null);
export const authLoading = signal(true);
export const authError = signal(null);

// デモモード用のダミーユーザー
const demoUser = {
  id: 'demo-user-id',
  email: 'demo@example.com',
};

// 初期化（セッション復元 + リスナー登録）
export async function initAuth() {
  if (isDemoMode) {
    // デモモードではログイン画面を表示するため、ユーザーはnullのまま
    authLoading.value = false;
    return;
  }

  try {
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    if (currentSession) {
      session.value = currentSession;
      user.value = currentSession.user;
    }
  } catch (e) {
    console.error('Session restore error:', e);
  } finally {
    authLoading.value = false;
  }

  // リアルタイム認証状態監視
  supabase.auth.onAuthStateChange((event, newSession) => {
    session.value = newSession;
    user.value = newSession?.user ?? null;
  });
}

// ログイン
export async function signIn(email, password) {
  authError.value = null;

  if (isDemoMode) {
    // デモモード: メール・パスワードに関わらずダミーユーザーでログイン
    user.value = demoUser;
    session.value = { user: demoUser, access_token: 'demo-token' };
    return { error: null };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    authError.value = 'メールアドレスまたはパスワードが正しくありません。';
    return { error };
  }

  session.value = data.session;
  user.value = data.session?.user ?? null;
  return { error: null };
}

// ログアウト
export async function signOut() {
  if (isDemoMode) {
    user.value = null;
    session.value = null;
    return;
  }

  await supabase.auth.signOut();
  user.value = null;
  session.value = null;
}
