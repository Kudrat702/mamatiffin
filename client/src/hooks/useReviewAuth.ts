// hooks/useReviewAuth.ts
import React, { useState, useEffect, useContext, createContext } from 'react';
import type { ReactNode } from 'react';

// Types and Interfaces
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: {
    district: string;
    block: string;
    city: string;
    homeLodgeName: string;
  };
  role: 'customer' | 'admin' | 'moderator';
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  refreshAuth: () => Promise<void>;
}

// Create Review Auth Context
export const ReviewAuthContext = createContext<AuthContextType | undefined>(undefined);

// Review Auth Provider Component
export const ReviewAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing auth on app load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const savedUser = sessionStorage.getItem('reviewUser');
      const savedToken = sessionStorage.getItem('reviewToken');

      if (savedUser && savedToken) {
        const parsedUser = JSON.parse(savedUser);
        
        // Validate token
        if (await isValidToken(savedToken)) {
          setUser(parsedUser);
        } else {
          // Token is invalid, clear storage
          clearAuthData();
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      clearAuthData();
    } finally {
      setIsLoading(false);
    }
  };

  // Token validation with backend verification
  const isValidToken = async (token: string): Promise<boolean> => {
    try {
      if (!token) return false;
      
      // Basic JWT structure check
      const parts = token.split('.');
      if (parts.length !== 3) return false;

      // Decode payload to check expiration
      const payload = JSON.parse(atob(parts[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      if (payload.exp <= currentTime) {
        return false; // Token expired
      }

      // Optional: Verify with backend
      try {
        const response = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        return response.ok;
      } catch (backendError) {
        console.warn('Backend token verification failed, using local validation:', backendError);
        return true; // Fallback to local validation
      }
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  };

  // Clear authentication data
  const clearAuthData = (): void => {
    sessionStorage.removeItem('reviewUser');
    sessionStorage.removeItem('reviewToken');
    setUser(null);
  };

  // Login function
  const login = (userData: User, token: string): void => {
    try {
      setUser(userData);
      sessionStorage.setItem('reviewUser', JSON.stringify(userData));
      sessionStorage.setItem('reviewToken', token);
      
      // Optional: Set up token refresh timer
      setupTokenRefresh(token);
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Failed to save authentication data');
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      const token = sessionStorage.getItem('reviewToken');
      
      // Optional: Notify backend about logout
      if (token) {
        try {
          await fetch('/api/auth/logout', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
        } catch (error) {
          console.warn('Backend logout notification failed:', error);
        }
      }
      
      clearAuthData();
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local data even if backend call fails
      clearAuthData();
    }
  };

  // Update user data
  const updateUser = (userData: Partial<User>): void => {
    if (!user) return;
    
    try {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      sessionStorage.setItem('reviewUser', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Update user error:', error);
    }
  };

  // Refresh authentication
  const refreshAuth = async (): Promise<void> => {
    await checkAuthStatus();
  };

  // Setup automatic token refresh
  const setupTokenRefresh = (token: string): void => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      const timeUntilExpiry = expirationTime - currentTime;
      
      // Refresh token 5 minutes before expiry
      const refreshTime = timeUntilExpiry - (5 * 60 * 1000);
      
      if (refreshTime > 0) {
        setTimeout(async () => {
          try {
            const response = await fetch('/api/auth/refresh', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (response.ok) {
              const data = await response.json();
              login(data.user, data.token);
            } else {
              logout(); // Token refresh failed, logout user
            }
          } catch (error) {
            console.error('Token refresh error:', error);
            logout();
          }
        }, refreshTime);
      }
    } catch (error) {
      console.error('Token refresh setup error:', error);
    }
  };

  const contextValue: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    updateUser,
    refreshAuth
  };

  return React.createElement(
    ReviewAuthContext.Provider,
    { value: contextValue },
    children
  );
};

// Custom hook to use Review Auth
export const useReviewAuth = (): AuthContextType => {
  const context = useContext(ReviewAuthContext);
  
  if (!context) {
    throw new Error('useReviewAuth must be used within a ReviewAuthProvider');
  }
  
  return context;
};

// Additional utility hooks



// Additional utility hooks

// Hook for checking specific permissions
export const usePermissions = () => {
  const { user } = useReviewAuth();
  
  const can = (permission: string): boolean => {
    if (!user) return false;
    
    const permissions: Record<string, string[]> = {
      'review.create': ['customer', 'admin', 'moderator'],
      'review.edit': ['admin', 'moderator'],
      'review.delete': ['admin'],
      'review.moderate': ['admin', 'moderator'],
      'admin.access': ['admin', 'moderator']
    };
    
    return permissions[permission]?.includes(user.role) || false;
  };
  
  const isCustomer = user?.role === 'customer';
  const isAdmin = user?.role === 'admin';
  const isModerator = user?.role === 'moderator';
  const isAdminOrModerator = isAdmin || isModerator;
  
  return {
    can,
    isCustomer,
    isAdmin,
    isModerator,
    isAdminOrModerator
  };
};

// Hook for getting user profile data
export const useUserProfile = () => {
  const { user, updateUser } = useReviewAuth();
  
  const getFullName = (): string => user?.name || '';
  const getEmail = (): string => user?.email || '';
  const getPhone = (): string => user?.phone || '';
  const getAddress = () => user?.address || null;
  const getRole = () => user?.role || null;
  
  const updateProfile = async (profileData: Partial<User>): Promise<void> => {
    try {
      const token = sessionStorage.getItem('reviewToken');
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });
      
      if (response.ok) {
        const updatedUser = await response.json();
        updateUser(updatedUser);
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };
  
  return {
    user,
    getFullName,
    getEmail,
    getPhone,
    getAddress,
    getRole,
    updateProfile
  };
};

// Hook for handling auth loading states
export const useAuthLoading = () => {
  const { isLoading } = useReviewAuth();
  const [actionLoading, setActionLoading] = useState(false);
  
  const withLoading = async <T>(action: () => Promise<T>): Promise<T> => {
    setActionLoading(true);
    try {
      return await action();
    } finally {
      setActionLoading(false);
    }
  };
  
  return {
    isLoading: isLoading || actionLoading,
    withLoading,
    isAuthLoading: isLoading,
    isActionLoading: actionLoading
  };
};

export default useReviewAuth;