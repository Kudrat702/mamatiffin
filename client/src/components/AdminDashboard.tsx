import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Button } from './ui/button';
import ImageSliderManager from './ImageSliderManager';
import MenuForm from './MenuForm';
import AdminOrderDashboard from './AdminOrder';
import AdminMessagesDashboard from './AdminMessagesDashboard';
import UsersList from './UsersList';
import AdminLocation from './AdminLocation';
import { AuthContext } from '../context/AdminAuthContext';  // ✅ ADDED
import messageService from '../../services/messageApi';  // ✅ ADDED
import { apiEndpoints } from '../configapi/api';
import { type Menu } from '../types/menu';
import {
  LayoutDashboard,
  Image,
  Users,
  ShoppingCart,
  BarChart3,
  Settings,
  LogOut,
  Menu as MenuIcon,
  X,
  BookOpen,
  Bell,
  Search,
  Calendar,
  Plus,
  Edit,
  Trash2,
  IndianRupee,
  Clock,
  RefreshCw,
  CheckCircle,
  Activity,
  MessageSquare,
  MapPin,
  Filter,
  Download,
  Eye,
  FileText,
  Target,
  Shield,
} from 'lucide-react';

// ==========================================
// INTERFACES & TYPES
// ==========================================

interface MenuDetailsFromAPI {
  _id: string;
  category: 'veg' | 'non-veg';
  menuType: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  price?: number;
  priceMonthly?: number;
  priceTrial?: number;
  deliveryTime?: string;
  weeklyMenu?: WeeklyMenuDay[] | Record<string, string | string[]> | string | undefined;
  createdAt?: string;
  updatedAt?: string;
}

interface WeeklyMenuDay {
  day: string;
  items: string[];
}

type AdminView =
  | 'dashboard'
  | 'slider-management'
  | 'menu-details'
  | 'users'
  | 'orders'
  | 'messages'
  | 'analytics'
  | 'settings'
  | 'locations';

interface MessageStats {
  unread: number;
  read: number;
  replied: number;
  total: number;
  avgResponseTime?: string;
  satisfaction?: number;
}

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  systemHealth: 'good' | 'warning' | 'critical';
  uptime: string;
  lastBackup?: string;
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

const convertAPIMenuToMenu = (apiMenu: MenuDetailsFromAPI): Menu => {
  const isDev = process.env.NODE_ENV === 'development';

  if (isDev) {
    console.log('🔧 CONVERTING API MENU:', apiMenu);
    console.log('🔧 RAW weeklyMenu from DB:', apiMenu.weeklyMenu);
  }

  let processedWeeklyMenu: WeeklyMenuDay[] = [];

  if (apiMenu.weeklyMenu && Array.isArray(apiMenu.weeklyMenu) && apiMenu.weeklyMenu.length > 0) {
    processedWeeklyMenu = (apiMenu.weeklyMenu as WeeklyMenuDay[]).map((day: WeeklyMenuDay) => ({
      day: day.day,
      items:
        Array.isArray(day.items) && day.items.length > 0
          ? day.items.filter((item: string) => item && item.trim() !== '')
          : ['No items added yet'],
    }));

    if (isDev) console.log('✅ Using database weeklyMenu data');
  } else if (
    apiMenu.weeklyMenu &&
    typeof apiMenu.weeklyMenu === 'object' &&
    !Array.isArray(apiMenu.weeklyMenu)
  ) {
    if (isDev) console.log('🔄 Converting object weeklyMenu to array format');

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const dayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    const weeklyMenuObj = apiMenu.weeklyMenu as Record<string, string | string[] | undefined>;
    processedWeeklyMenu = days.map((day, index) => {
      const dayKey = dayKeys[index];
      if (!dayKey) {
        return { day, items: ['No items found'] };
      }

      const dayMenu = weeklyMenuObj[dayKey] || '';

      let items: string[] = [];
      if (typeof dayMenu === 'string' && dayMenu.trim().length > 0) {
        if (dayMenu.includes('||')) {
          items = dayMenu
            .split('||')
            .map((item: string) => item.trim())
            .filter((item: string) => item.length > 0);
        } else if (dayMenu.includes('|')) {
          items = dayMenu
            .split('|')
            .map((item: string) => item.trim())
            .filter((item: string) => item.length > 0);
        } else if (dayMenu.includes(',')) {
          items = dayMenu
            .split(',')
            .map((item: string) => item.trim())
            .filter((item: string) => item.length > 0);
        } else {
          items = [dayMenu.trim()];
        }
      } else if (Array.isArray(dayMenu)) {
        items = (dayMenu as string[]).filter(
          (item: string) => typeof item === 'string' && item.trim().length > 0
        );
      }

      return {
        day,
        items: items.length > 0 ? items : ['No items found for this day'],
      };
    });
  } else {
    if (isDev) console.log('⚠️ Database weeklyMenu is empty, creating default structure');

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    processedWeeklyMenu = days.map(day => ({
      day,
      items: ['No items added yet - Please edit to add menu items'],
    }));
  }

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const finalWeeklyMenu = days.map(dayName => {
    const existingDay = processedWeeklyMenu.find(d => d.day === dayName);
    return (
      existingDay || {
        day: dayName,
        items: ['No items added yet - Please edit to add menu items'],
      }
    );
  });

  if (isDev) {
    console.log('🔧 FINAL processedWeeklyMenu:', finalWeeklyMenu);
    console.log('🔧 Sample day items:', finalWeeklyMenu[0]?.items);
  }

  return {
    _id: apiMenu._id,
    category: apiMenu.category,
    menuType: apiMenu.menuType,
    title: apiMenu.title || apiMenu.menuType,
    description: apiMenu.description || '',
    imageUrl: apiMenu.imageUrl || '',
    price: apiMenu.price || 0,
    priceMonthly: apiMenu.priceMonthly || apiMenu.price || 0,
    priceTrial: apiMenu.priceTrial || 0,
    deliveryTime: apiMenu.deliveryTime || 'Standard delivery',
    createdAt: apiMenu.createdAt,
    updatedAt: apiMenu.updatedAt,
    weeklyMenu: finalWeeklyMenu,
  };
};

// ==========================================
// MAIN COMPONENT
// ==========================================

const AdminDashboard: React.FC = () => {
  // ✅ AUTH CONTEXT
  const authContext = useContext(AuthContext);

  // View Management States
  const [currentView, setCurrentView] = useState<AdminView>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<string[]>([]);
  const [showNotificationBadge, setShowNotificationBadge] = useState(false);

  // Menu Management States
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'veg' | 'non-veg'>('all');
  const [menuFilter, setMenuFilter] = useState<string>('');
  const [stats, setStats] = useState({
    totalMenus: 0,
    vegMenus: 0,
    nonVegMenus: 0,
    activeMenus: 0,
    draftMenus: 0,
  });

  // Location Count for Sidebar Badge
  const [locationCount, setLocationCount] = useState(0);

  // Stats States
  const [messageStats, setMessageStats] = useState<MessageStats>({
    unread: 0,
    read: 0,
    replied: 0,
    total: 0,
    avgResponseTime: '2h 30m',
    satisfaction: 4.5,
  });

  const [systemStats, setSystemStats] = useState<SystemStats>({
    totalUsers: 0,
    activeUsers: 0,
    systemHealth: 'good',
    uptime: '99.9%',
    lastBackup: new Date().toISOString(),
  });

  // ==========================================
  // ✅ AUTHENTICATION SETUP
  // ==========================================

  useEffect(() => {
    // Setup authentication for messageService
    const token = authContext?.token || localStorage.getItem('ADMIN_TOKEN');
    
    if (token) {
      console.log('🔐 Setting up authentication for messageService in AdminDashboard');
      messageService.setAuthToken(token);
    } else {
      console.warn('⚠️ No authentication token found in AdminDashboard');
    }
  }, [authContext]);

  // ==========================================
  // SIDEBAR MENU ITEMS
  // ==========================================

  const menuItems = [
    {
      id: 'dashboard' as AdminView,
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Overview & Analytics',
      color: 'blue',
    },
    {
      id: 'slider-management' as AdminView,
      label: 'Image Slider',
      icon: Image,
      description: 'Manage Homepage Images',
      color: 'purple',
    },
    {
      id: 'menu-details' as AdminView,
      label: 'Menu Details',
      icon: BookOpen,
      badge: stats.totalMenus > 0 ? `${stats.totalMenus}` : undefined,
      description: 'Complete Menu Management',
      color: 'emerald',
    },
    {
      id: 'locations' as AdminView,
      label: 'Locations',
      icon: MapPin,
      description: 'Delivery Areas',
      badge: locationCount > 0 ? `${locationCount}` : undefined,
      color: 'emerald',
    },
    {
      id: 'users' as AdminView,
      label: 'Users',
      icon: Users,
      description: 'Customer Management',
      badge: systemStats.activeUsers > 0 ? `${systemStats.activeUsers}` : undefined,
      color: 'indigo',
    },
    {
      id: 'orders' as AdminView,
      label: 'Orders',
      icon: ShoppingCart,
      description: 'Order Processing',
      color: 'red',
    },
    {
      id: 'messages' as AdminView,
      label: 'Messages',
      icon: MessageSquare,
      description: 'Customer Inquiries',
      badge: messageStats.unread > 0 ? `${messageStats.unread}` : undefined,
      color: 'pink',
      priority: messageStats.unread > 0,
    },
    {
      id: 'analytics' as AdminView,
      label: 'Analytics',
      icon: BarChart3,
      description: 'Reports & Insights',
      color: 'cyan',
    },
    {
      id: 'settings' as AdminView,
      label: 'Settings',
      icon: Settings,
      description: 'System Configuration',
      color: 'gray',
    },
  ];

  // ==========================================
  // FETCH FUNCTIONS
  // ==========================================

  // Fetch location count for sidebar badge
  const fetchLocationCount = useCallback(async () => {
    try {
      const response = await fetch(apiEndpoints.locations);
      const data = await response.json();
      if (data.success) {
        setLocationCount(data.data?.length || 0);
      }
    } catch (error) {
      console.error('Error fetching location count:', error);
    }
  }, []);

  // ✅ UPDATED: Fetch message stats using messageService
  const fetchMessageStats = useCallback(async (): Promise<void> => {
    try {
      console.log('📊 Fetching message stats using messageService...');
      
      // Use messageService to get stats with authentication
      const stats = await messageService.getMessageStats();
      
      setMessageStats(prev => ({
        ...prev,
        unread: stats.unread || 0,
        read: stats.read || 0,
        replied: stats.replied || 0,
        total: stats.total || (stats.unread || 0) + (stats.read || 0) + (stats.replied || 0),
      }));
      
      console.log('✅ Message stats loaded:', stats);
    } catch (error) {
      console.error('❌ Error fetching message stats:', error);
      // Set default values on error
      setMessageStats(prev => ({
        ...prev,
        unread: 0,
        read: 0,
        replied: 0,
        total: 0,
      }));
    }
  }, []);

  // Fetch system stats
  const fetchSystemStats = useCallback(async (): Promise<void> => {
    try {
      setSystemStats({
        totalUsers: 1250,
        activeUsers: 890,
        systemHealth: 'good',
        uptime: '99.9%',
        lastBackup: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error fetching system stats:', error);
    }
  }, []);

  // Fetch menus
  const fetchMenus = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Fetching menus with enhanced weekly menu handling...');

      const [vegResponse, nonVegResponse] = await Promise.all([
        fetch(apiEndpoints.vegMenus),
        fetch(apiEndpoints.nonVegMenus),
      ]);

      console.log('📡 Veg Response Status:', vegResponse.status);
      console.log('📡 Non-Veg Response Status:', nonVegResponse.status);

      const [vegData, nonVegData] = await Promise.all([vegResponse.json(), nonVegResponse.json()]);

      console.log('📦 Veg Data from Database:', vegData);
      console.log('📦 Non-Veg Data from Database:', nonVegData);

      if (vegData.success && vegData.data && vegData.data.length > 0) {
        console.log('🔍 SAMPLE VEG MENU weeklyMenu:', vegData.data[0]?.weeklyMenu);
      }

      if (nonVegData.success && nonVegData.data && nonVegData.data.length > 0) {
        console.log('🔍 SAMPLE NON-VEG MENU weeklyMenu:', nonVegData.data[0]?.weeklyMenu);
      }

      let allMenus: MenuDetailsFromAPI[] = [];

      if (vegData.success && Array.isArray(vegData.data)) {
        console.log(`✅ Found ${vegData.data.length} veg menus in database`);
        allMenus = [...allMenus, ...vegData.data];
      }

      if (nonVegData.success && Array.isArray(nonVegData.data)) {
        console.log(`✅ Found ${nonVegData.data.length} non-veg menus in database`);
        allMenus = [...allMenus, ...nonVegData.data];
      }

      console.log(`📊 Total menus fetched from database: ${allMenus.length}`);

      const transformedMenus: Menu[] = allMenus.map((apiMenu: MenuDetailsFromAPI) => {
        const convertedMenu = convertAPIMenuToMenu(apiMenu);

        console.log(`🔧 Converted menu ${apiMenu.menuType}:`, {
          hasWeeklyMenu: !!convertedMenu.weeklyMenu,
          weeklyMenuLength: convertedMenu.weeklyMenu?.length,
          sampleDay: convertedMenu.weeklyMenu?.[0],
        });

        return convertedMenu;
      });

      setMenus(transformedMenus);

      const vegCount = transformedMenus.filter(menu => menu.category === 'veg').length;
      const nonVegCount = transformedMenus.filter(menu => menu.category === 'non-veg').length;

      setStats({
        totalMenus: transformedMenus.length,
        vegMenus: vegCount,
        nonVegMenus: nonVegCount,
        activeMenus: transformedMenus.length,
        draftMenus: 0,
      });

      console.log('📈 Menu Stats Updated:', {
        total: transformedMenus.length,
        veg: vegCount,
        nonVeg: nonVegCount,
      });
    } catch (err) {
      console.error('💥 Error fetching menus from database:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to load menus from database. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // NOTIFICATION SYSTEM
  // ==========================================

  const showDashboardNotification = (message: string): void => {
    setNotifications(prev => {
      const newNotifications = [message, ...prev.slice(0, 4)];
      return newNotifications;
    });
    setShowNotificationBadge(true);

    setTimeout(() => {
      setShowNotificationBadge(false);
    }, 10000);
  };

  // ==========================================
  // MENU MANAGEMENT FUNCTIONS
  // ==========================================

  const handleAddNew = (): void => {
    setEditingMenu(null);
    setShowForm(true);
  };

  const handleEdit = (menu: Menu): void => {
    setEditingMenu(menu);
    setShowForm(true);
  };

  const handleFormClose = (): void => {
    setShowForm(false);
    setEditingMenu(null);
    fetchMenus();
  };

  const handleDeleteMenu = async (id: string): Promise<void> => {
    if (!window.confirm('Are you sure you want to delete this menu?')) {
      return;
    }

    try {
      const menuToDelete = menus.find((menu: Menu) => menu._id === id);
      if (!menuToDelete) {
        throw new Error('Menu not found');
      }

      const response = await fetch(
        apiEndpoints.adminCategoryMenu(menuToDelete.category, menuToDelete.menuType),
        { method: 'DELETE' }
      );

      if (response.ok) {
        alert('Menu deleted successfully!');
        showDashboardNotification('Menu deleted successfully!');
        await fetchMenus();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete menu');
      }
    } catch (err) {
      console.error('Error deleting menu:', err);
      alert('Failed to delete menu. Please try again.');
    }
  };

  const getFilteredMenus = () => {
    return menus.filter(menu => {
      const matchesTab = activeTab === 'all' || menu.category === activeTab;
      const matchesSearch =
        !menuFilter ||
        menu.title.toLowerCase().includes(menuFilter.toLowerCase()) ||
        menu.menuType.toLowerCase().includes(menuFilter.toLowerCase());
      return matchesTab && matchesSearch;
    });
  };

  // ==========================================
  // UTILITY FUNCTIONS
  // ==========================================

  const handleLogout = (): void => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('ADMIN_TOKEN');
      if (authContext?.logout) {
        authContext.logout();
      }
      window.location.href = '/admin-login';
    }
  };

  const getPageTitle = (): string => {
    const titles: Record<AdminView, string> = {
      dashboard: 'Dashboard Overview',
      'slider-management': 'Image Slider Management',
      'menu-details': 'Menu Details Management',
      locations: 'Location Management',
      users: 'User Management',
      orders: 'Order Management',
      messages: 'Contact Messages Management',
      analytics: 'Analytics & Reports',
      settings: 'System Settings',
    };
    return titles[currentView] || 'Admin Panel';
  };

  const exportData = (type: string) => {
    console.log(`Exporting ${type} data...`);
    showDashboardNotification(`${type} data export initiated`);
  };

  // ==========================================
  // EFFECTS
  // ==========================================

  useEffect(() => {
    fetchMenus();
  }, []);

  useEffect(() => {
    fetchMessageStats();
    fetchSystemStats();
    fetchLocationCount();

    const interval = setInterval(() => {
      fetchMessageStats();
      fetchSystemStats();
      fetchLocationCount();
    }, 120000);

    return () => {
      clearInterval(interval);
    };
  }, [fetchMessageStats, fetchSystemStats, fetchLocationCount]);

  // ==========================================
  // RENDER FUNCTIONS
  // ==========================================

  if (showForm) {
    return <MenuForm menu={editingMenu} onClose={handleFormClose} onDelete={handleDeleteMenu} />;
  }

  // Menu Details Content
  const renderMenuDetailsContent = () => {
    const filteredMenus = getFilteredMenus();

    if (loading) {
      return (
        <div className="py-12 text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Loading menus...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="py-12 text-center">
          <div className="mb-4 text-6xl">⚠️</div>
          <h3 className="mb-2 text-xl font-semibold text-gray-900">Error Loading Menus</h3>
          <p className="mb-4 text-gray-600">{error}</p>
          <button
            onClick={fetchMenus}
            className="mx-auto flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-bold text-white transition-colors duration-200 hover:bg-blue-700"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        </div>
      );
    }

    if (menus.length === 0) {
      return (
        <div className="py-12 text-center">
          <div className="mb-4 text-6xl">📝</div>
          <h3 className="mb-2 text-xl font-semibold text-gray-900">No Menus Available</h3>
          <p className="mb-4 text-gray-600">Start by adding your first menu!</p>
          <button
            onClick={handleAddNew}
            className="mx-auto flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-bold text-white transition-colors duration-200 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add New Menu
          </button>
        </div>
      );
    }

    return (
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Menu Details Management</h2>
            <p className="text-gray-600">Manage your weekly menu plans and offerings</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={fetchMenus}
              className="flex items-center gap-2 rounded-lg bg-gray-500 px-4 py-2 font-bold text-white transition-colors duration-200 hover:bg-gray-600"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
            <button
              onClick={() => exportData('menus')}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 font-bold text-white transition-colors duration-200 hover:bg-green-700"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
            <button
              onClick={handleAddNew}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-bold text-white transition-colors duration-200 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Add New Menu
            </button>
          </div>
        </div>

        <div className="mb-6 space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                <input
                  type="text"
                  placeholder="Search menus..."
                  value={menuFilter}
                  onChange={e => setMenuFilter(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 py-2 pr-4 pl-10 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">Filter by category:</span>
            </div>
          </div>

          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('all')}
                className={`border-b-2 px-1 py-2 text-sm font-medium transition-colors duration-200 ${
                  activeTab === 'all'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                All Menus ({menus.length})
              </button>
              <button
                onClick={() => setActiveTab('veg')}
                className={`flex items-center gap-2 border-b-2 px-1 py-2 text-sm font-medium transition-colors duration-200 ${
                  activeTab === 'veg'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                🥬 Vegetarian ({stats.vegMenus})
              </button>
              <button
                onClick={() => setActiveTab('non-veg')}
                className={`flex items-center gap-2 border-b-2 px-1 py-2 text-sm font-medium transition-colors duration-200 ${
                  activeTab === 'non-veg'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                🍗 Non-Vegetarian ({stats.nonVegMenus})
              </button>
            </nav>
          </div>
        </div>

        {filteredMenus.length === 0 ? (
          <div className="py-12 text-center">
            <div className="mb-4 text-4xl">
              {activeTab === 'veg' ? '🥬' : activeTab === 'non-veg' ? '🍗' : '📝'}
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">
              {menuFilter
                ? `No menus found for "${menuFilter}"`
                : `No ${activeTab === 'veg' ? 'Vegetarian' : activeTab === 'non-veg' ? 'Non-Vegetarian' : ''} Menus Found`}
            </h3>
            <p className="mb-4 text-gray-600">
              {menuFilter
                ? 'Try adjusting your search criteria'
                : `Add some delicious ${activeTab === 'veg' ? 'vegetarian' : activeTab === 'non-veg' ? 'non-vegetarian' : ''} menu options!`}
            </p>
            {!menuFilter && (
              <button
                onClick={handleAddNew}
                className="mx-auto flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-bold text-white transition-colors duration-200 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Add{' '}
                {activeTab === 'veg'
                  ? 'Vegetarian'
                  : activeTab === 'non-veg'
                    ? 'Non-Vegetarian'
                    : ''}{' '}
                Menu
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredMenus.map(menu => (
              <div
                key={menu._id}
                className="transform overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={apiEndpoints.getImageUrl(menu.imageUrl || '')}
                    alt={`${menu.category === 'veg' ? 'Vegetarian' : 'Non-Vegetarian'} ${menu.menuType}`}
                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                    onError={e => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://via.placeholder.com/400x300?text=Menu+Image';
                    }}
                  />
                  <div className="absolute top-3 left-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        menu.category === 'veg'
                          ? 'border border-green-300 bg-green-100 text-green-800'
                          : 'border border-red-300 bg-red-100 text-red-800'
                      }`}
                    >
                      {menu.category === 'veg' ? '🥬 VEG' : '🍗 NON-VEG'}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="flex items-center gap-1 rounded-full bg-black/70 px-3 py-1 text-sm font-bold text-white">
                      <IndianRupee className="h-3 w-3" />
                      {menu.priceMonthly || menu.price || 0}
                    </span>
                  </div>
                  <div className="absolute right-3 bottom-3">
                    <button
                      onClick={() => handleEdit(menu)}
                      className="rounded-full bg-white/90 p-2 text-gray-700 shadow-md transition-all duration-200 hover:bg-white"
                      title="Quick Edit"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="p-4">
                  <div className="mb-2 flex items-start justify-between">
                    <h3 className="line-clamp-1 text-lg font-bold text-gray-900">
                      {menu.title || menu.menuType}
                    </h3>
                    <span className="ml-2 text-sm text-gray-500">{menu.menuType}</span>
                  </div>

                  <p className="mb-3 line-clamp-2 text-sm text-gray-600">
                    {menu.description || 'No description available'}
                  </p>

                  <div className="mb-4 flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{menu.deliveryTime || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <IndianRupee className="h-3 w-3" />
                      <span>Trial: {menu.priceTrial || 0}</span>
                    </div>
                  </div>

                  <div className="mb-4 rounded-lg bg-gray-50 p-2">
                    <h4 className="mb-1 text-xs font-semibold text-gray-700">
                      Weekly Menu Preview:
                    </h4>
                    <div className="text-xs text-gray-600">
                      {menu.weeklyMenu && menu.weeklyMenu.length > 0 ? (
                        <div className="space-y-1">
                          {menu.weeklyMenu.slice(0, 2).map((day, index) => (
                            <div key={index} className="truncate">
                              <span className="font-medium">{day.day}:</span>{' '}
                              {day.items &&
                              day.items.length > 0 &&
                              day.items[0] !== 'No items added yet - Please edit to add menu items'
                                ? day.items.slice(0, 2).join(', ')
                                : 'No items'}
                            </div>
                          ))}
                          {menu.weeklyMenu.length > 2 && (
                            <div className="text-gray-400">
                              ...and {menu.weeklyMenu.length - 2} more days
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-gray-400">No weekly menu data</div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(menu)}
                      className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-yellow-500 px-3 py-2 font-bold text-white transition-colors duration-200 hover:bg-yellow-600"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteMenu(menu._id)}
                      className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-red-500 px-3 py-2 font-bold text-white transition-colors duration-200 hover:bg-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Dashboard Content
  const renderDashboardContent = () => (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold">Welcome back, Admin!</h1>
            <p className="text-lg text-blue-100">
              Here's what's happening with your mamatiffin today.
            </p>
          </div>
          <div className="hidden md:block">
            <div className="flex items-center space-x-4">
              <Calendar className="h-8 w-8 text-blue-200" />
              <div className="text-right">
                <p className="text-sm text-blue-200">Today</p>
                <p className="font-semibold">
                  {new Date().toLocaleDateString('en-IN', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Banner */}
      {notifications.length > 0 && (
        <div className="rounded-lg border border-green-200 bg-gradient-to-r from-green-50 to-blue-50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircle className="mr-3 h-5 w-5 text-green-600" />
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Recent Activity</h3>
                <p className="text-sm text-gray-600">{notifications[0]}</p>
              </div>
            </div>
            <button
              onClick={() => setNotifications([])}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="rounded-xl border border-gray-100 bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
          <p className="text-gray-500">Manage your mamatiffin efficiently</p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
          <Button
            onClick={() => setCurrentView('orders')}
            className="flex h-auto flex-col items-center rounded-xl bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white shadow-sm transition-all duration-200 hover:scale-105 hover:from-orange-600 hover:to-red-600 hover:shadow-md"
          >
            <ShoppingCart className="mb-3 h-10 w-10" />
            <span className="text-lg font-semibold">Orders</span>
            <span className="mt-1 text-xs opacity-90">Manage Orders</span>
          </Button>

          <Button
            onClick={() => setCurrentView('locations')}
            className="flex h-auto flex-col items-center rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 p-6 text-white shadow-sm transition-all duration-200 hover:scale-105 hover:from-emerald-600 hover:to-teal-600 hover:shadow-md"
          >
            <MapPin className="mb-3 h-10 w-10" />
            <span className="text-lg font-semibold">Locations</span>
            <span className="mt-1 text-xs opacity-90">Delivery Areas</span>
          </Button>

          <Button
            onClick={() => setCurrentView('messages')}
            className="relative flex h-auto flex-col items-center rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white shadow-sm transition-all duration-200 hover:scale-105 hover:from-purple-600 hover:to-pink-600 hover:shadow-md"
          >
            <MessageSquare className="mb-3 h-10 w-10" />
            <span className="text-lg font-semibold">Messages</span>
            <span className="mt-1 text-xs opacity-90">Customer Inquiries</span>
            {messageStats.unread > 0 && (
              <span className="absolute -top-2 -right-2 rounded-full bg-white px-2 py-1 text-xs font-bold text-purple-600">
                {messageStats.unread}
              </span>
            )}
          </Button>

          <Button
            onClick={() => setCurrentView('menu-details')}
            className="flex h-auto flex-col items-center rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 p-6 text-white shadow-sm transition-all duration-200 hover:scale-105 hover:from-emerald-600 hover:to-green-700 hover:shadow-md"
          >
            <BookOpen className="mb-3 h-10 w-10" />
            <span className="text-lg font-semibold">Menu Details</span>
            <span className="mt-1 text-xs opacity-90">Complete Management</span>
          </Button>

          <Button
            onClick={() => setCurrentView('slider-management')}
            className="flex h-auto flex-col items-center rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 p-6 text-white shadow-sm transition-all duration-200 hover:scale-105 hover:from-indigo-600 hover:to-indigo-700 hover:shadow-md"
          >
            <Image className="mb-3 h-10 w-10" />
            <span className="text-lg font-semibold">Slider Images</span>
            <span className="mt-1 text-xs opacity-90">Homepage Management</span>
          </Button>
        </div>
      </div>

      {/* Overview Sections */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Menu Stats */}
        <div className="rounded-xl border border-gray-100 bg-white p-8 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Menu Overview</h2>
            <button
              onClick={() => setCurrentView('menu-details')}
              className="font-medium text-emerald-600 hover:text-emerald-700"
            >
              Manage →
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-gray-50 p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.totalMenus}</div>
              <div className="text-sm text-gray-600">Total Menus</div>
            </div>
            <div className="rounded-lg bg-green-50 p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.vegMenus}</div>
              <div className="text-sm text-gray-600">Vegetarian</div>
            </div>
            <div className="rounded-lg bg-red-50 p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{stats.nonVegMenus}</div>
              <div className="text-sm text-gray-600">Non-Veg</div>
            </div>
            <div className="rounded-lg bg-blue-50 p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.activeMenus}</div>
              <div className="text-sm text-gray-600">Active</div>
            </div>
          </div>
        </div>

        {/* Location Stats */}
        <div className="rounded-xl border border-gray-100 bg-white p-8 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Location Overview</h2>
            <button
              onClick={() => setCurrentView('locations')}
              className="font-medium text-emerald-600 hover:text-emerald-700"
            >
              Manage →
            </button>
          </div>
          <div className="text-center">
            <div className="rounded-lg bg-emerald-50 p-4">
              <div className="mb-2 text-4xl font-bold text-emerald-600">{locationCount}</div>
              <div className="text-sm text-gray-600">Delivery Locations</div>
              <div className="mt-1 text-xs text-emerald-600">
                {locationCount === 0 ? 'Add your first location' : 'Areas covered'}
              </div>
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="rounded-xl border border-gray-100 bg-white p-8 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">System Health</h2>
            <div
              className={`h-3 w-3 rounded-full ${systemStats.systemHealth === 'good' ? 'bg-green-500' : systemStats.systemHealth === 'warning' ? 'bg-yellow-500' : 'bg-red-500'}`}
            ></div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Uptime</span>
              <span className="font-semibold">{systemStats.uptime}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active Users</span>
              <span className="font-semibold">{systemStats.activeUsers}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Last Backup</span>
              <span className="text-xs font-semibold">
                {systemStats.lastBackup
                  ? new Date(systemStats.lastBackup).toLocaleDateString()
                  : 'N/A'}
              </span>
            </div>
            <div className="pt-2">
              <button
                onClick={() => setCurrentView('settings')}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-100 px-4 py-2 font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-200"
              >
                <Settings className="h-4 w-4" />
                System Settings
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div className="rounded-xl border border-gray-100 bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Recent Activity</h2>
          <div className="flex items-center text-sm text-gray-500">
            <div className="mr-2 h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
            Live updates
          </div>
        </div>
        <div className="space-y-4">
          {notifications.length > 0 ? (
            notifications.slice(0, 5).map((notification, index) => (
              <div
                key={index}
                className="flex items-center rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100"
              >
                <CheckCircle className="mr-3 h-5 w-5 flex-shrink-0 text-green-500" />
                <span className="flex-grow text-sm text-gray-700">{notification}</span>
                <span className="ml-2 text-xs text-gray-400">
                  {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))
          ) : (
            <div className="py-8 text-center">
              <Activity className="mx-auto mb-3 h-12 w-12 text-gray-300" />
              <p className="text-gray-500">No recent activity</p>
              <p className="mt-1 text-xs text-gray-400">
                Activity will appear here as you use the system
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Main Render Content Switch
  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return renderDashboardContent();

      case 'slider-management':
        return (
          <div className="min-h-[80vh] rounded-xl border border-gray-100 bg-white shadow-sm">
            <ImageSliderManager />
          </div>
        );

      case 'menu-details':
        return (
          <div className="min-h-[80vh] rounded-xl border border-gray-100 bg-white shadow-sm">
            {renderMenuDetailsContent()}
          </div>
        );

      case 'locations':
        return (
          <div className="min-h-[80vh] rounded-xl border border-gray-100 bg-white shadow-sm">
            <AdminLocation onNotification={showDashboardNotification} />
          </div>
        );

      case 'users':
        return (
          <div className="min-h-[80vh] rounded-xl border border-gray-100 bg-white shadow-sm">
            <UsersList />
          </div>
        );

      case 'orders':
        return (
          <div className="min-h-[80vh] rounded-xl border border-gray-100 bg-white shadow-sm">
            <AdminOrderDashboard />
          </div>
        );

      case 'messages':
        return (
          <div className="min-h-[80vh] rounded-xl border border-gray-100 bg-white shadow-sm">
            <AdminMessagesDashboard />
          </div>
        );

      case 'analytics':
        return (
          <div className="space-y-6">
            <div className="rounded-xl border border-gray-100 bg-white p-8 shadow-sm">
              <div className="py-12 text-center">
                <BarChart3 className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                <h3 className="mb-2 text-2xl font-semibold text-gray-900">Analytics Dashboard</h3>
                <p className="mb-6 text-gray-600">
                  Detailed analytics and reporting system will be implemented here.
                </p>
                <div className="flex justify-center gap-4">
                  <Button
                    className="bg-purple-600 px-6 py-3 text-white hover:bg-purple-700"
                    onClick={() => exportData('analytics')}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Report
                  </Button>
                  <Button
                    className="bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
                    onClick={() => setCurrentView('dashboard')}
                  >
                    <Target className="mr-2 h-4 w-4" />
                    View Dashboard
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-6">
            <div className="rounded-xl border border-gray-100 bg-white p-8 shadow-sm">
              <div className="py-12 text-center">
                <Settings className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                <h3 className="mb-2 text-2xl font-semibold text-gray-900">System Settings</h3>
                <p className="mb-6 text-gray-600">
                  Configuration and system settings panel will be implemented here.
                </p>
                <div className="flex justify-center gap-4">
                  <Button
                    className="bg-indigo-600 px-6 py-3 text-white hover:bg-indigo-700"
                    onClick={() => exportData('system-logs')}
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    System Logs
                  </Button>
                  <Button
                    className="bg-green-600 px-6 py-3 text-white hover:bg-green-700"
                    onClick={() => showDashboardNotification('System backup initiated')}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Backup Now
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // ==========================================
  // MAIN RENDER
  // ==========================================

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setSidebarOpen(false)}>
          <div className="bg-opacity-50 fixed inset-0 bg-gray-900 backdrop-blur-sm"></div>
        </div>
      )}

      {/* Enhanced Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 transform bg-white shadow-2xl ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } border-r border-gray-200 transition-transform duration-300 ease-in-out lg:static lg:inset-0 lg:translate-x-0`}
      >
        {/* Logo Header */}
        <div className="flex h-20 items-center justify-between border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600 px-6">
          <div className="flex items-center">
            <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white">
              <span className="text-2xl">🍽️</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">mamatiffin</h1>
              <p className="text-xs text-blue-100">Admin Panel</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-white transition-colors hover:text-blue-200 lg:hidden"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="border-b border-gray-100 p-4">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <input
              type="text"
              placeholder="Search menu..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pr-4 pl-10 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-6">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            const showBadge = item.badge && !isActive;
            const isPriority = item.priority;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id);
                  setSidebarOpen(false);
                }}
                className={`group relative flex w-full items-center rounded-xl px-4 py-3 text-left transition-all duration-200 ${
                  isActive
                    ? 'scale-105 transform bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                    : isPriority
                      ? 'bg-red-50 text-red-700 hover:bg-red-100'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon
                  className={`mr-3 h-5 w-5 transition-colors ${
                    isActive
                      ? 'text-white'
                      : isPriority
                        ? 'text-red-600'
                        : 'text-gray-400 group-hover:text-gray-600'
                  }`}
                />
                <div className="flex-1">
                  <div className="font-medium">{item.label}</div>
                  <div
                    className={`text-xs ${
                      isActive ? 'text-blue-100' : isPriority ? 'text-red-600' : 'text-gray-500'
                    }`}
                  >
                    {item.description}
                  </div>
                </div>
                {showBadge && (
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      isPriority
                        ? 'animate-pulse bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {isPriority && (
                  <span className="absolute -top-1 -right-1 animate-pulse rounded-full bg-red-500 px-2 py-1 text-xs font-bold text-white">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="border-t border-gray-200 p-4">
          <button
            onClick={handleLogout}
            className="group flex w-full items-center rounded-xl px-4 py-3 text-left text-red-600 transition-colors hover:bg-red-50"
          >
            <LogOut className="mr-3 h-5 w-5 group-hover:text-red-700" />
            <span className="font-medium group-hover:text-red-700">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="border-b border-gray-200 bg-white shadow-sm lg:shadow-none">
          <div className="flex h-16 items-center justify-between px-6">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="mr-4 text-gray-600 hover:text-gray-900 lg:hidden"
              >
                <MenuIcon className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{getPageTitle()}</h1>
                <p className="hidden text-sm text-gray-500 sm:block">
                  {new Date().toLocaleDateString('en-IN', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                className="relative rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                onClick={() => setShowNotificationBadge(false)}
              >
                <Bell className="h-5 w-5" />
                {showNotificationBadge && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 animate-pulse rounded-full bg-red-500"></span>
                )}
              </button>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-sm font-semibold text-white">
                A
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">{renderContent()}</div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;