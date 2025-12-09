/**
 * Cart Component - Demo cho cartSlice
 */

import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  addItem,
  removeItem,
  removeItemCompletely,
  clearCart,
  selectCartItems,
  selectCartSummary,
  selectIsCartEmpty,
} from './cartSlice';

// Sample products for demo
const SAMPLE_PRODUCTS = [
  { id: '1', name: 'MacBook Pro 14"', price: 1999.99, image: '💻' },
  { id: '2', name: 'iPhone 15 Pro', price: 999.99, image: '📱' },
  { id: '3', name: 'AirPods Pro', price: 249.99, image: '🎧' },
  { id: '4', name: 'Apple Watch Series 9', price: 399.99, image: '⌚' },
  { id: '5', name: 'iPad Pro 12.9"', price: 1099.99, image: '📱' },
];

const Cart: React.FC = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);
  const summary = useSelector(selectCartSummary);
  const isEmpty = useSelector(selectIsCartEmpty);

  const handleAddItem = (product: typeof SAMPLE_PRODUCTS[0]) => {
    dispatch(addItem(product));
  };

  const handleRemoveItem = (id: string) => {
    dispatch(removeItem(id));
  };

  const handleRemoveCompletely = (id: string) => {
    dispatch(removeItemCompletely(id));
  };

  const handleClearCart = () => {
    dispatch(clearCart());
  };

  return (
    <div className="card">
      <h2 className="section-title">A2: Redux Toolkit cartSlice + Selectors</h2>

      {/* Products List */}
      <div style={{ marginBottom: '30px' }}>
        <h3>🛍️ Available Products</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px', marginTop: '15px' }}>
          {SAMPLE_PRODUCTS.map((product) => (
            <div
              key={product.id}
              style={{
                background: '#f8f9fa',
                padding: '15px',
                borderRadius: '8px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '40px', marginBottom: '10px' }}>
                {product.image}
              </div>
              <h4>{product.name}</h4>
              <p style={{ color: '#0066cc', fontWeight: 'bold' }}>
                ${product.price.toFixed(2)}
              </p>
              <button
                className="btn btn-primary"
                onClick={() => handleAddItem(product)}
                style={{ marginTop: '10px' }}
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Shopping Cart */}
      <div>
        <h3>🛒 Shopping Cart ({summary.totalItems} items)</h3>
        
        {isEmpty ? (
          <p style={{ color: '#666', marginTop: '15px' }}>Your cart is empty</p>
        ) : (
          <>
            <div style={{ marginTop: '15px' }}>
              {cartItems.map((item) => (
                <div key={item.id} className="cart-item">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <span style={{ fontSize: '30px' }}>{item.image}</span>
                    <div>
                      <strong>{item.name}</strong>
                      <p style={{ color: '#666', fontSize: '14px' }}>
                        ${item.price.toFixed(2)} × {item.quantity}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontWeight: 'bold' }}>
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleRemoveItem(item.id)}
                    >
                      -
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleRemoveCompletely(item.id)}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Cart Summary with Selectors */}
            <div className="cart-total">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span>Subtotal:</span>
                <span>${summary.subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: '#666' }}>
                <span>Tax (10%):</span>
                <span>${summary.tax.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', borderTop: '1px solid #ddd', paddingTop: '10px' }}>
                <span>Total:</span>
                <span style={{ color: '#0066cc' }}>${summary.total.toFixed(2)}</span>
              </div>
            </div>

            <button
              className="btn btn-danger"
              onClick={handleClearCart}
              style={{ marginTop: '15px' }}
            >
              Clear Cart
            </button>
          </>
        )}
      </div>

      {/* Technical Info */}
      <div style={{ marginTop: '30px', padding: '15px', background: '#f0f0f0', borderRadius: '8px' }}>
        <h4>📝 Technical Notes:</h4>
        <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
          <li>Using <code>createSlice</code> for reducer + actions</li>
          <li>Using <code>createSelector</code> for memoized derived state</li>
          <li>Tax calculation is memoized and only recalculates when subtotal changes</li>
          <li>Immer allows "mutating" state safely</li>
        </ul>
      </div>
    </div>
  );
};

export default Cart;
