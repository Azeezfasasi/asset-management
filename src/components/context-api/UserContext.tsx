'use client';

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { usePathname } from 'next/navigation';

export type UserRole = 'Super Admin' | 'Admin' | 'Manager' | 'User';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface RoleConfig {
  label: UserRole;
  rank: number;
  badgeClassName: string;
}

interface UserContextValue {
  user: AuthUser | null;
  loading: boolean;
  refreshUser: () => Promise<AuthUser | null>;
  clearUser: () => void;
  setAuthenticatedUser: (nextUser: AuthUser) => void;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

const PUBLIC_ROUTES = ['/', '/forget-password', '/reset-password', '/register'];

export const ROLE_MAP: Record<UserRole, RoleConfig> = {
  'Super Admin': {
    label: 'Super Admin',
    rank: 4,
    badgeClassName: 'bg-red-100 text-red-800',
  },
  Admin: {
    label: 'Admin',
    rank: 3,
    badgeClassName: 'bg-blue-100 text-blue-800',
  },
  Manager: {
    label: 'Manager',
    rank: 2,
    badgeClassName: 'bg-green-100 text-green-800',
  },
  User: {
    label: 'User',
    rank: 1,
    badgeClassName: 'bg-gray-100 text-gray-800',
  },
};

export const ROLE_OPTIONS = Object.keys(ROLE_MAP) as UserRole[];

export function getRoleConfig(role: string) {
  return ROLE_MAP[(role as UserRole) || 'User'] ?? ROLE_MAP.User;
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  const refreshUser = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
      });

      if (response.status === 401) {
        setUser(null);
        return null;
      }

      if (!response.ok) {
        console.error(`Refresh user failed with status ${response.status}`);
        setUser(null);
        return null;
      }

      const data = await response.json();
      setUser(data.user);
      return data.user;
    } catch (error) {
      console.error('Refresh user error:', error);
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const clearUser = () => {
    setUser(null);
    setLoading(false);
  };

  const setAuthenticatedUser = (nextUser: AuthUser) => {
    setUser(nextUser);
    setLoading(false);
  };

  useEffect(() => {
    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

    if (isPublicRoute) {
      queueMicrotask(() => {
        setLoading(false);
      });
      return;
    }

    queueMicrotask(() => {
      void refreshUser();
    });
  }, [pathname]);

  return (
    <UserContext.Provider
      value={{ user, loading, refreshUser, clearUser, setAuthenticatedUser }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }

  return context;
}
