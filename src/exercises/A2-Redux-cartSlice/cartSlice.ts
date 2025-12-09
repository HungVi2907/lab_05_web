/**
 * ============================================
 * A2 — Redux Toolkit cartSlice + selector
 * ============================================
 * 
 * WHAT: Tạo cartSlice với reducers addItem, removeItem, clearCart + createSelector tính tax 10%
 * 
 * WHY:
 * - RTK giảm boilerplate và khuyến khích cấu trúc slice-based
 * - Selector memoized tối ưu derive state
 * - Immer integration cho phép "mutate" state một cách an toàn
 * 
 * HOW:
 * 1. configureStore({ reducer: { cart: cartSlice.reducer } })
 * 2. createSlice với reducers: addItem, removeItem, clearCart
 * 3. createSelector để tính tax = totalAmount * 0.1
 */

import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface CartState {
  items: CartItem[];
  lastUpdated: string | null;
}

// ============================================
// INITIAL STATE
// ============================================

const initialState: CartState = {
  items: [],
  lastUpdated: null,
};

// ============================================
// SLICE DEFINITION
// ============================================

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    /**
     * Add item to cart
     * - Nếu item đã tồn tại → tăng quantity
     * - Nếu chưa có → thêm mới với quantity = 1
     */
    addItem: (state, action: PayloadAction<Omit<CartItem, 'quantity'>>) => {
      const existingItem = state.items.find(
        (item) => item.id === action.payload.id
      );

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({ ...action.payload, quantity: 1 });
      }

      state.lastUpdated = new Date().toISOString();
    },

    /**
     * Add item with specific quantity
     */
    addItemWithQuantity: (
      state,
      action: PayloadAction<CartItem>
    ) => {
      const existingItem = state.items.find(
        (item) => item.id === action.payload.id
      );

      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }

      state.lastUpdated = new Date().toISOString();
    },

    /**
     * Remove item from cart
     * - Giảm quantity đi 1
     * - Nếu quantity = 0 → xóa item khỏi cart
     */
    removeItem: (state, action: PayloadAction<string>) => {
      const itemIndex = state.items.findIndex(
        (item) => item.id === action.payload
      );

      if (itemIndex !== -1) {
        const item = state.items[itemIndex];
        if (item.quantity > 1) {
          item.quantity -= 1;
        } else {
          state.items.splice(itemIndex, 1);
        }
        state.lastUpdated = new Date().toISOString();
      }
    },

    /**
     * Remove item completely (regardless of quantity)
     */
    removeItemCompletely: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
      state.lastUpdated = new Date().toISOString();
    },

    /**
     * Update item quantity directly
     */
    updateQuantity: (
      state,
      action: PayloadAction<{ id: string; quantity: number }>
    ) => {
      const item = state.items.find((item) => item.id === action.payload.id);
      if (item) {
        if (action.payload.quantity <= 0) {
          state.items = state.items.filter(
            (item) => item.id !== action.payload.id
          );
        } else {
          item.quantity = action.payload.quantity;
        }
        state.lastUpdated = new Date().toISOString();
      }
    },

    /**
     * Clear entire cart
     */
    clearCart: (state) => {
      state.items = [];
      state.lastUpdated = new Date().toISOString();
    },
  },
});

// ============================================
// EXPORT ACTIONS
// ============================================

export const {
  addItem,
  addItemWithQuantity,
  removeItem,
  removeItemCompletely,
  updateQuantity,
  clearCart,
} = cartSlice.actions;

// ============================================
// SELECTORS
// ============================================

// Root selector
export const selectCartState = (state: { cart: CartState }) => state.cart;

// Select all items
export const selectCartItems = createSelector(
  [selectCartState],
  (cart) => cart.items
);

// Select total number of items
export const selectTotalItems = createSelector(
  [selectCartItems],
  (items) => items.reduce((total, item) => total + item.quantity, 0)
);

// Select subtotal (before tax)
export const selectSubtotal = createSelector(
  [selectCartItems],
  (items) =>
    items.reduce((total, item) => total + item.price * item.quantity, 0)
);

// Select tax amount (10%)
export const selectTax = createSelector(
  [selectSubtotal],
  (subtotal) => subtotal * 0.1
);

// Select total amount (subtotal + tax)
export const selectTotalAmount = createSelector(
  [selectSubtotal, selectTax],
  (subtotal, tax) => subtotal + tax
);

// Select cart summary
export const selectCartSummary = createSelector(
  [selectTotalItems, selectSubtotal, selectTax, selectTotalAmount],
  (totalItems, subtotal, tax, total) => ({
    totalItems,
    subtotal,
    tax,
    total,
  })
);

// Select specific item by ID
export const selectItemById = (id: string) =>
  createSelector([selectCartItems], (items) =>
    items.find((item) => item.id === id)
  );

// Select if cart is empty
export const selectIsCartEmpty = createSelector(
  [selectCartItems],
  (items) => items.length === 0
);

// ============================================
// EXPORT REDUCER
// ============================================

export default cartSlice.reducer;
