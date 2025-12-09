/**
 * E10: Capstone Integration Tests
 * Testing login flow and inventory slice
 */

import { configureStore } from '@reduxjs/toolkit';
import authReducer, { login, logout, selectIsAuthenticated, selectCurrentUser } from '../store/slices/authSlice';
import inventoryReducer, { fetchInventory, selectAllProducts, setFilter } from '../store/slices/inventorySlice';
import uiReducer, { toggleDarkMode, addNotification, selectNotifications } from '../store/slices/uiSlice';

const createTestStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      inventory: inventoryReducer,
      ui: uiReducer,
    },
  });

type TestStore = ReturnType<typeof createTestStore>;

describe('Capstone Integration Tests', () => {
  let store: TestStore;

  beforeEach(() => {
    store = createTestStore();
    localStorage.clear();
  });

  describe('Authentication Flow', () => {
    test('should complete full login flow', async () => {
      expect(selectIsAuthenticated(store.getState())).toBe(false);
      expect(selectCurrentUser(store.getState())).toBeNull();

      await store.dispatch(login({ email: 'admin@example.com', password: 'admin123' }));

      expect(selectIsAuthenticated(store.getState())).toBe(true);
      expect(selectCurrentUser(store.getState())).not.toBeNull();
      expect(selectCurrentUser(store.getState())?.email).toBe('admin@example.com');
    });

    test('should fail login with invalid credentials', async () => {
      await store.dispatch(login({ email: 'invalid@example.com', password: 'wrong' }));
      expect(selectIsAuthenticated(store.getState())).toBe(false);
      expect(store.getState().auth.error).toBeTruthy();
    });

    test('should complete logout flow', async () => {
      await store.dispatch(login({ email: 'admin@example.com', password: 'admin123' }));
      expect(selectIsAuthenticated(store.getState())).toBe(true);

      await store.dispatch(logout());

      expect(selectIsAuthenticated(store.getState())).toBe(false);
      expect(selectCurrentUser(store.getState())).toBeNull();
    });
  });

  describe('Inventory Management', () => {
    beforeEach(async () => {
      await store.dispatch(login({ email: 'admin@example.com', password: 'admin123' }));
    });

    test('should load inventory after login', async () => {
      await store.dispatch(fetchInventory());
      const products = selectAllProducts(store.getState());
      expect(products.length).toBeGreaterThan(0);
    });

    test('should filter products by category', async () => {
      await store.dispatch(fetchInventory());
      store.dispatch(setFilter({ key: 'category', value: 'Electronics' }));
      expect(store.getState().inventory.filter.category).toBe('Electronics');
    });

    test('should filter products by status', async () => {
      await store.dispatch(fetchInventory());
      store.dispatch(setFilter({ key: 'status', value: 'in-stock' }));
      expect(store.getState().inventory.filter.status).toBe('in-stock');
    });
  });

  describe('UI State Management', () => {
    test('should manage dark mode toggle', () => {
      expect(store.getState().ui.darkMode).toBe(false);
      store.dispatch(toggleDarkMode());
      expect(store.getState().ui.darkMode).toBe(true);
      store.dispatch(toggleDarkMode());
      expect(store.getState().ui.darkMode).toBe(false);
    });

    test('should manage notifications', () => {
      store.dispatch(addNotification({ type: 'info', message: 'Test message' }));
      const notifications = selectNotifications(store.getState());
      expect(notifications.length).toBe(1);
      expect(notifications[0].message).toBe('Test message');
    });
  });
});
