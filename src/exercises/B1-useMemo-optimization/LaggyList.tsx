/**
 * ============================================
 * B1 — Laggy List Optimization (useMemo + React.memo)
 * ============================================
 * 
 * WHAT: Tối ưu list 10,000 items bằng caching sorting + memoized row component
 * 
 * WHY:
 * - Sorting mỗi lần render gây lag
 * - Theme toggle không nên re-render list
 * - React DevTools Profiler để kiểm tra performance
 * 
 * HOW:
 * 1. const sorted = useMemo(() => sort(items), [items])
 * 2. Child component ListItem → wrap bằng React.memo
 * 3. Kiểm tra bằng React DevTools Profiler
 */

import React, { useState, useMemo, useCallback } from 'react';

// ============================================
// TYPE DEFINITIONS
// ============================================

interface Item {
  id: number;
  name: string;
  value: number;
  category: string;
}

interface ListItemProps {
  item: Item;
  onDelete: (id: number) => void;
  theme: 'light' | 'dark';
}

// ============================================
// GENERATE 10,000 ITEMS
// ============================================

const generateItems = (count: number): Item[] => {
  const categories = ['Electronics', 'Books', 'Clothing', 'Food', 'Sports'];
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    name: `Item ${index + 1}`,
    value: Math.floor(Math.random() * 1000) + 1,
    category: categories[Math.floor(Math.random() * categories.length)],
  }));
};

// ============================================
// MEMOIZED LIST ITEM COMPONENT
// ============================================

/**
 * React.memo prevents re-renders when props haven't changed
 * This is crucial for lists with many items
 */
const ListItem = React.memo<ListItemProps>(({ item, onDelete, theme }) => {
  // Log để demo re-render (bỏ comment để xem)
  // console.log(`Rendering item ${item.id}`);

  const styles = {
    light: { background: '#fff', color: '#333' },
    dark: { background: '#333', color: '#fff' },
  };

  return (
    <div
      className="list-item"
      style={{
        ...styles[theme],
        display: 'flex',
        justifyContent: 'space-between',
        padding: '10px 15px',
        borderBottom: '1px solid #eee',
      }}
    >
      <div>
        <strong>{item.name}</strong>
        <span style={{ marginLeft: '10px', color: '#666', fontSize: '12px' }}>
          {item.category}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <span style={{ fontWeight: 'bold' }}>${item.value}</span>
        <button
          className="btn btn-danger"
          onClick={() => onDelete(item.id)}
          style={{ padding: '5px 10px', fontSize: '12px' }}
        >
          Delete
        </button>
      </div>
    </div>
  );
});

ListItem.displayName = 'ListItem';

// ============================================
// SORT TYPES
// ============================================

type SortField = 'name' | 'value' | 'category';
type SortOrder = 'asc' | 'desc';

// ============================================
// MAIN COMPONENT
// ============================================

const LaggyList: React.FC = () => {
  const [items, setItems] = useState<Item[]>(() => generateItems(10000));
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [renderCount, setRenderCount] = useState(0);

  // Track renders
  React.useEffect(() => {
    setRenderCount((c) => c + 1);
  });

  // ============================================
  // useMemo for expensive sorting operation
  // ============================================
  const sortedItems = useMemo(() => {
    console.log('🔄 Sorting items...');
    const startTime = performance.now();

    const sorted = [...items].sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'value':
          comparison = a.value - b.value;
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    const endTime = performance.now();
    console.log(`✅ Sorting completed in ${(endTime - startTime).toFixed(2)}ms`);

    return sorted;
  }, [items, sortField, sortOrder]); // Only re-sort when these change

  // ============================================
  // useMemo for filtered items
  // ============================================
  const filteredItems = useMemo(() => {
    console.log('🔍 Filtering items...');
    if (filterCategory === 'all') return sortedItems;
    return sortedItems.filter((item) => item.category === filterCategory);
  }, [sortedItems, filterCategory]);

  // ============================================
  // useCallback for stable handler reference
  // ============================================
  const handleDelete = useCallback((id: number) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  }, []);

  // Toggle theme (doesn't affect items)
  const toggleTheme = () => {
    setTheme((t) => (t === 'light' ? 'dark' : 'light'));
  };

  // Categories for filter
  const categories = ['all', 'Electronics', 'Books', 'Clothing', 'Food', 'Sports'];

  return (
    <div className="card">
      <h2 className="section-title">B1: Laggy List Optimization</h2>

      {/* Stats */}
      <div style={{ marginBottom: '20px', padding: '15px', background: '#f0f0f0', borderRadius: '8px' }}>
        <p><strong>Total Items:</strong> {items.length.toLocaleString()}</p>
        <p><strong>Displayed Items:</strong> {filteredItems.length.toLocaleString()}</p>
        <p><strong>Render Count:</strong> {renderCount}</p>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginBottom: '20px' }}>
        {/* Theme Toggle */}
        <button className="btn btn-secondary" onClick={toggleTheme}>
          Toggle Theme: {theme}
        </button>

        {/* Sort Controls */}
        <select
          className="input-field"
          style={{ width: 'auto' }}
          value={sortField}
          onChange={(e) => setSortField(e.target.value as SortField)}
        >
          <option value="name">Sort by Name</option>
          <option value="value">Sort by Value</option>
          <option value="category">Sort by Category</option>
        </select>

        <button
          className="btn btn-primary"
          onClick={() => setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'))}
        >
          Order: {sortOrder === 'asc' ? '↑' : '↓'}
        </button>

        {/* Filter */}
        <select
          className="input-field"
          style={{ width: 'auto' }}
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat === 'all' ? 'All Categories' : cat}
            </option>
          ))}
        </select>
      </div>

      {/* Technical Info */}
      <div style={{ marginBottom: '20px', padding: '15px', background: '#e8f4ff', borderRadius: '8px' }}>
        <h4>📝 Optimization Techniques:</h4>
        <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
          <li><code>useMemo</code> - Caches sorted array, only recalculates when items/sort changes</li>
          <li><code>React.memo</code> - ListItem won't re-render if props unchanged</li>
          <li><code>useCallback</code> - Stable handleDelete reference</li>
          <li>Theme toggle doesn't trigger re-sort (useMemo dependency)</li>
        </ul>
      </div>

      {/* List Container */}
      <div
        className="list-container"
        style={{
          maxHeight: '400px',
          overflow: 'auto',
          border: '1px solid #ddd',
          borderRadius: '8px',
        }}
      >
        {filteredItems.slice(0, 100).map((item) => (
          <ListItem
            key={item.id}
            item={item}
            onDelete={handleDelete}
            theme={theme}
          />
        ))}
        {filteredItems.length > 100 && (
          <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
            Showing first 100 of {filteredItems.length.toLocaleString()} items (virtualization recommended for full list)
          </div>
        )}
      </div>
    </div>
  );
};

export default LaggyList;
