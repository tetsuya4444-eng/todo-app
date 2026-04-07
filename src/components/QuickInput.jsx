import { useState, useRef } from 'preact/hooks';
import { quickAddTodo } from '../hooks/useTodos';
import { showToast } from '../app';
import { IconPlus } from './Icons';

export function QuickInput() {
  const [value, setValue] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef(null);

  async function handleSubmit(e) {
    e.preventDefault();
    const title = value.trim();
    if (!title || submitting) return;

    setSubmitting(true);
    const { error } = await quickAddTodo(title);
    setSubmitting(false);

    if (error) {
      showToast('タスクを追加できませんでした。インターネット接続を確認して、もう一度お試しください', 'error');
    } else {
      setValue('');
      showToast('タスクを追加しました', 'success');
      inputRef.current?.focus();
    }
  }

  return (
    <form class="quick-input" onSubmit={handleSubmit}>
      <div class="quick-input-field">
        <IconPlus size={18} />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onInput={e => setValue(e.target.value)}
          placeholder="新しいタスクを追加..."
          aria-label="新しいタスクを追加"
          disabled={submitting}
        />
      </div>
      <span class="quick-input-hint">Enter で追加</span>
    </form>
  );
}
