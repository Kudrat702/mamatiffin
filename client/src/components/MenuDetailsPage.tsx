import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, IndianRupee, RefreshCw, User, LogIn } from 'lucide-react';
import { apiEndpoints } from '../configapi/api';
import { getCache, setCache, TTL } from '../utils/apiCache';
import { useAuth } from '../context/AuthContext';

// Menu interface
interface WeeklyMenuItem {
  day: string;
  items: string[];
}

interface MenuDetails {
  _id: string;
  title: string;
  menuType: string;
  category: "veg" | "non-veg";
  description?: string;
  deliveryTime?: string;
  imageUrl?: string;
  imagePublicId?: string;
  price: number;
  priceMonthly: number;
  priceWeekly: number;
  priceTrial: number;
  weeklyMenu: WeeklyMenuItem[];
}

const MenuDetailsPage: React.FC = () => {
  const { diet, category } = useParams<{ diet: string; category: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [menuData, setMenuData] = useState<MenuDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!diet || !category) {
          console.error('Missing required parameters:', { diet, category });
          setError('Invalid menu parameters - diet and category are required');
          setLoading(false);
          return;
        }

        if (!['veg', 'non-veg'].includes(diet)) {
          console.error('Invalid diet parameter:', diet);
          setError('Invalid diet preference. Must be "veg" or "non-veg"');
          setLoading(false);
          return;
        }

        console.log('Fetching menu for:', { diet, category });
        const url = apiEndpoints.menuDetails(diet, category);
        console.log('API URL:', url);

        type RawMenuData = {
          _id: string; title?: string; menuType: string; category?: string;
          description?: string; deliveryTime?: string; imageUrl?: string; imagePublicId?: string;
          price?: number; priceMonthly?: number; priceWeekly?: number;
          priceTrial?: number | { value?: number; price?: number; amount?: number; [key: string]: unknown } | null; weeklyMenu?: unknown;
        };
        type MenuApiResponse = { success: boolean; data: RawMenuData; message?: string };
        const cached = getCache<MenuApiResponse>(url);
        let data: MenuApiResponse;

        if (cached) {
          data = cached;
        } else {
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          console.log('Response status:', response.status);

          if (!response.ok) {
            let errorMessage = `Server error: ${response.status}`;
            try {
              const errorData = await response.json();
              errorMessage = errorData.message || errorMessage;
            } catch {
              const errorText = await response.text();
              errorMessage = errorText || errorMessage;
            }
            console.error('Error response:', errorMessage);
            if (response.status === 404) {
              throw new Error(`Menu not found for ${formatDietPreference(diet)} ${formatCategoryName(category)}`);
            } else if (response.status === 400) {
              throw new Error(`Invalid request: ${errorMessage}`);
            } else {
              throw new Error(errorMessage);
            }
          }

          data = await response.json();
          if (data.success) setCache(url, data, TTL.MENU);
        }

        console.log('Raw API Response:', data);

        if (data.success && data.data) {
            const rawMenuData = data.data;
            console.log('Raw menu data from API:', rawMenuData);
            
            // Process weekly menu
            let normalizedWeeklyMenu: WeeklyMenuItem[] = [];
            
            if (rawMenuData.weeklyMenu) {
              if (Array.isArray(rawMenuData.weeklyMenu)) {
                normalizedWeeklyMenu = rawMenuData.weeklyMenu.map((item: WeeklyMenuItem) => ({
                  day: item.day,
                  items: Array.isArray(item.items) ? item.items : [item.items].filter(Boolean)
                }));
              } else if (typeof rawMenuData.weeklyMenu === 'object') {
                const weekDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
                const weeklyMenuObj = rawMenuData.weeklyMenu as Record<string, string>;
                normalizedWeeklyMenu = weekDays.map(day => ({
                  day: day.charAt(0).toUpperCase() + day.slice(1),
                  items: weeklyMenuObj[day]
                    ? weeklyMenuObj[day].split(',').map((item: string) => item.trim()).filter(Boolean)
                    : []
                }));
              }
            }

            if (normalizedWeeklyMenu.length === 0) {
              const defaultDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
              normalizedWeeklyMenu = defaultDays.map(day => ({
                day,
                items: ['Menu not available']
              }));
            }

            // NO fallback calculation - sirf admin's exact value use karte hain
            const normalizedMenuData: MenuDetails = {
              _id: rawMenuData._id,
              title: rawMenuData.title || formatCategoryName(rawMenuData.menuType),
              menuType: rawMenuData.menuType,
              category: (rawMenuData.category === 'veg' || rawMenuData.category === 'non-veg') 
                ? rawMenuData.category 
                : (diet === 'veg' ? 'veg' : 'non-veg'),
              description: rawMenuData.description,
              deliveryTime: rawMenuData.deliveryTime,
              imageUrl: rawMenuData.imageUrl,
              imagePublicId: rawMenuData.imagePublicId,
              price: rawMenuData.price || rawMenuData.priceMonthly || 0,
              priceMonthly: rawMenuData.priceMonthly || rawMenuData.price || 0,
              priceWeekly: rawMenuData.priceWeekly || 0,  // ✅ NO fallback - exact admin value
              priceTrial: extractTrialPrice(rawMenuData.priceTrial) || 0,  // ✅ NO fallback - exact admin value
              weeklyMenu: normalizedWeeklyMenu
            };

            console.log('Normalized menu data:', normalizedMenuData);
            
            if (process.env.NODE_ENV === 'development') {
              console.log('Image storage:', normalizedMenuData.imagePublicId ? 'Cloudinary' : 'Local');
              console.log('Monthly Price:', normalizedMenuData.priceMonthly);
              console.log('Weekly Price:', normalizedMenuData.priceWeekly);
              console.log('Trial Price:', normalizedMenuData.priceTrial);
            }
            
            setMenuData(normalizedMenuData);
          } else {
            throw new Error(data.message || 'Menu data not found in response');
          }
      } catch (err) {
        console.error('Error fetching menu:', err);
        setError(err instanceof Error ? err.message : 'Failed to load menu details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    console.log('useEffect triggered with params:', { diet, category });
    fetchMenuData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diet, category]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleRetry = () => {
    if (diet && category) {
      setError(null);
      setMenuData(null);
      
      const fetchMenuData = async () => {
        try {
          setLoading(true);
          setError(null);

          const url = apiEndpoints.menuDetails(diet, category);
          console.log('Retry - Fetching from:', url);

          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success) setCache(url, data, TTL.MENU);
            if (data.success && data.data) {
              const rawMenuData = data.data;
              
              let normalizedWeeklyMenu: WeeklyMenuItem[] = [];
              if (rawMenuData.weeklyMenu) {
                if (Array.isArray(rawMenuData.weeklyMenu)) {
                  normalizedWeeklyMenu = rawMenuData.weeklyMenu.map((item: WeeklyMenuItem) => ({
                    day: item.day,
                    items: Array.isArray(item.items) ? item.items : [item.items].filter(Boolean)
                  }));
                } else if (typeof rawMenuData.weeklyMenu === 'object') {
                  const weekDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
                  const weeklyMenuObj = rawMenuData.weeklyMenu as Record<string, string>;
                  normalizedWeeklyMenu = weekDays.map(day => ({
                    day: day.charAt(0).toUpperCase() + day.slice(1),
                    items: weeklyMenuObj[day]
                      ? weeklyMenuObj[day].split(',').map((item: string) => item.trim()).filter(Boolean)
                      : []
                  }));
                }
              }

              if (normalizedWeeklyMenu.length === 0) {
                const defaultDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
                normalizedWeeklyMenu = defaultDays.map(day => ({
                  day,
                  items: ['Menu not available']
                }));
              }

              // ✅ UPDATED: NO fallback in retry function either
              const normalizedMenuData: MenuDetails = {
                _id: rawMenuData._id,
                title: rawMenuData.title || formatCategoryName(rawMenuData.menuType),
                menuType: rawMenuData.menuType,
                category: (rawMenuData.category === 'veg' || rawMenuData.category === 'non-veg') 
                  ? rawMenuData.category 
                  : (diet === 'veg' ? 'veg' : 'non-veg'),
                description: rawMenuData.description,
                deliveryTime: rawMenuData.deliveryTime,
                imageUrl: rawMenuData.imageUrl,
                imagePublicId: rawMenuData.imagePublicId,
                price: rawMenuData.price || rawMenuData.priceMonthly || 0,
                priceMonthly: rawMenuData.priceMonthly || rawMenuData.price || 0,
                priceWeekly: rawMenuData.priceWeekly || 0,  // ✅ NO fallback
                priceTrial: extractTrialPrice(rawMenuData.priceTrial) || 0,  // ✅ NO fallback
                weeklyMenu: normalizedWeeklyMenu
              };

              setMenuData(normalizedMenuData);
            } else {
              throw new Error(data.message || 'Menu data not found');
            }
          } else {
            let errorMessage = `Server error: ${response.status}`;
            try {
              const errorData = await response.json();
              errorMessage = errorData.message || errorMessage;
            } catch {
              const errorText = await response.text();
              errorMessage = errorText || errorMessage;
            }
            throw new Error(errorMessage);
          }
        } catch (err) {
          console.error('Retry error:', err);
          setError(err instanceof Error ? err.message : 'Failed to load menu');
        } finally {
          setLoading(false);
        }
      };
      
      fetchMenuData();
    }
  };

  // ✅ UPDATED: Helper functions - NO fallback, sirf exact admin value
  const getMonthlyPrice = () => {
    if (!menuData) return 0;
    return menuData.priceMonthly || menuData.price || 0;
  };

  const getWeeklyPrice = () => {
    if (!menuData) return 0;
    return menuData.priceWeekly || 0;  // ✅ NO fallback
  };

  const getTrialPrice = () => {
    if (!menuData) return 0;
    return extractTrialPrice(menuData.priceTrial) || 0;  // ✅ NO fallback
  };

  // Subscribe Monthly Navigation
  const handleSubscribeMonthly = () => {
    if (!diet || !category || !menuData) {
      alert('Menu data not available. Please try refreshing the page.');
      return;
    }

    if (getMonthlyPrice() === 0) {
      alert('Monthly subscription not available for this menu.');
      return;
    }

    if (!user) {
      const redirectData = {
        path: `/payment`,
        menuData: {
          menuId: menuData._id,
          diet,
          category,
          menuTitle: getMenuTitle(),
          menuCategory: menuData.menuType,
          dietaryPreference: menuData.category,
          price: getMonthlyPrice(),
          duration: 1,
          totalAmount: getMonthlyPrice(),
          deliveryTime: menuData.deliveryTime,
          description: menuData.description,
          imageUrl: menuData.imageUrl,
          weeklyMenu: menuData.weeklyMenu
        }
      };
      
      sessionStorage.setItem('redirectAfterLogin', JSON.stringify(redirectData));
      window.dispatchEvent(new CustomEvent('triggerLogin'));
      return;
    }

    const paymentData = {
      menuId: menuData._id,
      menuTitle: getMenuTitle(),
      menuCategory: menuData.menuType,
      dietaryPreference: menuData.category,
      price: getMonthlyPrice(),
      duration: 1,
      totalAmount: getMonthlyPrice(),
      deliveryTime: menuData.deliveryTime,
      description: menuData.description,
      imageUrl: menuData.imageUrl,
      weeklyMenu: menuData.weeklyMenu,
      urlParams: { diet, category },
      customerInfo: {
        name: user.name || '',
        phone: user.phone || '',
        email: '',
        address: user.address || '',
        city: user.address?.city || ''
      },
      subscriptionType: 'monthly',
      startDate: new Date().toISOString(),
      timestamp: new Date().toISOString(),
      source: 'menu-details-page'
    };

    console.log('Navigating to payment with data:', paymentData);

    navigate('/payment', {
      state: paymentData,
      replace: false
    });
  };

  // Subscribe Weekly Navigation
  const handleSubscribeWeekly = () => {
    if (!diet || !category || !menuData) {
      alert('Menu data not available. Please try refreshing the page.');
      return;
    }

    // ✅ Check if weekly price is set
    if (getWeeklyPrice() === 0) {
      alert('Weekly subscription not available for this menu.');
      return;
    }

    if (!user) {
      const redirectData = {
        path: `/payment`,
        menuData: {
          menuId: menuData._id,
          diet,
          category,
          menuTitle: getMenuTitle(),
          menuCategory: menuData.menuType,
          dietaryPreference: menuData.category,
          price: getWeeklyPrice(),
          duration: 7,
          totalAmount: getWeeklyPrice(),
          deliveryTime: menuData.deliveryTime,
          description: menuData.description,
          imageUrl: menuData.imageUrl,
          weeklyMenu: menuData.weeklyMenu,
          subscriptionType: 'weekly'
        }
      };
      
      sessionStorage.setItem('redirectAfterLogin', JSON.stringify(redirectData));
      window.dispatchEvent(new CustomEvent('triggerLogin'));
      return;
    }

    const paymentData = {
      menuId: menuData._id,
      menuTitle: `${getMenuTitle()} - Weekly Plan`,
      menuCategory: menuData.menuType,
      dietaryPreference: menuData.category,
      price: getWeeklyPrice(),
      duration: 7,
      totalAmount: getWeeklyPrice(),
      deliveryTime: menuData.deliveryTime,
      description: menuData.description,
      imageUrl: menuData.imageUrl,
      weeklyMenu: menuData.weeklyMenu,
      urlParams: { diet, category },
      customerInfo: {
        name: user.name || '',
        phone: user.phone || '',
        email: '',
        address: user.address || '',
        city: user.address?.city || ''
      },
      subscriptionType: 'weekly',
      startDate: new Date().toISOString(),
      timestamp: new Date().toISOString(),
      source: 'menu-details-weekly'
    };

    console.log('Navigating to weekly payment with data:', paymentData);

    navigate('/payment', {
      state: paymentData,
      replace: false
    });
  };

  // Try One Day Navigation
  const handleTryOneDay = () => {
    if (!diet || !category || !menuData) {
      alert('Menu data not available. Please try refreshing the page.');
      return;
    }

    // ✅ Check if trial price is set
    if (getTrialPrice() === 0) {
      alert('Trial not available for this menu.');
      return;
    }

    if (!user) {
      const redirectData = {
        path: `/payment`,
        menuData: {
          menuId: menuData._id,
          diet,
          category,
          menuTitle: getMenuTitle(),
          menuCategory: menuData.menuType,
          dietaryPreference: menuData.category,
          price: getTrialPrice(),
          duration: 1,
          totalAmount: getTrialPrice(),
          deliveryTime: menuData.deliveryTime,
          description: menuData.description,
          imageUrl: menuData.imageUrl,
          subscriptionType: 'trial'
        }
      };
      
      sessionStorage.setItem('redirectAfterLogin', JSON.stringify(redirectData));
      window.dispatchEvent(new CustomEvent('triggerLogin'));
      return;
    }

    const trialPaymentData = {
      menuId: menuData._id,
      menuTitle: `${getMenuTitle()} - 1 Day Trial`,
      menuCategory: menuData.menuType,
      dietaryPreference: menuData.category,
      price: getTrialPrice(),
      duration: 1,
      totalAmount: getTrialPrice(),
      deliveryTime: menuData.deliveryTime,
      description: `One day trial of ${menuData.description}`,
      imageUrl: menuData.imageUrl,
      urlParams: { diet, category },
      customerInfo: {
        name: user.name || '',
        phone: user.phone || '',
        email: '',
        address: user.address || '',
        city: user.address?.city || ''
      },
      subscriptionType: 'trial',
      trialDuration: '1-day',
      startDate: new Date().toISOString(),
      timestamp: new Date().toISOString(),
      source: 'menu-details-trial'
    };

    console.log('Navigating to trial payment with data:', trialPaymentData);

    navigate('/payment', {
      state: trialPaymentData,
      replace: false
    });
  };

  // Helper Functions
  const formatCategoryName = (category?: string) => {
    if (!category) return 'Unknown Category';
    return category
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' + ');
  };

  const formatDietPreference = (diet?: string) => {
    if (!diet) return 'Unknown Diet';
    return diet === 'veg' ? 'Vegetarian' : 'Non-Vegetarian';
  };

  const getMenuTitle = () => {
    if (!menuData) return 'Unknown Menu';
    return menuData.title && menuData.title.trim() ? menuData.title : formatCategoryName(menuData.menuType);
  };

  // Trial price extraction (handles different data formats)
  type PriceTrialType = number | { value?: number; price?: number; amount?: number; [key: string]: unknown } | null | undefined;

  const extractTrialPrice = (priceTrial: PriceTrialType): number => {
    if (typeof priceTrial === 'number' && priceTrial > 0) {
      return priceTrial;
    }
    
    if (typeof priceTrial === 'object' && priceTrial !== null) {
      type PriceObj = { value?: number; price?: number; amount?: number; [key: string]: unknown };
      const priceObj = priceTrial as PriceObj;
      if (priceObj.value && typeof priceObj.value === 'number') {
        return priceObj.value;
      }
      if (priceObj.price && typeof priceObj.price === 'number') {
        return priceObj.price;
      }
      if (priceObj.amount && typeof priceObj.amount === 'number') {
        return priceObj.amount;
      }
      
      const values = Object.values(priceObj).filter((v): v is number => typeof v === 'number' && v > 0);
      if (values.length > 0) {
        return values[0];
      }
    }
    
    return 0;
  };

  // Parameter validation
  if (!diet || !category) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Invalid URL Parameters</h3>
          <p className="text-gray-600 mb-4">
            The URL is missing required parameters. Please navigate from the menu page.
          </p>
          <div className="text-sm text-gray-500 mb-6">
            <p>Expected URL format: <code>/menu/{'<diet>'}/{'<category>'}</code></p>
            <p>Received: diet={diet || 'undefined'}, category={category || 'undefined'}</p>
          </div>
          <button
            onClick={handleBack}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading menu details...</p>
          <p className="text-sm text-gray-500 mt-2">
            Looking for: {formatDietPreference(diet)} - {formatCategoryName(category)}
          </p>
        </div>
      </div>
    );
  }

  if (error || !menuData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">😕</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Menu Not Found</h3>
          <p className="text-gray-600 mb-4">{error || 'The requested menu is not available.'}</p>
          <div className="text-sm text-gray-500 mb-6">
            <p>Searched for: <strong>{formatDietPreference(diet)} - {formatCategoryName(category)}</strong></p>
            <p>URL: <code>/menu/{diet}/{category}</code></p>
          </div>
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleRetry}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
            <button
              onClick={handleBack}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen"
      style={{
        background: 'radial-gradient(circle, rgba(50, 140, 129, 1) 0%, rgba(255, 255, 255, 1) 100%)'
      }}
    >
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div 
          className="rounded-2xl shadow-lg mb-8 p-4 sm:p-8 overflow-hidden"
          style={{
            backgroundColor: 'white',
            border: '2px solid rgba(50, 140, 129, 0.2)'
          }}
        >
          <div className="flex items-center justify-between flex-wrap">
            <div className="flex items-center min-w-0 flex-1">
              <button
                onClick={handleBack}
                className="mr-3 sm:mr-4 p-2 sm:p-3 hover:bg-gray-100 rounded-full transition-all duration-300 border border-gray-200 flex-shrink-0"
                style={{ backgroundColor: 'rgba(50, 140, 129, 0.1)' }}
              >
                <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: '#328c81' }} />
              </button>
              <div>
                <h1 
                  className="text-xl sm:text-2xl md:text-3xl font-normal font-poppins"
                  style={{ color: '#328c81' }}
                >
                  {formatDietPreference(menuData.category)} - {getMenuTitle()}
                </h1>
                <p className="text-gray-600 mt-1 text-sm sm:text-base">Delicious Weekly Menu Plan</p>
              </div>
            </div>
          </div>
        </div>

        {/* Login Status Indicator */}
        {!user && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-2 text-yellow-800">
              <User className="w-5 h-5" />
              <p className="text-sm">
                <strong>Please log in to subscribe.</strong> You'll be redirected to login when you click Subscribe.
              </p>
            </div>
          </div>
        )}

        {/* Menu Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Image Section */}
          <div className="relative w-full aspect-square sm:aspect-[4/3] md:aspect-[3/2] lg:aspect-[16/9] overflow-hidden">
            <img
              src={apiEndpoints.getImageUrl(menuData.imageUrl || '')}
              alt={`${formatDietPreference(menuData.category)} ${formatCategoryName(menuData.menuType)}`}
              loading="eager"
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://via.placeholder.com/800x400?text=Menu+Image';
              }}
            />
            {process.env.NODE_ENV === 'development' && menuData.imagePublicId && (
              <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                ☁️ Cloudinary
              </div>
            )}
          </div>
          
          <div className="p-4 sm:p-6 md:p-8">
            {/* Description Section */}
            <div className="mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Menu Description</h2>
              <p className="text-gray-700 text-base sm:text-lg leading-relaxed">
                {menuData.description || 'No description available'}
              </p>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mr-3" />
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Delivery Time</p>
                    <p className="text-base sm:text-lg font-semibold text-gray-900">
                      {menuData.deliveryTime || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <IndianRupee className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 mr-3" />
                  <div>
                    <p className="text-sm text-green-600 font-medium">Monthly Price</p>
                    <p className="text-base sm:text-lg font-semibold text-gray-900">
                      ₹{getMonthlyPrice()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Weekly Menu Display */}
            <div className="mb-6 sm:mb-8">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">📅 Weekly Menu</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {menuData.weeklyMenu.map((dayMenu, index) => {
                  const displayText = dayMenu.items.length > 0 
                    ? dayMenu.items.join(', ') 
                    : 'Menu not available';

                  return (
                    <div key={dayMenu.day} className="bg-gradient-to-br from-purple-50 to-blue-50 p-3 sm:p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                      <h4 className="font-bold text-gray-900 capitalize mb-2 flex items-center gap-2 text-sm sm:text-base">
                        <span className="text-base sm:text-lg">
                          {['🌅', '🌤️', '⛅', '🌤️', '🌆', '🌇', '🌃'][index]}
                        </span>
                        {dayMenu.day}
                      </h4>
                      <p className="text-gray-700 text-xs sm:text-sm">
                        {displayText}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 sm:gap-4">
              {/* ✅ Monthly Button - Disabled if price is 0 */}
              <button 
                onClick={handleSubscribeMonthly}
                disabled={getMonthlyPrice() === 0}
                className={`w-full font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-xl transition-all duration-200 shadow-lg flex items-center justify-center space-x-2 text-sm sm:text-base ${
                  getMonthlyPrice() === 0
                    ? 'bg-gray-400 cursor-not-allowed text-gray-200'
                    : 'text-white hover:shadow-xl transform hover:scale-105'
                }`}
                style={getMonthlyPrice() !== 0 ? { backgroundColor: '#328c81' } : {}}
                onMouseEnter={(e) => {
                  if (getMonthlyPrice() !== 0) {
                    e.currentTarget.style.backgroundColor = '#2a756c';
                  }
                }}
                onMouseLeave={(e) => {
                  if (getMonthlyPrice() !== 0) {
                    e.currentTarget.style.backgroundColor = '#328c81';
                  }
                }}
              >
                {!user ? <LogIn className="w-4 h-4 sm:w-5 sm:h-5" /> : <IndianRupee className="w-4 h-4 sm:w-5 sm:h-5" />}
                <span>
                  {getMonthlyPrice() === 0
                    ? 'Monthly Plan Not Available'
                    : !user 
                    ? 'Login & Subscribe Monthly' 
                    : `Subscribe Monthly - ₹${getMonthlyPrice()}`
                  }
                </span>
              </button>

              {/* ✅ Weekly Button - Disabled if price is 0 */}
              <button 
                onClick={handleSubscribeWeekly}
                disabled={getWeeklyPrice() === 0}
                className={`w-full font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-xl transition-all duration-200 shadow-lg flex items-center justify-center space-x-2 text-sm sm:text-base ${
                  getWeeklyPrice() === 0
                    ? 'bg-gray-400 cursor-not-allowed text-gray-200'
                    : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white hover:shadow-xl transform hover:scale-105'
                }`}
              >
                {!user ? <LogIn className="w-4 h-4 sm:w-5 sm:h-5" /> : <span>📅</span>}
                <span>
                  {getWeeklyPrice() === 0
                    ? 'Weekly Plan Not Available'
                    : !user 
                    ? 'Login & Subscribe Weekly' 
                    : `Subscribe Weekly - ₹${getWeeklyPrice()}`
                  }
                </span>
              </button>
              
              {/* ✅ Trial Button - Disabled if price is 0 */}
              <button 
                onClick={handleTryOneDay}
                disabled={getTrialPrice() === 0}
                className={`w-full font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-xl transition-all duration-200 shadow-lg flex items-center justify-center space-x-2 text-sm sm:text-base ${
                  getTrialPrice() === 0
                    ? 'bg-gray-400 cursor-not-allowed text-gray-200'
                    : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white hover:shadow-xl transform hover:scale-105'
                }`}
              >
                {!user ? <LogIn className="w-4 h-4 sm:w-5 sm:h-5" /> : <span>🍽️</span>}
                <span>
                  {getTrialPrice() === 0
                    ? 'Trial Not Available'
                    : !user 
                    ? 'Login & Try 1 Day' 
                    : `Try 1 Day - ₹${getTrialPrice()}`
                  }
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuDetailsPage;

