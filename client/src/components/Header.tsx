// Header.tsx - UPDATED VERSION with Modern Watercolor Design and Our Story Integration
import React, { useState, useEffect } from 'react';
import { User, LogOut, Menu, X, ShoppingBag, SkipForward } from 'lucide-react';
import LocationDropdown from './LocationDropdown';
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

const Header: React.FC = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState<LocalUser | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Load user data from memory on component mount
  useEffect(() => {
    const loadUserData = () => {
      const savedUser = sessionStorage.getItem('user');
      const savedToken = sessionStorage.getItem('token');
      
      if (savedUser && savedToken) {
        setUser(JSON.parse(savedUser));
      } else {
        setUser(null);
      }
    };

    loadUserData();

    // Listen for custom login trigger from VegNonVegCards
    const handleTriggerLogin = () => {
      setIsAuthModalOpen(true);
    };

    window.addEventListener('triggerLogin', handleTriggerLogin);

    return () => {
      window.removeEventListener('triggerLogin', handleTriggerLogin);
    };
  }, []);

  const handleLoginSuccess = (user: LocalUser, token: string) => {
    setUser(user);
    sessionStorage.setItem('user', JSON.stringify(user));
    sessionStorage.setItem('token', token);
    
    // Notify other components about auth change
    window.dispatchEvent(new CustomEvent('userAuthChanged'));
    
    // Check if there's a redirect path and navigate to it
    const redirectPath = sessionStorage.getItem('redirectAfterLogin');
    if (redirectPath) {
      sessionStorage.removeItem('redirectAfterLogin');
      window.location.href = redirectPath;
    }
  };

  const handleLogout = () => {
    setUser(null);
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('redirectAfterLogin');
    
    // Notify other components about auth change
    window.dispatchEvent(new CustomEvent('userAuthChanged'));
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const handleNavigation = (path: string) => {
    // Check if user is logged in for protected routes
    if ((path === '/veg-menu' || path === '/non-veg-menu') && !user) {
      sessionStorage.setItem('redirectAfterLogin', path);
      setIsAuthModalOpen(true);
      return;
    }
    window.location.href = path;
  };

  const handleMyOrdersClick = () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    window.location.href = '/my-orders';
  };

  const handleOrderSkipClick = () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    window.location.href = '/order-skip';
  };

  return (
    <>
      {/* Body padding to prevent content overlap with fixed header */}
      <style>{`
        body {
          padding-top: 88px !important;
          background: none !important;
        }
        .fixed {
          background: none !important;
          backdrop-filter: none !important;
        }
      `}</style>
      
      <div className="fixed top-0 left-0 right-0 z-50 p-4" style={{ background: 'transparent' }}>
        {/* Custom Styles for Watercolor Effect */}
        <style>{`
          .watercolor-header {
            background: linear-gradient(135deg, 
              rgba(255, 255, 255, 0.95) 0%,
              rgba(240, 248, 255, 0.9) 25%,
              rgba(230, 245, 255, 0.85) 50%,
              rgba(220, 240, 250, 0.9) 75%,
              rgba(255, 255, 255, 0.95) 100%
            );
            backdrop-filter: blur(10px);
            border: 2px solid rgba(50, 140, 129, 0.2);
            box-shadow: 
              0 8px 32px rgba(50, 140, 129, 0.15),
              inset 0 1px 0 rgba(255, 255, 255, 0.8);
          }
          
          .dark .watercolor-header {
            background: transparent;
            border: 2px solid rgba(50, 140, 129, 0.3);
            box-shadow: 
              0 8px 32px rgba(50, 140, 129, 0.2),
              inset 0 1px 0 rgba(255, 255, 255, 0.05);
          }

          .logo-text {
            background: linear-gradient(135deg, rgb(50, 140, 129), rgb(34, 197, 94));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            font-size: 32px;
            font-weight: 600;
            letter-spacing: -0.5px;
          }

          @media (max-width: 768px) {
            .logo-text {
              font-size: 28px;
              font-weight: 600;
            }
          }

          .profile-icon-3d {
            background: linear-gradient(135deg, rgb(50, 140, 129), rgb(34, 140, 109));
            box-shadow: 
              0 4px 15px rgba(50, 140, 129, 0.4),
              inset 0 1px 0 rgba(255, 255, 255, 0.2),
              inset 0 -1px 0 rgba(0, 0, 0, 0.1);
            transform: perspective(100px) rotateX(5deg);
            transition: all 0.3s ease;
          }

          .profile-icon-3d:hover {
            transform: perspective(100px) rotateX(0deg) translateY(-2px);
            box-shadow: 
              0 6px 20px rgba(50, 140, 129, 0.5),
              inset 0 1px 0 rgba(255, 255, 255, 0.3),
              inset 0 -1px 0 rgba(0, 0, 0, 0.1);
          }

          .menu-background {
            background: linear-gradient(135deg, 
              rgba(50, 140, 129, 0.95) 0%,
              rgba(34, 120, 109, 0.9) 50%,
              rgba(50, 140, 129, 0.95) 100%
            );
            backdrop-filter: blur(15px);
            border: 1px solid rgba(255, 255, 255, 0.2);
          }

          .menu-item-hover {
            transition: all 0.3s ease;
          }

          .menu-item-hover:hover {
            background: rgba(255, 255, 255, 0.15);
            transform: translateX(4px);
          }

          .watercolor-mobile-menu {
            background: linear-gradient(180deg, 
              rgba(50, 140, 129, 0.95) 0%,
              rgba(34, 120, 109, 0.9) 100%
            );
            backdrop-filter: blur(15px);
            border-top: 2px solid rgba(255, 255, 255, 0.2);
          }
        `}</style>

        <header className="watercolor-header shadow-lg rounded-2xl transition-all duration-300">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
            <div className="flex items-center justify-between h-16">
              {/* Left side - Logo */}
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <h1 className="logo-text font-semibold tracking-tight">
                    mamatiffin
                  </h1>
                </div>
              </div>
              
              {/* Right side - Navigation, Location and Mobile Menu */}
              <div className="flex items-center space-x-6">
                {/* Navigation Menu - Desktop */}
                <nav className="hidden md:flex space-x-6">
                  <a 
                    href="/home" 
                    className="text-gray-700 dark:text-gray-300 hover:text-[rgb(50,140,129)] dark:hover:text-[rgb(50,140,129)] transition-colors font-medium"
                  >
                    Home
                  </a>
                  <button
                    onClick={() => handleNavigation('/veg-menu')}
                    className="text-gray-700 dark:text-gray-300 hover:text-[rgb(50,140,129)] dark:hover:text-[rgb(50,140,129)] transition-colors font-medium"
                  >
                    Veg Menu
                  </button>
                  <button
                    onClick={() => handleNavigation('/non-veg-menu')}
                    className="text-gray-700 dark:text-gray-300 hover:text-[rgb(50,140,129)] dark:hover:text-[rgb(50,140,129)] transition-colors font-medium"
                  >
                    Non-Veg Menu
                  </button>
                  <a 
                    href="/about-us" 
                    className="text-gray-700 dark:text-gray-300 hover:text-[rgb(50,140,129)] dark:hover:text-[rgb(50,140,129)] transition-colors font-medium"
                  >
                    About Us
                  </a>
                  <a 
                    href="/contact" 
                    className="text-gray-700 dark:text-gray-300 hover:text-[rgb(50,140,129)] dark:hover:text-[rgb(50,140,129)] transition-colors font-medium"
                  >
                    Contact
                  </a>
                  <a 
                    href="/our-story" 
                    className="text-gray-700 dark:text-gray-300 hover:text-[rgb(50,140,129)] dark:hover:text-[rgb(50,140,129)] transition-colors font-medium"
                  >
                    Our Story
                  </a>
                </nav>

                {/* Location Dropdown - Desktop */}
                <div className="hidden md:block">
                  <LocationDropdown />
                </div>

                {/* Mobile menu button - Right side */}
                <button
                  onClick={toggleMobileMenu}
                  className="md:hidden p-2 rounded-lg text-white hover:bg-white hover:bg-opacity-20 transition-all duration-300"
                  style={{ backgroundColor: 'rgb(50, 140, 129)' }}
                  aria-label="Toggle menu"
                >
                  {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile menu with watercolor background */}
          {isMobileMenuOpen && (
            <div className="md:hidden watercolor-mobile-menu">
              <div className="px-6 py-4 space-y-4">
                <div className="mb-4">
                  <LocationDropdown />
                </div>
                
                <nav className="flex flex-col space-y-3">
                  <a 
                    href="/home" 
                    className="text-white hover:text-gray-200 transition-colors py-2 menu-item-hover rounded-lg px-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Home
                  </a>
                  <button
                    onClick={() => {
                      handleNavigation('/veg-menu');
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-left text-white hover:text-gray-200 transition-colors py-2 menu-item-hover rounded-lg px-2"
                  >
                    Veg Menu
                  </button>
                  <button
                    onClick={() => {
                      handleNavigation('/non-veg-menu');
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-left text-white hover:text-gray-200 transition-colors py-2 menu-item-hover rounded-lg px-2"
                  >
                    Non-Veg Menu
                  </button>
                  <a 
                    href="/about-us" 
                    className="text-white hover:text-gray-200 transition-colors py-2 menu-item-hover rounded-lg px-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    About Us
                  </a>
                  <a 
                    href="/contact" 
                    className="text-white hover:text-gray-200 transition-colors py-2 menu-item-hover rounded-lg px-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Contact
                  </a>
                  <a 
                    href="/our-story" 
                    className="text-white hover:text-gray-200 transition-colors py-2 menu-item-hover rounded-lg px-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Our Story
                  </a>
                </nav>

                {/* Mobile user section */}
                {user ? (
                  <div className="pt-4 border-t border-white border-opacity-20">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="profile-icon-3d w-10 h-10 rounded-full flex items-center justify-center">
                        <User size={20} className="text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-white">Hi, {user.name}</p>
                        <p className="text-sm text-gray-200">{user.phone}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <button
                        className="menu-item-hover w-full text-left px-4 py-3 text-sm text-white rounded-lg transition-colors flex items-center space-x-3"
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          handleMyOrdersClick();
                        }}
                      >
                        <ShoppingBag size={16} />
                        <span>My Orders</span>
                      </button>
                      
                      <button
                        className="menu-item-hover w-full text-left px-4 py-3 text-sm text-white rounded-lg transition-colors flex items-center space-x-3"
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          handleOrderSkipClick();
                        }}
                      >
                        <SkipForward size={16} />
                        <span>Order Skip</span>
                      </button>
                      
                      {(user.role === 'admin' || user.role === 'moderator') && (
                        <button
                          className="menu-item-hover w-full text-left px-4 py-3 text-sm text-yellow-300 rounded-lg transition-colors flex items-center space-x-3"
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            window.location.href = '/admin-dashboard';
                          }}
                        >
                          <User size={16} />
                          <span>Admin Dashboard</span>
                        </button>
                      )}
                      
                      <button
                        className="menu-item-hover w-full text-left px-4 py-3 text-sm text-red-300 rounded-lg transition-colors flex items-center space-x-3"
                        onClick={() => {
                          handleLogout();
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        <LogOut size={16} />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="pt-4 border-t border-white border-opacity-20">
                    <button
                      onClick={() => {
                        setIsAuthModalOpen(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full bg-transparent hover:bg-opacity-10 hover:bg-gray-500 text-white px-6 py-2 rounded-xl text-sm font-medium transition-all duration-300 shadow-md hover:shadow-lg backdrop-blur-sm border border-white border-opacity-20"
                    >
                      Sign In
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </header>

        {/* Auth Modal */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      </div>
    </>
  );
};

export default Header;