// components/UserDashboard.tsx
import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  IndianRupee, 
  Package, 
  User, 
  Phone, 
  MapPin,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Eye,
  Download,
  Plus,
  Star,
  Utensils
} from 'lucide-react';
import { apiEndpoints } from '../configapi/api';
import { useAuth } from '../context/AuthContext';
import { generateReceipt } from '../utils/generateReceipt';

interface WeeklyMenu {
  [key: string]: string[] | undefined;
}

interface UserOrder {
  _id: string;
  menuTitle: string;
  menuCategory: string;
  dietaryPreference: 'veg' | 'non-veg';
  subscriptionType: 'monthly' | 'trial';
  totalAmount: number;
  paymentStatus: 'pending' | 'success' | 'failed';
  orderStatus: 'active' | 'completed' | 'cancelled' | 'pending';
  startDate: string;
  endDate: string;
  orderDate: string;
  deliveryTime?: string;
  weeklyMenu?: WeeklyMenu;
}

interface OrderStats {
  totalOrders: number;
  activeSubscriptions: number;
  totalSpent: number;
  completedOrders: number;
}

interface OrderResponse {
  success: boolean;
  data: UserOrder[];
  message?: string;
}

const UserDashboard: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'all'>('active');
  const [stats, setStats] = useState<OrderStats>({
    totalOrders: 0,
    activeSubscriptions: 0,
    totalSpent: 0,
    completedOrders: 0
  });

  useEffect(() => {
    if (authLoading) return;
    if (user) {
      fetchUserOrders(user.phone);
    } else {
      setLoading(false);
    }
  }, [user, authLoading]);

  const fetchUserOrders = async (phone: string): Promise<void> => {
    try {
      setLoading(true);
      // Filter orders by customer phone number
      const response = await fetch(`${apiEndpoints.orders}?customerPhone=${phone}`);
      
      if (response.ok) {
        const data = await response.json() as OrderResponse;
        const userOrders = data.data || [];
        setOrders(userOrders);
        
        // Calculate stats
        const totalSpent = userOrders.reduce((sum: number, order: UserOrder) => 
          order.paymentStatus === 'success' ? sum + order.totalAmount : sum, 0);
        
        setStats({
          totalOrders: userOrders.length,
          activeSubscriptions: userOrders.filter((order: UserOrder) => order.orderStatus === 'active').length,
          totalSpent,
          completedOrders: userOrders.filter((order: UserOrder) => order.orderStatus === 'completed').length
        });
      }
    } catch (error) {
      console.error('Error fetching user orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusIcon = (status: string): React.ReactElement => {
    switch (status) {
      case 'success':
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed':
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'success':
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed':
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredOrders = orders.filter(order => {
    switch (activeTab) {
      case 'active':
        return order.orderStatus === 'active';
      case 'completed':
        return order.orderStatus === 'completed';
      default:
        return true;
    }
  });

  const getDaysRemaining = (endDate: string): number => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const handleRefresh = (): void => {
    if (user) {
      fetchUserOrders(user.phone);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Show login prompt if no user info
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md p-8">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Log In</h2>
          <p className="text-gray-600 mb-6">
            You need to be logged in to view your dashboard and manage your orders.
          </p>
          <div className="space-y-3">
            <a 
              href="/login" 
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Go to Login
            </a>
            <a 
              href="/" 
              className="block w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Go to Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user.name}!
              </h1>
              <p className="text-gray-600 mt-1">Manage your food subscriptions and orders</p>
            </div>
            <button
              onClick={handleRefresh}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
              </div>
              <Package className="w-12 h-12 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Subscriptions</p>
                <p className="text-3xl font-bold text-gray-900">{stats.activeSubscriptions}</p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-3xl font-bold text-gray-900">₹{stats.totalSpent}</p>
              </div>
              <IndianRupee className="w-12 h-12 text-purple-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Orders</p>
                <p className="text-3xl font-bold text-gray-900">{stats.completedOrders}</p>
              </div>
              <Star className="w-12 h-12 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* User Profile Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{user.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{user.phone}</p>
              </div>
            </div>
            {user.address && (
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">City</p>
                  <p className="font-medium">{user.address.city}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Orders Section */}
        <div className="bg-white rounded-xl shadow-lg">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('active')}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'active'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Active Subscriptions ({stats.activeSubscriptions})
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'completed'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Completed Orders ({stats.completedOrders})
              </button>
              <button
                onClick={() => setActiveTab('all')}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'all'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                All Orders ({stats.totalOrders})
              </button>
            </nav>
          </div>

          {/* Orders List */}
          <div className="p-6">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <Utensils className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Orders Found</h3>
                <p className="text-gray-600 mb-6">
                  {activeTab === 'active' 
                    ? "You don't have any active subscriptions." 
                    : `No ${activeTab} orders found.`}
                </p>
                <a 
                  href="/menu" 
                  className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  <span>Browse Menu</span>
                </a>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredOrders.map((order) => (
                  <div key={order._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    {/* Order Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className={`inline-block w-3 h-3 rounded-full ${
                          order.dietaryPreference === 'veg' ? 'bg-green-400' : 'bg-red-400'
                        }`}></span>
                        <div>
                          <h3 className="font-semibold text-gray-900">{order.menuTitle}</h3>
                          <p className="text-sm text-gray-500">
                            {order.subscriptionType === 'trial' ? '1 Day Trial' : 'Monthly Plan'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">₹{order.totalAmount}</p>
                      </div>
                    </div>

                    {/* Order Details */}
                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div>
                        <p className="text-gray-500">Order Date</p>
                        <p className="font-medium">{formatDate(order.orderDate)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Delivery Time</p>
                        <p className="font-medium">{order.deliveryTime || 'Standard'}</p>
                      </div>
                      {order.subscriptionType === 'monthly' && (
                        <>
                          <div>
                            <p className="text-gray-500">Start Date</p>
                            <p className="font-medium">{formatDate(order.startDate)}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">
                              {order.orderStatus === 'active' ? 'Days Remaining' : 'End Date'}
                            </p>
                            <p className="font-medium">
                              {order.orderStatus === 'active' 
                                ? `${getDaysRemaining(order.endDate)} days`
                                : formatDate(order.endDate)}
                            </p>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Status Badges */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.paymentStatus)}`}>
                        {getStatusIcon(order.paymentStatus)}
                        <span className="ml-1">Payment: {order.paymentStatus.toUpperCase()}</span>
                      </span>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.orderStatus)}`}>
                        {getStatusIcon(order.orderStatus)}
                        <span className="ml-1">Order: {order.orderStatus.toUpperCase()}</span>
                      </span>
                    </div>

                    {/* Order Actions */}
                    <div className="flex space-x-2">
                      <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2">
                        <Eye className="w-4 h-4" />
                        <span>View Details</span>
                      </button>
                      {order.paymentStatus === 'success' && (
                        <button
                          onClick={() => generateReceipt({
                            orderId: order._id,
                            customerName: user?.name || '',
                            customerPhone: user?.phone || '',
                            menuTitle: order.menuTitle,
                            menuCategory: order.menuCategory,
                            dietaryPreference: order.dietaryPreference,
                            subscriptionType: order.subscriptionType,
                            totalAmount: order.totalAmount,
                            paymentStatus: order.paymentStatus,
                            orderDate: order.orderDate,
                            startDate: order.startDate,
                            endDate: order.endDate,
                            deliveryTime: order.deliveryTime,
                          })}
                          className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                        >
                          <Download className="w-4 h-4" />
                          <span>Receipt</span>
                        </button>
                      )}
                    </div>

                    {/* Active Subscription Progress */}
                    {order.orderStatus === 'active' && order.subscriptionType === 'monthly' && (
                      <div className="mt-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Subscription Progress</span>
                          <span>{Math.max(0, 30 - getDaysRemaining(order.endDate))}/30 days</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ 
                              width: `${Math.min(100, Math.max(0, (30 - getDaysRemaining(order.endDate)) / 30 * 100))}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a 
              href="/menu" 
              className="flex items-center space-x-3 bg-blue-50 hover:bg-blue-100 p-4 rounded-lg transition-colors"
            >
              <Plus className="w-6 h-6 text-blue-600" />
              <div>
                <p className="font-medium text-blue-900">Order New Menu</p>
                <p className="text-sm text-blue-600">Browse our menu options</p>
              </div>
            </a>
            <button className="flex items-center space-x-3 bg-green-50 hover:bg-green-100 p-4 rounded-lg transition-colors">
              <User className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-medium text-green-900">Update Profile</p>
                <p className="text-sm text-green-600">Edit your information</p>
              </div>
            </button>
            <button className="flex items-center space-x-3 bg-purple-50 hover:bg-purple-100 p-4 rounded-lg transition-colors">
              <Phone className="w-6 h-6 text-purple-600" />
              <div>
                <p className="font-medium text-purple-900">Contact Support</p>
                <p className="text-sm text-purple-600">Get help with your orders</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;