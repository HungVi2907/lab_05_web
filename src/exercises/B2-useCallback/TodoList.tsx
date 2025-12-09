/**
 * ============================================
 * B2 — useCallback for handler stabilization
 * ============================================
 * 
 * WHAT: Memo hóa hàm handleDelete & các event handler khác
 * 
 * WHY:
 * - Không làm thế → function mới mỗi render → phá React.memo row
 * - Stable reference cho dependency arrays
 * - Performance optimization cho child components
 * 
 * HOW:
 * - useCallback với dependency array phù hợp
 * - Kết hợp với React.memo cho child components
 */

import React, { useState, useCallback, memo } from 'react';

// ============================================
// TYPE DEFINITIONS
// ============================================

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (id: number, text: string) => void;
}

// ============================================
// MEMOIZED TODO ITEM
// ============================================

const TodoItem = memo<TodoItemProps>(({ todo, onToggle, onDelete, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);

  // Track renders
  console.log(`📝 TodoItem ${todo.id} rendered`);

  const handleSave = () => {
    onEdit(todo.id, editText);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditText(todo.text);
    setIsEditing(false);
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '12px 15px',
        borderBottom: '1px solid #eee',
        background: todo.completed ? '#f0fff0' : '#fff',
      }}
    >
      {isEditing ? (
        <>
          <input
            type="text"
            className="input-field"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            style={{ flex: 1, marginRight: '10px', marginBottom: 0 }}
          />
          <button className="btn btn-primary" onClick={handleSave} style={{ marginRight: '5px' }}>
            Save
          </button>
          <button className="btn btn-secondary" onClick={handleCancel}>
            Cancel
          </button>
        </>
      ) : (
        <>
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => onToggle(todo.id)}
            style={{ marginRight: '15px', width: '18px', height: '18px' }}
          />
          <span
            style={{
              flex: 1,
              textDecoration: todo.completed ? 'line-through' : 'none',
              color: todo.completed ? '#888' : '#333',
            }}
          >
            {todo.text}
          </span>
          <button
            className="btn btn-secondary"
            onClick={() => setIsEditing(true)}
            style={{ marginRight: '5px', padding: '5px 10px' }}
          >
            Edit
          </button>
          <button
            className="btn btn-danger"
            onClick={() => onDelete(todo.id)}
            style={{ padding: '5px 10px' }}
          >
            Delete
          </button>
        </>
      )}
    </div>
  );
});

TodoItem.displayName = 'TodoItem';

// ============================================
// RENDER COUNTER COMPONENT
// ============================================

interface RenderCounterProps {
  label: string;
}

const RenderCounter: React.FC<RenderCounterProps> = memo(({ label }) => {
  const [count, setCount] = useState(0);

  React.useEffect(() => {
    setCount((c) => c + 1);
  });

  return (
    <span style={{ fontSize: '12px', color: '#666' }}>
      {label}: {count} renders
    </span>
  );
});

RenderCounter.displayName = 'RenderCounter';

// ============================================
// MAIN COMPONENT
// ============================================

const TodoList: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([
    { id: 1, text: 'Learn useCallback', completed: false },
    { id: 2, text: 'Understand React.memo', completed: false },
    { id: 3, text: 'Build optimized components', completed: false },
    { id: 4, text: 'Test performance', completed: false },
    { id: 5, text: 'Deploy application', completed: false },
  ]);
  const [newTodo, setNewTodo] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // ============================================
  // STABILIZED CALLBACKS WITH useCallback
  // ============================================

  /**
   * handleToggle - Stable reference với useCallback
   * Chỉ được tạo lại khi component mount
   */
  const handleToggle = useCallback((id: number) => {
    setTodos((prevTodos) =>
      prevTodos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  }, []); // Empty deps = stable forever

  /**
   * handleDelete - Stable reference với useCallback
   */
  const handleDelete = useCallback((id: number) => {
    setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));
  }, []); // Empty deps = stable forever

  /**
   * handleEdit - Stable reference với useCallback
   */
  const handleEdit = useCallback((id: number, text: string) => {
    setTodos((prevTodos) =>
      prevTodos.map((todo) =>
        todo.id === id ? { ...todo, text } : todo
      )
    );
  }, []); // Empty deps = stable forever

  /**
   * handleAdd - Không cần useCallback vì không pass cho child
   */
  const handleAdd = () => {
    if (newTodo.trim()) {
      setTodos((prev) => [
        ...prev,
        { id: Date.now(), text: newTodo.trim(), completed: false },
      ]);
      setNewTodo('');
    }
  };

  const toggleTheme = () => {
    setTheme((t) => (t === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className="card">
      <h2 className="section-title">B2: useCallback Handler Stabilization</h2>

      {/* Stats */}
      <div style={{ 
        marginBottom: '20px', 
        padding: '15px', 
        background: '#f0f0f0', 
        borderRadius: '8px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <p><strong>Total Todos:</strong> {todos.length}</p>
          <p><strong>Completed:</strong> {todos.filter(t => t.completed).length}</p>
        </div>
        <RenderCounter label="Parent" />
      </div>

      {/* Theme Toggle - This won't re-render TodoItems */}
      <div style={{ marginBottom: '20px' }}>
        <button className="btn btn-secondary" onClick={toggleTheme}>
          Theme: {theme} (toggle doesn't re-render items)
        </button>
      </div>

      {/* Add Todo */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input
          type="text"
          className="input-field"
          placeholder="Add new todo..."
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          style={{ flex: 1, marginBottom: 0 }}
        />
        <button className="btn btn-primary" onClick={handleAdd}>
          Add
        </button>
      </div>

      {/* Technical Info */}
      <div style={{ marginBottom: '20px', padding: '15px', background: '#e8f4ff', borderRadius: '8px' }}>
        <h4>📝 useCallback Optimization:</h4>
        <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
          <li><code>handleToggle</code> - Stable reference, uses functional update</li>
          <li><code>handleDelete</code> - Stable reference, uses functional update</li>
          <li><code>handleEdit</code> - Stable reference, uses functional update</li>
          <li>Theme changes won't cause TodoItem re-renders</li>
          <li>Check console for render logs</li>
        </ul>
      </div>

      {/* Todo List */}
      <div style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
        {todos.length === 0 ? (
          <p style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
            No todos yet. Add one above!
          </p>
        ) : (
          todos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={handleToggle}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          ))
        )}
      </div>

      {/* Without useCallback comparison */}
      <div style={{ marginTop: '20px', padding: '15px', background: '#fff5f5', borderRadius: '8px' }}>
        <h4>⚠️ Without useCallback:</h4>
        <pre style={{ background: '#f8f8f8', padding: '10px', borderRadius: '4px', overflow: 'auto' }}>
{`// Bad: New function every render
const handleDelete = (id) => {
  setTodos(todos.filter(t => t.id !== id));
};

// Good: Stable reference
const handleDelete = useCallback((id) => {
  setTodos(prev => prev.filter(t => t.id !== id));
}, []);`}
        </pre>
      </div>
    </div>
  );
};

export default TodoList;
