/**
 * ============================================
 * E2 — Auth + Protected Routing
 * ============================================
 * 
 * WHAT: Redirect unauthenticated người dùng về /login
 * 
 * WHY: Dashboard là hệ thống nội bộ
 * 
 * HOW:
 * - Tạo PrivateRoute wrapper kiểm tra state.auth.token
 * - Nếu không token → navigate("/login")
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../store';
import { selectIsAuthenticated, selectUserRole } from '../store/slices/authSlice';

// ============================================
// PRIVATE ROUTE COMPONENT
// ============================================

interface PrivateRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'manager' | 'user';
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const userRole = useAppSelector(selectUserRole);
  const location = useLocation();

  // Not authenticated -> redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access
  if (requiredRole) {
    const roleHierarchy = { admin: 3, manager: 2, user: 1 };
    const userRoleLevel = roleHierarchy[userRole || 'user'];
    const requiredRoleLevel = roleHierarchy[requiredRole];

    if (userRoleLevel < requiredRoleLevel) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
};

// ============================================
// PUBLIC ROUTE (redirect if already logged in)
// ============================================

interface PublicRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export const PublicRoute: React.FC<PublicRouteProps> = ({ 
  children, 
  redirectTo = '/dashboard' 
}) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const location = useLocation();

  if (isAuthenticated) {
    // Redirect to where they came from, or default
    const from = (location.state as { from?: Location })?.from?.pathname || redirectTo;
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
};

// ============================================
// ROLE-BASED COMPONENTS
// ============================================

interface RequireRoleProps {
  children: React.ReactNode;
  allowedRoles: Array<'admin' | 'manager' | 'user'>;
  fallback?: React.ReactNode;
}

export const RequireRole: React.FC<RequireRoleProps> = ({ 
  children, 
  allowedRoles,
  fallback = null 
}) => {
  const userRole = useAppSelector(selectUserRole);

  if (!userRole || !allowedRoles.includes(userRole)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// ============================================
// ADMIN ONLY WRAPPER
// ============================================

interface AdminOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const AdminOnly: React.FC<AdminOnlyProps> = ({ children, fallback }) => {
  return (
    <RequireRole allowedRoles={['admin']} fallback={fallback}>
      {children}
    </RequireRole>
  );
};

export default PrivateRoute;
