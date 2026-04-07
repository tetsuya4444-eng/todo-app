import { todoFilter, categoryFilter, sortBy } from '../hooks/useTodos';
import { categories } from '../hooks/useCategories';
import { IconSort } from './Icons';

const SORT_OPTIONS = [
  { key: 'due_date', label: '期限順' },
  { key: 'priority', label: '優先度順' },
  { key: 'created_at', label: '作成日順' },
];

export function FilterBar() {
  const currentFilter = todoFilter.value;
  const currentCategory = categoryFilter.value;
  const currentSort = sortBy.value;
  const cats = categories.value;

  function handleFilterChange(filter) {
    todoFilter.value = filter;
  }

  function handleCategoryToggle(catId) {
    categoryFilter.value = categoryFilter.value === catId ? null : catId;
  }

  function handleSortCycle() {
    const idx = SORT_OPTIONS.findIndex(s => s.key === currentSort);
    const next = SORT_OPTIONS[(idx + 1) % SORT_OPTIONS.length];
    sortBy.value = next.key;
  }

  const sortLabel = SORT_OPTIONS.find(s => s.key === currentSort)?.label || '期限順';

  return (
    <div class="filter-bar">
      <button
        class={`filter-chip ${currentFilter === 'all' ? 'is-active' : ''}`}
        onClick={() => handleFilterChange('all')}
      >
        すべて
      </button>
      <button
        class={`filter-chip ${currentFilter === 'active' ? 'is-active' : ''}`}
        onClick={() => handleFilterChange('active')}
      >
        未完了
      </button>
      <button
        class={`filter-chip ${currentFilter === 'completed' ? 'is-active' : ''}`}
        onClick={() => handleFilterChange('completed')}
      >
        完了済み
      </button>

      <span class="filter-divider" />

      {cats.map(cat => (
        <button
          key={cat.id}
          class={`filter-chip ${currentCategory === cat.id ? 'is-active' : ''}`}
          onClick={() => handleCategoryToggle(cat.id)}
        >
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: cat.color,
            display: 'inline-block',
          }} />
          {cat.name}
        </button>
      ))}

      <button class="sort-btn" onClick={handleSortCycle}>
        <IconSort />
        {sortLabel}
      </button>
    </div>
  );
}
