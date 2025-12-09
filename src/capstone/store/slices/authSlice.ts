/**
 * ============================================
 * E1 — Auth Slice
 * ============================================
 * 
 * Manages authentication state:
 * - token
 * - user info
 * - role
 * - login/logout actions
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'user';
  avatar?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  user: User;
  token: string;
}

// ============================================
// INITIAL STATE
// ============================================

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null,
};

// ============================================
// ASYNC THUNKS
// ============================================

/**
 * Login thunk - handles authentication
 */
export const login = createAsyncThunk<LoginResponse, LoginCredentials>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock validation
      if (credentials.email === 'admin@example.com' && credentials.password === 'admin123') {
        return {
          user: {
            id: '1',
            email: credentials.email,
            name: 'Admin User',
            role: 'admin' as const,
          },
          token: 'mock-jwt-token-admin',
        };
      }

      if (credentials.email === 'user@example.com' && credentials.password === 'user123') {
        return {
          user: {
            id: '2',
            email: credentials.email,
            name: 'Regular User',
            role: 'user' as const,
          },
          token: 'mock-jwt-token-user',
        };
      }

      throw new Error('Invalid credentials');
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Login failed');
    }
  }
);

/**
 * Logout thunk
 */
export const logout = createAsyncThunk('auth/logout', async () => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 500));
  localStorage.removeItem('token');
  return null;
});

// ============================================
// SLICE DEFINITION
// ============================================

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Set credentials manually (e.g., from stored token)
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      localStorage.setItem('token', action.payload.token);
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Update user profile
    updateProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        localStorage.setItem('token', action.payload.token);
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      })
      // Logout
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = null;
      });
  },
});

// ============================================
// EXPORTS
// ============================================

export const { setCredentials, clearError, updateProfile } = authSlice.actions;

// Selectors
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectCurrentUser = selectUser; // Alias
export const selectToken = (state: { auth: AuthState }) => state.auth.token;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.isLoading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;
export const selectUserRole = (state: { auth: AuthState }) => state.auth.user?.role;

export default authSlice.reducer;
