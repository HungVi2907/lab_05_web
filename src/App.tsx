/**
 * Main App Component
 * Capstone Project - Lab 05 Module 5
 *
 * Features demonstrated:
 * - E1: Redux store setup
 * - E2: Protected routing with PrivateRoute
 * - E6: Lazy loading pages with Suspense
 * - Full routing configuration
 */

import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './capstone/store';
import { useAppSelector, useAppDispatch } from './capstone/store';
import { logout, selectIsAuthenticated, selectCurrentUser } from './capstone/store/slices';
import { PrivateRoute } from './capstone/components/PrivateRoute';
import { ErrorBoundary } from './exercises/C3-ErrorBoundary/ErrorBoundary';

// E6: Lazy loading pages
const LoginPage = lazy(() => import('./capstone/pages/LoginPage').then(m => ({ default: m.default })));
const DashboardPage = lazy(() => import('./capstone/pages/DashboardPage').then(m => ({ default: m.default })));
const InventoryPage = lazy(() => import('./capstone/pages/InventoryPage').then(m => ({ default: m.default })));
const AnalyticsPage = lazy(() => import('./capstone/pages/AnalyticsPage').then(m => ({ default: m.default })));
const ExercisesPage = lazy(() => import('./capstone/pages/ExercisesPage').then(m => ({ default: m.default })));

// Loading fallback
const LoadingFallback: React.FC = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    flexDirection: 'column',
    gap: '20px',
  }}>
    <div className="loading-spinner" style={{ width: '50px', height: '50px' }}></div>
    <p>Loading...</p>
  </div>
);

// Navigation component
const Navigation: React.FC = () => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectCurrentUser);
  const dispatch = useAppDispatch();
  const location = useLocation();

  if (!isAuthenticated) return null;

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '0 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '60px',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
        <Link to="/dashboard" style={{
          color: 'white',
          textDecoration: 'none',
          fontWeight: 'bold',
          fontSize: '20px',
        }}>
          🏢 Enterprise
        </Link>
        
        <div style={{ display: 'flex', gap: '5px' }}>
          <Link
            to="/dashboard"
            style={{
              color: 'white',
              textDecoration: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              background: isActive('/dashboard') ? 'rgba(255,255,255,0.2)' : 'transparent',
            }}
          >
            Dashboard
          </Link>
          <Link
            to="/inventory"
            style={{
              color: 'white',
              textDecoration: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              background: isActive('/inventory') ? 'rgba(255,255,255,0.2)' : 'transparent',
            }}
          >
            Inventory
          </Link>
          <Link
            to="/analytics"
            style={{
              color: 'white',
              textDecoration: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              background: isActive('/analytics') ? 'rgba(255,255,255,0.2)' : 'transparent',
            }}
          >
            Analytics
          </Link>
          <Link
            to="/exercises"
            style={{
              color: 'white',
              textDecoration: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              background: isActive('/exercises') ? 'rgba(255,255,255,0.2)' : 'transparent',
            }}
          >
            📚 Exercises
          </Link>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <span style={{ color: 'white', opacity: 0.9 }}>
          👤 {user?.name} ({user?.role})
        </span>
        <button
          onClick={() => dispatch(logout())}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

// Main layout wrapper
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fa' }}>
      <Navigation />
      <main style={{ padding: '30px', maxWidth: '1400px', margin: '0 auto' }}>
        {children}
      </main>
    </div>
  );
};

// App Routes component
const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Routes - E2: PrivateRoute */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Layout>
                <DashboardPage />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/inventory"
          element={
            <PrivateRoute>
              <Layout>
                <InventoryPage />
              </Layout>
            </PrivateRoute>
          }
        />

        {/* E9: Analytics with Error Boundary */}
        <Route
          path="/analytics"
          element={
            <PrivateRoute requiredRole="admin">
              <Layout>
                <ErrorBoundary
                  fallback={
                    <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
                      <h2>⚠️ Analytics Error</h2>
                      <p>There was an error loading the analytics page.</p>
                    </div>
                  }
                >
                  <AnalyticsPage />
                </ErrorBoundary>
              </Layout>
            </PrivateRoute>
          }
        />

        {/* Exercises Demo Page */}
        <Route
          path="/exercises"
          element={
            <PrivateRoute>
              <Layout>
                <ExercisesPage />
              </Layout>
            </PrivateRoute>
          }
        />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
};

// Root App component
const App: React.FC = () => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </Provider>
  );
};

export default App;
