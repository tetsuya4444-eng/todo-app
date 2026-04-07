import { useEffect } from 'preact/hooks';
import { signal } from '@preact/signals';
import { user, authLoading } from './hooks/useAuth';
import { Login } from './components/Login';
import { TaskList } from './components/TaskList';
import { TaskForm } from './components/TaskForm';
import { Settings } from './components/Settings';

// 現在の画面
export const currentView = signal('list'); // 'list' | 'form' | 'settings'
export const editingTodoId = signal(null);

// 画面遷移関数
export function navigateTo(view, todoId = null) {
  currentView.value = view;
  editingTodoId.value = todoId;
}

// トースト管理
export const toasts = signal([]);

export function showToast(message, type = 'default', options = {}) {
  const id = Date.now();
  toasts.value = [...toasts.value, { id, message, type, ...options }];
  const duration = options.action ? 5000 : 3000;
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id);
  }, duration);
}

function ToastContainer() {
  if (toasts.value.length === 0) return null;
  return (
    <div class="toast-container">
      {toasts.value.map(t => (
        <div key={t.id} class={`toast ${t.type === 'success' ? 'toast-success' : t.type === 'error' ? 'toast-error' : ''}`}>
          {t.message}
          {t.action && t.onAction && (
            <button class="toast-action" onClick={() => {
              t.onAction();
              toasts.value = toasts.value.filter(toast => toast.id !== t.id);
            }}>
              {t.action}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

export function App() {
  const loading = authLoading.value;
  const currentUser = user.value;
  const view = currentView.value;

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100dvh',
        color: 'var(--color-text-tertiary)',
        fontSize: 'var(--font-size-sm)',
      }}>
        読み込み中...
      </div>
    );
  }

  if (!currentUser) {
    return (
      <>
        <Login />
        <ToastContainer />
      </>
    );
  }

  return (
    <>
      {view === 'list' && <TaskList />}
      {view === 'form' && <TaskForm />}
      {view === 'settings' && <Settings />}
      <ToastContainer />
    </>
  );
}
