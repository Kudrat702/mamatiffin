// // src/context/AdminAuthContext.tsx
// import React, { createContext } from 'react';
// import type { ReactNode } from 'react';

// interface AuthContextType {
//   isAuthenticated: boolean;
//   token: string | null;
//   login: (token: string) => void;
//   logout: () => void;
// }

// interface AuthProviderProps {
//   children: ReactNode;
// }

// export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// const AUTH_TOKEN_KEY = 'ADMIN_TOKEN';

// export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
//   const [token, setToken] = React.useState<string | null>(null);
//   const [isAuthenticated, setIsAuthenticated] = React.useState(false);

//   React.useEffect(() => {
//     const savedToken = localStorage.getItem(AUTH_TOKEN_KEY);
//     if (savedToken) {
//       setToken(savedToken);
//       setIsAuthenticated(true);
//     }
//   }, []);

//   const login = (newToken: string) => {
//     setToken(newToken);
//     setIsAuthenticated(true);
//     localStorage.setItem(AUTH_TOKEN_KEY, newToken);
//   };

//   const logout = () => {
//     setToken(null);
//     setIsAuthenticated(false);
//     localStorage.removeItem(AUTH_TOKEN_KEY);
//   };

//   const value: AuthContextType = {
//     isAuthenticated,
//     token,
//     login,
//     logout
//   };

//   return (
//     <AuthContext.Provider value={value}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// src/context/AdminAuthContext.tsx
// FINAL VERSION - Complete with 1 hour token expiry and localStorage persistence

// src/context/AdminAuthContext.tsx
// FINAL VERSION - TypeScript & ESLint errors fixed

import React, { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react'; // ✅ Type-only import

// ============================================
// INTERFACES
// ============================================
interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (token: string) => void;
  logout: () => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

// ============================================
// CONSTANTS
// ============================================
const ADMIN_TOKEN_KEY = 'ADMIN_TOKEN';
const ADMIN_TOKEN_EXPIRY_KEY = 'ADMIN_TOKEN_EXPIRY';
const TOKEN_EXPIRY_DURATION = 60 * 60 * 1000; // 1 hour

// ============================================
// CONTEXT
// ============================================
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================
// AUTH PROVIDER COMPONENT
// ============================================
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // ============================================
  // LOAD TOKEN FROM LOCALSTORAGE ON MOUNT
  // ============================================
  useEffect(() => {
    const loadToken = () => {
      try {
        const savedToken = localStorage.getItem(ADMIN_TOKEN_KEY);
        const savedExpiry = localStorage.getItem(ADMIN_TOKEN_EXPIRY_KEY);

        if (savedToken && savedExpiry) {
          const expiryTime = parseInt(savedExpiry, 10);
          const currentTime = Date.now();

          // Check if token is still valid
          if (currentTime < expiryTime) {
            setToken(savedToken);
            console.log('✅ Admin token loaded from localStorage');
            console.log(`⏰ Token expires in ${Math.floor((expiryTime - currentTime) / 1000 / 60)} minutes`);

            // Set timeout to auto-logout when token expires
            const timeUntilExpiry = expiryTime - currentTime;
            setTimeout(() => {
              console.log('⏰ Admin token expired, logging out...');
              logout();
            }, timeUntilExpiry);
          } else {
            console.log('❌ Admin token expired, clearing...');
            localStorage.removeItem(ADMIN_TOKEN_KEY);
            localStorage.removeItem(ADMIN_TOKEN_EXPIRY_KEY);
            setToken(null);
          }
        } else {
          setToken(null);
        }
      } catch (error) {
        console.error('❌ Error loading admin token:', error);
        localStorage.removeItem(ADMIN_TOKEN_KEY);
        localStorage.removeItem(ADMIN_TOKEN_EXPIRY_KEY);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    loadToken();
  }, []);

  // ============================================
  // LOGIN FUNCTION
  // ============================================
  const login = (newToken: string) => {
    const expiryTime = Date.now() + TOKEN_EXPIRY_DURATION;

    setToken(newToken);
    localStorage.setItem(ADMIN_TOKEN_KEY, newToken);
    localStorage.setItem(ADMIN_TOKEN_EXPIRY_KEY, expiryTime.toString());

    console.log('🔐 Admin logged in successfully');
    console.log('⏰ Token will expire in 1 hour');

    setTimeout(() => {
      console.log('⏰ Admin token expired after 1 hour, logging out...');
      logout();
    }, TOKEN_EXPIRY_DURATION);
  };

  // ============================================
  // LOGOUT FUNCTION
  // ============================================
  const logout = () => {
    setToken(null);
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_TOKEN_EXPIRY_KEY);
    console.log('🚪 Admin logged out');
  };

  // ============================================
  // CONTEXT VALUE
  // ============================================
  const value: AuthContextType = {
    token,
    isAuthenticated: !!token,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ============================================
// CUSTOM HOOK
// ============================================
export const useAdminAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within AuthProvider');
  }
  return context;
};

// ✅ Default export for convenience
export default AuthProvider;