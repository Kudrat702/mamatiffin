// frontend/src/App.tsx - PRODUCTION READY WITH FIXED OG IMAGES
import React from 'react';
import { Helmet } from 'react-helmet';
import { LocationProvider } from './context/LocationContext';
import { AuthProvider as AdminAuthProvider } from './context/AdminAuthContext';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/AdminAuthHooks';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';

// Import all components
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

// ✅ AUTOMATIC APP TYPE DETECTION
const getAppType = (): 'user' | 'admin' => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const port = window.location.port;
    
    // Check for admin subdomain or admin port
    if (hostname.includes('admin') || port === '5174') {
      console.log('🔧 Detected ADMIN mode from hostname:', hostname);
      return 'admin';
    }
  }
  
  // Check environment variable
  const envAppType = import.meta.env.VITE_APP_TYPE;
  if (envAppType === 'admin') {
    console.log('🔧 Detected ADMIN mode from environment variable');
    return 'admin';
  }
  
  console.log('📱 Detected USER mode (default)');
  return 'user';
};

// ✅ Get app type
const APP_TYPE = getAppType();

// ✅ Get URLs from environment
const USER_APP_URL = import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5173';
const ADMIN_APP_URL = import.meta.env.ADMIN_URL || 'http://admin.localhost:5173';

// ✅ API URL from environment
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// ✅ PRODUCTION URLs - ABSOLUTE PATHS FOR SOCIAL MEDIA
const PRODUCTION_URL = 'https://www.mamatiffin.com';
const OG_IMAGE_URL = 'https://www.mamatiffin.com/og-image.png';

// Log configuration on startup
console.log('🔧 App Configuration:', {
  APP_TYPE,
  HOSTNAME: window.location.hostname,
  PORT: window.location.port,
  USER_APP_URL,
  ADMIN_APP_URL,
  API_URL,
  PRODUCTION_URL,
  OG_IMAGE_URL,
  NODE_ENV: import.meta.env.MODE
});

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

// ✅ UPDATED: Customer Layout Component with Fixed Helmet
const CustomerLayout: React.FC = () => {
  return (
    <AuthProvider>
      {/* ✅ HELMET WITH ABSOLUTE URLs FOR WHATSAPP/FACEBOOK */}
      <Helmet>
        {/* Basic Meta Tags */}
        <title>mamatiffin - Student Tiffin Service | Hot Homemade Food Delivery</title>
        <meta name="description" content="mamatiffin is a trusted Student Tiffin Service provider that delivers hot, homemade-style and delicious food right to your hostel or room, sourced only from hygienic and FSSAI-approved kitchens across the city." />
        <meta name="author" content="mamatiffin" />
        <meta name="robots" content="index, follow" />
        
        {/* ✅ Open Graph Tags (Facebook, WhatsApp, Instagram) - FIXED */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={PRODUCTION_URL} />
        <meta property="og:site_name" content="mamatiffin" />
        <meta property="og:title" content="mamatiffin - Student Tiffin Service | Hot Homemade Food Delivery" />
        <meta property="og:description" content="mamatiffin delivers hot, homemade-style delicious food right to your hostel or room from FSSAI-approved kitchens. Order fresh tiffin service today!" />
        
        {/* ✅ Image Tags - ABSOLUTE URLs */}
        <meta property="og:image" content={OG_IMAGE_URL} />
        <meta property="og:image:secure_url" content={OG_IMAGE_URL} />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="mamatiffin - Fresh Homemade Food Delivery Service" />
        
        {/* ✅ Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="mamatiffin - Student Tiffin Service" />
        <meta name="twitter:description" content="mamatiffin delivers hot, homemade food to your hostel from FSSAI-approved kitchens." />
        <meta name="twitter:image" content={OG_IMAGE_URL} />
        <meta name="twitter:image:alt" content="mamatiffin - Fresh Homemade Food" />
        
        {/* Canonical URL */}
        <link rel="canonical" href={PRODUCTION_URL} />
      </Helmet>

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

// External Redirect Component
const ExternalRedirect: React.FC<{ to: string }> = ({ to }) => {
  React.useEffect(() => {
    window.location.href = to;
  }, [to]);
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
};

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
        
        {/* Admin routes redirect to admin app */}
        <Route path="/admin/*" element={<ExternalRedirect to={`${ADMIN_APP_URL}/admin`} />} />
        <Route path="/admin-login" element={<ExternalRedirect to={`${ADMIN_APP_URL}/admin-login`} />} />
        <Route path="/super-admin/*" element={<ExternalRedirect to={`${ADMIN_APP_URL}/super-admin`} />} />
        
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Route>
    </Routes>
  );
};

// Admin Routes Component
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
      
      {/* User routes redirect to user app */}
      <Route path="/home" element={<ExternalRedirect to={`${USER_APP_URL}/home`} />} />
      <Route path="/veg-menu" element={<ExternalRedirect to={`${USER_APP_URL}/veg-menu`} />} />
      <Route path="/non-veg-menu" element={<ExternalRedirect to={`${USER_APP_URL}/non-veg-menu`} />} />
      <Route path="/my-orders" element={<ExternalRedirect to={`${USER_APP_URL}/my-orders`} />} />
      <Route path="/about-us" element={<ExternalRedirect to={`${USER_APP_URL}/about-us`} />} />
      <Route path="/contact" element={<ExternalRedirect to={`${USER_APP_URL}/contact`} />} />
      <Route path="/our-story" element={<ExternalRedirect to={`${USER_APP_URL}/our-story`} />} />
      
      {/* Default redirects */}
      <Route path="/" element={<Navigate to="/admin" replace />} />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
};

// Global Styles Component
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

// ✅ Main App Component
const App: React.FC = () => {
  console.log(`✅ Mama Tiffin App - Mode: ${APP_TYPE}`);
  
  // Show warning if admin subdomain but in user mode
  React.useEffect(() => {
    const hostname = window.location.hostname;
    if (hostname.includes('admin') && APP_TYPE === 'user') {
      console.warn('⚠️ WARNING: Admin subdomain detected but app is in USER mode!');
    }
  }, []);

  return (
    <AdminAuthProvider>
      <Router>
        {APP_TYPE === 'admin' ? (
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