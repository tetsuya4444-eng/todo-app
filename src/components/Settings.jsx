import { useState } from 'preact/hooks';
import { categories, addCategory, updateCategory, deleteCategory } from '../hooks/useCategories';
import { signOut } from '../hooks/useAuth';
import { navigateTo, showToast } from '../app';
import { IconBack, IconLogout, IconTrash, IconX, IconCheck } from './Icons';

export function Settings() {
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#6B9DA8');
  const [editingCat, setEditingCat] = useState(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [confirmLogout, setConfirmLogout] = useState(false);

  async function handleAddCategory(e) {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const { error } = await addCategory(newCatName.trim(), newCatColor);
    if (error) {
      showToast('カテゴリを追加できませんでした。インターネット接続を確認して、もう一度お試しください', 'error');
    } else {
      setNewCatName('');
      showToast('カテゴリを追加しました', 'success');
    }
  }

  function startEditCategory(cat) {
    setEditingCat(cat.id);
    setEditName(cat.name);
    setEditColor(cat.color);
  }

  async function handleSaveEdit(id) {
    if (!editName.trim()) return;
    const { error } = await updateCategory(id, { name: editName.trim(), color: editColor });
    if (error) {
      showToast('カテゴリを更新できませんでした。インターネット接続を確認して、もう一度お試しください', 'error');
    } else {
      showToast('カテゴリを更新しました', 'success');
    }
    setEditingCat(null);
  }

  function cancelEdit() {
    setEditingCat(null);
  }

  async function handleDeleteCategory(id) {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id);
      return;
    }
    const { error } = await deleteCategory(id);
    if (error) {
      showToast('カテゴリを削除できませんでした。インターネット接続を確認して、もう一度お試しください', 'error');
    } else {
      showToast('カテゴリを削除しました', 'success');
    }
    setConfirmDeleteId(null);
  }

  async function handleLogout() {
    if (!confirmLogout) {
      setConfirmLogout(true);
      return;
    }
    await signOut();
    navigateTo('list');
  }

  const PRESET_COLORS = [
    '#6B9DA8', '#C4A265', '#C48B8B', '#7B82A8', '#7AAB8E',
    '#A88B6B', '#8B6BA8', '#6BA89E', '#A86B8B', '#6B7280',
  ];

  return (
    <div class="settings-page">
      <header class="app-header">
        <button class="icon-btn" aria-label="戻る" onClick={() => navigateTo('list')}>
          <IconBack />
        </button>
        <h1 class="app-header-title">設定</h1>
        <div style={{ width: '44px' }} />
      </header>

      <div class="settings-content">
        {/* カテゴリ管理 */}
        <section class="settings-section">
          <h2 class="settings-section-title">カテゴリ管理</h2>

          <div class="category-list">
            {categories.value.map(cat => (
              <div key={cat.id} class="category-row">
                {editingCat === cat.id ? (
                  <>
                    <div class="category-edit-colors">
                      {PRESET_COLORS.map(c => (
                        <button
                          key={c}
                          type="button"
                          class={`color-swatch-mini ${editColor === c ? 'is-active' : ''}`}
                          style={{ background: c }}
                          onClick={() => setEditColor(c)}
                          aria-label={`色を選択: ${c}`}
                        />
                      ))}
                    </div>
                    <input
                      type="text"
                      class="form-input category-edit-input"
                      value={editName}
                      onInput={e => setEditName(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleSaveEdit(cat.id);
                        if (e.key === 'Escape') cancelEdit();
                      }}
                      autoFocus
                    />
                    <button
                      class="category-action-btn is-save"
                      aria-label="保存"
                      onClick={() => handleSaveEdit(cat.id)}
                    >
                      <IconCheck size={14} />
                    </button>
                    <button
                      class="category-action-btn"
                      aria-label="キャンセル"
                      onClick={cancelEdit}
                    >
                      <IconX size={14} />
                    </button>
                  </>
                ) : (
                  <>
                    <span class="category-dot" style={{ background: cat.color }} />
                    <span
                      class="category-name"
                      onClick={() => startEditCategory(cat)}
                      title="クリックして編集"
                    >
                      {cat.name}
                    </span>
                    <button
                      class={`category-delete-btn ${confirmDeleteId === cat.id ? 'is-confirm' : ''}`}
                      aria-label={confirmDeleteId === cat.id ? `${cat.name}を本当に削除` : `${cat.name}を削除`}
                      onClick={() => handleDeleteCategory(cat.id)}
                      onBlur={() => {
                        if (confirmDeleteId === cat.id) setConfirmDeleteId(null);
                      }}
                    >
                      {confirmDeleteId === cat.id ? (
                        <span class="category-delete-confirm-text">削除</span>
                      ) : (
                        <IconX size={14} />
                      )}
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>

          <form class="category-add-form" onSubmit={handleAddCategory}>
            <div class="color-picker">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  class={`color-swatch ${newCatColor === c ? 'is-active' : ''}`}
                  style={{ background: c }}
                  onClick={() => setNewCatColor(c)}
                  aria-label={`色を選択: ${c}`}
                />
              ))}
            </div>
            <div class="category-add-row">
              <input
                type="text"
                value={newCatName}
                onInput={e => setNewCatName(e.target.value)}
                placeholder="新しいカテゴリ名"
                class="form-input"
                style={{ flex: 1 }}
              />
              <button type="submit" class="category-add-btn" disabled={!newCatName.trim()}>
                追加
              </button>
            </div>
          </form>
        </section>

        {/* ログアウト */}
        <section class="settings-section">
          <button class="logout-btn" onClick={handleLogout}>
            <IconLogout />
            {confirmLogout ? '本当にログアウトしますか？' : 'ログアウト'}
          </button>
          {confirmLogout && (
            <button
              class="cancel-logout-btn"
              onClick={() => setConfirmLogout(false)}
            >
              キャンセル
            </button>
          )}
        </section>
      </div>

      <style>{`
        .settings-page {
          min-height: 100dvh;
          background: var(--color-bg);
        }

        .settings-content {
          max-width: 640px;
          margin: 0 auto;
          padding: 16px;
        }

        @media (min-width: 768px) {
          .settings-content { padding: 24px; }
        }

        .settings-section {
          background: var(--color-bg-white);
          border-radius: var(--radius-lg);
          padding: 16px;
          margin-bottom: 16px;
          box-shadow: var(--shadow-sm);
        }

        .settings-section-title {
          font-size: var(--font-size-base);
          font-weight: 600;
          color: var(--color-text);
          margin-bottom: 12px;
        }

        .category-list {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-bottom: 16px;
        }

        .category-row {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px;
          border-radius: var(--radius-md);
          min-height: var(--touch-target-min);
          flex-wrap: wrap;
        }

        .category-row:hover {
          background: var(--color-bg-subtle);
        }

        .category-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .category-name {
          flex: 1;
          font-size: var(--font-size-sm);
          cursor: pointer;
          padding: 4px 0;
        }

        .category-name:hover {
          text-decoration: underline;
          text-decoration-color: var(--color-text-tertiary);
          text-underline-offset: 2px;
        }

        .category-edit-colors {
          display: flex;
          gap: 6px;
          width: 100%;
          margin-bottom: 4px;
        }

        .color-swatch-mini {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          border: 2px solid transparent;
          cursor: pointer;
          padding: 0;
          transition: all var(--transition-fast);
        }

        .color-swatch-mini.is-active {
          border-color: var(--color-text);
          box-shadow: 0 0 0 2px var(--color-bg-white);
        }

        .category-edit-input {
          flex: 1;
          min-width: 0;
        }

        .category-action-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          background: transparent;
          border: none;
          border-radius: var(--radius-sm);
          cursor: pointer;
          color: var(--color-text-secondary);
          transition: all var(--transition-fast);
        }

        .category-action-btn.is-save {
          color: var(--color-success);
        }

        .category-action-btn:hover {
          background: var(--color-bg-subtle);
        }

        .category-delete-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 44px;
          height: 44px;
          background: transparent;
          border: none;
          border-radius: var(--radius-sm);
          cursor: pointer;
          color: var(--color-text-tertiary);
          transition: all var(--transition-fast);
          padding: 0 4px;
        }

        .category-delete-btn:hover {
          background: var(--color-error-bg);
          color: var(--color-error);
        }

        .category-delete-btn.is-confirm {
          background: var(--color-error);
          color: var(--color-bg-white);
          border-radius: var(--radius-md);
          padding: 0 12px;
        }

        .category-delete-confirm-text {
          font-size: var(--font-size-xs);
          font-weight: 600;
          white-space: nowrap;
        }

        .color-picker {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 12px;
        }

        .color-swatch {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 2px solid transparent;
          cursor: pointer;
          padding: 0;
          transition: all var(--transition-fast);
        }

        .color-swatch.is-active {
          border-color: var(--color-text);
          box-shadow: 0 0 0 2px var(--color-bg-white);
        }

        .category-add-row {
          display: flex;
          gap: 8px;
        }

        .category-add-btn {
          padding: 10px 16px;
          font-family: var(--font-family-base);
          font-size: var(--font-size-sm);
          font-weight: 500;
          color: var(--color-text-on-primary);
          background: var(--color-primary);
          border: none;
          border-radius: var(--radius-md);
          cursor: pointer;
          min-height: var(--touch-target-min);
          transition: background-color var(--transition-fast);
        }

        .category-add-btn:hover {
          background: var(--color-primary-600);
        }

        .category-add-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .logout-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 12px;
          font-family: var(--font-family-base);
          font-size: var(--font-size-base);
          font-weight: 500;
          color: var(--color-error);
          background: transparent;
          border: none;
          border-radius: var(--radius-md);
          cursor: pointer;
          min-height: var(--touch-target-min);
          transition: background-color var(--transition-fast);
        }

        .logout-btn:hover {
          background: var(--color-error-bg);
        }

        .cancel-logout-btn {
          display: block;
          width: 100%;
          padding: 8px 12px;
          margin-top: 8px;
          font-family: var(--font-family-base);
          font-size: var(--font-size-sm);
          color: var(--color-text-secondary);
          background: transparent;
          border: none;
          cursor: pointer;
          text-align: center;
        }

        .form-input {
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

        .form-input:focus {
          background: var(--color-bg-white);
          border-color: var(--color-border-focus);
          box-shadow: 0 0 0 3px var(--color-primary-100);
        }
      `}</style>
    </div>
  );
}
