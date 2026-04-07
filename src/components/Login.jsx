import { useState } from 'preact/hooks';
import { signIn, authError } from '../hooks/useAuth';
import { isDemoMode } from '../lib/supabase';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const error = authError.value;

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    await signIn(email, password);
    setLoading(false);
  }

  return (
    <div class="login-screen">
      <div class="login-card">
        <h1 class="login-title">Todo</h1>
        <p class="login-subtitle">
          {isDemoMode ? 'デモモード: 任意の値でログインできます' : 'ログインしてください'}
        </p>
        <form onSubmit={handleSubmit} class="login-form">
          <div class="login-field">
            <label for="email" class="login-label">メールアドレス</label>
            <input
              id="email"
              type="email"
              value={email}
              onInput={e => setEmail(e.target.value)}
              placeholder="email@example.com"
              required
              autocomplete="email"
              class="login-input"
            />
          </div>
          <div class="login-field">
            <label for="password" class="login-label">パスワード</label>
            <input
              id="password"
              type="password"
              value={password}
              onInput={e => setPassword(e.target.value)}
              placeholder="パスワード"
              required
              autocomplete="current-password"
              class="login-input"
            />
          </div>
          {error && (
            <div class="login-error">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
              {error}
            </div>
          )}
          <button type="submit" class="login-btn" disabled={loading}>
            {loading ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>
      </div>

      <style>{`
        .login-screen {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100dvh;
          padding: 16px;
          background: var(--color-bg);
        }

        .login-card {
          width: 100%;
          max-width: 360px;
          background: var(--color-bg-white);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-lg);
          padding: 32px 24px;
        }

        .login-title {
          font-size: var(--font-size-2xl);
          font-weight: 700;
          text-align: center;
          color: var(--color-primary);
          margin-bottom: 4px;
        }

        .login-subtitle {
          font-size: var(--font-size-sm);
          color: var(--color-text-secondary);
          text-align: center;
          margin-bottom: 24px;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .login-field {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .login-label {
          font-size: var(--font-size-sm);
          font-weight: 500;
          color: var(--color-text-secondary);
        }

        .login-input {
          padding: 10px 12px;
          font-family: var(--font-family-base);
          font-size: var(--font-size-base);
          color: var(--color-text);
          background: var(--color-bg-subtle);
          border: 1.5px solid transparent;
          border-radius: var(--radius-md);
          outline: none;
          transition: border-color var(--transition-fast), background-color var(--transition-fast);
        }

        .login-input:focus {
          background: var(--color-bg-white);
          border-color: var(--color-border-focus);
          box-shadow: 0 0 0 3px var(--color-primary-100);
        }

        .login-error {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          background: var(--color-error-bg);
          color: var(--color-error);
          font-size: var(--font-size-sm);
          border-radius: var(--radius-md);
        }

        .login-btn {
          padding: 12px 24px;
          font-family: var(--font-family-base);
          font-size: var(--font-size-base);
          font-weight: 600;
          color: var(--color-text-on-primary);
          background: var(--color-primary);
          border: none;
          border-radius: var(--radius-md);
          cursor: pointer;
          min-height: 48px;
          transition: background-color var(--transition-fast);
        }

        .login-btn:hover {
          background: var(--color-primary-600);
        }

        .login-btn:active {
          background: var(--color-primary-700);
        }

        .login-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
