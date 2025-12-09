/* eslint-disable */
/**
 * E5: Inventory Page with Optimization Pass
 * @module InventoryPage
 * - useMemo for expensive filtering/sorting  
 * - useCallback for stable handlers
 * - React.memo for child components
 */
/* eslint-enable */

import React, { useState, useMemo, useCallback, useEffect, memo } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import {
  fetchInventory,
  deleteProduct,
  selectAllProducts,
  selectInventoryStatus,
  selectInventoryError,
  setFilter,
  setSort,
  selectInventoryFilter,
  selectInventorySort,
  Product,
} from '../store/slices/inventorySlice';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

// ==================== MEMOIZED SUB-COMPONENTS ====================

interface ProductRowProps {
  product: Product;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

// React.memo prevents re-render if props don't change
const ProductRow = memo<ProductRowProps>(({ product, onEdit, onDelete }) => {
  console.log('ProductRow render:', product.id);

  return (
    <tr>
      <td>{product.name}</td>
      <td>{product.category}</td>
      <td>${product.price.toFixed(2)}</td>
      <td>
        <span style={{
          padding: '2px 8px',
          borderRadius: '4px',
          background: product.quantity > 10 ? '#d4edda' : product.quantity > 0 ? '#fff3cd' : '#f8d7da',
          color: product.quantity > 10 ? '#155724' : product.quantity > 0 ? '#856404' : '#721c24',
        }}>
          {product.quantity}
        </span>
      </td>
      <td>
        <button className="btn" onClick={() => onEdit(product.id)} style={{ marginRight: '8px', padding: '4px 8px' }}>
          Edit
        </button>
        <button className="btn btn-danger" onClick={() => onDelete(product.id)} style={{ padding: '4px 8px' }}>
          Delete
        </button>
      </td>
    </tr>
  );
});

ProductRow.displayName = 'ProductRow';

// ==================== MAIN INVENTORY PAGE ====================

const InventoryPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const products = useAppSelector(selectAllProducts);
  const status = useAppSelector(selectInventoryStatus);
  const error = useAppSelector(selectInventoryError);
  const filter = useAppSelector(selectInventoryFilter);
  const sort = useAppSelector(selectInventorySort);

  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  const isLoading = status === 'loading';

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchInventory());
    }
  }, [dispatch, status]);

  // useMemo: categories
  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category));
    return ['all', ...Array.from(cats).sort()];
  }, [products]);

  // useMemo: filter + sort
  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (localSearchTerm) {
      const term = localSearchTerm.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(term) || p.sku.toLowerCase().includes(term));
    }

    if (filter.category !== 'all') {
      result = result.filter(p => p.category === filter.category);
    }

    if (filter.status !== 'all') {
      result = result.filter(p => p.status === filter.status);
    }

    result.sort((a, b) => {
      const field = sort.sortBy;
      let cmp = 0;
      if (field === 'name' || field === 'category' || field === 'sku' || field === 'status') {
        cmp = String(a[field]).localeCompare(String(b[field]));
      } else {
        cmp = Number(a[field]) - Number(b[field]);
      }
      return sort.sortOrder === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [products, localSearchTerm, filter, sort]);

  // useMemo: stats
  const stats = useMemo(() => ({
    total: filteredProducts.length,
    totalValue: filteredProducts.reduce((sum, p) => sum + p.price * p.quantity, 0),
    lowStock: filteredProducts.filter(p => p.status === 'low-stock').length,
    outOfStock: filteredProducts.filter(p => p.status === 'out-of-stock').length,
  }), [filteredProducts]);

  // useCallback handlers
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearchTerm(e.target.value);
  }, []);

  const handleCategoryChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setFilter({ key: 'category', value: e.target.value }));
  }, [dispatch]);

  const handleStatusChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setFilter({ key: 'status', value: e.target.value }));
  }, [dispatch]);

  const handleEdit = useCallback((id: string) => {
    console.log('Edit:', id);
  }, []);

  const handleDeleteClick = useCallback((id: string) => {
    setProductToDelete(id);
    setDeleteModalOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (productToDelete) {
      await dispatch(deleteProduct(productToDelete));
      setDeleteModalOpen(false);
      setProductToDelete(null);
    }
  }, [dispatch, productToDelete]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteModalOpen(false);
    setProductToDelete(null);
  }, []);

  const handleSortChange = useCallback((field: keyof Product) => {
    const newOrder = sort.sortBy === field && sort.sortOrder === 'asc' ? 'desc' : 'asc';
    dispatch(setSort({ sortBy: field, sortOrder: newOrder }));
  }, [dispatch, sort]);

  if (error) {
    return (
      <div className="card">
        <h2>Error Loading Inventory</h2>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={() => dispatch(fetchInventory())}>Retry</button>
      </div>
    );
  }

  const productToDeleteName = productToDelete ? products.find(p => p.id === productToDelete)?.name || 'this product' : '';

  return (
    <div className="inventory-page">
      <h1>📦 Inventory Management</h1>
      <p>E5: Optimization with useMemo, useCallback, React.memo</p>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
        <div className="card" style={{ textAlign: 'center' }}><h3>{stats.total}</h3><p>Products</p></div>
        <div className="card" style={{ textAlign: 'center' }}><h3>${stats.totalValue.toLocaleString()}</h3><p>Value</p></div>
        <div className="card" style={{ textAlign: 'center', background: '#fff3cd' }}><h3>{stats.lowStock}</h3><p>Low Stock</p></div>
        <div className="card" style={{ textAlign: 'center', background: '#f8d7da' }}><h3>{stats.outOfStock}</h3><p>Out of Stock</p></div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '20px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        <input type="text" placeholder="Search..." value={localSearchTerm} onChange={handleSearchChange} className="input-field" />
        <select value={filter.category} onChange={handleCategoryChange} className="input-field">
          {categories.map(c => <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>)}
        </select>
        <select value={filter.status} onChange={handleStatusChange} className="input-field">
          <option value="all">All Status</option>
          <option value="in-stock">In Stock</option>
          <option value="low-stock">Low Stock</option>
          <option value="out-of-stock">Out of Stock</option>
        </select>
        <button className={`btn ${sort.sortBy === 'name' ? 'btn-primary' : ''}`} onClick={() => handleSortChange('name')}>
          Name {sort.sortBy === 'name' && (sort.sortOrder === 'asc' ? '↑' : '↓')}
        </button>
        <button className={`btn ${sort.sortBy === 'price' ? 'btn-primary' : ''}`} onClick={() => handleSortChange('price')}>
          Price {sort.sortBy === 'price' && (sort.sortOrder === 'asc' ? '↑' : '↓')}
        </button>
      </div>

      {/* Table */}
      <div className="card">
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}><div className="loading-spinner"></div><p>Loading...</p></div>
        ) : (
          <table className="data-table" style={{ width: '100%' }}>
            <thead><tr><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Actions</th></tr></thead>
            <tbody>
              {filteredProducts.slice(0, 50).map(p => (
                <ProductRow key={p.id} product={p} onEdit={handleEdit} onDelete={handleDeleteClick} />
              ))}
            </tbody>
          </table>
        )}
        <p style={{ marginTop: '20px', color: '#666' }}>Showing {Math.min(50, filteredProducts.length)} of {filteredProducts.length}</p>
      </div>

      <DeleteConfirmModal isOpen={deleteModalOpen} itemName={productToDeleteName} onConfirm={handleDeleteConfirm} onClose={handleDeleteCancel} />
    </div>
  );
};

export default InventoryPage;
