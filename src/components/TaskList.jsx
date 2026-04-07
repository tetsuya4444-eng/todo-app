import { useEffect } from 'preact/hooks';
import { signal } from '@preact/signals';
import { filteredTodos, todosLoading, fetchTodos, todos, searchQuery } from '../hooks/useTodos';
import { fetchCategories } from '../hooks/useCategories';
import { navigateTo } from '../app';
import { QuickInput } from './QuickInput';
import { FilterBar } from './FilterBar';
import { TaskItem } from './TaskItem';
import { IconSettings, IconSearch, IconPlus, IconX } from './Icons';

const showSearch = signal(false);

export function TaskList() {
  useEffect(() => {
    fetchTodos();
    fetchCategories();
  }, []);

  const loading = todosLoading.value;
  const list = filteredTodos.value;
  const allTodos = todos.value.filter(t => !t.is_deleted);

  const activeCount = allTodos.filter(t => !t.is_completed).length;
  const completedCount = allTodos.filter(t => t.is_completed).length;

  function toggleSearch() {
    showSearch.value = !showSearch.value;
    if (!showSearch.value) {
      searchQuery.value = '';
    }
  }

  // セクション分け（未完了と完了済みを分ける）
  const activeTodos = list.filter(t => !t.is_completed);
  const completedTodos = list.filter(t => t.is_completed);

  return (
    <div class="task-list-page">
      {/* ヘッダー */}
      <header class="app-header">
        <h1 class="app-header-title">Todo</h1>
        <div class="app-header-actions">
          <button class="icon-btn" aria-label="検索" onClick={toggleSearch}>
            <IconSearch />
          </button>
          <button class="icon-btn" aria-label="設定" onClick={() => navigateTo('settings')}>
            <IconSettings />
          </button>
        </div>
      </header>

      {/* 検索バー */}
      {showSearch.value && (
        <div class="search-bar">
          <div class="search-bar-field">
            <IconSearch size={16} />
            <input
              type="search"
              placeholder="タスクを検索..."
              value={searchQuery.value}
              onInput={e => { searchQuery.value = e.target.value; }}
              autoFocus
            />
            <button class="search-bar-close" onClick={toggleSearch} aria-label="検索を閉じる">
              <IconX size={16} />
            </button>
          </div>
        </div>
      )}

      {/* クイック入力 */}
      <QuickInput />

      {/* フィルタバー */}
      <FilterBar />

      {/* タスクリスト */}
      <main class="task-list-container">
        {loading ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '64px 32px',
            color: 'var(--color-text-tertiary)',
            fontSize: 'var(--font-size-sm)',
          }}>
            読み込み中...
          </div>
        ) : list.length === 0 ? (
          <div class="empty-state" style={{ display: 'flex' }}>
            <svg class="empty-state-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <div class="empty-state-title">タスクがありません</div>
            <div class="empty-state-desc">
              上の入力欄からタスクを追加するか、右下の「+」ボタンから詳細付きで作成できます
            </div>
          </div>
        ) : (
          <>
            {/* 未完了タスク */}
            {activeTodos.length > 0 && activeTodos.map(todo => (
              <TaskItem key={todo.id} todo={todo} />
            ))}

            {/* 完了済みタスク */}
            {completedTodos.length > 0 && (
              <>
                <div class="task-list-section-label" style={{ marginTop: '8px' }}>
                  完了済み
                </div>
                {completedTodos.map(todo => (
                  <TaskItem key={todo.id} todo={todo} />
                ))}
              </>
            )}
          </>
        )}

        {!loading && list.length > 0 && (
          <div class="task-count">
            {list.length === allTodos.length
              ? `${allTodos.length}件のタスク（未完了: ${activeCount} / 完了: ${completedCount}）`
              : `${list.length}件表示 / 全${allTodos.length}件`
            }
          </div>
        )}
      </main>

      {/* FAB */}
      <button class="fab" aria-label="新しいタスクを作成" onClick={() => navigateTo('form')}>
        <IconPlus />
      </button>

      <style>{`
        .task-list-page {
          min-height: 100dvh;
          padding-bottom: 80px;
        }

        .search-bar {
          position: sticky;
          top: 56px;
          z-index: 95;
          padding: 8px 16px;
          background: var(--color-bg-white);
          border-bottom: 1px solid var(--color-border);
        }

        .search-bar-field {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: var(--color-bg-subtle);
          border: 1.5px solid transparent;
          border-radius: var(--radius-md);
          transition: border-color var(--transition-fast);
        }

        .search-bar-field:focus-within {
          background: var(--color-bg-white);
          border-color: var(--color-border-focus);
          box-shadow: 0 0 0 3px var(--color-primary-100);
        }

        .search-bar-field svg {
          color: var(--color-text-tertiary);
          flex-shrink: 0;
        }

        .search-bar-field input {
          flex: 1;
          border: none;
          outline: none;
          background: transparent;
          font-family: var(--font-family-base);
          font-size: var(--font-size-base);
          color: var(--color-text);
          min-width: 0;
        }

        .search-bar-field input::placeholder {
          color: var(--color-text-tertiary);
        }

        .search-bar-close {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: transparent;
          border: none;
          border-radius: var(--radius-sm);
          cursor: pointer;
          color: var(--color-text-tertiary);
        }

        .search-bar-close:hover {
          background: var(--color-bg-subtle);
          color: var(--color-text);
        }
      `}</style>
    </div>
  );
}
