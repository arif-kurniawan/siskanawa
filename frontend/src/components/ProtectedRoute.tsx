import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string;
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, hasRole } = useAuth();

  if (isLoading) {
    return <div style={{ padding: 40 }}>Memuat...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return <div style={{ padding: 40 }}>Anda tidak punya akses ke halaman ini.</div>;
  }

  return <>{children}</>;
}