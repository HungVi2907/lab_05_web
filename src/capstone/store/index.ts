/**
 * ============================================
 * E1 — Setup Redux Store & Base Slices
 * ============================================
 *
 * WHAT: Setup configureStore + authSlice + uiSlice
 *
 * WHY: Là nền tảng cho toàn bộ dashboard enterprise
 *
 * HOW:
 * 1. Tạo folder store
 * 2. Tạo authSlice (token, role, login/logout)
 * 3. Tạo uiSlice (darkMode toggle, sidebar)
 * 4. Combine reducers vào store
 */

import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { authReducer, uiReducer, inventoryReducer } from './slices';

// ============================================
// STORE CONFIGURATION
// ============================================

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    inventory: inventoryReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these paths in the state
        ignoredActions: ['auth/login/fulfilled'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// ============================================
// TYPE EXPORTS
// ============================================

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// ============================================
// TYPED HOOKS (for components)
// ============================================

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
