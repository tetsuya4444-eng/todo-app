import { signal, computed } from '@preact/signals';
import { supabase, isDemoMode } from '../lib/supabase';
import { user } from './useAuth';
import { categories } from './useCategories';

export const todos = signal([]);
export const todosLoading = signal(false);
export const todoFilter = signal('active'); // 'all' | 'active' | 'completed'
export const categoryFilter = signal(null);
export const sortBy = signal('due_date'); // 'due_date' | 'priority' | 'created_at'
export const searchQuery = signal('');

// デモ用データ
const demoTodos = [
  {
    id: 'todo-1',
    title: '議会だよりの原稿を提出する',
    memo: '## 提出内容\n- 一般質問の要旨\n- 委員会報告のまとめ\n\n### 注意事項\n担当の田中さんに **4/7 17:00まで** にメールで送付すること。',
    due_date: new Date().toISOString().split('T')[0] + 'T17:00:00',
    priority: 1,
    is_completed: false,
    is_deleted: false,
    reminder_minutes: 60,
    created_at: '2026-04-05T10:00:00Z',
    updated_at: '2026-04-05T10:00:00Z',
    categories: [{ id: 'cat-3', name: '議会', color: '#C48B8B' }],
  },
  {
    id: 'todo-2',
    title: '補助金申請書類の確認',
    memo: '',
    due_date: '2026-04-05T23:59:00',
    priority: 1,
    is_completed: false,
    is_deleted: false,
    reminder_minutes: null,
    created_at: '2026-04-03T08:00:00Z',
    updated_at: '2026-04-03T08:00:00Z',
    categories: [{ id: 'cat-1', name: '仕事', color: '#6B9DA8' }],
  },
  {
    id: 'todo-3',
    title: 'TFC定例会の資料を準備する',
    memo: '・前回の議事録を添付\n・新メンバーの紹介を追加',
    due_date: '2026-04-10T10:00:00',
    priority: 2,
    is_completed: false,
    is_deleted: false,
    reminder_minutes: 1440,
    created_at: '2026-04-04T12:00:00Z',
    updated_at: '2026-04-04T12:00:00Z',
    categories: [{ id: 'cat-1', name: '仕事', color: '#6B9DA8' }],
  },
  {
    id: 'todo-4',
    title: 'Obsidianのフォルダ構成を見直す',
    memo: '',
    due_date: null,
    priority: 3,
    is_completed: false,
    is_deleted: false,
    reminder_minutes: null,
    created_at: '2026-04-06T15:00:00Z',
    updated_at: '2026-04-06T15:00:00Z',
    categories: [{ id: 'cat-2', name: '個人', color: '#C4A265' }],
  },
  {
    id: 'todo-5',
    title: 'Claude Code連携用のAPIキーを設定する',
    memo: '',
    due_date: '2026-04-12T18:00:00',
    priority: 2,
    is_completed: false,
    is_deleted: false,
    reminder_minutes: null,
    created_at: '2026-04-06T16:00:00Z',
    updated_at: '2026-04-06T16:00:00Z',
    categories: [
      { id: 'cat-1', name: '仕事', color: '#6B9DA8' },
      { id: 'cat-4', name: '技術', color: '#7B82A8' },
    ],
  },
  {
    id: 'todo-6',
    title: '牛乳とパンを買う',
    memo: '',
    due_date: null,
    priority: 3,
    is_completed: true,
    completed_at: '2026-04-06T18:00:00Z',
    is_deleted: false,
    reminder_minutes: null,
    created_at: '2026-04-06T09:00:00Z',
    updated_at: '2026-04-06T18:00:00Z',
    categories: [{ id: 'cat-2', name: '個人', color: '#C4A265' }],
  },
];

// フィルタリング・ソート済みのTodoリスト
export const filteredTodos = computed(() => {
  let list = todos.value.filter(t => !t.is_deleted);

  // 完了/未完了フィルタ
  if (todoFilter.value === 'active') {
    list = list.filter(t => !t.is_completed);
  } else if (todoFilter.value === 'completed') {
    list = list.filter(t => t.is_completed);
  }

  // カテゴリフィルタ
  if (categoryFilter.value) {
    list = list.filter(t =>
      t.categories?.some(c => c.id === categoryFilter.value)
    );
  }

  // 検索
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter(t =>
      t.title.toLowerCase().includes(q) ||
      (t.memo && t.memo.toLowerCase().includes(q))
    );
  }

  // ソート
  const sortKey = sortBy.value;
  list = [...list].sort((a, b) => {
    // 完了済みは常に下
    if (a.is_completed !== b.is_completed) return a.is_completed ? 1 : -1;

    if (sortKey === 'priority') {
      return a.priority - b.priority;
    }
    if (sortKey === 'created_at') {
      return new Date(b.created_at) - new Date(a.created_at);
    }
    // due_date: nullは下に
    if (!a.due_date && !b.due_date) return 0;
    if (!a.due_date) return 1;
    if (!b.due_date) return -1;
    return new Date(a.due_date) - new Date(b.due_date);
  });

  return list;
});

export async function fetchTodos() {
  todosLoading.value = true;

  if (isDemoMode) {
    todos.value = demoTodos;
    todosLoading.value = false;
    return;
  }

  const { data, error } = await supabase
    .from('todos')
    .select(`
      *,
      todo_categories (
        category:categories (*)
      )
    `)
    .eq('user_id', user.value?.id)
    .eq('is_deleted', false)
    .order('due_date', { ascending: true, nullsFirst: false });

  if (!error && data) {
    todos.value = data.map(t => ({
      ...t,
      categories: t.todo_categories?.map(tc => tc.category).filter(Boolean) || [],
    }));
  }
  todosLoading.value = false;
}

export async function addTodo(todo) {
  if (isDemoMode) {
    const newTodo = {
      id: `todo-${Date.now()}`,
      ...todo,
      is_completed: false,
      is_deleted: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      categories: todo.categoryIds
        ? categories.value.filter(c => todo.categoryIds.includes(c.id))
        : [],
    };
    todos.value = [newTodo, ...todos.value];
    return { data: newTodo, error: null };
  }

  const { categoryIds, ...todoData } = todo;

  const { data, error } = await supabase
    .from('todos')
    .insert({
      user_id: user.value.id,
      ...todoData,
    })
    .select()
    .single();

  if (!error && data && categoryIds?.length) {
    await supabase.from('todo_categories').insert(
      categoryIds.map(cid => ({ todo_id: data.id, category_id: cid }))
    );
  }

  if (!error) {
    await fetchTodos();
  }
  return { data, error };
}

export async function updateTodo(id, updates) {
  if (isDemoMode) {
    const { categoryIds, ...demoUpdates } = updates;
    const resolvedCategories = categoryIds !== undefined
      ? categories.value.filter(c => categoryIds.includes(c.id))
      : undefined;
    todos.value = todos.value.map(t =>
      t.id === id ? {
        ...t,
        ...demoUpdates,
        ...(resolvedCategories !== undefined ? { categories: resolvedCategories } : {}),
        updated_at: new Date().toISOString(),
      } : t
    );
    return { error: null };
  }

  const { categoryIds, ...updateData } = updates;

  const { error } = await supabase
    .from('todos')
    .update({ ...updateData, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (!error && categoryIds !== undefined) {
    await supabase.from('todo_categories').delete().eq('todo_id', id);
    if (categoryIds.length) {
      await supabase.from('todo_categories').insert(
        categoryIds.map(cid => ({ todo_id: id, category_id: cid }))
      );
    }
  }

  if (!error) {
    await fetchTodos();
  }
  return { error };
}

export async function toggleComplete(id) {
  const todo = todos.value.find(t => t.id === id);
  if (!todo) return;

  const isCompleted = !todo.is_completed;
  const updates = {
    is_completed: isCompleted,
    completed_at: isCompleted ? new Date().toISOString() : null,
  };

  return updateTodo(id, updates);
}

export async function deleteTodo(id) {
  // 論理削除
  return updateTodo(id, {
    is_deleted: true,
    deleted_at: new Date().toISOString(),
  });
}

export async function undoDelete(id) {
  return updateTodo(id, {
    is_deleted: false,
    deleted_at: null,
  });
}

export async function quickAddTodo(title) {
  return addTodo({
    title,
    memo: '',
    due_date: null,
    priority: 2,
    reminder_minutes: null,
  });
}
