/**
 * Capstone Project Barrel Export
 * Lab 05 - Module 5
 */

// Store
export { store, useAppDispatch, useAppSelector } from './store';
export type { RootState, AppDispatch } from './store';

// Slices
export * from './store/slices/authSlice';
export * from './store/slices/inventorySlice';
export * from './store/slices/uiSlice';

// Components
export * from './components';

// Pages
export * from './pages';
