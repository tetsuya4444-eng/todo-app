import { signal } from '@preact/signals';
import { supabase, isDemoMode } from '../lib/supabase';
import { user } from './useAuth';

export const categories = signal([]);
export const categoriesLoading = signal(false);

// デモ用カテゴリデータ
const demoCategories = [
  { id: 'cat-1', name: '仕事', color: '#6B9DA8', sort_order: 0 },
  { id: 'cat-2', name: '個人', color: '#C4A265', sort_order: 1 },
  { id: 'cat-3', name: '議会', color: '#C48B8B', sort_order: 2 },
  { id: 'cat-4', name: '技術', color: '#7B82A8', sort_order: 3 },
  { id: 'cat-5', name: 'TFC', color: '#7AAB8E', sort_order: 4 },
];

export async function fetchCategories() {
  categoriesLoading.value = true;

  if (isDemoMode) {
    categories.value = demoCategories;
    categoriesLoading.value = false;
    return;
  }

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', user.value?.id)
    .order('sort_order', { ascending: true });

  if (!error && data) {
    categories.value = data;
  }
  categoriesLoading.value = false;
}

export async function addCategory(name, color = '#6B7280') {
  if (isDemoMode) {
    const newCat = {
      id: `cat-${Date.now()}`,
      name,
      color,
      sort_order: categories.value.length,
    };
    categories.value = [...categories.value, newCat];
    return { data: newCat, error: null };
  }

  const { data, error } = await supabase
    .from('categories')
    .insert({
      user_id: user.value.id,
      name,
      color,
      sort_order: categories.value.length,
    })
    .select()
    .single();

  if (!error && data) {
    categories.value = [...categories.value, data];
  }
  return { data, error };
}

export async function updateCategory(id, updates) {
  if (isDemoMode) {
    categories.value = categories.value.map(c =>
      c.id === id ? { ...c, ...updates } : c
    );
    return { error: null };
  }

  const { error } = await supabase
    .from('categories')
    .update(updates)
    .eq('id', id);

  if (!error) {
    categories.value = categories.value.map(c =>
      c.id === id ? { ...c, ...updates } : c
    );
  }
  return { error };
}

export async function deleteCategory(id) {
  if (isDemoMode) {
    categories.value = categories.value.filter(c => c.id !== id);
    return { error: null };
  }

  // まず中間テーブルの関連を削除
  await supabase.from('todo_categories').delete().eq('category_id', id);

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  if (!error) {
    categories.value = categories.value.filter(c => c.id !== id);
  }
  return { error };
}
