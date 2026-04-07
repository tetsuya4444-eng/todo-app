import { useState } from 'preact/hooks';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { toggleComplete, deleteTodo, undoDelete } from '../hooks/useTodos';
import { navigateTo, showToast } from '../app';
import { IconCheck, IconMemo, IconChevronRight, IconEdit, IconTrash } from './Icons';

// カテゴリ色のマッピング
function getCategoryColorClass(color) {
  if (!color) return {};
  // くすみ系のパステル背景と暗めのテキスト色を生成
  return {
    background: `${color}1A`,
    color: color,
  };
}

// 期限のフォーマット
function formatDueDate(dueDate) {
  if (!dueDate) return null;
  const due = new Date(dueDate);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());

  const diffDays = Math.floor((dueDay - today) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { text: `${due.getMonth() + 1}/${due.getDate()}`, className: 'is-overdue' };
  }
  if (diffDays === 0) {
    return { text: '今日', className: 'is-today' };
  }
  if (diffDays === 1) {
    return { text: '明日', className: '' };
  }
  return { text: `${due.getMonth() + 1}/${due.getDate()}`, className: '' };
}

// 優先度テキスト
function getPriorityLabel(priority) {
  switch (priority) {
    case 1: return '高';
    case 2: return '中';
    case 3: return '低';
    default: return '中';
  }
}

// 優先度の色
function getPriorityColor(priority) {
  switch (priority) {
    case 1: return 'var(--color-priority-high)';
    case 2: return 'var(--color-priority-medium)';
    case 3: return 'var(--color-priority-low)';
    default: return 'var(--color-priority-medium)';
  }
}

// リマインダーのフォーマット
function formatReminder(minutes) {
  if (!minutes) return null;
  if (minutes < 60) return `${minutes}分前`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}時間前`;
  return `${Math.floor(minutes / 1440)}日前`;
}

export function TaskItem({ todo }) {
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const priorityClass =
    todo.priority === 1 ? 'priority-high' :
    todo.priority === 2 ? 'priority-medium' : 'priority-low';

  const dueInfo = formatDueDate(todo.due_date);
  const hasMemo = todo.memo && todo.memo.trim().length > 0;

  function handleToggle(e) {
    e.stopPropagation();
    setExpanded(!expanded);
  }

  async function handleCheck(e) {
    e.stopPropagation();
    const { error } = await toggleComplete(todo.id);
    if (error) {
      showToast('更新できませんでした。インターネット接続を確認して、もう一度お試しください', 'error');
    } else {
      showToast(
        todo.is_completed ? 'タスクを未完了に戻しました' : 'タスクを完了しました',
        'success'
      );
    }
  }

  function handleEdit(e) {
    e.stopPropagation();
    navigateTo('form', todo.id);
  }

  async function handleDelete(e) {
    e.stopPropagation();
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    const { error } = await deleteTodo(todo.id);
    if (error) {
      showToast('削除できませんでした。インターネット接続を確認して、もう一度お試しください', 'error');
    } else {
      const deletedId = todo.id;
      showToast('タスクを削除しました', 'success', {
        action: '元に戻す',
        onAction: async () => {
          const { error: undoError } = await undoDelete(deletedId);
          if (undoError) {
            showToast('元に戻せませんでした', 'error');
          } else {
            showToast('タスクを復元しました', 'success');
          }
        },
      });
      setExpanded(false);
    }
    setConfirmDelete(false);
  }

  // マークダウンをHTMLにレンダリング（XSS対策: DOMPurifyでサニタイズ）
  const memoHtml = hasMemo ? DOMPurify.sanitize(marked.parse(todo.memo, { breaks: true })) : '';

  return (
    <>
      <div
        class={`task-item ${priorityClass} ${todo.is_completed ? 'is-completed' : ''} ${expanded ? 'is-expanded' : ''} ${hasMemo || todo.due_date ? 'has-detail' : ''}`}
        onClick={handleToggle}
      >
        {/* チェックボックス */}
        <div class="task-checkbox" role="checkbox" aria-checked={todo.is_completed} tabindex="0" onClick={handleCheck}>
          <div class={`task-checkbox-inner ${todo.is_completed ? 'is-checked' : ''}`}>
            <IconCheck />
          </div>
        </div>

        {/* タスク本体: タイトル + カテゴリ（インライン） */}
        <div class="task-body">
          <span class="task-title">{todo.title}</span>
          {todo.categories && todo.categories.length > 0 && (
            <span class="task-inline-categories">
              {todo.categories.map(cat => (
                <span
                  key={cat.id}
                  class="task-category"
                  style={getCategoryColorClass(cat.color)}
                >
                  {cat.name}
                </span>
              ))}
            </span>
          )}
        </div>

        {/* 右端: 期限・メモアイコン・シェブロン */}
        <div class="task-trailing">
          <span class={`task-due-slot ${dueInfo ? '' : 'is-empty'}`}>
            {dueInfo && (
              <span class={`task-due ${dueInfo.className}`}>
                {dueInfo.text}
              </span>
            )}
          </span>
          {hasMemo && (
            <span class="task-memo-icon" title="メモあり">
              <IconMemo />
            </span>
          )}
          <div class="task-expand-indicator">
            <IconChevronRight />
          </div>
        </div>
      </div>

      {/* アコーディオン展開部分 */}
      <div class={`task-detail ${expanded ? 'is-open' : ''}`}>
        <div class="task-detail-grid">
          {todo.due_date && (
            <div class="task-detail-item">
              <span class="task-detail-label">期限</span>
              <span class="task-detail-value">
                {dueInfo?.text}
                {todo.due_date && (() => {
                  const d = new Date(todo.due_date);
                  const hours = d.getHours();
                  const minutes = d.getMinutes();
                  if (hours === 0 && minutes === 0) return '';
                  if (hours === 23 && minutes === 59) return '';
                  return ` ${hours}:${String(minutes).padStart(2, '0')}`;
                })()}
              </span>
            </div>
          )}
          {todo.reminder_minutes && (
            <div class="task-detail-item">
              <span class="task-detail-label">リマインダー</span>
              <span class="task-detail-value">{formatReminder(todo.reminder_minutes)}</span>
            </div>
          )}
        </div>

        {hasMemo && (
          <div class="task-detail-memo markdown-body" dangerouslySetInnerHTML={{ __html: memoHtml }} />
        )}

        <div class="task-detail-actions">
          <button class="task-detail-btn" onClick={handleEdit}>
            <IconEdit />
            編集
          </button>
          <button class={`task-detail-btn is-danger`} onClick={handleDelete}>
            <IconTrash />
            {confirmDelete ? '本当に削除する' : '削除'}
          </button>
        </div>
      </div>
    </>
  );
}
