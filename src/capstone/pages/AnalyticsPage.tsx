/**
 * ============================================
 * E6 + E9 — Lazy Load Analytics with Error Boundary
 * ============================================
 * 
 * E6 - WHAT: Analytics rất nặng (chart libs)
 * E6 - WHY: Giảm initial load time
 * E6 - HOW: lazy(() => import('Analytics')) + Suspense
 * 
 * E9 - WHAT: Bảo vệ analytics widget
 * E9 - WHY: Chart hay crash → tránh sập dashboard
 * E9 - HOW: <ErrorBoundary><Analytics/></ErrorBoundary>
 */

import React, { Suspense, lazy, useState } from 'react';
import { ErrorBoundary } from '../../exercises/C3-ErrorBoundary';

// ============================================
// LOADING COMPONENT
// ============================================

const AnalyticsLoading: React.FC = () => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px',
    background: '#f8f9fa',
    borderRadius: '8px',
  }}>
    <div className="loading-spinner" style={{ width: '50px', height: '50px' }}></div>
    <p style={{ marginTop: '20px', color: '#666' }}>Loading Analytics...</p>
    <p style={{ fontSize: '14px', color: '#999' }}>This might take a moment...</p>
  </div>
);

// ============================================
// LAZY LOADED ANALYTICS COMPONENT
// ============================================

const AnalyticsContent = lazy(() => {
  // Simulate loading heavy chart library
  return new Promise<{ default: React.FC }>(resolve => {
    setTimeout(() => {
      resolve({
        default: () => (
          <div>
            {/* Analytics Header */}
            <div style={{ marginBottom: '30px' }}>
              <h2 style={{ margin: 0 }}>📊 Analytics Dashboard</h2>
              <p style={{ color: '#666', marginTop: '5px' }}>
                Real-time business insights and metrics
              </p>
            </div>

            {/* KPI Cards */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(4, 1fr)', 
              gap: '20px',
              marginBottom: '30px'
            }}>
              <KPICard 
                title="Total Revenue" 
                value="$124,563" 
                change="+12.5%" 
                positive={true}
                icon="💰"
              />
              <KPICard 
                title="Orders" 
                value="1,234" 
                change="+8.2%" 
                positive={true}
                icon="📦"
              />
              <KPICard 
                title="Customers" 
                value="5,678" 
                change="+15.3%" 
                positive={true}
                icon="👥"
              />
              <KPICard 
                title="Return Rate" 
                value="2.4%" 
                change="-0.5%" 
                positive={true}
                icon="↩️"
              />
            </div>

            {/* Charts Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '30px' }}>
              <ChartPlaceholder title="Revenue Over Time" type="line" />
              <ChartPlaceholder title="Sales by Category" type="pie" />
            </div>

            {/* Bottom Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <ChartPlaceholder title="Top Products" type="bar" />
              <ChartPlaceholder title="Customer Demographics" type="donut" />
            </div>
          </div>
        )
      });
    }, 2000); // 2 second delay to show lazy loading
  });
});

// ============================================
// KPI CARD COMPONENT
// ============================================

interface KPICardProps {
  title: string;
  value: string;
  change: string;
  positive: boolean;
  icon: string;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, change, positive, icon }) => (
  <div style={{
    background: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: '14px', color: '#666' }}>{title}</span>
      <span style={{ fontSize: '24px' }}>{icon}</span>
    </div>
    <div style={{ marginTop: '10px' }}>
      <span style={{ fontSize: '28px', fontWeight: 'bold' }}>{value}</span>
    </div>
    <div style={{ marginTop: '10px' }}>
      <span style={{ 
        color: positive ? '#28a745' : '#dc3545',
        fontSize: '14px',
        fontWeight: 'bold'
      }}>
        {change}
      </span>
      <span style={{ color: '#666', fontSize: '12px', marginLeft: '5px' }}>
        vs last month
      </span>
    </div>
  </div>
);

// ============================================
// CHART PLACEHOLDER COMPONENT
// ============================================

interface ChartPlaceholderProps {
  title: string;
  type: 'line' | 'bar' | 'pie' | 'donut';
}

const ChartPlaceholder: React.FC<ChartPlaceholderProps> = ({ title, type }) => {
  const chartIcons = {
    line: '📈',
    bar: '📊',
    pie: '🥧',
    donut: '🍩',
  };

  return (
    <div style={{
      background: 'white',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    }}>
      <h4 style={{ margin: '0 0 15px 0' }}>{title}</h4>
      <div style={{
        height: '200px',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
      }}>
        <span style={{ fontSize: '48px' }}>{chartIcons[type]}</span>
        <p style={{ color: '#666', marginTop: '10px' }}>
          {type.charAt(0).toUpperCase() + type.slice(1)} Chart
        </p>
        <p style={{ fontSize: '12px', color: '#999' }}>
          (In production, use Chart.js or Recharts)
        </p>
      </div>
    </div>
  );
};

// ============================================
// BUGGY CHART (for testing Error Boundary)
// ============================================

interface BuggyChartProps {
  shouldCrash?: boolean;
}

const BuggyChart: React.FC<BuggyChartProps> = ({ shouldCrash = false }) => {
  if (shouldCrash) {
    throw new Error('Chart rendering failed! Data format invalid.');
  }

  return (
    <div style={{
      background: 'white',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    }}>
      <h4>Working Chart</h4>
      <div style={{
        height: '150px',
        background: '#e8f4ff',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        📊 Chart is working fine!
      </div>
    </div>
  );
};

// ============================================
// MAIN ANALYTICS PAGE WITH ERROR BOUNDARY
// ============================================

const AnalyticsPage: React.FC = () => {
  const [crashChart, setCrashChart] = useState(false);
  const [key, setKey] = useState(0);

  return (
    <div className="card">
      <h2 className="section-title">E6 + E9: Lazy Analytics with Error Boundary</h2>

      {/* Demo Controls */}
      <div style={{ marginBottom: '20px', padding: '15px', background: '#f0f0f0', borderRadius: '8px' }}>
        <h4>Demo Controls:</h4>
        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <button 
            className="btn btn-danger" 
            onClick={() => setCrashChart(true)}
          >
            Crash Chart Widget
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={() => {
              setCrashChart(false);
              setKey(k => k + 1);
            }}
          >
            Reset All
          </button>
        </div>
      </div>

      {/* Error Boundary Protected Chart */}
      <div style={{ marginBottom: '20px' }}>
        <h4>Protected Widget (with Error Boundary):</h4>
        <ErrorBoundary
          key={key}
          fallback={
            <div style={{
              padding: '40px',
              textAlign: 'center',
              background: '#fff5f5',
              borderRadius: '8px',
              border: '1px solid #ffcccc',
            }}>
              <h3 style={{ color: '#dc3545' }}>📊 Chart Failed to Load</h3>
              <p>The analytics chart encountered an error.</p>
              <button 
                className="btn btn-primary" 
                onClick={() => {
                  setCrashChart(false);
                  setKey(k => k + 1);
                }}
                style={{ marginTop: '15px' }}
              >
                Retry
              </button>
            </div>
          }
        >
          <BuggyChart shouldCrash={crashChart} />
        </ErrorBoundary>
      </div>

      {/* Lazy Loaded Analytics */}
      <div>
        <h4>Lazy Loaded Analytics (2s simulated delay):</h4>
        <Suspense fallback={<AnalyticsLoading />}>
          <ErrorBoundary>
            <AnalyticsContent />
          </ErrorBoundary>
        </Suspense>
      </div>

      {/* Technical Info */}
      <div style={{ marginTop: '30px', padding: '15px', background: '#e8f4ff', borderRadius: '8px' }}>
        <h4>📝 Implementation Notes:</h4>
        <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
          <li><code>React.lazy()</code> - Code splitting for Analytics</li>
          <li><code>Suspense</code> - Loading fallback during chunk load</li>
          <li><code>ErrorBoundary</code> - Catches chart rendering errors</li>
          <li>Isolation - Chart crash doesn't affect rest of dashboard</li>
        </ul>
      </div>
    </div>
  );
};

export default AnalyticsPage;
