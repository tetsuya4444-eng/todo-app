import { useState, useEffect } from 'preact/hooks';
import { todos, addTodo, updateTodo } from '../hooks/useTodos';
import { categories } from '../hooks/useCategories';
import { navigateTo, editingTodoId, showToast } from '../app';
import { IconBack } from './Icons';

export function TaskForm() {
  const todoId = editingTodoId.value;
  const isEdit = !!todoId;
  const existingTodo = isEdit ? todos.value.find(t => t.id === todoId) : null;

  const [title, setTitle] = useState('');
  const [memo, setMemo] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [priority, setPriority] = useState(2);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [reminderMinutes, setReminderMinutes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [titleError, setTitleError] = useState('');

  useEffect(() => {
    if (existingTodo) {
      setTitle(existingTodo.title || '');
      setMemo(existingTodo.memo || '');
      setPriority(existingTodo.priority || 2);
      setSelectedCategories(existingTodo.categories?.map(c => c.id) || []);
      setReminderMinutes(existingTodo.reminder_minutes ? String(existingTodo.reminder_minutes) : '');

      if (existingTodo.due_date) {
        const d = new Date(existingTodo.due_date);
        setDueDate(d.toISOString().split('T')[0]);
        const hours = d.getHours();
        const minutes = d.getMinutes();
        if (hours !== 0 || minutes !== 0) {
          setDueTime(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`);
        }
      }
    }
  }, [todoId]);

  function handleTitleBlur() {
    if (!title.trim()) {
      setTitleError('タイトルは必須です');
    } else {
      setTitleError('');
    }
  }

  function toggleCategory(catId) {
    setSelectedCategories(prev =>
      prev.includes(catId)
        ? prev.filter(id => id !== catId)
        : [...prev, catId]
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) {
      setTitleError('タイトルは必須です');
      return;
    }

    setSubmitting(true);

    let dueDateValue = null;
    if (dueDate) {
      dueDateValue = dueTime ? `${dueDate}T${dueTime}:00` : `${dueDate}T23:59:00`;
    }

    const todoData = {
      title: title.trim(),
      memo: memo.trim(),
      due_date: dueDateValue,
      priority,
      reminder_minutes: reminderMinutes ? parseInt(reminderMinutes, 10) : null,
      categoryIds: selectedCategories,
    };

    let result;
    if (isEdit) {
      result = await updateTodo(todoId, todoData);
    } else {
      result = await addTodo(todoData);
    }

    setSubmitting(false);

    if (result.error) {
      showToast(isEdit ? '更新できませんでした。インターネット接続を確認して、もう一度お試しください' : '作成できませんでした。インターネット接続を確認して、もう一度お試しください', 'error');
    } else {
      showToast(isEdit ? 'タスクを更新しました' : 'タスクを作成しました', 'success');
      navigateTo('list');
    }
  }

  const REMINDER_OPTIONS = [
    { value: '', label: 'なし' },
    { value: '15', label: '15分前' },
    { value: '30', label: '30分前' },
    { value: '60', label: '1時間前' },
    { value: '1440', label: '1日前' },
  ];

  return (
    <div class="form-page">
      <header class="app-header">
        <button class="icon-btn" aria-label="戻る" onClick={() => navigateTo('list')}>
          <IconBack />
        </button>
        <h1 class="app-header-title">{isEdit ? 'タスク編集' : '新しいタスク'}</h1>
        <div style={{ width: '44px' }} />
      </header>

      <form class="task-form" onSubmit={handleSubmit}>
        {/* タイトル */}
        <div class="form-field">
          <label for="task-title" class="form-label">タイトル <span class="form-required">*</span></label>
          <input
            id="task-title"
            type="text"
            value={title}
            onInput={e => { setTitle(e.target.value); setTitleError(''); }}
            onBlur={handleTitleBlur}
            placeholder="タスクのタイトル"
            class={`form-input ${titleError ? 'is-error' : ''}`}
            autoFocus
          />
          {titleError && <div class="form-error">{titleError}</div>}
        </div>

        {/* 補足メモ */}
        <div class="form-field">
          <label for="task-memo" class="form-label">補足メモ</label>
          <textarea
            id="task-memo"
            value={memo}
            onInput={e => setMemo(e.target.value)}
            placeholder="マークダウンで記述できます..."
            class="form-textarea"
            rows={5}
          />
          <div class="form-hint">Markdown記法が使えます（**太字**、- リスト、# 見出し）</div>
        </div>

        {/* 期限 */}
        <div class="form-row">
          <div class="form-field" style={{ flex: 1 }}>
            <label for="task-due-date" class="form-label">期限日</label>
            <input
              id="task-due-date"
              type="date"
              value={dueDate}
              onInput={e => setDueDate(e.target.value)}
              class="form-input"
            />
          </div>
          <div class="form-field" style={{ flex: 1 }}>
            <label for="task-due-time" class="form-label">時刻（任意）</label>
            <input
              id="task-due-time"
              type="time"
              value={dueTime}
              onInput={e => setDueTime(e.target.value)}
              class="form-input"
            />
          </div>
        </div>

        {/* 優先度 */}
        <div class="form-field">
          <label class="form-label">優先度</label>
          <div class="priority-select">
            {[
              { value: 1, label: '高', color: 'var(--color-priority-high)' },
              { value: 2, label: '中', color: 'var(--color-priority-medium)' },
              { value: 3, label: '低', color: 'var(--color-priority-low)' },
            ].map(opt => (
              <button
                key={opt.value}
                type="button"
                class={`priority-chip ${priority === opt.value ? 'is-active' : ''}`}
                style={{
                  '--chip-color': opt.color,
                }}
                onClick={() => setPriority(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* カテゴリ */}
        <div class="form-field">
          <label class="form-label">カテゴリ</label>
          <div class="category-chips">
            {categories.value.map(cat => (
              <button
                key={cat.id}
                type="button"
                class={`category-chip ${selectedCategories.includes(cat.id) ? 'is-active' : ''}`}
                style={{
                  '--cat-color': cat.color,
                }}
                onClick={() => toggleCategory(cat.id)}
              >
                <span class="cat-dot" style={{ background: cat.color }} />
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* リマインダー */}
        <div class="form-field">
          <label for="task-reminder" class="form-label">リマインダー</label>
          <select
            id="task-reminder"
            value={reminderMinutes}
            onChange={e => setReminderMinutes(e.target.value)}
            class="form-select"
          >
            {REMINDER_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* 送信ボタン */}
        <div class="form-actions">
          <button type="button" class="form-btn-cancel" onClick={() => navigateTo('list')}>
            キャンセル
          </button>
          <button type="submit" class="form-btn-submit" disabled={submitting}>
            {submitting ? '保存中...' : isEdit ? '更新する' : '作成する'}
          </button>
        </div>
      </form>

      <style>{`
        .form-page {
          min-height: 100dvh;
          background: var(--color-bg);
        }

        .task-form {
          max-width: 640px;
          margin: 0 auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        @media (min-width: 768px) {
          .task-form { padding: 24px; }
        }

        .form-field {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .form-row {
          display: flex;
          gap: 12px;
        }

        .form-label {
          font-size: var(--font-size-sm);
          font-weight: 500;
          color: var(--color-text-secondary);
        }

        .form-required {
          color: var(--color-error);
        }

        .form-input,
        .form-textarea,
        .form-select {
          padding: 10px 12px;
          font-family: var(--font-family-base);
          font-size: var(--font-size-base);
          color: var(--color-text);
          background: var(--color-bg-white);
          border: 1.5px solid var(--color-border);
          border-radius: var(--radius-md);
          outline: none;
          transition: border-color var(--transition-fast);
        }

        .form-input:focus,
        .form-textarea:focus,
        .form-select:focus {
          border-color: var(--color-border-focus);
          box-shadow: 0 0 0 3px var(--color-primary-100);
        }

        .form-input.is-error {
          border-color: var(--color-error);
        }

        .form-textarea {
          resize: vertical;
          min-height: 120px;
          line-height: var(--line-height-relaxed);
        }

        .form-select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          padding-right: 36px;
        }

        .form-error {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: var(--font-size-xs);
          color: var(--color-error);
        }

        .form-hint {
          font-size: var(--font-size-xs);
          color: var(--color-text-tertiary);
        }

        .priority-select {
          display: flex;
          gap: 8px;
        }

        .priority-chip {
          flex: 1;
          padding: 8px 16px;
          font-family: var(--font-family-base);
          font-size: var(--font-size-sm);
          font-weight: 500;
          color: var(--color-text-secondary);
          background: var(--color-bg-subtle);
          border: 1.5px solid transparent;
          border-radius: var(--radius-md);
          cursor: pointer;
          text-align: center;
          min-height: var(--touch-target-min);
          transition: all var(--transition-fast);
        }

        .priority-chip.is-active {
          color: var(--chip-color);
          background: color-mix(in srgb, var(--chip-color) 10%, white);
          border-color: color-mix(in srgb, var(--chip-color) 30%, white);
        }

        .category-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .category-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          font-family: var(--font-family-base);
          font-size: var(--font-size-sm);
          font-weight: 500;
          color: var(--color-text-secondary);
          background: var(--color-bg-subtle);
          border: 1.5px solid transparent;
          border-radius: var(--radius-full);
          cursor: pointer;
          min-height: 36px;
          transition: all var(--transition-fast);
        }

        .category-chip.is-active {
          color: var(--cat-color);
          background: color-mix(in srgb, var(--cat-color) 10%, white);
          border-color: color-mix(in srgb, var(--cat-color) 30%, white);
        }

        .cat-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .form-actions {
          display: flex;
          gap: 12px;
          padding-top: 8px;
        }

        .form-btn-cancel {
          flex: 1;
          padding: 12px 24px;
          font-family: var(--font-family-base);
          font-size: var(--font-size-base);
          font-weight: 500;
          color: var(--color-text-secondary);
          background: var(--color-bg-subtle);
          border: none;
          border-radius: var(--radius-md);
          cursor: pointer;
          min-height: 48px;
          transition: background-color var(--transition-fast);
        }

        .form-btn-cancel:hover {
          background: var(--color-border);
        }

        .form-btn-submit {
          flex: 1;
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

        .form-btn-submit:hover {
          background: var(--color-primary-600);
        }

        .form-btn-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
