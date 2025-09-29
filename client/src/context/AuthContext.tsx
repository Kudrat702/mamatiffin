// import React, { createContext, useContext, useState, useEffect } from 'react';
// import type { ReactNode } from 'react';

// interface User {
//   id: string;
//   name: string;
//   phone: string;
//   address: {
//     district: string;
//     block: string;
//     city: string;
//     homeLodgeName: string;
//   };
//   role: string;
// }

// interface AuthContextType {
//   user: User | null;
//   token: string | null;
//   login: (userData: User, userToken: string) => void;
//   logout: () => void;
//   isAuthenticated: boolean;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// interface AuthProviderProps {
//   children: ReactNode;
// }

// export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
//   const [user, setUser] = useState<User | null>(null);
//   const [token, setToken] = useState<string | null>(null);

//   // Load user data on app initialization
//   useEffect(() => {
//     const savedUser = sessionStorage.getItem('user');
//     const savedToken = sessionStorage.getItem('token');
    
//     if (savedUser && savedToken) {
//       try {
//         setUser(JSON.parse(savedUser));
//         setToken(savedToken);
//       } catch (error) {
//         console.error('Error parsing saved user data:', error);
//         // Clear invalid data
//         sessionStorage.removeItem('user');
//         sessionStorage.removeItem('token');
//       }
//     }
//   }, []);

//   const login = (userData: User, userToken: string) => {
//     setUser(userData);
//     setToken(userToken);
    
//     // Store in session storage
//     sessionStorage.setItem('user', JSON.stringify(userData));
//     sessionStorage.setItem('token', userToken);
//   };

//   const logout = () => {
//     setUser(null);
//     setToken(null);
    
//     // Clear session storage
//     sessionStorage.removeItem('user');
//     sessionStorage.removeItem('token');
//   };

//   const isAuthenticated = !!user && !!token;

//   const value: AuthContextType = {
//     user,
//     token,
//     login,
//     logout,
//     isAuthenticated
//   };

//   return (
//     <AuthContext.Provider value={value}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = (): AuthContextType => {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };

import React, { createContext, useContext, useState } from 'react';
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const login = (userData: User, userToken: string) => {
    console.log('🔥 GLOBAL AUTH: User logged in', userData.name);
    setUser(userData);
    setToken(userToken);
  };

  const logout = () => {
    console.log('🔥 GLOBAL AUTH: User logged out');
    setUser(null);
    setToken(null);
  };

  const isAuthenticated = !!user && !!token;

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isAuthenticated
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