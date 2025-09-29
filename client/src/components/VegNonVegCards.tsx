import React, { useState, useEffect } from 'react';
import { Leaf, Drumstick } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

const VegNonVegCards: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<LocalUser | null>(null);
  
  // Load user data from sessionStorage on component mount
  useEffect(() => {
    const checkUserLogin = () => {
      const savedUser = sessionStorage.getItem('user');
      const savedToken = sessionStorage.getItem('token');
      
      if (savedUser && savedToken) {
        setUser(JSON.parse(savedUser));
      } else {
        setUser(null);
      }
    };

    // Check on mount
    checkUserLogin();

    // Listen for storage changes (when user logs in/out from header)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user' || e.key === 'token') {
        checkUserLogin();
      }
    };

    // Listen for custom events (for same-tab login/logout)
    const handleAuthChange = () => {
      checkUserLogin();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userAuthChanged', handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userAuthChanged', handleAuthChange);
    };
  }, []);
  
  const handleCardClick = (menuType: 'veg' | 'non-veg') => {
    if (user) {
      // User is logged in, navigate to respective menu page
      const path = menuType === 'veg' ? '/veg-menu' : '/non-veg-menu';
      navigate(path);
    } else {
      // User is not logged in, store intended destination and trigger login
      sessionStorage.setItem('redirectAfterLogin', menuType === 'veg' ? '/veg-menu' : '/non-veg-menu');
      
      // Dispatch custom event to trigger login modal in header
      window.dispatchEvent(new CustomEvent('triggerLogin'));
    }
  };

  // Button styles
  const vegButtonStyle = {
    backgroundColor: 'rgb(50, 140, 129)'
  };

  const nonVegButtonStyle = {
    backgroundColor: 'rgb(239, 68, 68)' // Light red color
  };

  // Hover handlers
  const handleVegButtonHover = (e: React.MouseEvent<HTMLButtonElement>, isHover: boolean) => {
    if (isHover) {
      e.currentTarget.style.backgroundColor = 'rgb(45, 125, 115)'; // Darker teal
    } else {
      e.currentTarget.style.backgroundColor = 'rgb(50, 140, 129)'; // Original teal
    }
  };

  const handleNonVegButtonHover = (e: React.MouseEvent<HTMLButtonElement>, isHover: boolean) => {
    if (isHover) {
      e.currentTarget.style.backgroundColor = 'rgb(220, 38, 38)'; // Darker red
    } else {
      e.currentTarget.style.backgroundColor = 'rgb(239, 68, 68)'; // Original light red
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
        {/* Veg Card */}
        <div 
          onClick={() => handleCardClick('veg')}
          className="group relative bg-transparent rounded-3xl p-8 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 cursor-pointer overflow-hidden border-2 border-gray-200 hover:border-green-200"
        >
          {/* Background gradient - removed opacity for transparent effect */}
          <div className="absolute inset-0 bg-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
          
          {/* Content */}
          <div className="relative z-10 flex flex-col items-center text-center">
            {/* Icon */}
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-green-200 transition-colors duration-300 group-hover:scale-110 transform">
              <Leaf className="w-10 h-10 text-green-600" />
            </div>
            
            {/* Title */}
            <h2 className="text-3xl font-bold text-gray-800 mb-4 group-hover:text-green-700 transition-colors duration-300">
              Vegetarian
            </h2>
            
            {/* Description */}
            <p className="text-gray-600 text-lg mb-6 group-hover:text-gray-700 transition-colors duration-300">
              Fresh, healthy aur tasty plant-based khane
            </p>
            
            {/* Explore Button with Teal Color */}
            <button 
              className="text-white font-semibold py-3 px-8 rounded-full transition-all duration-300 transform group-hover:scale-105 shadow-lg hover:shadow-xl"
              style={vegButtonStyle}
              onMouseEnter={(e) => handleVegButtonHover(e, true)}
              onMouseLeave={(e) => handleVegButtonHover(e, false)}
            >
              {user ? 'Explore' : 'Login to Explore'}
            </button>
          </div>
          
          {/* Hover effect overlay - made transparent */}
          <div className="absolute inset-0 bg-transparent opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
        </div>

        {/* Non-Veg Card */}
        <div 
          onClick={() => handleCardClick('non-veg')}
          className="group relative bg-transparent rounded-3xl p-8 shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 cursor-pointer overflow-hidden border-2 border-gray-200 hover:border-red-200"
        >
          {/* Background gradient - removed opacity for transparent effect */}
          <div className="absolute inset-0 bg-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
          
          {/* Content */}
          <div className="relative z-10 flex flex-col items-center text-center">
            {/* Icon */}
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-red-200 transition-colors duration-300 group-hover:scale-110 transform">
              <Drumstick className="w-10 h-10 text-red-600" />
            </div>
            
            {/* Title */}
            <h2 className="text-3xl font-bold text-gray-800 mb-4 group-hover:text-red-700 transition-colors duration-300">
              Non-Vegetarian
            </h2>
            
            {/* Description */}
            <p className="text-gray-600 text-lg mb-6 group-hover:text-gray-700 transition-colors duration-300">
              Perfectly banaye gaye meats , taste mein kamaal
            </p>
            
            {/* Explore Button with Light Red Color */}
            <button 
              className="text-white font-semibold py-3 px-8 rounded-full transition-all duration-300 transform group-hover:scale-105 shadow-lg hover:shadow-xl"
              style={nonVegButtonStyle}
              onMouseEnter={(e) => handleNonVegButtonHover(e, true)}
              onMouseLeave={(e) => handleNonVegButtonHover(e, false)}
            >
              {user ? 'Explore' : 'Login to Explore'}
            </button>
          </div>
          
          {/* Hover effect overlay - made transparent */}
          <div className="absolute inset-0 bg-transparent opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
        </div>
      </div>
    </div>
  );
};

export default VegNonVegCards;