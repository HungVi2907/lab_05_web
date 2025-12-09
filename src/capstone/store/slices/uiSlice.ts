/**
 * ============================================
 * E1 — UI Slice
 * ============================================
 * 
 * Manages UI state:
 * - Dark mode toggle
 * - Sidebar state
 * - Notifications
 * - Loading overlays
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

export interface UiState {
  darkMode: boolean;
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  notifications: Notification[];
  globalLoading: boolean;
  loadingMessage: string | null;
}

// ============================================
// INITIAL STATE
// ============================================

const initialState: UiState = {
  darkMode: localStorage.getItem('darkMode') === 'true',
  sidebarOpen: true,
  sidebarCollapsed: false,
  notifications: [],
  globalLoading: false,
  loadingMessage: null,
};

// ============================================
// SLICE DEFINITION
// ============================================

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Toggle dark mode
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
      localStorage.setItem('darkMode', String(state.darkMode));
    },

    // Set dark mode explicitly
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.darkMode = action.payload;
      localStorage.setItem('darkMode', String(action.payload));
    },

    // Toggle sidebar
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },

    // Set sidebar state
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },

    // Toggle sidebar collapsed
    toggleSidebarCollapsed: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },

    // Add notification
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id'>>) => {
      const id = Date.now().toString();
      state.notifications.push({ ...action.payload, id });
    },

    // Remove notification
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        (n) => n.id !== action.payload
      );
    },

    // Clear all notifications
    clearNotifications: (state) => {
      state.notifications = [];
    },

    // Set global loading
    setGlobalLoading: (state, action: PayloadAction<{ loading: boolean; message?: string }>) => {
      state.globalLoading = action.payload.loading;
      state.loadingMessage = action.payload.message || null;
    },
  },
});

// ============================================
// EXPORTS
// ============================================

export const {
  toggleDarkMode,
  setDarkMode,
  toggleSidebar,
  setSidebarOpen,
  toggleSidebarCollapsed,
  addNotification,
  removeNotification,
  clearNotifications,
  setGlobalLoading,
} = uiSlice.actions;

// Selectors
export const selectDarkMode = (state: { ui: UiState }) => state.ui.darkMode;
export const selectSidebarOpen = (state: { ui: UiState }) => state.ui.sidebarOpen;
export const selectSidebarCollapsed = (state: { ui: UiState }) => state.ui.sidebarCollapsed;
export const selectNotifications = (state: { ui: UiState }) => state.ui.notifications;
export const selectGlobalLoading = (state: { ui: UiState }) => state.ui.globalLoading;
export const selectLoadingMessage = (state: { ui: UiState }) => state.ui.loadingMessage;

export default uiSlice.reducer;
