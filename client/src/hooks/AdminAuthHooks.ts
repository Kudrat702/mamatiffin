// src/context/AdminAuthHooks.ts
import { useContext } from 'react';
import { AuthContext } from '../context/AdminAuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Optional: You can add more auth-related hooks here if needed
// For example:
export const useAdminAuth = () => {
  const { isAuthenticated, token } = useAuth();
  
  return {
    isAdmin: isAuthenticated,
    adminToken: token
  };
};