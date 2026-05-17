import React, { useState, useEffect, useRef } from 'react';
import {
  User, LogOut, Menu, X, ShoppingBag, SkipForward, ChevronDown,
  BookOpen, ShoppingCart, Tag, List,
  Home,
} from 'lucide-react';
import LocationDropdown from './LocationDropdown';
import AuthModal from './AuthModal';
import { useAuth } from '../context/AuthContext';

const Header: React.FC = () => {
  const { user, logout: authLogout } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState<boolean>(false);
  const [isBookDropdownOpen, setIsBookDropdownOpen] = useState<boolean>(false);
  const [isMobileBookDropdownOpen, setIsMobileBookDropdownOpen] = useState<boolean>(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const bookDropdownRef = useRef<HTMLDivElement>(null);
  const mobileBookDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleTriggerLogin = (): void => setIsAuthModalOpen(true);
    window.addEventListener('triggerLogin', handleTriggerLogin);
    return () => window.removeEventListener('triggerLogin', handleTriggerLogin);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
      if (bookDropdownRef.current && !bookDropdownRef.current.contains(event.target as Node)) {
        setIsBookDropdownOpen(false);
      }
      if (mobileBookDropdownRef.current && !mobileBookDropdownRef.current.contains(event.target as Node)) {
        setIsMobileBookDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLoginSuccess = (): void => {
    const redirectPath = sessionStorage.getItem('redirectAfterLogin');
    if (redirectPath) {
      sessionStorage.removeItem('redirectAfterLogin');
      window.location.href = redirectPath;
    }
  };

  const handleLogout = (): void => {
    authLogout();
    setIsProfileDropdownOpen(false);
  };

  const toggleMobileMenu = (): void => setIsMobileMenuOpen((p) => !p);
  const toggleProfileDropdown = (): void => setIsProfileDropdownOpen((p) => !p);
  const toggleBookDropdown = (): void => setIsBookDropdownOpen((p) => !p);
  const toggleMobileBookDropdown = (): void => setIsMobileBookDropdownOpen((p) => !p);

  const handleNavigation = (path: string): void => {
    if ((path === '/veg-menu' || path === '/non-veg-menu') && !user) {
      sessionStorage.setItem('redirectAfterLogin', path);
      setIsAuthModalOpen(true);
      return;
    }
    window.location.href = path;
  };

  const handleMyOrdersClick = (): void => {
    if (!user) { setIsAuthModalOpen(true); return; }
    setIsProfileDropdownOpen(false);
    window.location.href = '/my-orders';
  };

  const handleOrderSkipClick = (): void => {
    if (!user) { setIsAuthModalOpen(true); return; }
    setIsProfileDropdownOpen(false);
    window.location.href = '/order-skip';
  };

  const handleBuyClick = (): void => {
    setIsBookDropdownOpen(false);
    setIsMobileBookDropdownOpen(false);
    setIsMobileMenuOpen(false);
    window.location.href = '/books/buy';
  };

  const handleSellClick = (): void => {
    setIsBookDropdownOpen(false);
    setIsMobileBookDropdownOpen(false);
    setIsMobileMenuOpen(false);
    if (!user) {
      sessionStorage.setItem('redirectAfterLogin', '/books/sell');
      setIsAuthModalOpen(true);
      return;
    }
    window.location.href = '/books/sell';
  };

  const handleMyListingsClick = (): void => {
    setIsBookDropdownOpen(false);
    setIsMobileBookDropdownOpen(false);
    setIsProfileDropdownOpen(false);
    setIsMobileMenuOpen(false);
    if (!user) {
      sessionStorage.setItem('redirectAfterLogin', '/books/my-listings');
      setIsAuthModalOpen(true);
      return;
    }
    window.location.href = '/books/my-listings';
  };

  const handleRoomsClick = (): void => {
    setIsMobileMenuOpen(false);
    window.location.href = '/rooms';
  };

  return (
    <>
      <style>{`
        body { padding-top: 80px !important; background: none !important; }
        .fixed { background: none !important; backdrop-filter: none !important; }

        .watercolor-header {
          background: linear-gradient(135deg, 
            rgba(255, 255, 255, 0.95) 0%,
            rgba(240, 248, 255, 0.9) 25%,
            rgba(230, 245, 255, 0.85) 50%,
            rgba(220, 240, 250, 0.9) 75%,
            rgba(255, 255, 255, 0.95) 100%);
          backdrop-filter: blur(10px);
          border: 2px solid rgba(50, 140, 129, 0.2);
          box-shadow: 0 8px 32px rgba(50, 140, 129, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.8);
        }

        .logo-text {
          background: linear-gradient(135deg, rgb(50, 140, 129), rgb(34, 197, 94));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-size: 32px;
          font-weight: 600;
          letter-spacing: -0.5px;
          white-space: nowrap;
        }

        /* ✅ Mobile: balanced logo size */
        @media (max-width: 768px) {
          .logo-text { font-size: 24px; font-weight: 700; letter-spacing: -0.3px; }
        }
        @media (max-width: 380px) {
          .logo-text { font-size: 22px; }
        }

        .profile-icon-3d {
          background: linear-gradient(135deg, rgb(50, 140, 129), rgb(34, 140, 109));
          box-shadow: 0 4px 15px rgba(50, 140, 129, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(0, 0, 0, 0.1);
          transform: perspective(100px) rotateX(5deg);
          transition: all 0.3s ease;
        }
        .profile-icon-3d:hover {
          transform: perspective(100px) rotateX(0deg) translateY(-2px);
          box-shadow: 0 6px 20px rgba(50, 140, 129, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.3), inset 0 -1px 0 rgba(0, 0, 0, 0.1);
        }

        .profile-dropdown, .book-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          min-width: 240px;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(250, 252, 255, 0.95) 100%);
          backdrop-filter: blur(15px);
          border: 2px solid rgba(50, 140, 129, 0.2);
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(50, 140, 129, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.9);
          opacity: 0;
          visibility: hidden;
          transform: translateY(-10px);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 1000;
          overflow: hidden;
          padding: 4px;
        }
        .profile-dropdown { min-width: 280px; }
        .book-dropdown { left: 50%; right: auto; transform: translateX(-50%) translateY(-10px); }
        .profile-dropdown.open { opacity: 1; visibility: visible; transform: translateY(0); }
        .book-dropdown.open { opacity: 1; visibility: visible; transform: translateX(-50%) translateY(0); }

        .mobile-book-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          left: auto;
          min-width: 190px;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(250, 252, 255, 0.95) 100%);
          backdrop-filter: blur(15px);
          border: 2px solid rgba(50, 140, 129, 0.2);
          border-radius: 14px;
          box-shadow: 0 10px 40px rgba(50, 140, 129, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.9);
          opacity: 0;
          visibility: hidden;
          transform: translateY(-10px);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 1000;
          overflow: hidden;
          padding: 4px;
        }
        .mobile-book-dropdown.open { opacity: 1; visibility: visible; transform: translateY(0); }

        .profile-dropdown-item {
          padding: 12px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          color: #374151;
          transition: background-color 0.2s ease, color 0.2s ease;
          border-radius: 8px;
          margin: 4px 4px;
          font-weight: 500;
          width: calc(100% - 8px);
          box-sizing: border-box;
          font-size: 14px;
        }
        .profile-dropdown-item:hover { background: rgba(50, 140, 129, 0.1); }
        .profile-dropdown-item.logout:hover { background: rgba(239, 68, 68, 0.1); color: #dc2626; }
        .profile-dropdown-item.admin:hover { background: rgba(234, 179, 8, 0.1); color: #ca8a04; }
        .profile-dropdown-item.buy:hover { background: rgba(34, 197, 94, 0.1); color: #16a34a; }
        .profile-dropdown-item.sell:hover { background: rgba(59, 130, 246, 0.1); color: #2563eb; }

        .watercolor-mobile-menu {
          background: linear-gradient(180deg, rgba(50, 140, 129, 0.95) 0%, rgba(34, 120, 109, 0.9) 100%);
          backdrop-filter: blur(15px);
          border-top: 2px solid rgba(255, 255, 255, 0.2);
        }
        .menu-item-hover { transition: all 0.3s ease; }
        .menu-item-hover:hover { background: rgba(255, 255, 255, 0.15); transform: translateX(4px); }

        .book-nav-button {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #374151;
          font-weight: 500;
          padding: 6px 12px;
          border-radius: 10px;
          transition: all 0.3s ease;
          background: linear-gradient(135deg, rgba(50, 140, 129, 0.08), rgba(34, 197, 94, 0.08));
          border: 1px solid rgba(50, 140, 129, 0.2);
        }
        .book-nav-button:hover {
          background: linear-gradient(135deg, rgba(50, 140, 129, 0.15), rgba(34, 197, 94, 0.15));
          transform: translateY(-1px);
          color: rgb(50, 140, 129);
        }

        /* ✅ Mobile Book button — compact, simple, no heavy box */
        .book-nav-button-mobile {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #374151;
          font-weight: 500;
          padding: 6px 9px;
          border-radius: 8px;
          transition: all 0.3s ease;
          background: transparent;
          border: none;
          font-size: 15px;
          white-space: nowrap;
        }
        .book-nav-button-mobile:hover,
        .book-nav-button-mobile:active {
          color: rgb(50, 140, 129);
          background: rgba(50, 140, 129, 0.08);
        }

        /* ✅ Mobile Rooms link — simple text + icon, no box */
        .rooms-nav-link-mobile {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #374151;
          font-weight: 500;
          padding: 6px 8px;
          font-size: 15px;
          background: transparent;
          border: none;
          transition: color 0.2s ease;
          white-space: nowrap;
        }
        .rooms-nav-link-mobile:hover,
        .rooms-nav-link-mobile:active {
          color: rgb(50, 140, 129);
        }

        /* ✅ Mobile menu icon button — slimmer so it stays inside */
        .mobile-menu-toggle {
          padding: 6px;
          border-radius: 8px;
          color: white;
          background-color: rgb(50, 140, 129);
          transition: all 0.3s ease;
          flex-shrink: 0;
        }
        .mobile-menu-toggle:hover {
          background-color: rgb(40, 120, 110);
        }

        /* ✅ Mobile container row tighter padding so nothing overflows */
        @media (max-width: 768px) {
          .header-inner-row {
            padding-left: 12px;
            padding-right: 12px;
            height: 56px;
          }
          .mobile-actions {
            gap: 4px;
          }
        }
        @media (max-width: 380px) {
          .header-inner-row {
            padding-left: 8px;
            padding-right: 8px;
          }
          .mobile-actions {
            gap: 2px;
          }
          .rooms-nav-link-mobile {
            padding: 5px 5px;
            font-size: 13px;
          }
          .book-nav-button-mobile {
            padding: 5px 6px;
            font-size: 13px;
          }
        }
      `}</style>

      <div className="fixed top-0 left-0 right-0 z-50 p-3 sm:p-4" style={{ background: 'transparent' }}>
        <header className="watercolor-header shadow-lg rounded-2xl transition-all duration-300">
          <div className="max-w-7xl mx-auto">
            <div className="header-inner-row flex items-center justify-between h-16 px-4 sm:px-6 lg:px-10">
              {/* Logo */}
              <div className="flex items-center min-w-0 flex-shrink">
                <h1
                  className="logo-text font-semibold tracking-tight cursor-pointer truncate"
                  onClick={() => (window.location.href = '/home')}
                >
                  mamatiffin
                </h1>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center space-x-6">
                <a href="/home" className="text-gray-700 hover:text-[rgb(50,140,129)] transition-colors font-medium">Home</a>
                <button onClick={() => handleNavigation('/veg-menu')} className="text-gray-700 hover:text-[rgb(50,140,129)] transition-colors font-medium">Veg Menu</button>
                <button onClick={() => handleNavigation('/non-veg-menu')} className="text-gray-700 hover:text-[rgb(50,140,129)] transition-colors font-medium">Non-Veg Menu</button>
                <a href="/about-us" className="text-gray-700 hover:text-[rgb(50,140,129)] transition-colors font-medium">About Us</a>
                <a href="/contact" className="text-gray-700 hover:text-[rgb(50,140,129)] transition-colors font-medium">Contact</a>

                <a
                  href="/rooms"
                  className="text-gray-700 hover:text-[rgb(50,140,129)] transition-colors font-medium flex items-center gap-1"
                >
                  <Home size={16} />
                  Rooms
                </a>

                <div className="relative" ref={bookDropdownRef}>
                  <button onClick={toggleBookDropdown} className="book-nav-button">
                    <BookOpen size={18} />
                    <span>Book</span>
                    <ChevronDown size={16} className={`transition-transform duration-300 ${isBookDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <div className={`book-dropdown ${isBookDropdownOpen ? 'open' : ''}`}>
                    <div className="py-2">
                      <button className="profile-dropdown-item buy" onClick={handleBuyClick}>
                        <ShoppingCart size={18} />
                        <span>Buy Books</span>
                      </button>
                      <button className="profile-dropdown-item sell" onClick={handleSellClick}>
                        <Tag size={18} />
                        <span>Sell Book</span>
                      </button>
                      {user && (
                        <>
                          <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent my-2 mx-4"></div>
                          <button className="profile-dropdown-item" onClick={handleMyListingsClick}>
                            <List size={18} />
                            <span>My Listings</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </nav>

              {/* Desktop Right Side */}
              <div className="hidden lg:flex items-center space-x-4">
                <LocationDropdown />

                {user ? (
                  <div className="relative" ref={profileDropdownRef}>
                    <button onClick={toggleProfileDropdown} className="profile-button flex items-center space-x-3 px-4 py-2 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 transition-all duration-300 border border-gray-200">
                      <div className="profile-icon-3d w-9 h-9 rounded-full flex items-center justify-center">
                        <User size={18} className="text-white" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-gray-800 leading-tight">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.phone}</p>
                      </div>
                      <ChevronDown size={18} className={`text-gray-600 transition-transform duration-300 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <div className={`profile-dropdown ${isProfileDropdownOpen ? 'open' : ''}`}>
                      <div className="py-2">
                        <button className="profile-dropdown-item" onClick={handleMyOrdersClick}>
                          <ShoppingBag size={18} />
                          <span>My Orders</span>
                        </button>
                        <button className="profile-dropdown-item" onClick={handleOrderSkipClick}>
                          <SkipForward size={18} />
                          <span>Order Skip</span>
                        </button>
                        <button className="profile-dropdown-item" onClick={handleMyListingsClick}>
                          <BookOpen size={18} />
                          <span>My Book Listings</span>
                        </button>

                        {(user.role === 'admin' || user.role === 'moderator') && (
                          <>
                            <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent my-2 mx-4"></div>
                            <button className="profile-dropdown-item admin" onClick={() => { setIsProfileDropdownOpen(false); window.location.href = '/admin-dashboard'; }}>
                              <User size={18} />
                              <span>Admin Dashboard</span>
                            </button>
                          </>
                        )}

                        <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent my-2 mx-4"></div>
                        <button className="profile-dropdown-item logout" onClick={handleLogout}>
                          <LogOut size={18} />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setIsAuthModalOpen(true)} className="px-6 py-2.5 rounded-xl font-semibold text-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5" style={{ background: 'linear-gradient(135deg, rgb(50, 140, 129), rgb(34, 197, 94))' }}>
                    Sign In
                  </button>
                )}
              </div>

              {/* ✅ Mobile right side: Rooms + Book + Menu — all compact */}
              <div className="lg:hidden flex items-center mobile-actions flex-shrink-0">
                <button
                  onClick={handleRoomsClick}
                  className="rooms-nav-link-mobile"
                  aria-label="Rooms"
                >
                  <Home size={16} />
                  <span>Rooms</span>
                </button>

                <div className="relative" ref={mobileBookDropdownRef}>
                  <button onClick={toggleMobileBookDropdown} className="book-nav-button-mobile" aria-label="Books menu">
                    <BookOpen size={16} />
                    <span>Book</span>
                    <ChevronDown size={14} className={`transition-transform duration-300 ${isMobileBookDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <div className={`mobile-book-dropdown ${isMobileBookDropdownOpen ? 'open' : ''}`}>
                    <div className="py-2">
                      <button className="profile-dropdown-item buy" onClick={handleBuyClick}>
                        <ShoppingCart size={16} />
                        <span>Buy Books</span>
                      </button>
                      <button className="profile-dropdown-item sell" onClick={handleSellClick}>
                        <Tag size={16} />
                        <span>Sell Book</span>
                      </button>
                      {user && (
                        <>
                          <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent my-2 mx-4"></div>
                          <button className="profile-dropdown-item" onClick={handleMyListingsClick}>
                            <List size={16} />
                            <span>My Listings</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={toggleMobileMenu}
                  className="mobile-menu-toggle"
                  aria-label="Toggle menu"
                >
                  {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
              </div>
            </div>
          </div>

          {isMobileMenuOpen && (
            <div className="lg:hidden watercolor-mobile-menu rounded-b-2xl">
              <div className="px-6 py-4 space-y-4">
                <div className="mb-4"><LocationDropdown /></div>

                <nav className="flex flex-col space-y-3">
                  <a href="/home" className="text-white hover:text-gray-200 transition-colors py-2 menu-item-hover rounded-lg px-2" onClick={() => setIsMobileMenuOpen(false)}>Home</a>
                  <button onClick={() => { handleNavigation('/veg-menu'); setIsMobileMenuOpen(false); }} className="text-left text-white hover:text-gray-200 transition-colors py-2 menu-item-hover rounded-lg px-2">Veg Menu</button>
                  <button onClick={() => { handleNavigation('/non-veg-menu'); setIsMobileMenuOpen(false); }} className="text-left text-white hover:text-gray-200 transition-colors py-2 menu-item-hover rounded-lg px-2">Non-Veg Menu</button>

                  <button
                    onClick={handleRoomsClick}
                    className="text-left text-white hover:text-gray-200 transition-colors py-2 menu-item-hover rounded-lg px-2 flex items-center gap-2"
                  >
                    <Home size={18} />
                    <span>Rooms</span>
                  </button>

                  <div className="border-t border-white border-opacity-20 pt-3">
                    <p className="text-white text-xs uppercase tracking-wider mb-2 px-2 opacity-70">Books</p>
                    <button onClick={handleBuyClick} className="w-full text-left text-white hover:text-gray-200 transition-colors py-2 menu-item-hover rounded-lg px-2 flex items-center gap-3">
                      <ShoppingCart size={18} />
                      <span>Buy Books</span>
                    </button>
                    <button onClick={handleSellClick} className="w-full text-left text-white hover:text-gray-200 transition-colors py-2 menu-item-hover rounded-lg px-2 flex items-center gap-3">
                      <Tag size={18} />
                      <span>Sell Book</span>
                    </button>
                    {user && (
                      <button onClick={handleMyListingsClick} className="w-full text-left text-white hover:text-gray-200 transition-colors py-2 menu-item-hover rounded-lg px-2 flex items-center gap-3">
                        <List size={18} />
                        <span>My Listings</span>
                      </button>
                    )}
                  </div>

                  <a href="/about-us" className="text-white hover:text-gray-200 transition-colors py-2 menu-item-hover rounded-lg px-2" onClick={() => setIsMobileMenuOpen(false)}>About Us</a>
                  <a href="/contact" className="text-white hover:text-gray-200 transition-colors py-2 menu-item-hover rounded-lg px-2" onClick={() => setIsMobileMenuOpen(false)}>Contact</a>
                </nav>

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
                      <button className="menu-item-hover w-full text-left px-4 py-3 text-sm text-white rounded-lg transition-colors flex items-center space-x-3" onClick={() => { setIsMobileMenuOpen(false); handleMyOrdersClick(); }}>
                        <ShoppingBag size={16} /><span>My Orders</span>
                      </button>
                      <button className="menu-item-hover w-full text-left px-4 py-3 text-sm text-white rounded-lg transition-colors flex items-center space-x-3" onClick={() => { setIsMobileMenuOpen(false); handleOrderSkipClick(); }}>
                        <SkipForward size={16} /><span>Order Skip</span>
                      </button>
                      {(user.role === 'admin' || user.role === 'moderator') && (
                        <button className="menu-item-hover w-full text-left px-4 py-3 text-sm text-yellow-300 rounded-lg transition-colors flex items-center space-x-3" onClick={() => { setIsMobileMenuOpen(false); window.location.href = '/admin-dashboard'; }}>
                          <User size={16} /><span>Admin Dashboard</span>
                        </button>
                      )}
                      <button className="menu-item-hover w-full text-left px-4 py-3 text-sm text-red-300 rounded-lg transition-colors flex items-center space-x-3" onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}>
                        <LogOut size={16} /><span>Logout</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="pt-4 border-t border-white border-opacity-20">
                    <button onClick={() => { setIsAuthModalOpen(true); setIsMobileMenuOpen(false); }} className="w-full bg-transparent hover:bg-opacity-10 hover:bg-gray-500 text-white px-6 py-2 rounded-xl text-sm font-medium transition-all duration-300 shadow-md hover:shadow-lg backdrop-blur-sm border border-white border-opacity-20">
                      Sign In
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </header>

        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} onLoginSuccess={handleLoginSuccess} />
      </div>
    </>
  );
};

export default Header; 