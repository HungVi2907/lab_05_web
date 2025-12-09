/**
 * ============================================
 * D2 — Testing Error Boundaries
 * ============================================
 * 
 * WHAT: Test rằng ErrorBoundary hiển thị fallback khi một component throw error
 * 
 * WHY:
 * - Đảm bảo UI không crash
 * - Bảo vệ dashboard enterprise
 * - Verify error handling behavior
 * 
 * HOW:
 * - Render ErrorBoundary(Bomb) → expect fallback message visible
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary, Bomb, BuggyCounter } from '../C3-ErrorBoundary';

// Suppress console.error for cleaner test output
beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  (console.error as jest.Mock).mockRestore();
});

describe('ErrorBoundary Tests', () => {
  // ============================================
  // TEST 1: Renders children when no error
  // ============================================
  test('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Safe Content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Safe Content')).toBeInTheDocument();
  });

  // ============================================
  // TEST 2: Renders fallback when child throws
  // ============================================
  test('renders fallback UI when child component throws', () => {
    render(
      <ErrorBoundary>
        <Bomb shouldExplode={true} />
      </ErrorBoundary>
    );

    // Should show error UI instead of crashing
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });

  // ============================================
  // TEST 3: Shows error message in fallback
  // ============================================
  test('displays error message in fallback UI', () => {
    render(
      <ErrorBoundary>
        <Bomb shouldExplode={true} />
      </ErrorBoundary>
    );

    // Should display the error message
    expect(screen.getByText(/boom/i)).toBeInTheDocument();
  });

  // ============================================
  // TEST 4: Custom fallback is rendered
  // ============================================
  test('renders custom fallback when provided', () => {
    const customFallback = <div>Custom Error UI</div>;

    render(
      <ErrorBoundary fallback={customFallback}>
        <Bomb shouldExplode={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom Error UI')).toBeInTheDocument();
  });

  // ============================================
  // TEST 5: Safe Bomb doesn't trigger error
  // ============================================
  test('does not show error UI when Bomb is safe', () => {
    render(
      <ErrorBoundary>
        <Bomb shouldExplode={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText(/bomb is safe/i)).toBeInTheDocument();
    expect(screen.queryByText(/something went wrong/i)).not.toBeInTheDocument();
  });

  // ============================================
  // TEST 6: Calls onError callback
  // ============================================
  test('calls onError callback when error occurs', () => {
    const onError = jest.fn();

    render(
      <ErrorBoundary onError={onError}>
        <Bomb shouldExplode={true} />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalled();
    expect(onError.mock.calls[0][0]).toBeInstanceOf(Error);
  });

  // ============================================
  // TEST 7: Try Again button resets error state
  // ============================================
  test('Try Again button is present in fallback UI', () => {
    render(
      <ErrorBoundary>
        <Bomb shouldExplode={true} />
      </ErrorBoundary>
    );

    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  // ============================================
  // TEST 8: Multiple error boundaries are isolated
  // ============================================
  test('error in one boundary does not affect siblings', () => {
    render(
      <div>
        <ErrorBoundary>
          <Bomb shouldExplode={true} />
        </ErrorBoundary>
        <ErrorBoundary>
          <div>Safe Sibling</div>
        </ErrorBoundary>
      </div>
    );

    // First boundary should show error
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    
    // Second boundary should still work
    expect(screen.getByText('Safe Sibling')).toBeInTheDocument();
  });

  // ============================================
  // TEST 9: Error details are expandable
  // ============================================
  test('error details section exists', () => {
    render(
      <ErrorBoundary>
        <Bomb shouldExplode={true} />
      </ErrorBoundary>
    );

    // Should have details element
    expect(screen.getByText(/view error details/i)).toBeInTheDocument();
  });

  // ============================================
  // TEST 10: Handles nested errors
  // ============================================
  test('handles errors from nested components', () => {
    const NestedBomb = () => (
      <div>
        <div>
          <Bomb shouldExplode={true} />
        </div>
      </div>
    );

    render(
      <ErrorBoundary>
        <NestedBomb />
      </ErrorBoundary>
    );

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });
});

describe('BuggyCounter Error Tests', () => {
  // Note: These tests would require simulating user interactions
  // which trigger the counter to reach the threshold
  
  test('BuggyCounter renders initially without error', () => {
    render(
      <ErrorBoundary>
        <BuggyCounter throwOnValue={5} />
      </ErrorBoundary>
    );

    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /count/i })).toBeInTheDocument();
  });
});
