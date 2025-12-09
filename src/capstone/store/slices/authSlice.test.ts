/**
 * ============================================
 * E10 — Testing Login + Reducer
 * ============================================
 * 
 * WHAT:
 * - Test login integration
 * - Test reducer thêm sản phẩm
 * 
 * WHY: Đảm bảo chức năng cốt lõi ổn định
 * 
 * HOW:
 * - Login test: nhập email/pw → mock API → assert redirect
 * - Reducer test: gọi reducer với action → kiểm tra state mới
 */

import authReducer, {
  login,
  logout,
  setCredentials,
  clearError,
} from './authSlice';

// ============================================
// AUTH REDUCER TESTS
// ============================================

describe('authSlice reducer', () => {
  const initialState = {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  };

  // ============================================
  // TEST 1: Initial state
  // ============================================
  test('should return the initial state', () => {
    expect(authReducer(undefined, { type: 'unknown' })).toEqual(
      expect.objectContaining({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      })
    );
  });

  // ============================================
  // TEST 2: Set credentials
  // ============================================
  test('should handle setCredentials', () => {
    const credentials = {
      user: {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user' as const,
      },
      token: 'test-token',
    };

    const state = authReducer(initialState, setCredentials(credentials));

    expect(state.isAuthenticated).toBe(true);
    expect(state.user).toEqual(credentials.user);
    expect(state.token).toBe('test-token');
  });

  // ============================================
  // TEST 3: Clear error
  // ============================================
  test('should handle clearError', () => {
    const stateWithError = {
      ...initialState,
      error: 'Some error occurred',
    };

    const state = authReducer(stateWithError, clearError());

    expect(state.error).toBeNull();
  });

  // ============================================
  // TEST 4: Login pending
  // ============================================
  test('should handle login.pending', () => {
    const state = authReducer(initialState, login.pending('', { email: '', password: '' }));

    expect(state.isLoading).toBe(true);
    expect(state.error).toBeNull();
  });

  // ============================================
  // TEST 5: Login fulfilled
  // ============================================
  test('should handle login.fulfilled', () => {
    const user = {
      id: '1',
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'admin' as const,
    };
    const token = 'mock-jwt-token';

    const state = authReducer(
      initialState,
      login.fulfilled({ user, token }, '', { email: 'admin@example.com', password: 'admin123' })
    );

    expect(state.isLoading).toBe(false);
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).toEqual(user);
    expect(state.token).toBe(token);
    expect(state.error).toBeNull();
  });

  // ============================================
  // TEST 6: Login rejected
  // ============================================
  test('should handle login.rejected', () => {
    const state = authReducer(
      initialState,
      login.rejected(null, '', { email: '', password: '' }, 'Invalid credentials')
    );

    expect(state.isLoading).toBe(false);
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.error).toBe('Invalid credentials');
  });

  // ============================================
  // TEST 7: Logout fulfilled
  // ============================================
  test('should handle logout.fulfilled', () => {
    const loggedInState = {
      user: { id: '1', email: 'test@test.com', name: 'Test', role: 'user' as const },
      token: 'some-token',
      isAuthenticated: true,
      isLoading: false,
      error: null,
    };

    const state = authReducer(loggedInState, logout.fulfilled(null, ''));

    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
  });
});
