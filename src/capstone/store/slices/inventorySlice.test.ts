/**
 * E10 — Testing inventorySlice reducer
 */

import inventoryReducer, {
  setFilter,
  clearFilters,
  setSort,
  updateStock,
  fetchInventory,
  addProduct,
  deleteProduct,
} from './inventorySlice';

// ============================================
// INVENTORY REDUCER TESTS
// ============================================

describe('inventorySlice reducer', () => {
  // Helper to get initial state
  const getInitialState = () => inventoryReducer(undefined, { type: 'unknown' });

  // ============================================
  // TEST 1: Initial state
  // ============================================
  test('should return the initial state', () => {
    const state = getInitialState();
    
    expect(state.status).toBe('idle');
    expect(state.error).toBeNull();
    expect(state.ids).toEqual([]);
    expect(state.entities).toEqual({});
    expect(state.filter).toEqual({
      category: 'all',
      status: 'all',
      searchTerm: '',
    });
  });

  // ============================================
  // TEST 2: Set filter
  // ============================================
  test('should handle setFilter for category', () => {
    const state = inventoryReducer(
      getInitialState(),
      setFilter({ key: 'category', value: 'Electronics' })
    );

    expect(state.filter.category).toBe('Electronics');
  });

  test('should handle setFilter for searchTerm', () => {
    const state = inventoryReducer(
      getInitialState(),
      setFilter({ key: 'searchTerm', value: 'laptop' })
    );

    expect(state.filter.searchTerm).toBe('laptop');
  });

  // ============================================
  // TEST 3: Clear filters
  // ============================================
  test('should handle clearFilters', () => {
    let state = inventoryReducer(
      getInitialState(),
      setFilter({ key: 'category', value: 'Electronics' })
    );
    state = inventoryReducer(state, setFilter({ key: 'searchTerm', value: 'test' }));
    state = inventoryReducer(state, clearFilters());

    expect(state.filter).toEqual({
      category: 'all',
      status: 'all',
      searchTerm: '',
    });
  });

  // ============================================
  // TEST 4: Set sort
  // ============================================
  test('should handle setSort', () => {
    const state = inventoryReducer(
      getInitialState(),
      setSort({ sortBy: 'price', sortOrder: 'desc' })
    );

    expect(state.sortBy).toBe('price');
    expect(state.sortOrder).toBe('desc');
  });

  // ============================================
  // TEST 5: Fetch inventory pending
  // ============================================
  test('should handle fetchInventory.pending', () => {
    const state = inventoryReducer(
      getInitialState(),
      fetchInventory.pending('', undefined)
    );

    expect(state.status).toBe('loading');
    expect(state.error).toBeNull();
  });

  // ============================================
  // TEST 6: Fetch inventory fulfilled
  // ============================================
  test('should handle fetchInventory.fulfilled', () => {
    const products = [
      {
        id: 'PROD-00001',
        name: 'Product 1',
        sku: 'SKU-000001',
        category: 'Electronics',
        price: 100,
        quantity: 50,
        minStock: 10,
        status: 'in-stock' as const,
        lastUpdated: '2024-01-01',
      },
      {
        id: 'PROD-00002',
        name: 'Product 2',
        sku: 'SKU-000002',
        category: 'Books',
        price: 25,
        quantity: 5,
        minStock: 10,
        status: 'low-stock' as const,
        lastUpdated: '2024-01-01',
      },
    ];

    const state = inventoryReducer(
      getInitialState(),
      fetchInventory.fulfilled(products, '', undefined)
    );

    expect(state.status).toBe('succeeded');
    expect(state.ids).toHaveLength(2);
    expect(state.entities['PROD-00001']).toEqual(products[0]);
    expect(state.entities['PROD-00002']).toEqual(products[1]);
  });

  // ============================================
  // TEST 7: Fetch inventory rejected
  // ============================================
  test('should handle fetchInventory.rejected', () => {
    const state = inventoryReducer(
      getInitialState(),
      fetchInventory.rejected(null, '', undefined, 'Network error')
    );

    expect(state.status).toBe('failed');
    expect(state.error).toBe('Network error');
  });

  // ============================================
  // TEST 8: Add product
  // ============================================
  test('should handle addProduct.fulfilled', () => {
    const newProduct = {
      id: 'PROD-NEW',
      name: 'New Product',
      sku: 'SKU-NEW',
      category: 'Food',
      price: 15,
      quantity: 100,
      minStock: 10,
      status: 'in-stock' as const,
      lastUpdated: '2024-01-01',
    };

    const state = inventoryReducer(
      getInitialState(),
      addProduct.fulfilled(newProduct, '', {
        name: 'New Product',
        sku: 'SKU-NEW',
        category: 'Food',
        price: 15,
        quantity: 100,
        minStock: 10,
      })
    );

    expect(state.ids).toContain('PROD-NEW');
    expect(state.entities['PROD-NEW']).toEqual(newProduct);
  });

  // ============================================
  // TEST 9: Delete product
  // ============================================
  test('should handle deleteProduct.fulfilled', () => {
    // First add a product
    const product = {
      id: 'PROD-DELETE',
      name: 'To Delete',
      sku: 'SKU-DELETE',
      category: 'Books',
      price: 20,
      quantity: 10,
      minStock: 5,
      status: 'in-stock' as const,
      lastUpdated: '2024-01-01',
    };

    let state = inventoryReducer(
      getInitialState(),
      addProduct.fulfilled(product, '', {
        name: product.name,
        sku: product.sku,
        category: product.category,
        price: product.price,
        quantity: product.quantity,
        minStock: product.minStock,
      })
    );

    // Then delete it
    state = inventoryReducer(
      state,
      deleteProduct.fulfilled('PROD-DELETE', '', 'PROD-DELETE')
    );

    expect(state.ids).not.toContain('PROD-DELETE');
    expect(state.entities['PROD-DELETE']).toBeUndefined();
  });

  // ============================================
  // TEST 10: Update stock
  // ============================================
  test('should handle updateStock and update status correctly', () => {
    const product = {
      id: 'PROD-STOCK',
      name: 'Stock Test',
      sku: 'SKU-STOCK',
      category: 'Electronics',
      price: 100,
      quantity: 50,
      minStock: 10,
      status: 'in-stock' as const,
      lastUpdated: '2024-01-01',
    };

    let state = inventoryReducer(
      getInitialState(),
      addProduct.fulfilled(product, '', {
        name: product.name,
        sku: product.sku,
        category: product.category,
        price: product.price,
        quantity: product.quantity,
        minStock: product.minStock,
      })
    );

    // Update to low stock
    state = inventoryReducer(
      state,
      updateStock({ id: 'PROD-STOCK', quantity: 5 })
    );

    expect(state.entities['PROD-STOCK']?.quantity).toBe(5);
    expect(state.entities['PROD-STOCK']?.status).toBe('low-stock');

    // Update to out of stock
    state = inventoryReducer(
      state,
      updateStock({ id: 'PROD-STOCK', quantity: 0 })
    );

    expect(state.entities['PROD-STOCK']?.quantity).toBe(0);
    expect(state.entities['PROD-STOCK']?.status).toBe('out-of-stock');
  });
});
