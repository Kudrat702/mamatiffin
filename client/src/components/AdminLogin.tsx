// import React, { useState, useContext } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { AuthContext } from '../context/AdminAuthContext';
// import { adminLogin } from '../../services/api'; // Fixed: Removed extra ../

// const AdminLogin: React.FC = () => {
//   const [password, setPassword] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const authContext = useContext(AuthContext);
  
//   if (!authContext) {
//     throw new Error('AuthContext is undefined. Make sure your component is wrapped in AuthProvider.');
//   }
  
//   const { login } = authContext;
//   const navigate = useNavigate();

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setError(null);

//     try {
//       const response = await adminLogin(password);
//       if (!response.token) {
//         throw new Error('Login failed: token not provided.');
//       }
//       login(response.token);
//       navigate('/super-admin');
//     } catch (err: unknown) {
//       type ErrorResponse = { response?: { data?: { message?: string } } };
//       if (
//         err &&
//         typeof err === 'object' &&
//         'response' in err &&
//         (err as ErrorResponse).response?.data?.message
//       ) {
//         setError((err as ErrorResponse).response!.data!.message!);
//       } else {
//         setError('Invalid password. Please try again.');
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <>
//       {/* CSS Styles */}
//       <style>{`
//         @keyframes bounce-custom {
//           0%, 100% {
//             transform: translateY(-25%);
//             animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
//           }
//           50% {
//             transform: translateY(0);
//             animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
//           }
//         }
        
//         @keyframes pulse-custom {
//           0%, 100% {
//             opacity: 0.1;
//           }
//           50% {
//             opacity: 0.2;
//           }
//         }
        
//         .floating-circle-1 {
//           animation: pulse-custom 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
//         }
        
//         .floating-circle-2 {
//           animation: bounce-custom 3s ease-in-out infinite;
//         }
        
//         .floating-circle-3 {
//           animation: pulse-custom 2s cubic-bezier(0.4, 0, 0.6, 1) infinite 1s;
//         }
        
//         .login-input:focus {
//           outline: none;
//           border-color: #328c81;
//           box-shadow: 0 0 0 2px rgba(50, 140, 129, 0.3);
//         }
        
//         .login-button:focus {
//           outline: none;
//           box-shadow: 0 0 0 2px rgba(50, 140, 129, 0.5);
//         }
        
//         .glass-card {
//           background: rgba(255, 255, 255, 0.1);
//           backdrop-filter: blur(10px);
//           border: 1px solid rgba(255, 255, 255, 0.2);
//         }
        
//         .input-glass {
//           background: rgba(255, 255, 255, 0.2);
//           backdrop-filter: blur(10px);
//           border: 1px solid rgba(255, 255, 255, 0.3);
//         }
        
//         .error-glass {
//           background: rgba(239, 68, 68, 0.2);
//           backdrop-filter: blur(10px);
//           border: 1px solid rgba(248, 113, 113, 0.3);
//         }
//       `}</style>

//       <div className="min-h-screen relative overflow-hidden">
//         {/* Animated Background */}
//         <div 
//           className="absolute inset-0"
//           style={{
//             background: 'linear-gradient(135deg, #0f172a 0%, #134e4a 50%, #064e3b 100%)'
//           }}
//         >
//           {/* Animated floating circles */}
//           <div 
//             className="absolute top-10 left-10 w-72 h-72 rounded-full floating-circle-1" 
//             style={{ 
//               background: 'linear-gradient(135deg, #328c81, #2dd4bf)',
//               opacity: 0.1
//             }}
//           ></div>
//           <div 
//             className="absolute top-1/3 right-20 w-96 h-96 rounded-full floating-circle-2" 
//             style={{ 
//               background: 'linear-gradient(45deg, #0d9488, #328c81)',
//               opacity: 0.1
//             }}
//           ></div>
//           <div 
//             className="absolute bottom-20 left-1/4 w-64 h-64 rounded-full floating-circle-3" 
//             style={{ 
//               background: 'linear-gradient(225deg, #14b8a6, #328c81)',
//               opacity: 0.1
//             }}
//           ></div>
          
//           {/* Grid pattern overlay */}
//           <div 
//             className="absolute inset-0" 
//             style={{
//               backgroundImage: `
//                 linear-gradient(#328c81 1px, transparent 1px),
//                 linear-gradient(90deg, #328c81 1px, transparent 1px)
//               `,
//               backgroundSize: '50px 50px',
//               opacity: 0.05
//             }}
//           ></div>
//         </div>

//         {/* Content */}
//         <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
//           <div className="max-w-md w-full space-y-8">
//             {/* Logo/Icon Section */}
//             <div className="text-center">
//               <div 
//                 className="mx-auto h-16 w-16 flex items-center justify-center rounded-2xl shadow-2xl transition-transform duration-300 hover:scale-110"
//                 style={{ 
//                   background: 'linear-gradient(135deg, #328c81, #0d9488)',
//                   boxShadow: '0 25px 50px -12px rgba(50, 140, 129, 0.5)'
//                 }}
//               >
//                 <svg
//                   className="h-8 w-8 text-white"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2.5}
//                     d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
//                   />
//                 </svg>
//               </div>
//               <h2 className="mt-8 text-4xl font-bold text-white tracking-tight">
//                 Admin Portal
//               </h2>
//               <p className="mt-3 text-lg text-teal-100" style={{ opacity: 0.8 }}>
//                 Secure access to your dashboard
//               </p>
//             </div>

//             {/* Login Form */}
//             <div 
//               className="glass-card rounded-2xl shadow-2xl p-8 transition-all duration-300 hover:scale-105"
//               style={{
//                 boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
//               }}
//             >
//               <form className="space-y-6" onSubmit={handleSubmit}>
//                 <div>
//                   <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
//                     Admin Password
//                   </label>
//                   <div className="relative group">
//                     <input
//                       id="password"
//                       name="password"
//                       type="password"
//                       required
//                       value={password}
//                       onChange={(e) => setPassword(e.target.value)}
//                       className="login-input input-glass w-full px-4 py-3 text-white rounded-xl transition-all duration-200 text-base placeholder-white"
//                       style={{ 
//                         opacity: 0.6
//                       }}
//                       placeholder="Enter your password"
//                     />
//                     <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
//                       <svg 
//                         className="h-5 w-5 text-white transition-colors group-hover:opacity-80" 
//                         style={{ opacity: 0.6 }}
//                         fill="none" 
//                         stroke="currentColor" 
//                         viewBox="0 0 24 24"
//                       >
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
//                       </svg>
//                     </div>
//                   </div>
//                 </div>

//                 {error && (
//                   <div className="error-glass text-red-100 px-4 py-3 rounded-xl flex items-center space-x-2">
//                     <svg className="h-5 w-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                     </svg>
//                     <span className="text-sm font-medium">{error}</span>
//                   </div>
//                 )}

//                 <div>
//                   <button
//                     type="submit"
//                     disabled={isLoading}
//                     className={`login-button group relative w-full flex justify-center py-3 px-4 border-0 text-base font-semibold rounded-xl text-white transition-all duration-300 transform ${
//                       isLoading
//                         ? 'cursor-not-allowed scale-95'
//                         : 'hover:scale-105 active:scale-95'
//                     }`}
//                     style={{
//                       background: isLoading 
//                         ? 'rgba(107, 114, 128, 0.5)' 
//                         : 'linear-gradient(135deg, #328c81, #0d9488)',
//                       boxShadow: isLoading 
//                         ? 'none' 
//                         : '0 10px 25px -5px rgba(50, 140, 129, 0.4)'
//                     }}
//                     onMouseEnter={(e) => {
//                       if (!isLoading) {
//                         e.currentTarget.style.boxShadow = '0 20px 40px -10px rgba(50, 140, 129, 0.6)';
//                       }
//                     }}
//                     onMouseLeave={(e) => {
//                       if (!isLoading) {
//                         e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(50, 140, 129, 0.4)';
//                       }
//                     }}
//                   >
//                     <span className="absolute left-0 inset-y-0 flex items-center pl-4">
//                       {isLoading ? (
//                         <div 
//                           className="rounded-full h-5 w-5 border-2 border-white border-t-transparent"
//                           style={{
//                             animation: 'spin 1s linear infinite'
//                           }}
//                         ></div>
//                       ) : (
//                         <svg
//                           className="h-5 w-5 text-white transition-colors duration-200 group-hover:opacity-100"
//                           style={{ opacity: 0.8 }}
//                           fill="currentColor"
//                           viewBox="0 0 20 20"
//                         >
//                           <path
//                             fillRule="evenodd"
//                             d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
//                             clipRule="evenodd"
//                           />
//                         </svg>
//                       )}
//                     </span>
//                     {isLoading ? 'Authenticating...' : 'Access Dashboard'}
//                   </button>
//                 </div>
//               </form>
//             </div>

//             {/* Footer */}
//             <div className="text-center">
//               <p 
//                 className="text-sm text-teal-100 flex items-center justify-center space-x-2"
//                 style={{ opacity: 0.6 }}
//               >
//                 <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
//                 </svg>
//                 <span>Protected by enterprise-grade security</span>
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Additional keyframes for spin animation */}
//         <style>{`
//           @keyframes spin {
//             from {
//               transform: rotate(0deg);
//             }
//             to {
//               transform: rotate(360deg);
//             }
//           }
//         `}</style>
//       </div>
//     </>
//   );
// };

// export default AdminLogin;

import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AdminAuthContext';
import { adminLogin } from '../../services/api';

const AdminLogin: React.FC = () => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const authContext = useContext(AuthContext);
  
  if (!authContext) {
    throw new Error('AuthContext is undefined. Make sure your component is wrapped in AdminAuthProvider.');
  }
  
  const { login, isAuthenticated } = authContext;
  const navigate = useNavigate();

  // Auto-redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log('✅ Admin already authenticated, redirecting...');
      navigate('/super-admin', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await adminLogin(password);
      if (!response.token) {
        throw new Error('Login failed: token not provided.');
      }
      
      // Call login function which will save token with 1 hour expiry
      login(response.token);
      
      console.log('✅ Admin login successful, token saved for 1 hour');
      
      // Navigate to admin dashboard
      navigate('/super-admin', { replace: true });
    } catch (err: unknown) {
      type ErrorResponse = { response?: { data?: { message?: string } } };
      if (
        err &&
        typeof err === 'object' &&
        'response' in err &&
        (err as ErrorResponse).response?.data?.message
      ) {
        setError((err as ErrorResponse).response!.data!.message!);
      } else {
        setError('Invalid password. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // authLoading is not provided by AuthContextType; render the login UI directly.

  return (
    <>
      {/* CSS Styles */}
      <style>{`
        @keyframes bounce-custom {
          0%, 100% {
            transform: translateY(-25%);
            animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
          }
          50% {
            transform: translateY(0);
            animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
          }
        }
        
        @keyframes pulse-custom {
          0%, 100% {
            opacity: 0.1;
          }
          50% {
            opacity: 0.2;
          }
        }
        
        .floating-circle-1 {
          animation: pulse-custom 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        .floating-circle-2 {
          animation: bounce-custom 3s ease-in-out infinite;
        }
        
        .floating-circle-3 {
          animation: pulse-custom 2s cubic-bezier(0.4, 0, 0.6, 1) infinite 1s;
        }
        
        .login-input:focus {
          outline: none;
          border-color: #328c81;
          box-shadow: 0 0 0 2px rgba(50, 140, 129, 0.3);
        }
        
        .login-button:focus {
          outline: none;
          box-shadow: 0 0 0 2px rgba(50, 140, 129, 0.5);
        }
        
        .glass-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .input-glass {
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
        
        .error-glass {
          background: rgba(239, 68, 68, 0.2);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(248, 113, 113, 0.3);
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>

      <div className="min-h-screen relative overflow-hidden">
        {/* Animated Background */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #134e4a 50%, #064e3b 100%)'
          }}
        >
          {/* Animated floating circles */}
          <div 
            className="absolute top-10 left-10 w-72 h-72 rounded-full floating-circle-1" 
            style={{ 
              background: 'linear-gradient(135deg, #328c81, #2dd4bf)',
              opacity: 0.1
            }}
          ></div>
          <div 
            className="absolute top-1/3 right-20 w-96 h-96 rounded-full floating-circle-2" 
            style={{ 
              background: 'linear-gradient(45deg, #0d9488, #328c81)',
              opacity: 0.1
            }}
          ></div>
          <div 
            className="absolute bottom-20 left-1/4 w-64 h-64 rounded-full floating-circle-3" 
            style={{ 
              background: 'linear-gradient(225deg, #14b8a6, #328c81)',
              opacity: 0.1
            }}
          ></div>
          
          {/* Grid pattern overlay */}
          <div 
            className="absolute inset-0" 
            style={{
              backgroundImage: `
                linear-gradient(#328c81 1px, transparent 1px),
                linear-gradient(90deg, #328c81 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px',
              opacity: 0.05
            }}
          ></div>
        </div>

        {/* Content */}
        <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            {/* Logo/Icon Section */}
            <div className="text-center">
              <div 
                className="mx-auto h-16 w-16 flex items-center justify-center rounded-2xl shadow-2xl transition-transform duration-300 hover:scale-110"
                style={{ 
                  background: 'linear-gradient(135deg, #328c81, #0d9488)',
                  boxShadow: '0 25px 50px -12px rgba(50, 140, 129, 0.5)'
                }}
              >
                <svg
                  className="h-8 w-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h2 className="mt-8 text-4xl font-bold text-white tracking-tight">
                Admin Portal
              </h2>
              <p className="mt-3 text-lg text-teal-100" style={{ opacity: 0.8 }}>
                Secure access to your dashboard
              </p>
              {/* Session info */}
              <p className="mt-2 text-sm text-teal-200" style={{ opacity: 0.6 }}>
                Login session valid for 1 hour
              </p>
            </div>

            {/* Login Form */}
            <div 
              className="glass-card rounded-2xl shadow-2xl p-8 transition-all duration-300 hover:scale-105"
              style={{
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              }}
            >
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                    Admin Password
                  </label>
                  <div className="relative group">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      className="login-input input-glass w-full px-4 py-3 text-white rounded-xl transition-all duration-200 text-base placeholder-white disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ 
                        opacity: 0.6
                      }}
                      placeholder="Enter your password"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <svg 
                        className="h-5 w-5 text-white transition-colors group-hover:opacity-80" 
                        style={{ opacity: 0.6 }}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="error-glass text-red-100 px-4 py-3 rounded-xl flex items-center space-x-2 animate-shake">
                    <svg className="h-5 w-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-medium">{error}</span>
                  </div>
                )}

                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`login-button group relative w-full flex justify-center py-3 px-4 border-0 text-base font-semibold rounded-xl text-white transition-all duration-300 transform ${
                      isLoading
                        ? 'cursor-not-allowed scale-95'
                        : 'hover:scale-105 active:scale-95'
                    }`}
                    style={{
                      background: isLoading 
                        ? 'rgba(107, 114, 128, 0.5)' 
                        : 'linear-gradient(135deg, #328c81, #0d9488)',
                      boxShadow: isLoading 
                        ? 'none' 
                        : '0 10px 25px -5px rgba(50, 140, 129, 0.4)'
                    }}
                    onMouseEnter={(e) => {
                      if (!isLoading) {
                        e.currentTarget.style.boxShadow = '0 20px 40px -10px rgba(50, 140, 129, 0.6)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isLoading) {
                        e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(50, 140, 129, 0.4)';
                      }
                    }}
                  >
                    <span className="absolute left-0 inset-y-0 flex items-center pl-4">
                      {isLoading ? (
                        <div 
                          className="rounded-full h-5 w-5 border-2 border-white border-t-transparent"
                          style={{
                            animation: 'spin 1s linear infinite'
                          }}
                        ></div>
                      ) : (
                        <svg
                          className="h-5 w-5 text-white transition-colors duration-200 group-hover:opacity-100"
                          style={{ opacity: 0.8 }}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </span>
                    {isLoading ? 'Authenticating...' : 'Access Dashboard'}
                  </button>
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="text-center space-y-2">
              <p 
                className="text-sm text-teal-100 flex items-center justify-center space-x-2"
                style={{ opacity: 0.6 }}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Protected by enterprise-grade security</span>
              </p>
              <p 
                className="text-xs text-teal-200"
                style={{ opacity: 0.5 }}
              >
                Your session will automatically expire after 1 hour of inactivity
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminLogin;