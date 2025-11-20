// import React, { useState, useEffect } from 'react';
// import AuthModal from './AuthModal';

// interface LocalUser {
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

// interface ProtectedRouteProps {
//   children: React.ReactNode;
//   requireRole?: string[];
// }

// const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireRole }) => {
//   const [user, setUser] = useState<LocalUser | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [showAuthModal, setShowAuthModal] = useState(false);

//   useEffect(() => {
//     checkAuthentication();
//   }, []);

//   const checkAuthentication = () => {
//     const savedUser = sessionStorage.getItem('user');
//     const savedToken = sessionStorage.getItem('token');
    
//     if (savedUser && savedToken) {
//       const userData = JSON.parse(savedUser);
//       setUser(userData);
//     }
//     setLoading(false);
//   };

//   const handleLoginSuccess = (user: LocalUser, token: string) => {
//     setUser(user);
//     sessionStorage.setItem('user', JSON.stringify(user));
//     sessionStorage.setItem('token', token);
//     setShowAuthModal(false);
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
//         <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
//       </div>
//     );
//   }

//   // If no user is logged in, show auth modal
//   if (!user) {
//     return (
//       <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
//         <div className="text-center p-8">
//           <div className="mb-6">
//             <svg className="mx-auto h-24 w-24 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
//             </svg>
//           </div>
//           <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
//             Authentication Required
//           </h2>
//           <p className="text-gray-600 dark:text-gray-400 mb-6">
//             Please sign in to access this page
//           </p>
//           <button
//             onClick={() => setShowAuthModal(true)}
//             className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
//           >
//             Sign In
//           </button>
//         </div>
        
//         <AuthModal
//           isOpen={showAuthModal}
//           onClose={() => setShowAuthModal(false)}
//           onLoginSuccess={handleLoginSuccess}
//         />
//       </div>
//     );
//   }

//   // If role is required, check if user has the required role
//   if (requireRole && !requireRole.includes(user.role)) {
//     return (
//       <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
//         <div className="text-center p-8">
//           <div className="mb-6">
//             <svg className="mx-auto h-24 w-24 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M18.364 18.364L5.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364L18.364 5.636" />
//             </svg>
//           </div>
//           <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
//             Access Denied
//           </h2>
//           <p className="text-gray-600 dark:text-gray-400 mb-6">
//             You don't have permission to access this page. This area is restricted to {requireRole?.join(' and ')} users.
//           </p>
//           <button
//             onClick={() => window.history.back()}
//             className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors mr-4"
//           >
//             Go Back
//           </button>
//           <button
//             onClick={() => window.location.href = '/home'}
//             className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
//           >
//             Go Home
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // User is authenticated and has required role (if any)
//   return <>{children}</>;
// };

// export default ProtectedRoute;

// src/components/ProtectedRoute.tsx
// For protecting NORMAL USER routes (not admin routes)

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext'; // User AuthContext
import AuthModal from './AuthModal';

interface LocalUser {
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

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: string[]; // Optional role requirement
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireRole }) => {
  const { user: authUser, isAuthenticated: authAuthenticated, loading: authLoading } = useAuth();
  const [user, setUser] = useState<LocalUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // ============================================
  // CHECK AUTHENTICATION ON MOUNT
  // ============================================
  useEffect(() => {
    checkAuthentication();
  }, [authUser, authAuthenticated, authLoading]);

  const checkAuthentication = () => {
    // Priority 1: Check AuthContext
    if (authUser && authAuthenticated) {
      setUser(authUser as LocalUser);
      setLoading(false);
      return;
    }

    // Priority 2: Check localStorage
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    
    if (savedUser && savedToken) {
      try {
        const userData = JSON.parse(savedUser) as LocalUser;
        setUser(userData);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
      }
    } else {
      setUser(null);
    }
    
    setLoading(false);
  };

  // ============================================
  // HANDLE LOGIN SUCCESS
  // ============================================
  const handleLoginSuccess = (userData: LocalUser, token: string) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
    setShowAuthModal(false);
    
    // Dispatch event to notify other components
    window.dispatchEvent(new CustomEvent('userAuthChanged'));
  };

  // ============================================
  // LOADING STATE
  // ============================================
  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // ============================================
  // NOT AUTHENTICATED - SHOW LOGIN
  // ============================================
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center p-8">
          {/* Lock Icon */}
          <div className="mb-6">
            <svg 
              className="mx-auto h-24 w-24 text-gray-400 dark:text-gray-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
              />
            </svg>
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Authentication Required
          </h2>

          {/* Description */}
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
            Please sign in to access this page. You need to be logged in to view this content.
          </p>

          {/* Sign In Button */}
          <button
            onClick={() => setShowAuthModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Sign In
          </button>

          {/* Go Home Link */}
          <div className="mt-6">
            <button
              onClick={() => window.location.href = '/home'}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              ← Back to Home
            </button>
          </div>
        </div>
        
        {/* Auth Modal */}
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      </div>
    );
  }

  // ============================================
  // ROLE CHECK (If required)
  // ============================================
  if (requireRole && !requireRole.includes(user.role)) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center p-8 max-w-2xl">
          {/* X Icon */}
          <div className="mb-6">
            <div className="mx-auto h-24 w-24 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
              <svg 
                className="h-12 w-12 text-red-600 dark:text-red-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M6 18L18 6M6 6l12 12" 
                />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Access Denied
          </h2>

          {/* Description */}
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            You don't have permission to access this page.
          </p>
          <p className="text-gray-500 dark:text-gray-500 text-sm mb-8">
            This area is restricted to <span className="font-semibold">{requireRole?.join(' and ')}</span> users only.
          </p>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => window.history.back()}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Go Back
            </button>
            <button
              onClick={() => window.location.href = '/home'}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // AUTHENTICATED & AUTHORIZED - RENDER CHILDREN
  // ============================================
  return <>{children}</>;
};

export default ProtectedRoute;