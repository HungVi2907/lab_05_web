/**
 * Login Page Component
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { login, selectIsAuthenticated, selectAuthLoading, selectAuthError, clearError } from '../store/slices/authSlice';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as { from?: Location })?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  // Clear error on unmount
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(login({ email, password }));
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '40px',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ margin: 0, color: '#333' }}>🏢 Enterprise Dashboard</h1>
          <p style={{ color: '#666', marginTop: '10px' }}>Sign in to your account</p>
        </div>

        {error && (
          <div style={{
            padding: '10px 15px',
            background: '#f8d7da',
            borderRadius: '4px',
            marginBottom: '20px',
            color: '#721c24',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              className="input-field"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              className="input-field"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
            style={{ width: '100%', marginTop: '10px' }}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{
          marginTop: '30px',
          padding: '15px',
          background: '#f0f0f0',
          borderRadius: '8px',
        }}>
          <h4 style={{ margin: '0 0 10px 0' }}>🔑 Demo Credentials:</h4>
          <p style={{ fontSize: '14px', margin: '5px 0' }}>
            <strong>Admin:</strong> admin@example.com / admin123
          </p>
          <p style={{ fontSize: '14px', margin: '5px 0' }}>
            <strong>User:</strong> user@example.com / user123
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
