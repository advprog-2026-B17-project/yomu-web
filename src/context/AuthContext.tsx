'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession, signIn as nextAuthSignIn, signOut as nextAuthSignOut } from 'next-auth/react';

interface User {
  id: string;
  username: string;
  displayName: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (credentials: { username: string; password: string }) => Promise<void>;
  register: (data: { username: string; email: string; displayName: string; password: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Sync NextAuth session with state
  useEffect(() => {
    if (status === 'loading') return;

    if (session) {
      const sessionUser = session as any;
      const userData = {
        id: sessionUser.userId || '',
        username: sessionUser.user?.name || sessionUser.user?.email || '',
        displayName: sessionUser.user?.name || '',
        role: sessionUser.role || 'student',
      };
      setUser(userData);
      setToken(sessionUser.accessToken || '');
      localStorage.setItem('yomu_user', JSON.stringify(userData));
      localStorage.setItem('yomu_token', sessionUser.accessToken || '');
    } else {
      // Check localStorage for manual login
      const storedUser = localStorage.getItem('yomu_user');
      const storedToken = localStorage.getItem('yomu_token');
      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      }
    }
    setIsLoading(false);
  }, [session, status]);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000';

  const login = async ({ username, password }: { username: string; password: string }) => {
    const res = await fetch(`${apiUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) throw new Error('Login failed');

    const data = await res.json();
    const userData = { id: data.userId, username: data.username, displayName: data.displayName, role: data.role };
    setUser(userData);
    setToken(data.token);
    localStorage.setItem('yomu_user', JSON.stringify(userData));
    localStorage.setItem('yomu_token', data.token);
  };

  const register = async ({ username, email, displayName, password }: { username: string; email: string; displayName: string; password: string }) => {
    const res = await fetch(`${apiUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, displayName, password }),
    });

    if (!res.ok) throw new Error('Registration failed');

    const data = await res.json();
    const userData = { id: data.userId, username: data.username, displayName: data.displayName, role: data.role };
    setUser(userData);
    setToken(data.token);
    localStorage.setItem('yomu_user', JSON.stringify(userData));
    localStorage.setItem('yomu_token', data.token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('yomu_user');
    localStorage.removeItem('yomu_token');
    nextAuthSignOut({ callbackUrl: '/login' });
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
