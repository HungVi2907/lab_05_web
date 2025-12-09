/**
 * Exercises Demo Page - Showcase all exercises from Groups A-D
 */

import React, { Suspense, lazy, useState } from 'react';

// Lazy load exercise components
const UserList = lazy(() => import('../../exercises/A1-useReducer-FSM'));
const Cart = lazy(() => import('../../exercises/A2-Redux-cartSlice'));
const LaggyList = lazy(() => import('../../exercises/B1-useMemo-optimization'));
const TodoList = lazy(() => import('../../exercises/B2-useCallback'));
const CodeSplitting = lazy(() => import('../../exercises/B3-CodeSplitting'));
const TabsDemo = lazy(() => import('../../exercises/C1-CompoundTabs').then(m => ({ default: m.CompoundTabsDemo })));
const ModalDemo = lazy(() => import('../../exercises/C2-PortalModal').then(m => ({ default: m.PortalModalDemo })));
const ErrorBoundaryDemo = lazy(() => import('../../exercises/C3-ErrorBoundary').then(m => ({ default: m.ErrorBoundaryDemo })));
const LoginFormDemo = lazy(() => import('../../exercises/D1-IntegrationTesting').then(m => ({ default: m.LoginForm })));

interface Exercise {
  id: string;
  title: string;
  group: string;
  description: string;
  component: React.LazyExoticComponent<React.ComponentType>;
}

const exercises: Exercise[] = [
  {
    id: 'A1',
    title: 'useReducer FSM',
    group: 'A - State Management',
    description: 'Finite State Machine pattern for data fetching with useReducer',
    component: UserList,
  },
  {
    id: 'A2',
    title: 'Redux cartSlice',
    group: 'A - State Management',
    description: 'Redux Toolkit slice with async actions and memoized selectors',
    component: Cart,
  },
  {
    id: 'B1',
    title: 'useMemo Optimization',
    group: 'B - Performance',
    description: 'Optimizing expensive list rendering with useMemo and React.memo',
    component: LaggyList,
  },
  {
    id: 'B2',
    title: 'useCallback',
    group: 'B - Performance',
    description: 'Stabilizing callbacks with useCallback to prevent re-renders',
    component: TodoList,
  },
  {
    id: 'B3',
    title: 'Code Splitting',
    group: 'B - Performance',
    description: 'Route-based code splitting with React.lazy and Suspense',
    component: CodeSplitting,
  },
  {
    id: 'C1',
    title: 'Compound Tabs',
    group: 'C - Design Patterns',
    description: 'Compound component pattern for flexible tab interfaces',
    component: TabsDemo,
  },
  {
    id: 'C2',
    title: 'Portal Modal',
    group: 'C - Design Patterns',
    description: 'Modal component using React Portal for proper DOM placement',
    component: ModalDemo,
  },
  {
    id: 'C3',
    title: 'Error Boundary',
    group: 'C - Design Patterns',
    description: 'Error Boundary pattern for graceful error handling',
    component: ErrorBoundaryDemo,
  },
  {
    id: 'D1',
    title: 'Integration Testing',
    group: 'D - Testing',
    description: 'Login form with comprehensive integration tests',
    component: LoginFormDemo,
  },
];

const LoadingFallback: React.FC = () => (
  <div style={{ padding: '40px', textAlign: 'center' }}>
    <div className="loading-spinner"></div>
    <p>Loading exercise...</p>
  </div>
);

const ExercisesPage: React.FC = () => {
  const [activeExercise, setActiveExercise] = useState<string | null>(null);

  const groupedExercises = exercises.reduce((acc, ex) => {
    if (!acc[ex.group]) acc[ex.group] = [];
    acc[ex.group].push(ex);
    return acc;
  }, {} as Record<string, Exercise[]>);

  const currentExercise = exercises.find(e => e.id === activeExercise);

  return (
    <div className="exercises-page">
      <header style={{ marginBottom: '30px' }}>
        <h1>📚 React Exercises - Module 5</h1>
        <p style={{ color: '#666' }}>Advanced patterns and optimization techniques</p>
      </header>

      {!activeExercise ? (
        // Exercise Selection Grid
        <div>
          {Object.entries(groupedExercises).map(([group, exs]) => (
            <div key={group} style={{ marginBottom: '30px' }}>
              <h2 style={{ borderBottom: '2px solid #667eea', paddingBottom: '10px' }}>
                {group}
              </h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '20px',
                marginTop: '20px',
              }}>
                {exs.map(ex => (
                  <div
                    key={ex.id}
                    className="card"
                    style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
                    onClick={() => setActiveExercise(ex.id)}
                    onMouseOver={(e) => (e.currentTarget.style.transform = 'translateY(-4px)')}
                    onMouseOut={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                  >
                    <h3 style={{ margin: '0 0 10px 0', color: '#667eea' }}>
                      {ex.id}: {ex.title}
                    </h3>
                    <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                      {ex.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Active Exercise View
        <div>
          <button
            className="btn"
            onClick={() => setActiveExercise(null)}
            style={{ marginBottom: '20px' }}
          >
            ← Back to Exercises
          </button>
          
          <div className="card">
            <h2 style={{ marginTop: 0, color: '#667eea' }}>
              {currentExercise?.id}: {currentExercise?.title}
            </h2>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              {currentExercise?.description}
            </p>
            
            <div style={{ borderTop: '1px solid #eee', paddingTop: '20px' }}>
              <Suspense fallback={<LoadingFallback />}>
                {currentExercise && <currentExercise.component />}
              </Suspense>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExercisesPage;
