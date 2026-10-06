import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { authApi } from '@/services/api';
import type { AuthResponse, User } from '@/types';

const TOKEN_KEY = 'flowtodo-access-token';
const AUTH_EXPIRED_EVENT = 'flowtodo-auth-expired';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuthToken() {
  localStorage.removeItem(TOKEN_KEY);
}

function applyAuthResponse(response: AuthResponse, setUser: (user: User) => void) {
  setAuthToken(response.access_token);
  setUser(response.user);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleExpired = () => {
      clearAuthToken();
      setUser(null);
    };
    window.addEventListener(AUTH_EXPIRED_EVENT, handleExpired);

    const token = getAuthToken();
    if (!token) {
      setLoading(false);
    } else {
      authApi.me()
        .then(setUser)
        .catch(() => {
          clearAuthToken();
          setUser(null);
        })
        .finally(() => setLoading(false));
    }

    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, handleExpired);
  }, []);

  const login = async (identifier: string, password: string) => {
    const response = await authApi.login(identifier, password);
    applyAuthResponse(response, setUser);
  };

  const register = async (username: string, email: string, password: string) => {
    const response = await authApi.register({ username, email: email || undefined, password });
    applyAuthResponse(response, setUser);
  };

  const logout = () => {
    clearAuthToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated: Boolean(user), login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
