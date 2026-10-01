import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Role } from '../types.js';
import { apiRequest } from '../api/client.js';

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: Role;
  collegeName: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: RegisterData) => Promise<User>;
  logout: () => void;
  updateProfile: (data: { name: string; phone?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('canteenx_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('canteenx_token') || null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Validate session with server on initial mount
  useEffect(() => {
    const verifyAuth = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await apiRequest<{ user: User }>('/auth/me');
        if (response && response.user) {
          setUser(response.user);
          localStorage.setItem('canteenx_user', JSON.stringify(response.user));
        }
      } catch (err) {
        // If verification fails, clear stored credentials
        console.warn('Auth verification failed:', err);
        setUser(null);
        setToken(null);
        localStorage.removeItem('canteenx_token');
        localStorage.removeItem('canteenx_user');
      } finally {
        setIsLoading(false);
      }
    };

    verifyAuth();

    const handleExpired = () => {
      setUser(null);
      setToken(null);
    };

    window.addEventListener('auth_expired', handleExpired);
    return () => window.removeEventListener('auth_expired', handleExpired);
  }, [token]);

  const login = async (email: string, password: string): Promise<User> => {
    const data = await apiRequest<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('canteenx_token', data.token);
    localStorage.setItem('canteenx_user', JSON.stringify(data.user));
    return data.user;
  };

  const register = async (regData: RegisterData): Promise<User> => {
    const data = await apiRequest<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(regData),
    });

    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('canteenx_token', data.token);
    localStorage.setItem('canteenx_user', JSON.stringify(data.user));
    return data.user;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('canteenx_token');
    localStorage.removeItem('canteenx_user');
  };

  const updateProfile = async (profileData: { name: string; phone?: string }) => {
    const data = await apiRequest<{ user: User }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });

    if (data.user) {
      setUser(data.user);
      localStorage.setItem('canteenx_user', JSON.stringify(data.user));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
