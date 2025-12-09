/**
 * ============================================
 * B3 — Route-based Code Splitting
 * ============================================
 * 
 * WHAT: Lazy load AdminPanel hoặc Analytics Page
 * 
 * WHY:
 * - Giảm JavaScript bundle ban đầu
 * - Tải module nặng khi thật sự cần
 * - Cải thiện initial load time
 * 
 * HOW:
 * - React.lazy(() => import('./Component'))
 * - Suspense với fallback loading
 */

import React, { Suspense, lazy, useState } from 'react';

// ============================================
// LOADING COMPONENT
// ============================================

const LoadingSpinner: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    color: '#666',
  }}>
    <div className="loading-spinner" style={{ width: '40px', height: '40px' }}></div>
    <p style={{ marginTop: '15px' }}>{message}</p>
  </div>
);

// ============================================
// LAZY LOADED COMPONENTS
// ============================================

// Simulate code splitting with dynamic imports
const AdminPanel = lazy(() => {
  // Simulate network delay
  return new Promise<{ default: React.FC }>(resolve => {
    setTimeout(() => {
      resolve({
        default: () => (
          <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
            <h3>🔐 Admin Panel</h3>
            <p>This component was lazy loaded!</p>
            <div style={{ marginTop: '15px' }}>
              <h4>Admin Features:</h4>
              <ul>
                <li>User Management</li>
                <li>System Settings</li>
                <li>Analytics Dashboard</li>
                <li>Security Controls</li>
              </ul>
            </div>
            <div style={{ 
              marginTop: '20px', 
              padding: '15px', 
              background: '#e8f4ff', 
              borderRadius: '4px' 
            }}>
              <strong>Bundle Info:</strong>
              <p style={{ fontSize: '14px', marginTop: '5px' }}>
                This module would be in a separate chunk in production build.
                Check Network tab to see lazy loading in action.
              </p>
            </div>
          </div>
        )
      });
    }, 1500); // 1.5s delay to show loading
  });
});

const AnalyticsPage = lazy(() => {
  return new Promise<{ default: React.FC }>(resolve => {
    setTimeout(() => {
      resolve({
        default: () => (
          <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
            <h3>📊 Analytics Page</h3>
            <p>Heavy analytics component loaded on demand!</p>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(3, 1fr)', 
              gap: '15px',
              marginTop: '20px' 
            }}>
              <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                <h4 style={{ color: '#0066cc' }}>1,234</h4>
                <p style={{ fontSize: '14px', color: '#666' }}>Total Users</p>
              </div>
              <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                <h4 style={{ color: '#28a745' }}>$45,678</h4>
                <p style={{ fontSize: '14px', color: '#666' }}>Revenue</p>
              </div>
              <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                <h4 style={{ color: '#dc3545' }}>89%</h4>
                <p style={{ fontSize: '14px', color: '#666' }}>Conversion</p>
              </div>
            </div>
            <div style={{ 
              marginTop: '20px', 
              padding: '15px', 
              background: '#fff5e6', 
              borderRadius: '4px' 
            }}>
              <strong>Performance Note:</strong>
              <p style={{ fontSize: '14px', marginTop: '5px' }}>
                Chart libraries (Chart.js, Recharts) would be bundled with this component,
                only loaded when user navigates to Analytics.
              </p>
            </div>
          </div>
        )
      });
    }, 2000); // 2s delay to show loading
  });
});

const SettingsPage = lazy(() => {
  return new Promise<{ default: React.FC }>(resolve => {
    setTimeout(() => {
      resolve({
        default: () => (
          <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
            <h3>⚙️ Settings Page</h3>
            <p>Settings component with lazy loading!</p>
            <div style={{ marginTop: '20px' }}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input type="checkbox" defaultChecked />
                  Enable notifications
                </label>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input type="checkbox" />
                  Dark mode
                </label>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input type="checkbox" defaultChecked />
                  Auto-save
                </label>
              </div>
            </div>
          </div>
        )
      });
    }, 1000);
  });
});

// ============================================
// NAVIGATION TABS
// ============================================

type TabType = 'home' | 'admin' | 'analytics' | 'settings';

// ============================================
// MAIN COMPONENT
// ============================================

const CodeSplitting: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [loadHistory, setLoadHistory] = useState<string[]>([]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    if (tab !== 'home' && !loadHistory.includes(tab)) {
      setLoadHistory([...loadHistory, tab]);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
            <h3>🏠 Home Page</h3>
            <p>This is the home page - loaded immediately (not lazy loaded).</p>
            <div style={{ marginTop: '15px', padding: '15px', background: '#e8f4ff', borderRadius: '4px' }}>
              <strong>Try clicking other tabs!</strong>
              <p style={{ fontSize: '14px', marginTop: '5px' }}>
                Admin, Analytics, and Settings are lazy loaded.
                Watch the loading spinner appear.
              </p>
            </div>
          </div>
        );
      case 'admin':
        return (
          <Suspense fallback={<LoadingSpinner message="Loading Admin Panel..." />}>
            <AdminPanel />
          </Suspense>
        );
      case 'analytics':
        return (
          <Suspense fallback={<LoadingSpinner message="Loading Analytics..." />}>
            <AnalyticsPage />
          </Suspense>
        );
      case 'settings':
        return (
          <Suspense fallback={<LoadingSpinner message="Loading Settings..." />}>
            <SettingsPage />
          </Suspense>
        );
      default:
        return null;
    }
  };

  return (
    <div className="card">
      <h2 className="section-title">B3: Route-based Code Splitting</h2>

      {/* Load History */}
      <div style={{ marginBottom: '20px', padding: '15px', background: '#f0f0f0', borderRadius: '8px' }}>
        <strong>Loaded Modules:</strong>{' '}
        {loadHistory.length === 0 ? (
          <span style={{ color: '#666' }}>None yet - click a tab to lazy load</span>
        ) : (
          loadHistory.map((mod, i) => (
            <span key={mod} style={{ 
              display: 'inline-block',
              background: '#28a745', 
              color: 'white', 
              padding: '2px 8px', 
              borderRadius: '4px',
              marginLeft: '5px',
              fontSize: '12px'
            }}>
              {mod}
            </span>
          ))
        )}
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '5px', marginBottom: '20px' }}>
        {(['home', 'admin', 'analytics', 'settings'] as TabType[]).map((tab) => (
          <button
            key={tab}
            className={`btn ${activeTab === tab ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => handleTabChange(tab)}
            style={{ textTransform: 'capitalize' }}
          >
            {tab}
            {tab !== 'home' && !loadHistory.includes(tab) && (
              <span style={{ 
                fontSize: '10px', 
                marginLeft: '5px',
                opacity: 0.7 
              }}>
                (lazy)
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div style={{ minHeight: '300px' }}>
        {renderContent()}
      </div>

      {/* Technical Info */}
      <div style={{ marginTop: '20px', padding: '15px', background: '#e8f4ff', borderRadius: '8px' }}>
        <h4>📝 Code Splitting Benefits:</h4>
        <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
          <li>Smaller initial bundle size</li>
          <li>Faster initial page load</li>
          <li>Load code only when needed</li>
          <li>Better caching (unchanged chunks stay cached)</li>
        </ul>
        <pre style={{ 
          marginTop: '15px',
          background: '#f8f8f8', 
          padding: '10px', 
          borderRadius: '4px', 
          overflow: 'auto',
          fontSize: '13px' 
        }}>
{`// Usage pattern
const AdminPanel = React.lazy(() => import('./AdminPanel'));

<Suspense fallback={<Loading />}>
  <AdminPanel />
</Suspense>`}
        </pre>
      </div>
    </div>
  );
};

export default CodeSplitting;
