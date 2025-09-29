// AdminDashboard.tsx - Complete Fixed Version with Enhanced Weekly Menu Handling

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import ImageSliderManager from './ImageSliderManager';
import MenuForm from './MenuForm';
import AdminOrderDashboard from './AdminOrder';
import AdminMessagesDashboard from './AdminMessagesDashboard';
import UsersList from "./UsersList";
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
  Save,
  Filter,
  Download,
  Eye,
  FileText,
  Target,
  Shield
} from 'lucide-react';

// FIXED: Local interfaces to replace missing exports
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
  weeklyMenu?: WeeklyMenuDay[] | Record<string, string | string[]> | string | undefined; // Accepts array, object, string, or undefined
  createdAt?: string;
  updatedAt?: string;
}

// FIXED: WeeklyMenuDay interface
interface WeeklyMenuDay {
  day: string;
  items: string[];
}

// UPDATED: Enhanced conversion function with better database handling
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
      items: Array.isArray(day.items) && day.items.length > 0 
        ? day.items.filter((item: string) => item && item.trim() !== '')
        : ['No items added yet']
    }));
    
    if (isDev) console.log('✅ Using database weeklyMenu data');
  } else if (apiMenu.weeklyMenu && typeof apiMenu.weeklyMenu === 'object' && !Array.isArray(apiMenu.weeklyMenu)) {
    if (isDev) console.log('🔄 Converting object weeklyMenu to array format');
    
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const dayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    const weeklyMenuObj = apiMenu.weeklyMenu as Record<string, string | string[] | undefined>;
    processedWeeklyMenu = days.map((day, index) => {
      // ✅ FIXED: Type guard added
      const dayKey = dayKeys[index];
      if (!dayKey) {
        return { day, items: ['No items found'] };
      }
      
      const dayMenu = weeklyMenuObj[dayKey] || '';
      
      let items: string[] = [];
      if (typeof dayMenu === 'string' && dayMenu.trim().length > 0) {
        if (dayMenu.includes('||')) {
          items = dayMenu.split('||').map((item: string) => item.trim()).filter((item: string) => item.length > 0);
        } else if (dayMenu.includes('|')) {
          items = dayMenu.split('|').map((item: string) => item.trim()).filter((item: string) => item.length > 0);
        } else if (dayMenu.includes(',')) {
          items = dayMenu.split(',').map((item: string) => item.trim()).filter((item: string) => item.length > 0);
        } else {
          items = [dayMenu.trim()];
        }
      } else if (Array.isArray(dayMenu)) {
        items = (dayMenu as string[]).filter((item: string) => 
          typeof item === 'string' && item.trim().length > 0
        );
      }
      
      return {
        day,
        items: items.length > 0 ? items : ['No items found for this day']
      };
    });
  } else {
    if (isDev) console.log('⚠️ Database weeklyMenu is empty, creating default structure');
    
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    processedWeeklyMenu = days.map(day => ({
      day,
      items: ['No items added yet - Please edit to add menu items']
    }));
  }

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const finalWeeklyMenu = days.map(dayName => {
    const existingDay = processedWeeklyMenu.find(d => d.day === dayName);
    return existingDay || {
      day: dayName,
      items: ['No items added yet - Please edit to add menu items']
    };
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
// Location interface
interface Location {
  _id: string;
  name: string;
  id: string;
  createdAt?: string;
  updatedAt?: string;
}

// Admin view types
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

const AdminDashboard: React.FC = () => {
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

  // Location Management States
  const [locations, setLocations] = useState<Location[]>([]);
  const [locationsLoading, setLocationsLoading] = useState(false);
  const [locationsError, setLocationsError] = useState<string | null>(null);
  const [showLocationForm, setShowLocationForm] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [locationFormData, setLocationFormData] = useState({
    name: '',
    id: ''
  });

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

  // Sidebar menu items
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
      badge: locations.length > 0 ? `${locations.length}` : undefined,
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

  // Location Management Functions
  const fetchLocations = async (): Promise<void> => {
    try {
      setLocationsLoading(true);
      setLocationsError(null);

      const response = await fetch(apiEndpoints.locations);
      const data = await response.json();

      if (data.success) {
        setLocations(data.data || []);
      } else {
        throw new Error(data.message || 'Failed to fetch locations');
      }
    } catch (err) {
      console.error('Error fetching locations:', err);
      setLocationsError(
        err instanceof Error
          ? err.message
          : 'Failed to load locations. Please try again.'
      );
    } finally {
      setLocationsLoading(false);
    }
  };

  const handleLocationSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    if (!locationFormData.name.trim() || !locationFormData.id.trim()) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const url = editingLocation 
        ? apiEndpoints.location(editingLocation.id)
        : apiEndpoints.locations;
      
      const method = editingLocation ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(locationFormData),
      });

      const data = await response.json();

      if (data.success) {
        const message = editingLocation ? 'Location updated successfully!' : 'Location added successfully!';
        alert(message);
        showDashboardNotification(message);
        setShowLocationForm(false);
        setEditingLocation(null);
        setLocationFormData({ name: '', id: '' });
        await fetchLocations();
      } else {
        throw new Error(data.message || 'Failed to save location');
      }
    } catch (err) {
      console.error('Error saving location:', err);
      alert(err instanceof Error ? err.message : 'Failed to save location');
    }
  };

  const handleEditLocation = (location: Location): void => {
    setEditingLocation(location);
    setLocationFormData({
      name: location.name,
      id: location.id
    });
    setShowLocationForm(true);
  };

  const handleDeleteLocation = async (locationId: string): Promise<void> => {
    if (!window.confirm('Are you sure you want to delete this location?')) {
      return;
    }

    try {
      const response = await fetch(apiEndpoints.location(locationId), {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        alert('Location deleted successfully!');
        showDashboardNotification('Location deleted successfully!');
        await fetchLocations();
      } else {
        throw new Error(data.message || 'Failed to delete location');
      }
    } catch (err) {
      console.error('Error deleting location:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete location');
    }
  };

  const handleCancelLocationForm = (): void => {
    setShowLocationForm(false);
    setEditingLocation(null);
    setLocationFormData({ name: '', id: '' });
  };

  // Stats Fetching Functions
  const fetchMessageStats = useCallback(async (): Promise<void> => {
    try {
      const response = await fetch(`${apiEndpoints.messages}?limit=1`);
      const data = await response.json();

      if (data.success && data.data?.stats) {
        const stats = data.data.stats;
        setMessageStats(prev => ({
          ...prev,
          unread: stats.unread || 0,
          read: stats.read || 0,
          replied: stats.replied || 0,
          total: (stats.unread || 0) + (stats.read || 0) + (stats.replied || 0),
        }));
      }
    } catch (error) {
      console.error('Error fetching message stats:', error);
    }
  }, []);

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

  // Notification System
  const showDashboardNotification = (message: string): void => {
    setNotifications((prev) => {
      const newNotifications = [message, ...prev.slice(0, 4)];
      return newNotifications;
    });
    setShowNotificationBadge(true);

    setTimeout(() => {
      setShowNotificationBadge(false);
    }, 10000);
  };

  useEffect(() => {
    fetchMessageStats();
    fetchSystemStats();
    fetchLocations();

    const interval = setInterval(() => {
      fetchMessageStats();
      fetchSystemStats();
    }, 120000);

    return () => {
      clearInterval(interval);
    };
  }, [fetchMessageStats, fetchSystemStats]);

  // UPDATED: Enhanced menu fetching with better error handling
  const fetchMenus = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Fetching menus with enhanced weekly menu handling...');

      // Using correct database endpoints for Menu Details
      const [vegResponse, nonVegResponse] = await Promise.all([
        fetch(apiEndpoints.vegMenus),      // /api/veg-menus
        fetch(apiEndpoints.nonVegMenus)    // /api/non-veg-menus
      ]);

      console.log('📡 Veg Response Status:', vegResponse.status);
      console.log('📡 Non-Veg Response Status:', nonVegResponse.status);

      const [vegData, nonVegData] = await Promise.all([
        vegResponse.json(),
        nonVegResponse.json()
      ]);

      // Enhanced logging for debugging
      console.log('📦 Veg Data from Database:', vegData);
      console.log('📦 Non-Veg Data from Database:', nonVegData);

      // Check sample menu's weeklyMenu structure
      if (vegData.success && vegData.data && vegData.data.length > 0) {
        console.log('🔍 SAMPLE VEG MENU weeklyMenu:', vegData.data[0]?.weeklyMenu);
        console.log('🔍 SAMPLE VEG MENU weeklyMenu type:', typeof vegData.data[0]?.weeklyMenu);
        console.log('🔍 SAMPLE VEG MENU weeklyMenu length:', vegData.data[0]?.weeklyMenu?.length);
      }

      if (nonVegData.success && nonVegData.data && nonVegData.data.length > 0) {
        console.log('🔍 SAMPLE NON-VEG MENU weeklyMenu:', nonVegData.data[0]?.weeklyMenu);
        console.log('🔍 SAMPLE NON-VEG MENU weeklyMenu type:', typeof nonVegData.data[0]?.weeklyMenu);
        console.log('🔍 SAMPLE NON-VEG MENU weeklyMenu length:', nonVegData.data[0]?.weeklyMenu?.length);
      }

      let allMenus: MenuDetailsFromAPI[] = [];

      // Process veg menus from database
      if (vegData.success && Array.isArray(vegData.data)) {
        console.log(`✅ Found ${vegData.data.length} veg menus in database`);
        allMenus = [...allMenus, ...vegData.data];
      } else {
        console.log('⚠️ No veg menus found or invalid response');
      }

      // Process non-veg menus from database
      if (nonVegData.success && Array.isArray(nonVegData.data)) {
        console.log(`✅ Found ${nonVegData.data.length} non-veg menus in database`);
        allMenus = [...allMenus, ...nonVegData.data];
      } else {
        console.log('⚠️ No non-veg menus found or invalid response');
      }

      console.log(`📊 Total menus fetched from database: ${allMenus.length}`);

      // Transform to Menu format using enhanced function
      const transformedMenus: Menu[] = allMenus.map((apiMenu: MenuDetailsFromAPI) => {
        const convertedMenu = convertAPIMenuToMenu(apiMenu);
        
        // Additional validation
        console.log(`🔧 Converted menu ${apiMenu.menuType}:`, {
          hasWeeklyMenu: !!convertedMenu.weeklyMenu,
          weeklyMenuLength: convertedMenu.weeklyMenu?.length,
          sampleDay: convertedMenu.weeklyMenu?.[0],
          sampleItems: convertedMenu.weeklyMenu?.[0]?.items?.length
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
        nonVeg: nonVegCount
      });

    } catch (err) {
      console.error('💥 Error fetching menus from database:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load menus from database. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, []);

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

  // Utility Functions
  const handleLogout = (): void => {
    if (window.confirm('Are you sure you want to logout?')) {
      window.location.href = '/admin-login';
    }
  };

  const getPageTitle = (): string => {
    const titles: Record<AdminView, string> = {
      'dashboard': 'Dashboard Overview',
      'slider-management': 'Image Slider Management',
      'menu-details': 'Menu Details Management',
      'locations': 'Location Management',
      'users': 'User Management',
      'orders': 'Order Management',
      'messages': 'Contact Messages Management',
      'analytics': 'Analytics & Reports',
      'settings': 'System Settings',
    };
    return titles[currentView] || 'Admin Panel';
  };

  const exportData = (type: string) => {
    console.log(`Exporting ${type} data...`);
    showDashboardNotification(`${type} data export initiated`);
  };

  const getFilteredMenus = () => {
    return menus.filter((menu) => {
      const matchesTab = activeTab === 'all' || menu.category === activeTab;
      const matchesSearch = !menuFilter || 
        menu.title.toLowerCase().includes(menuFilter.toLowerCase()) ||
        menu.menuType.toLowerCase().includes(menuFilter.toLowerCase());
      return matchesTab && matchesSearch;
    });
  };

  if (showForm) {
    return (
      <MenuForm
        menu={editingMenu}
        onClose={handleFormClose}
        onDelete={handleDeleteMenu}
      />
    );
  }

  // Content Renderers
  const renderMenuDetailsContent = () => {
    const filteredMenus = getFilteredMenus();

    if (loading) {
      return (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading menus...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Menus</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchMenus}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      );
    }

    if (menus.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Menus Available</h3>
          <p className="text-gray-600 mb-4">Start by adding your first menu!</p>
          <button
            onClick={handleAddNew}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2 mx-auto"
          >
            <Plus className="w-4 h-4" />
            Add New Menu
          </button>
        </div>
      );
    }

    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Menu Details Management</h2>
            <p className="text-gray-600">Manage your weekly menu plans and offerings</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={fetchMenus}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={() => exportData('menus')}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={handleAddNew}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add New Menu
            </button>
          </div>
        </div>

        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search menus..."
                  value={menuFilter}
                  onChange={(e) => setMenuFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">Filter by category:</span>
            </div>
          </div>

          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('all')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'all'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                All Menus ({menus.length})
              </button>
              <button
                onClick={() => setActiveTab('veg')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 flex items-center gap-2 ${
                  activeTab === 'veg'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                🥬 Vegetarian ({stats.vegMenus})
              </button>
              <button
                onClick={() => setActiveTab('non-veg')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 flex items-center gap-2 ${
                  activeTab === 'non-veg'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                🍗 Non-Vegetarian ({stats.nonVegMenus})
              </button>
            </nav>
          </div>
        </div>

        {filteredMenus.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">
              {activeTab === 'veg' ? '🥬' : activeTab === 'non-veg' ? '🍗' : '📝'}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {menuFilter 
                ? `No menus found for "${menuFilter}"`
                : `No ${activeTab === 'veg' ? 'Vegetarian' : activeTab === 'non-veg' ? 'Non-Vegetarian' : ''} Menus Found`
              }
            </h3>
            <p className="text-gray-600 mb-4">
              {menuFilter 
                ? 'Try adjusting your search criteria'
                : `Add some delicious ${activeTab === 'veg' ? 'vegetarian' : activeTab === 'non-veg' ? 'non-vegetarian' : ''} menu options!`
              }
            </p>
            {!menuFilter && (
              <button
                onClick={handleAddNew}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2 mx-auto"
              >
                <Plus className="w-4 h-4" />
                Add {activeTab === 'veg' ? 'Vegetarian' : activeTab === 'non-veg' ? 'Non-Vegetarian' : ''} Menu
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMenus.map((menu) => (
              <div
                key={menu._id}
                className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={
                      menu.imageUrl?.startsWith('http')
                        ? menu.imageUrl
                        : apiEndpoints.getImageUrl(menu.imageUrl || '')
                    }
                    alt={`${menu.category === 'veg' ? 'Vegetarian' : 'Non-Vegetarian'} ${menu.menuType}`}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://via.placeholder.com/400x300?text=Menu+Image';
                    }}
                  />
                  <div className="absolute top-3 left-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        menu.category === 'veg'
                          ? 'bg-green-100 text-green-800 border border-green-300'
                          : 'bg-red-100 text-red-800 border border-red-300'
                      }`}
                    >
                      {menu.category === 'veg' ? '🥬 VEG' : '🍗 NON-VEG'}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="bg-black/70 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                      <IndianRupee className="w-3 h-3" />
                      {menu.priceMonthly || menu.price || 0}
                    </span>
                  </div>
                  <div className="absolute bottom-3 right-3">
                    <button
                      onClick={() => handleEdit(menu)}
                      className="bg-white/90 hover:bg-white text-gray-700 p-2 rounded-full shadow-md transition-all duration-200"
                      title="Quick Edit"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-1">
                      {menu.title || menu.menuType}
                    </h3>
                    <span className="text-sm text-gray-500 ml-2">{menu.menuType}</span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {menu.description || 'No description available'}
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{menu.deliveryTime || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <IndianRupee className="w-3 h-3" />
                      <span>Trial: {menu.priceTrial || 0}</span>
                    </div>
                  </div>

                  {/* ENHANCED: Weekly Menu Preview */}
                  <div className="mb-4 p-2 bg-gray-50 rounded-lg">
                    <h4 className="text-xs font-semibold text-gray-700 mb-1">Weekly Menu Preview:</h4>
                    <div className="text-xs text-gray-600">
                      {menu.weeklyMenu && menu.weeklyMenu.length > 0 ? (
                        <div className="space-y-1">
                          {menu.weeklyMenu.slice(0, 2).map((day, index) => (
                            <div key={index} className="truncate">
                              <span className="font-medium">{day.day}:</span> {
                                day.items && day.items.length > 0 && day.items[0] !== 'No items added yet - Please edit to add menu items'
                                  ? day.items.slice(0, 2).join(', ')
                                  : 'No items'
                              }
                            </div>
                          ))}
                          {menu.weeklyMenu.length > 2 && (
                            <div className="text-gray-400">...and {menu.weeklyMenu.length - 2} more days</div>
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
                      className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-3 rounded-lg transition-colors duration-200 flex items-center justify-center gap-1"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteMenu(menu._id)}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-3 rounded-lg transition-colors duration-200 flex items-center justify-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" />
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

  // Location content renderer
  const renderLocationContent = () => {
    if (locationsLoading) {
      return (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading locations...</p>
        </div>
      );
    }

    if (locationsError) {
      return (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Locations</h3>
          <p className="text-gray-600 mb-4">{locationsError}</p>
          <button
            onClick={fetchLocations}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      );
    }

    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Location Management</h2>
            <p className="text-gray-600">Manage delivery areas and zones</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={fetchLocations}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={() => exportData('locations')}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={() => setShowLocationForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Location
            </button>
          </div>
        </div>

        {showLocationForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl">
              <h3 className="text-lg font-semibold mb-4">
                {editingLocation ? 'Edit Location' : 'Add New Location'}
              </h3>
              <form onSubmit={handleLocationSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location Name
                  </label>
                  <input
                    type="text"
                    value={locationFormData.name}
                    onChange={(e) => setLocationFormData({ ...locationFormData, name: e.target.value })}
                    placeholder="e.g., Patna City Center"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location ID
                  </label>
                  <input
                    type="text"
                    value={locationFormData.id}
                    onChange={(e) => setLocationFormData({ ...locationFormData, id: e.target.value })}
                    placeholder="e.g., PAT_001"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {editingLocation ? 'Update' : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelLocationForm}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {locations.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Locations Added</h3>
            <p className="text-gray-600 mb-4">Start by adding your first delivery location!</p>
            <button
              onClick={() => setShowLocationForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2 mx-auto"
            >
              <Plus className="w-4 h-4" />
              Add First Location
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Delivery Locations ({locations.length})
                </h3>
                <span className="text-sm text-gray-500">Manage areas where you deliver</span>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {locations.map((location) => (
                <div key={location._id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <MapPin className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">{location.name}</h4>
                        <p className="text-sm text-gray-500">ID: {location.id}</p>
                        {location.createdAt && (
                          <p className="text-xs text-gray-400">
                            Added: {new Date(location.createdAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditLocation(location)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-3 rounded-lg transition-colors duration-200 flex items-center gap-1"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteLocation(location.id)}
                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-3 rounded-lg transition-colors duration-200 flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Dashboard Content
  const renderDashboardContent = () => (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back, Admin!</h1>
            <p className="text-blue-100 text-lg">
              Here's what's happening with your restaurant today.
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
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Recent Activity</h3>
                <p className="text-sm text-gray-600">{notifications[0]}</p>
              </div>
            </div>
            <button
              onClick={() => setNotifications([])}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
          <p className="text-gray-500">Manage your restaurant efficiently</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {/* Orders Action */}
          <Button
            onClick={() => setCurrentView('orders')}
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white p-6 h-auto flex flex-col items-center rounded-xl shadow-sm transition-all duration-200 hover:shadow-md hover:scale-105"
          >
            <ShoppingCart className="h-10 w-10 mb-3" />
            <span className="font-semibold text-lg">Orders</span>
            <span className="text-xs opacity-90 mt-1">Manage Orders</span>
          </Button>

          {/* Locations Action */}
          <Button
            onClick={() => setCurrentView('locations')}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white p-6 h-auto flex flex-col items-center rounded-xl shadow-sm transition-all duration-200 hover:shadow-md hover:scale-105"
          >
            <MapPin className="h-10 w-10 mb-3" />
            <span className="font-semibold text-lg">Locations</span>
            <span className="text-xs opacity-90 mt-1">Delivery Areas</span>
          </Button>

          {/* Messages Action */}
          <Button
            onClick={() => setCurrentView('messages')}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white p-6 h-auto flex flex-col items-center rounded-xl shadow-sm transition-all duration-200 hover:shadow-md hover:scale-105 relative"
          >
            <MessageSquare className="h-10 w-10 mb-3" />
            <span className="font-semibold text-lg">Messages</span>
            <span className="text-xs opacity-90 mt-1">Customer Inquiries</span>
            {messageStats.unread > 0 && (
              <span className="absolute -top-2 -right-2 bg-white text-purple-600 text-xs font-bold px-2 py-1 rounded-full">
                {messageStats.unread}
              </span>
            )}
          </Button>

          {/* Menu Details Action */}
          <Button
            onClick={() => setCurrentView('menu-details')}
            className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white p-6 h-auto flex flex-col items-center rounded-xl shadow-sm transition-all duration-200 hover:shadow-md hover:scale-105"
          >
            <BookOpen className="h-10 w-10 mb-3" />
            <span className="font-semibold text-lg">Menu Details</span>
            <span className="text-xs opacity-90 mt-1">Complete Management</span>
          </Button>

          {/* Slider Management Action */}
          <Button
            onClick={() => setCurrentView('slider-management')}
            className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white p-6 h-auto flex flex-col items-center rounded-xl shadow-sm transition-all duration-200 hover:shadow-md hover:scale-105"
          >
            <Image className="h-10 w-10 mb-3" />
            <span className="font-semibold text-lg">Slider Images</span>
            <span className="text-xs opacity-90 mt-1">Homepage Management</span>
          </Button>
        </div>
      </div>

      {/* Overview Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Menu Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Menu Overview</h2>
            <button
              onClick={() => setCurrentView('menu-details')}
              className="text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Manage →
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{stats.totalMenus}</div>
              <div className="text-sm text-gray-600">Total Menus</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.vegMenus}</div>
              <div className="text-sm text-gray-600">Vegetarian</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{stats.nonVegMenus}</div>
              <div className="text-sm text-gray-600">Non-Veg</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.activeMenus}</div>
              <div className="text-sm text-gray-600">Active</div>
            </div>
          </div>
        </div>

        {/* Location Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Location Overview</h2>
            <button
              onClick={() => setCurrentView('locations')}
              className="text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Manage →
            </button>
          </div>
          <div className="text-center">
            <div className="p-4 bg-emerald-50 rounded-lg">
              <div className="text-4xl font-bold text-emerald-600 mb-2">{locations.length}</div>
              <div className="text-sm text-gray-600">Delivery Locations</div>
              <div className="text-xs text-emerald-600 mt-1">
                {locations.length === 0 ? 'Add your first location' : 'Areas covered'}
              </div>
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">System Health</h2>
            <div className={`w-3 h-3 rounded-full ${systemStats.systemHealth === 'good' ? 'bg-green-500' : systemStats.systemHealth === 'warning' ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
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
              <span className="font-semibold text-xs">
                {systemStats.lastBackup ? new Date(systemStats.lastBackup).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="pt-2">
              <button
                onClick={() => setCurrentView('settings')}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <Settings className="w-4 h-4" />
                System Settings
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Recent Activity</h2>
          <div className="flex items-center text-sm text-gray-500">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            Live updates
          </div>
        </div>
        <div className="space-y-4">
          {notifications.length > 0 ? (
            notifications.slice(0, 5).map((notification, index) => (
              <div
                key={index}
                className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                <span className="text-sm text-gray-700 flex-grow">{notification}</span>
                <span className="text-xs text-gray-400 ml-2">
                  {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No recent activity</p>
              <p className="text-xs text-gray-400 mt-1">
                Activity will appear here as you use the system
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return renderDashboardContent();

      case 'slider-management':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 min-h-[80vh]">
            <ImageSliderManager />
          </div>
        );

      case 'menu-details':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 min-h-[80vh]">
            {renderMenuDetailsContent()}
          </div>
        );

      case 'locations':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 min-h-[80vh]">
            {renderLocationContent()}
          </div>
        );

      case 'users':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 min-h-[80vh]">
            <UsersList />
          </div>
        );

      case 'orders':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 min-h-[80vh]">
            <AdminOrderDashboard />
          </div>
        );

      case 'messages':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 min-h-[80vh]">
            <AdminMessagesDashboard />
          </div>
        );

      case 'analytics':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <div className="text-center py-12">
                <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                  Analytics Dashboard
                </h3>
                <p className="text-gray-600 mb-6">
                  Detailed analytics and reporting system will be implemented here.
                </p>
                <div className="flex gap-4 justify-center">
                  <Button 
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3"
                    onClick={() => exportData('analytics')}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Generate Report
                  </Button>
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3"
                    onClick={() => setCurrentView('dashboard')}
                  >
                    <Target className="w-4 h-4 mr-2" />
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <div className="text-center py-12">
                <Settings className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                  System Settings
                </h3>
                <p className="text-gray-600 mb-6">
                  Configuration and system settings panel will be implemented here.
                </p>
                <div className="flex gap-4 justify-center">
                  <Button 
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3"
                    onClick={() => exportData('system-logs')}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    System Logs
                  </Button>
                  <Button 
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3"
                    onClick={() => showDashboardNotification('System backup initiated')}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
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

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm"></div>
        </div>
      )}

      {/* Enhanced Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 border-r border-gray-200`}
      >
        {/* Logo Header */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mr-3">
              <span className="text-2xl">🍽️</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Mamatiffin</h1>
              <p className="text-xs text-blue-100">Admin Panel</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white hover:text-blue-200 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
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
                className={`w-full group flex items-center px-4 py-3 text-left rounded-xl transition-all duration-200 relative ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-105'
                    : isPriority
                    ? 'text-red-700 bg-red-50 hover:bg-red-100'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon
                  className={`h-5 w-5 mr-3 transition-colors ${
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
                      isActive 
                        ? 'text-blue-100' 
                        : isPriority
                        ? 'text-red-600'
                        : 'text-gray-500'
                    }`}
                  >
                    {item.description}
                  </div>
                </div>
                {showBadge && (
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      isPriority
                        ? 'bg-red-100 text-red-700 animate-pulse'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {isPriority && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 text-left rounded-xl text-red-600 hover:bg-red-50 transition-colors group"
          >
            <LogOut className="h-5 w-5 mr-3 group-hover:text-red-700" />
            <span className="font-medium group-hover:text-red-700">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 lg:shadow-none">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-600 hover:text-gray-900 mr-4"
              >
                <MenuIcon className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{getPageTitle()}</h1>
                <p className="text-sm text-gray-500 hidden sm:block">
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
                className="relative p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
                onClick={() => setShowNotificationBadge(false)}
              >
                <Bell className="h-5 w-5" />
                {showNotificationBadge && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse"></span>
                )}
              </button>
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
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