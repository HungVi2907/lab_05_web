/* eslint-disable */
/**
 * Dashboard Page - Main landing after login
 * @module DashboardPage
 */
/* eslint-enable */

import React, { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store';
import { selectCurrentUser } from '../store/slices/authSlice';
import { fetchInventory, selectAllProducts, selectInventoryStatus } from '../store/slices/inventorySlice';

const DashboardPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);
  const products = useAppSelector(selectAllProducts);
  const status = useAppSelector(selectInventoryStatus);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchInventory());
    }
  }, [dispatch, status]);

  const stats = useMemo(() => ({
    totalProducts: products.length,
    lowStock: products.filter(p => p.status === 'low-stock').length,
    outOfStock: products.filter(p => p.status === 'out-of-stock').length,
    totalValue: products.reduce((sum, p) => sum + (p.price * p.quantity), 0),
    categories: new Set(products.map(p => p.category)).size,
  }), [products]);

  return (
    <div className="dashboard-page">
      <header style={{ marginBottom: '30px' }}>
        <h1>👋 Welcome back, {user?.name || 'User'}!</h1>
        <p style={{ color: '#666' }}>Here's what's happening with your inventory today.</p>
      </header>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div className="card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <h3 style={{ fontSize: '32px', margin: '0 0 10px 0' }}>{stats.totalProducts}</h3>
          <p style={{ margin: 0, opacity: 0.9 }}>Total Products</p>
        </div>
        <div className="card" style={{ background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', color: 'white' }}>
          <h3 style={{ fontSize: '32px', margin: '0 0 10px 0' }}>${stats.totalValue.toLocaleString()}</h3>
          <p style={{ margin: 0, opacity: 0.9 }}>Inventory Value</p>
        </div>
        <div className="card" style={{ background: 'linear-gradient(135deg, #F2994A 0%, #F2C94C 100%)', color: 'white' }}>
          <h3 style={{ fontSize: '32px', margin: '0 0 10px 0' }}>{stats.lowStock}</h3>
          <p style={{ margin: 0, opacity: 0.9 }}>Low Stock Items</p>
        </div>
        <div className="card" style={{ background: 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)', color: 'white' }}>
          <h3 style={{ fontSize: '32px', margin: '0 0 10px 0' }}>{stats.outOfStock}</h3>
          <p style={{ margin: 0, opacity: 0.9 }}>Out of Stock</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card" style={{ marginBottom: '30px' }}>
        <h2>🚀 Quick Actions</h2>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <Link to="/inventory" className="btn btn-primary">📦 View Inventory</Link>
          <Link to="/analytics" className="btn btn-secondary">📊 Analytics</Link>
          <Link to="/exercises" className="btn">📚 Exercises Demo</Link>
        </div>
      </div>

      {/* User Info */}
      <div className="card">
        <h2>👤 Your Profile</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div><strong>Name:</strong> {user?.name}</div>
          <div><strong>Email:</strong> {user?.email}</div>
          <div>
            <strong>Role:</strong>{' '}
            <span style={{ padding: '2px 8px', borderRadius: '4px', background: user?.role === 'admin' ? '#d4edda' : '#e2e3e5' }}>
              {user?.role}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
