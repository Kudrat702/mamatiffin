// src/context/AuthContext.tsx (or wherever your current file is)
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  phone: string;
  address: {
    district: string;
    block: string;
    city: string;
    homeLodgeName: string;
  };
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (userData: User, userToken: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean; // ⬅️ NEW: Loading state
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // ⬅️ NEW: Loading state

  // ⬅️ NEW: Auto-login from localStorage on mount
  useEffect(() => {
    const loadUserFromStorage = () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
          const parsedUser = JSON.parse(storedUser) as User;
          setToken(storedToken);
          setUser(parsedUser);
          console.log('✅ User auto-logged in from localStorage:', parsedUser.name);
        }
      } catch (error) {
        console.error('❌ Error loading user from localStorage:', error);
        // Clear corrupted data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    loadUserFromStorage();
  }, []);

  // ⬅️ UPDATED: Now saves to localStorage
  const login = (userData: User, userToken: string) => {
    console.log('🔥 GLOBAL AUTH: User logged in', userData.name);
    setUser(userData);
    setToken(userToken);
    
    // Save to localStorage for persistence
    localStorage.setItem('token', userToken);
    localStorage.setItem('user', JSON.stringify(userData));
    console.log('✅ Saved to localStorage');
  };

  // ⬅️ UPDATED: Now clears localStorage
  const logout = () => {
    console.log('🔥 GLOBAL AUTH: User logged out');
    setUser(null);
    setToken(null);
    
    // Clear from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    console.log('✅ Cleared from localStorage');
  };

  const isAuthenticated = !!user && !!token;

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isAuthenticated,
    loading // ⬅️ NEW: Expose loading state
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};