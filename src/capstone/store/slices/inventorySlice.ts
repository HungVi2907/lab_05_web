/**
 * ============================================
 * E3 + E4 — Inventory Slice with Entity Adapter + Async Thunk
 * ============================================
 * 
 * E3 - WHAT: List 5000 sản phẩm dạng normalized
 * E3 - WHY: O(1) CRUD operations + selector tối ưu
 * 
 * E4 - WHAT: Mock API trả 5000 sản phẩm
 * E4 - WHY: Cho phép UI thể hiện loading → success → failure
 * 
 * HOW:
 * 1. const adapter = createEntityAdapter()
 * 2. initialState = adapter.getInitialState({ status })
 * 3. createAsyncThunk for fetchInventory
 * 4. extraReducers → adapter.setAll(...)
 */

import { 
  createSlice, 
  createAsyncThunk, 
  createEntityAdapter,
  PayloadAction,
  createSelector
} from '@reduxjs/toolkit';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  quantity: number;
  minStock: number;
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
  lastUpdated: string;
}

type FetchStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

interface InventoryState {
  status: FetchStatus;
  error: string | null;
  filter: {
    category: string;
    status: string;
    searchTerm: string;
  };
  sortBy: keyof Product;
  sortOrder: 'asc' | 'desc';
}

// ============================================
// ENTITY ADAPTER
// ============================================

/**
 * Entity Adapter provides:
 * - Normalized state shape (ids[], entities{})
 * - CRUD operations (addOne, updateOne, removeOne, etc.)
 * - Memoized selectors (selectAll, selectById, selectTotal)
 */
const inventoryAdapter = createEntityAdapter<Product>({
  sortComparer: (a, b) => a.name.localeCompare(b.name),
});

// ============================================
// INITIAL STATE
// ============================================

const initialState = inventoryAdapter.getInitialState<InventoryState>({
  status: 'idle',
  error: null,
  filter: {
    category: 'all',
    status: 'all',
    searchTerm: '',
  },
  sortBy: 'name',
  sortOrder: 'asc',
});

// ============================================
// MOCK DATA GENERATOR
// ============================================

const categories = ['Electronics', 'Clothing', 'Food', 'Books', 'Sports', 'Home'];
const generateMockProducts = (count: number): Product[] => {
  return Array.from({ length: count }, (_, index) => {
    const quantity = Math.floor(Math.random() * 100);
    const minStock = 10;
    let status: Product['status'] = 'in-stock';
    if (quantity === 0) status = 'out-of-stock';
    else if (quantity < minStock) status = 'low-stock';

    return {
      id: `PROD-${String(index + 1).padStart(5, '0')}`,
      name: `Product ${index + 1}`,
      sku: `SKU-${String(index + 1).padStart(6, '0')}`,
      category: categories[Math.floor(Math.random() * categories.length)],
      price: Math.floor(Math.random() * 1000) + 10,
      quantity,
      minStock,
      status,
      lastUpdated: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    };
  });
};

// ============================================
// ASYNC THUNKS
// ============================================

/**
 * E4: Fetch inventory from mock API
 */
export const fetchInventory = createAsyncThunk<Product[], number | undefined>(
  'inventory/fetchInventory',
  async (count = 5000, { rejectWithValue }) => {
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Simulate occasional failure (10% chance)
      if (Math.random() < 0.1) {
        throw new Error('Network error: Failed to fetch inventory');
      }

      return generateMockProducts(count);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch');
    }
  }
);

/**
 * Add new product
 */
export const addProduct = createAsyncThunk<Product, Omit<Product, 'id' | 'lastUpdated' | 'status'>>(
  'inventory/addProduct',
  async (productData, { rejectWithValue }) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const quantity = productData.quantity;
      const minStock = productData.minStock;
      let status: Product['status'] = 'in-stock';
      if (quantity === 0) status = 'out-of-stock';
      else if (quantity < minStock) status = 'low-stock';

      return {
        ...productData,
        id: `PROD-${Date.now()}`,
        status,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      return rejectWithValue('Failed to add product');
    }
  }
);

/**
 * Update product
 */
export const updateProduct = createAsyncThunk<
  { id: string; changes: Partial<Product> },
  { id: string; changes: Partial<Product> }
>(
  'inventory/updateProduct',
  async ({ id, changes }, { rejectWithValue }) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return { id, changes: { ...changes, lastUpdated: new Date().toISOString() } };
    } catch (error) {
      return rejectWithValue('Failed to update product');
    }
  }
);

/**
 * Delete product
 */
export const deleteProduct = createAsyncThunk<string, string>(
  'inventory/deleteProduct',
  async (id, { rejectWithValue }) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return id;
    } catch (error) {
      return rejectWithValue('Failed to delete product');
    }
  }
);

// ============================================
// SLICE DEFINITION
// ============================================

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    // Set filter
    setFilter: (
      state,
      action: PayloadAction<{ key: keyof InventoryState['filter']; value: string }>
    ) => {
      state.filter[action.payload.key] = action.payload.value;
    },

    // Clear filters
    clearFilters: (state) => {
      state.filter = { category: 'all', status: 'all', searchTerm: '' };
    },

    // Set sort
    setSort: (state, action: PayloadAction<{ sortBy: keyof Product; sortOrder: 'asc' | 'desc' }>) => {
      state.sortBy = action.payload.sortBy;
      state.sortOrder = action.payload.sortOrder;
    },

    // Update stock locally
    updateStock: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const product = state.entities[action.payload.id];
      if (product) {
        product.quantity = action.payload.quantity;
        if (product.quantity === 0) product.status = 'out-of-stock';
        else if (product.quantity < product.minStock) product.status = 'low-stock';
        else product.status = 'in-stock';
        product.lastUpdated = new Date().toISOString();
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch inventory
      .addCase(fetchInventory.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchInventory.fulfilled, (state, action) => {
        state.status = 'succeeded';
        inventoryAdapter.setAll(state, action.payload);
      })
      .addCase(fetchInventory.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // Add product
      .addCase(addProduct.fulfilled, (state, action) => {
        inventoryAdapter.addOne(state, action.payload);
      })
      // Update product
      .addCase(updateProduct.fulfilled, (state, action) => {
        inventoryAdapter.updateOne(state, action.payload);
      })
      // Delete product
      .addCase(deleteProduct.fulfilled, (state, action) => {
        inventoryAdapter.removeOne(state, action.payload);
      });
  },
});

// ============================================
// EXPORTS
// ============================================

export const { setFilter, clearFilters, setSort, updateStock } = inventorySlice.actions;

// Type for selectors - use any to allow compatibility with any RootState shape
// This avoids circular dependency issues between store and slices
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AppState = any;

// Export adapter selectors
export const {
  selectAll: selectAllProducts,
  selectById: selectProductById,
  selectIds: selectProductIds,
  selectTotal: selectTotalProducts,
} = inventoryAdapter.getSelectors((state: AppState) => state.inventory);

// Custom selectors
export const selectInventoryStatus = (state: AppState): FetchStatus => 
  state.inventory.status;
export const selectInventoryError = (state: AppState): string | null => 
  state.inventory.error;
export const selectInventoryFilter = (state: AppState) => 
  state.inventory.filter as { category: string; status: string; searchTerm: string };
export const selectInventorySort = (state: AppState) => ({
  sortBy: state.inventory.sortBy as keyof Product,
  sortOrder: state.inventory.sortOrder as 'asc' | 'desc',
});

// E5: Memoized filtered products selector
export const selectFilteredProducts = createSelector(
  [selectAllProducts, selectInventoryFilter],
  (products, filter) => {
    return products.filter((product) => {
      const matchesCategory = filter.category === 'all' || product.category === filter.category;
      const matchesStatus = filter.status === 'all' || product.status === filter.status;
      const matchesSearch = filter.searchTerm === '' || 
        product.name.toLowerCase().includes(filter.searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(filter.searchTerm.toLowerCase());
      
      return matchesCategory && matchesStatus && matchesSearch;
    });
  }
);

// Statistics selector
export const selectInventoryStats = createSelector(
  [selectAllProducts],
  (products) => ({
    total: products.length,
    inStock: products.filter((p) => p.status === 'in-stock').length,
    lowStock: products.filter((p) => p.status === 'low-stock').length,
    outOfStock: products.filter((p) => p.status === 'out-of-stock').length,
    totalValue: products.reduce((sum, p) => sum + p.price * p.quantity, 0),
    categories: Array.from(new Set(products.map((p) => p.category))),
  })
);

export default inventorySlice.reducer;
