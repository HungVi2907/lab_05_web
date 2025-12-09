/**
 * ============================================
 * C3 — Error Boundaries
 * ============================================
 * 
 * WHAT: Dùng ErrorBoundary wrapper → bắt runtime error từ child
 * 
 * WHY:
 * - Không crash toàn app khi có lỗi
 * - Bắt buộc dùng class component (hoặc library react-error-boundary)
 * - Hiển thị fallback UI thay vì blank screen
 * - Enterprise-grade error handling
 * 
 * HOW:
 * 1. Tạo Bomb component: throw new Error("Boom")
 * 2. Bọc Bomb vào ErrorBoundary
 * 3. Render fallback UI khi lỗi xảy ra
 */

import React, { Component, ReactNode, useState } from 'react';

// ============================================
// ERROR BOUNDARY CLASS COMPONENT
// ============================================

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so next render shows fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log error to error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({ errorInfo });
    
    // Call optional error handler
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="error-boundary-fallback">
          <h2>⚠️ Something went wrong</h2>
          <p style={{ marginTop: '10px', color: '#666' }}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          {this.state.errorInfo && (
            <details style={{ marginTop: '15px', textAlign: 'left' }}>
              <summary style={{ cursor: 'pointer', color: '#0066cc' }}>
                View error details
              </summary>
              <pre
                style={{
                  marginTop: '10px',
                  padding: '10px',
                  background: '#f8f8f8',
                  borderRadius: '4px',
                  overflow: 'auto',
                  fontSize: '12px',
                  maxHeight: '200px',
                }}
              >
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
          <button
            className="btn btn-primary"
            onClick={this.handleRetry}
            style={{ marginTop: '20px' }}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// ============================================
// BOMB COMPONENT (intentionally throws error)
// ============================================

interface BombProps {
  shouldExplode?: boolean;
}

const Bomb: React.FC<BombProps> = ({ shouldExplode = true }) => {
  if (shouldExplode) {
    throw new Error('💥 BOOM! The bomb exploded!');
  }
  return <div>🎉 The bomb is safe!</div>;
};

// ============================================
// BUGGY COUNTER (throws on specific value)
// ============================================

interface BuggyCounterProps {
  throwOnValue?: number;
}

const BuggyCounter: React.FC<BuggyCounterProps> = ({ throwOnValue = 5 }) => {
  const [count, setCount] = useState(0);

  if (count === throwOnValue) {
    throw new Error(`💥 Counter crashed at ${throwOnValue}!`);
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <p style={{ fontSize: '48px', margin: '20px 0' }}>{count}</p>
      <p style={{ color: '#666', marginBottom: '15px' }}>
        Click to {throwOnValue} to trigger error
      </p>
      <button
        className="btn btn-primary"
        onClick={() => setCount((c) => c + 1)}
      >
        Count: {count}
      </button>
    </div>
  );
};

// ============================================
// ASYNC ERROR COMPONENT
// ============================================

const AsyncErrorComponent: React.FC = () => {
  const [shouldThrow, setShouldThrow] = useState(false);

  // This will throw during render
  if (shouldThrow) {
    throw new Error('💥 Async operation failed!');
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <p style={{ marginBottom: '15px' }}>Simulates async error during render</p>
      <button
        className="btn btn-danger"
        onClick={() => setShouldThrow(true)}
      >
        Trigger Render Error
      </button>
    </div>
  );
};

// ============================================
// DEMO COMPONENT
// ============================================

const ErrorBoundaryDemo: React.FC = () => {
  const [showBomb, setShowBomb] = useState(false);
  const [key, setKey] = useState(0);

  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // In production, send to error tracking service
    console.log('Error logged:', {
      error: error.message,
      componentStack: errorInfo.componentStack,
    });
  };

  return (
    <div className="card">
      <h2 className="section-title">C3: Error Boundaries</h2>

      {/* Example 1: Bomb */}
      <div style={{ marginBottom: '30px' }}>
        <h3>Example 1: Bomb Component</h3>
        <p style={{ color: '#666', marginBottom: '15px' }}>
          Click to mount a component that throws immediately
        </p>
        
        <button
          className="btn btn-danger"
          onClick={() => setShowBomb(true)}
          style={{ marginBottom: '15px' }}
        >
          Activate Bomb 💣
        </button>

        <ErrorBoundary
          key={`bomb-${key}`}
          onError={handleError}
          fallback={
            <div className="error-boundary-fallback">
              <h3>💥 Bomb Exploded!</h3>
              <p>The bomb component crashed.</p>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setShowBomb(false);
                  setKey((k) => k + 1);
                }}
                style={{ marginTop: '15px' }}
              >
                Reset
              </button>
            </div>
          }
        >
          {showBomb ? <Bomb /> : <div style={{ padding: '20px', background: '#f0f0f0', borderRadius: '8px' }}>Bomb is disarmed 🕊️</div>}
        </ErrorBoundary>
      </div>

      {/* Example 2: Buggy Counter */}
      <div style={{ marginBottom: '30px' }}>
        <h3>Example 2: Buggy Counter</h3>
        <p style={{ color: '#666', marginBottom: '15px' }}>
          Counter crashes when it reaches 5
        </p>
        
        <ErrorBoundary
          key={`counter-${key}`}
          onError={handleError}
        >
          <div style={{ padding: '20px', background: '#f0f0f0', borderRadius: '8px' }}>
            <BuggyCounter throwOnValue={5} />
          </div>
        </ErrorBoundary>
      </div>

      {/* Example 3: Isolated Errors */}
      <div style={{ marginBottom: '30px' }}>
        <h3>Example 3: Isolated Error Boundaries</h3>
        <p style={{ color: '#666', marginBottom: '15px' }}>
          Each widget has its own error boundary - one crash doesn't affect others
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
          <ErrorBoundary>
            <div style={{ padding: '15px', background: '#e8f4ff', borderRadius: '8px', textAlign: 'center' }}>
              <h4>Widget A</h4>
              <p>Safe widget</p>
            </div>
          </ErrorBoundary>
          
          <ErrorBoundary>
            <div style={{ padding: '15px', background: '#fff5e6', borderRadius: '8px' }}>
              <h4 style={{ textAlign: 'center' }}>Widget B</h4>
              <AsyncErrorComponent />
            </div>
          </ErrorBoundary>
          
          <ErrorBoundary>
            <div style={{ padding: '15px', background: '#e8ffe8', borderRadius: '8px', textAlign: 'center' }}>
              <h4>Widget C</h4>
              <p>Also safe</p>
            </div>
          </ErrorBoundary>
        </div>
      </div>

      {/* Reset Button */}
      <button
        className="btn btn-secondary"
        onClick={() => setKey((k) => k + 1)}
        style={{ marginBottom: '20px' }}
      >
        Reset All Error Boundaries
      </button>

      {/* Technical Info */}
      <div style={{ padding: '15px', background: '#e8f4ff', borderRadius: '8px' }}>
        <h4>📝 Error Boundary Notes:</h4>
        <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
          <li>Must be a class component (as of React 18)</li>
          <li>Catches errors in render, lifecycle, and constructors</li>
          <li>Does NOT catch: event handlers, async code, server-side rendering</li>
          <li>Use multiple boundaries for granular error isolation</li>
        </ul>
        <pre style={{ 
          marginTop: '15px',
          background: '#f8f8f8', 
          padding: '10px', 
          borderRadius: '4px', 
          overflow: 'auto',
          fontSize: '13px' 
        }}>
{`class ErrorBoundary extends Component {
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  componentDidCatch(error, errorInfo) {
    logErrorToService(error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return <FallbackUI />;
    }
    return this.props.children;
  }
}`}
        </pre>
      </div>
    </div>
  );
};

export { ErrorBoundary, Bomb, BuggyCounter };
export default ErrorBoundaryDemo;
