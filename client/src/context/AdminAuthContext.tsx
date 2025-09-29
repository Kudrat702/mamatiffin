// import React, { useState, useEffect } from 'react';
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
// export const AuthContext = React.createContext<AuthContextType | undefined>(undefined);
// //const AuthContext = createContext<AuthContextType | undefined>(undefined);

// const AUTH_TOKEN_KEY = 'ADMIN_TOKEN';

// export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
//   const [token, setToken] = useState<string | null>(null);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);

//   useEffect(() => {
//     // Check for existing token on app load
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

// // Remove useAuth and AuthContext export from this file.
// // Move them to a new file named AdminAuthHooks.ts

// src/context/AdminAuthContext.tsx
import React, { createContext } from 'react';
import type { ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_TOKEN_KEY = 'ADMIN_TOKEN';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = React.useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  React.useEffect(() => {
    const savedToken = localStorage.getItem(AUTH_TOKEN_KEY);
    if (savedToken) {
      setToken(savedToken);
      setIsAuthenticated(true);
    }
  }, []);

  const login = (newToken: string) => {
    setToken(newToken);
    setIsAuthenticated(true);
    localStorage.setItem(AUTH_TOKEN_KEY, newToken);
  };

  const logout = () => {
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem(AUTH_TOKEN_KEY);
  };

  const value: AuthContextType = {
    isAuthenticated,
    token,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};