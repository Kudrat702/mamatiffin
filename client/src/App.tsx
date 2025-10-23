// // frontend/src/App.tsx - COMPLETE VERSION WITH OUR STORY ROUTE
// import React from 'react';
// import { LocationProvider } from './context/LocationContext';
// import { AuthProvider as AdminAuthProvider } from './context/AdminAuthContext';
// import { AuthProvider } from './context/AuthContext';
// import { useAuth } from './hooks/AdminAuthHooks';
// import { useDomain } from './hooks/useDomain';
// import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';

// // Import all your existing components
// import Header from './components/Header';
// import LocationModal from './components/LocationModal';
// import Footer from './components/footer/Footer';
// import AdminLogin from './components/AdminLogin';
// import AdminDashboard from './components/AdminDashboard';
// import MenuCatalogManager from './components/MenuTimeCatlogManager';
// import MenuForm from './components/MenuForm';
// import VegMenu from './components/VegMenu';
// import NonVegMenu from './components/NonVegMenu';
// import Brand from './components/Brand';
// import MenuDetailsPage from './components/MenuDetailsPage';
// import PaymentPage from './components/Payment';
// import PaymentResult from './components/PaymentResult';
// import AdminOrders from './components/AdminOrder';
// import UsersList from "./components/UsersList";
// import MyOrders from './components/MyOrders';
// import OrderSkip from './components/OrderSkip';
// import AboutUs from './components/AboutUs';
// import Contact from './components/Contact';
// import { ImageSlider } from './components/ImageSlider';
// import VegNonVegCards from './components/VegNonVegCards';
// import TermsConditions from './components/footer/Term_Condition';
// import PrivacyPolicy from './components/footer/Privacy_Policy';
// import RefundCancellationPolicy from './components/footer/Refund';
// import ReturnPolicy from './components/footer/Return_Policy';
// import OurStory from './components/OurStory';
// import OurStoryPage from './components/OurStoryHeader';

// import './App.css';

// // Protected Route Component
// const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const { isAuthenticated } = useAuth();
//   const location = useLocation();
  
//   return isAuthenticated ? (
//     <>{children}</>
//   ) : (
//     <Navigate to="/admin-login" state={{ from: location }} replace />
//   );
// };

// // Customer Layout Component
// const CustomerLayout: React.FC = () => {
//   return (
//     <AuthProvider>
//       <div className="App flex flex-col min-h-screen dark:bg-gray-900">
//         <Header />
//         <LocationModal />
//         <main className="flex-grow">
//           <Outlet />
//         </main>
//         <Footer />
//       </div>
//     </AuthProvider>
//   );
// };

// // Admin Layout Component
// const AdminLayoutWrapper: React.FC = () => {
//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         <Outlet />
//       </div>
//     </div>
//   );
// };

// // Home Page Component
// const HomePage: React.FC = () => {
//   return (
//     <div className="container mx-auto px-4 py-8">
//       <div className="mb-12">
//         <ImageSlider />
//       </div>
//       <div className="mb-12">
//         <VegNonVegCards />
//       </div>
//       <OurStory />
//       <div className="mb-12">
//         <Brand />
//       </div>
//     </div>
//   );
// };

// // Simple Error Boundary Component
// const DomainMismatch: React.FC<{ message: string }> = ({ message }) => {
//   return (
//     <div className="flex items-center justify-center min-h-screen bg-gray-100">
//       <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
//         <div className="text-red-500 text-6xl mb-4">⚠️</div>
//         <h2 className="text-xl font-bold text-gray-800 mb-4">Domain Mismatch</h2>
//         <p className="text-gray-600 mb-6">{message}</p>
//         <div className="space-y-2 text-sm text-gray-500">
//           <p><strong>User Site:</strong> http://localhost:5173</p>
//           <p><strong>Admin Site:</strong> http://admin.localhost:5173</p>
//         </div>
//       </div>
//     </div>
//   );
// };

// // User Routes Component - WITH OUR STORY ROUTE ADDED
// const UserRoutes: React.FC = () => {
//   return (
//     <Routes>
//       <Route element={<CustomerLayout />}>
//         <Route path="/" element={<Navigate to="/home" replace />} />
//         <Route path="/home" element={<HomePage />} />
//         <Route path="/terms-conditions" element={<TermsConditions />} />
//         <Route path="/privacy-policy" element={<PrivacyPolicy />} />
//         <Route path="/refund-cancellation-policy" element={<RefundCancellationPolicy />} />
//         <Route path="/return-policy" element={<ReturnPolicy />} />
//         <Route path="/my-orders" element={<MyOrders />} />
//         <Route path="/order-skip" element={<OrderSkip />} />
//         <Route path="/veg-menu" element={<VegMenu />} />
//         <Route path="/non-veg-menu" element={<NonVegMenu />} />
//         <Route path="/menu/:diet/:category" element={<MenuDetailsPage />} />
//         <Route path="/payment" element={<PaymentPage />} />
//         <Route path="/payment-result" element={<PaymentResult />} />
//         <Route path="/about-us" element={<AboutUs />} />
//         <Route path="/contact" element={<Contact />} />
//         <Route path="/our-story" element={<OurStoryPage />} />
        
//         {/* Admin routes - show error message instead of redirect */}
//         <Route path="/admin/*" element={
//           <DomainMismatch message="Admin routes should be accessed from admin.localhost:5173" />
//         } />
//         <Route path="/admin-login" element={
//           <DomainMismatch message="Please go to admin.localhost:5173/admin-login" />
//         } />
//         <Route path="/super-admin/*" element={
//           <DomainMismatch message="Super admin routes should be accessed from admin.localhost:5173" />
//         } />
        
//         <Route path="*" element={<Navigate to="/home" replace />} />
//       </Route>
//     </Routes>
//   );
// };

// // Admin Routes Component - SIMPLIFIED
// const AdminRoutes: React.FC = () => {
//   return (
//     <Routes>
//       <Route path="/admin-login" element={<AdminLogin />} />
//       <Route element={<ProtectedRoute><AdminLayoutWrapper /></ProtectedRoute>}>
//         <Route path="/super-admin" element={<AdminDashboard />} />
//         <Route path="/admin" element={<AdminDashboard />} />
//         <Route path="/admin/dashboard" element={<AdminDashboard />} />
//         <Route path="/admin/menu-catalog" element={<MenuCatalogManager />} />
//         <Route path="/admin/menu-form" element={
//           <MenuForm 
//             menu={null} 
//             onClose={() => {
//               if (window.history.length > 1) {
//                 window.history.back();
//               } else {
//                 window.location.href = '/admin/dashboard';
//               }
//             }} 
//           />
//         } />
//         <Route path="/admin/users" element={<UsersList />} />
//         <Route path="/admin/orders" element={<AdminOrders />} />
//       </Route>
//       <Route path="/admin/menu-catalog-standalone" element={
//         <ProtectedRoute>
//           <MenuCatalogManager />
//         </ProtectedRoute>
//       } />
      
//       {/* User routes - show error message instead of redirect */}
//       <Route path="/home" element={
//         <DomainMismatch message="User routes should be accessed from localhost:5173" />
//       } />
//       <Route path="/veg-menu" element={
//         <DomainMismatch message="User routes should be accessed from localhost:5173" />
//       } />
//       <Route path="/non-veg-menu" element={
//         <DomainMismatch message="User routes should be accessed from localhost:5173" />
//       } />
//       <Route path="/my-orders" element={
//         <DomainMismatch message="User routes should be accessed from localhost:5173" />
//       } />
//       <Route path="/about-us" element={
//         <DomainMismatch message="User routes should be accessed from localhost:5173" />
//       } />
//       <Route path="/contact" element={
//         <DomainMismatch message="User routes should be accessed from localhost:5173" />
//       } />
//       <Route path="/our-story" element={
//         <DomainMismatch message="User routes should be accessed from localhost:5173" />
//       } />
      
//       <Route path="/" element={<Navigate to="/admin" replace />} />
//       <Route path="*" element={<Navigate to="/admin" replace />} />
//     </Routes>
//   );
// };

// // Global Styles Component (keeping your existing styles)
// const GlobalStyles: React.FC = () => {
//   return (
//     <style>{`
//       .nav-link {
//         color: #374151;
//         padding: 0.5rem 0.75rem;
//         font-size: 1rem;
//         font-weight: 500;
//         border-radius: 0.5rem;
//         transition: color 0.3s, background-color 0.3s;
//       }
//       .nav-link:hover {
//         color: #16a34a;
//         background-color: #f0fdf4;
//       }
//       .dark .nav-link {
//         color: #d1d5db;
//       }
//       .dark .nav-link:hover {
//         color: #4ade80;
//         background-color: rgba(22, 163, 74, 0.125);
//       }
      
//       ::-webkit-scrollbar {
//         width: 6px;
//       }
      
//       ::-webkit-scrollbar-track {
//         background: #f3f4f6;
//       }
      
//       ::-webkit-scrollbar-thumb {
//         background: #4ade80;
//         border-radius: 9999px;
//       }
      
//       ::-webkit-scrollbar-thumb:hover {
//         background: #22c55e;
//       }

//       html.dark {
//         color-scheme: dark;
//       }

//       * {
//         transition-property: background-color, border-color, color;
//         transition-duration: 300ms;
//         transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
//       }

//       button:focus,
//       input:focus,
//       textarea:focus,
//       select:focus {
//         outline: none;
//         box-shadow: 0 0 0 2px rgb(34 197 94 / 0.5);
//       }

//       body {
//         overflow-x: hidden;
//       }

//       .animate-slide-in {
//         animation: slide-in 0.3s ease-out;
//       }
      
//       @keyframes slide-in {
//         from {
//           transform: translateX(100%);
//           opacity: 0;
//         }
//         to {
//           transform: translateX(0);
//           opacity: 1;
//         }
//       }

//       .payment-container {
//         max-width: 600px;
//         margin: 0 auto;
//         padding: 2rem;
//       }

//       .payment-card {
//         background: white;
//         border-radius: 1rem;
//         box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
//         overflow: hidden;
//       }

//       .order-status-pending {
//         background-color: #fef3c7;
//         color: #92400e;
//       }

//       .order-status-confirmed {
//         background-color: #d1fae5;
//         color: #065f46;
//       }

//       .order-status-delivered {
//         background-color: #dbeafe;
//         color: #1e40af;
//       }

//       .order-status-cancelled {
//         background-color: #fee2e2;
//         color: #991b1b;
//       }

//       @media (max-width: 768px) {
//         .payment-container {
//           padding: 1rem;
//         }

//         .order-card {
//           margin-bottom: 1rem;
//         }

//         .admin-dashboard-mobile {
//           padding: 0.5rem;
//         }
//       }

//       .loading-spinner {
//         animation: spin 1s linear infinite;
//       }

//       @keyframes spin {
//         from {
//           transform: rotate(0deg);
//         }
//         to {
//           transform: rotate(360deg);
//         }
//       }

//       .btn-primary {
//         background-color: #16a34a;
//         color: white;
//         padding: 0.75rem 1.5rem;
//         border-radius: 0.5rem;
//         font-weight: 600;
//         transition: all 0.3s ease;
//       }

//       .btn-primary:hover {
//         background-color: #15803d;
//         transform: translateY(-1px);
//         box-shadow: 0 4px 12px rgba(22, 163, 74, 0.3);
//       }

//       .btn-secondary {
//         background-color: #6b7280;
//         color: white;
//         padding: 0.75rem 1.5rem;
//         border-radius: 0.5rem;
//         font-weight: 600;
//         transition: all 0.3s ease;
//       }

//       .btn-secondary:hover {
//         background-color: #4b5563;
//         transform: translateY(-1px);
//       }

//       .hover-card {
//         transition: transform 0.3s ease, box-shadow 0.3s ease;
//       }

//       .hover-card:hover {
//         transform: translateY(-2px);
//         box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12);
//       }

//       .success-message {
//         background-color: #d1fae5;
//         border: 1px solid #a7f3d0;
//         color: #065f46;
//         padding: 1rem;
//         border-radius: 0.5rem;
//         margin-bottom: 1rem;
//       }

//       .error-message {
//         background-color: #fee2e2;
//         border: 1px solid #fca5a5;
//         color: #991b1b;
//         padding: 1rem;
//         border-radius: 0.5rem;
//         margin-bottom: 1rem;
//       }
//     `}</style>
//   );
// };

// // Main App Component - CLEAN & SIMPLE
// const App: React.FC = () => {
//   const { isAdmin, hostname } = useDomain();

//   console.log(`Mama Tiffin App loaded - Domain: ${hostname}, Mode: ${isAdmin ? 'Admin' : 'User'}`);

//   return (
//     <AdminAuthProvider>
//       <Router>
//         {isAdmin ? (
//           <AdminRoutes />
//         ) : (
//           <LocationProvider>
//             <UserRoutes />
//           </LocationProvider>
//         )}
//         <GlobalStyles />
//       </Router>
//     </AdminAuthProvider>
//   );
// };

// export default App;

// frontend/src/App.tsx - FIXED VERSION - NO DOMAIN MISMATCH
import React from 'react';
import { LocationProvider } from './context/LocationContext';
import { AuthProvider as AdminAuthProvider } from './context/AdminAuthContext';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/AdminAuthHooks';
import { useDomain } from './hooks/useDomain';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';

// Import all components (keeping your existing imports)
import Header from './components/Header';
import LocationModal from './components/LocationModal';
import Footer from './components/footer/Footer';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import MenuCatalogManager from './components/MenuTimeCatlogManager';
import MenuForm from './components/MenuForm';
import VegMenu from './components/VegMenu';
import NonVegMenu from './components/NonVegMenu';
import Brand from './components/Brand';
import MenuDetailsPage from './components/MenuDetailsPage';
import PaymentPage from './components/Payment';
import PaymentResult from './components/PaymentResult';
import AdminOrders from './components/AdminOrder';
import UsersList from "./components/UsersList";
import MyOrders from './components/MyOrders';
import OrderSkip from './components/OrderSkip';
import AboutUs from './components/AboutUs';
import Contact from './components/Contact';
import { ImageSlider } from './components/ImageSlider';
import VegNonVegCards from './components/VegNonVegCards';
import TermsConditions from './components/footer/Term_Condition';
import PrivacyPolicy from './components/footer/Privacy_Policy';
import RefundCancellationPolicy from './components/footer/Refund';
import ReturnPolicy from './components/footer/Return_Policy';
import OurStory from './components/OurStory';
import OurStoryPage from './components/OurStoryHeader';

import './App.css';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  
  return isAuthenticated ? (
    <>{children}</>
  ) : (
    <Navigate to="/admin-login" state={{ from: location }} replace />
  );
};

// Customer Layout Component
const CustomerLayout: React.FC = () => {
  return (
    <AuthProvider>
      <div className="App flex flex-col min-h-screen dark:bg-gray-900">
        <Header />
        <LocationModal />
        <main className="flex-grow">
          <Outlet />
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
};

// Admin Layout Component
const AdminLayoutWrapper: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </div>
    </div>
  );
};

// Home Page Component
const HomePage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-12">
        <ImageSlider />
      </div>
      <div className="mb-12">
        <VegNonVegCards />
      </div>
      <OurStory />
      <div className="mb-12">
        <Brand />
      </div>
    </div>
  );
};

// ✅ REMOVED DomainMismatch Component - No longer needed

// User Routes Component
const UserRoutes: React.FC = () => {
  return (
    <Routes>
      <Route element={<CustomerLayout />}>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/terms-conditions" element={<TermsConditions />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/refund-cancellation-policy" element={<RefundCancellationPolicy />} />
        <Route path="/return-policy" element={<ReturnPolicy />} />
        <Route path="/my-orders" element={<MyOrders />} />
        <Route path="/order-skip" element={<OrderSkip />} />
        <Route path="/veg-menu" element={<VegMenu />} />
        <Route path="/non-veg-menu" element={<NonVegMenu />} />
        <Route path="/menu/:diet/:category" element={<MenuDetailsPage />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/payment-result" element={<PaymentResult />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/our-story" element={<OurStoryPage />} />
        
        {/* ✅ FIXED: Admin routes redirect instead of showing error */}
        <Route path="/admin/*" element={<Navigate to="http://admin.localhost:5173/admin" replace />} />
        <Route path="/admin-login" element={<Navigate to="http://admin.localhost:5173/admin-login" replace />} />
        <Route path="/super-admin/*" element={<Navigate to="http://admin.localhost:5173/super-admin" replace />} />
        
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Route>
    </Routes>
  );
};

// Admin Routes Component - FIXED
const AdminRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/admin-login" element={<AdminLogin />} />
      
      <Route element={<ProtectedRoute><AdminLayoutWrapper /></ProtectedRoute>}>
        <Route path="/super-admin" element={<AdminDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/menu-catalog" element={<MenuCatalogManager />} />
        <Route path="/admin/menu-form" element={
          <MenuForm 
            menu={null} 
            onClose={() => {
              if (window.history.length > 1) {
                window.history.back();
              } else {
                window.location.href = '/admin/dashboard';
              }
            }} 
          />
        } />
        <Route path="/admin/users" element={<UsersList />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
      </Route>
      
      <Route path="/admin/menu-catalog-standalone" element={
        <ProtectedRoute>
          <MenuCatalogManager />
        </ProtectedRoute>
      } />
      
      {/* ✅ FIXED: Remove DomainMismatch, just redirect to user site */}
      <Route path="/home" element={<Navigate to="http://localhost:5173/home" replace />} />
      <Route path="/veg-menu" element={<Navigate to="http://localhost:5173/veg-menu" replace />} />
      <Route path="/non-veg-menu" element={<Navigate to="http://localhost:5173/non-veg-menu" replace />} />
      <Route path="/my-orders" element={<Navigate to="http://localhost:5173/my-orders" replace />} />
      <Route path="/about-us" element={<Navigate to="http://localhost:5173/about-us" replace />} />
      <Route path="/contact" element={<Navigate to="http://localhost:5173/contact" replace />} />
      <Route path="/our-story" element={<Navigate to="http://localhost:5173/our-story" replace />} />
      
      {/* Default redirects */}
      <Route path="/" element={<Navigate to="/admin" replace />} />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
};

// Global Styles Component (keeping your existing styles)
const GlobalStyles: React.FC = () => {
  return (
    <style>{`
      .nav-link {
        color: #374151;
        padding: 0.5rem 0.75rem;
        font-size: 1rem;
        font-weight: 500;
        border-radius: 0.5rem;
        transition: color 0.3s, background-color 0.3s;
      }
      .nav-link:hover {
        color: #16a34a;
        background-color: #f0fdf4;
      }
      .dark .nav-link {
        color: #d1d5db;
      }
      .dark .nav-link:hover {
        color: #4ade80;
        background-color: rgba(22, 163, 74, 0.125);
      }
      
      ::-webkit-scrollbar {
        width: 6px;
      }
      
      ::-webkit-scrollbar-track {
        background: #f3f4f6;
      }
      
      ::-webkit-scrollbar-thumb {
        background: #4ade80;
        border-radius: 9999px;
      }
      
      ::-webkit-scrollbar-thumb:hover {
        background: #22c55e;
      }

      html.dark {
        color-scheme: dark;
      }

      * {
        transition-property: background-color, border-color, color;
        transition-duration: 300ms;
        transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      }

      button:focus,
      input:focus,
      textarea:focus,
      select:focus {
        outline: none;
        box-shadow: 0 0 0 2px rgb(34 197 94 / 0.5);
      }

      body {
        overflow-x: hidden;
      }

      .animate-slide-in {
        animation: slide-in 0.3s ease-out;
      }
      
      @keyframes slide-in {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      .payment-container {
        max-width: 600px;
        margin: 0 auto;
        padding: 2rem;
      }

      .payment-card {
        background: white;
        border-radius: 1rem;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        overflow: hidden;
      }

      .order-status-pending {
        background-color: #fef3c7;
        color: #92400e;
      }

      .order-status-confirmed {
        background-color: #d1fae5;
        color: #065f46;
      }

      .order-status-delivered {
        background-color: #dbeafe;
        color: #1e40af;
      }

      .order-status-cancelled {
        background-color: #fee2e2;
        color: #991b1b;
      }

      @media (max-width: 768px) {
        .payment-container {
          padding: 1rem;
        }

        .order-card {
          margin-bottom: 1rem;
        }

        .admin-dashboard-mobile {
          padding: 0.5rem;
        }
      }

      .loading-spinner {
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }

      .btn-primary {
        background-color: #16a34a;
        color: white;
        padding: 0.75rem 1.5rem;
        border-radius: 0.5rem;
        font-weight: 600;
        transition: all 0.3s ease;
      }

      .btn-primary:hover {
        background-color: #15803d;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(22, 163, 74, 0.3);
      }

      .btn-secondary {
        background-color: #6b7280;
        color: white;
        padding: 0.75rem 1.5rem;
        border-radius: 0.5rem;
        font-weight: 600;
        transition: all 0.3s ease;
      }

      .btn-secondary:hover {
        background-color: #4b5563;
        transform: translateY(-1px);
      }

      .hover-card {
        transition: transform 0.3s ease, box-shadow 0.3s ease;
      }

      .hover-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12);
      }

      .success-message {
        background-color: #d1fae5;
        border: 1px solid #a7f3d0;
        color: #065f46;
        padding: 1rem;
        border-radius: 0.5rem;
        margin-bottom: 1rem;
      }

      .error-message {
        background-color: #fee2e2;
        border: 1px solid #fca5a5;
        color: #991b1b;
        padding: 1rem;
        border-radius: 0.5rem;
        margin-bottom: 1rem;
      }
    `}</style>
  );
};

// Main App Component - CLEAN & SIMPLE
const App: React.FC = () => {
  const { isAdmin, hostname } = useDomain();

  console.log(`✅ Mama Tiffin App loaded - Domain: ${hostname}, Mode: ${isAdmin ? 'Admin' : 'User'}`);

  return (
    <AdminAuthProvider>
      <Router>
        {isAdmin ? (
          <AdminRoutes />
        ) : (
          <LocationProvider>
            <UserRoutes />
          </LocationProvider>
        )}
        <GlobalStyles />
      </Router>
    </AdminAuthProvider>
  );
};

export default App;