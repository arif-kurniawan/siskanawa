import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react'
import { authService } from '../services/auth';
import type { User } from '../services/auth';

interface AuthContextType {
  user: User | null;
  roles: string[];
  permissions: string[];
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Saat app pertama load, cek apakah ada token valid
  useEffect(() => {
    const initAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          const data = await authService.me();
          setUser(data.user);
          setRoles(data.roles);
          setPermissions(data.permissions);
        } catch {
          // Token invalid, sudah di-handle interceptor
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const data = await authService.login(email, password);
    setUser(data.user);
    setRoles(data.roles);
    setPermissions(data.permissions);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setRoles([]);
    setPermissions([]);
  };

  const hasRole = (role: string) => roles.includes(role);
  const hasPermission = (permission: string) => permissions.includes(permission);

  return (
    <AuthContext.Provider
      value={{
        user,
        roles,
        permissions,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        hasRole,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth harus dipakai di dalam AuthProvider');
  }
  return context;
}