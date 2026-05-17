// MyOrders.tsx - COMPLETE FIXED VERSION
import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  IndianRupee,
  Eye,
  X,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Download
} from 'lucide-react';
import { apiEndpoints } from '../configapi/api';
import { useAuth } from '../context/AuthContext';
import { generateReceipt } from '../utils/generateReceipt';

interface Order {
  _id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  address: {
    district: string;
    block: string;
    city: string;
    homeLodgeName: string;
  };
  menuId: {
    _id: string;
    title: string;
    category: string;
    price: number;
    imageUrl: string;
    description: string;
  };
  menuTitle: string;
  menuCategory: string;
  dietaryPreference: 'veg' | 'non-veg';
  weeklyMenu: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
  subscriptionType: 'monthly' | 'trial';
  duration: number;
  price: number;
  totalAmount: number;
  deliveryTime: string;
  description: string;
  imageUrl: string;
  paymentId?: string;
  paymentStatus: 'pending' | 'success' | 'failed';
  paymentMethod: 'upi' | 'card' | 'net_banking';
  startDate: string;
  endDate: string;
  orderDate: string;
  orderStatus: 'active' | 'completed' | 'cancelled' | 'pending';
  source: string;
  notes?: string;
  orderAttemptId: string;
  createdAt: string;
  updatedAt: string;
}

type OrderFilter = 'all' | 'active' | 'pending' | 'completed' | 'cancelled';

const MyOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, token } = useAuth();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filter, setFilter] = useState<OrderFilter>('all');

  useEffect(() => {
    if (user && token) {
      fetchOrders(user.phone, token);
    } else if (!user) {
      setError('Please login to view your orders');
      setLoading(false);
    }
  }, [user, token]);

  const fetchOrders = async (customerPhone: string, token: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(apiEndpoints.customerOrders(customerPhone), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const textResponse = await response.text();

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} - ${textResponse}`);
      }

      let data: { success: boolean; data: Order[]; message?: string };
      try {
        data = JSON.parse(textResponse);
      } catch {
        throw new Error('Invalid JSON response from server');
      }

      if (data.success) {
        setOrders(data.data || []);
      } else {
        setError(data.message || 'Failed to fetch orders');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.orderStatus === filter;
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
            <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Please Login</h2>
            <p className="text-gray-600 dark:text-gray-400">You need to login to view your orders</p>
            <button
              onClick={() => window.location.href = '/home'}
              className="mt-4 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl transition-colors"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Orders</h1>
          <p className="text-gray-600 dark:text-gray-400">Track and manage your tiffin orders</p>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg mb-6 p-1">
          <div className="flex flex-wrap gap-1">
            {[
              { key: 'all', label: 'All Orders', count: orders.length },
              { key: 'active', label: 'Active', count: orders.filter(o => o.orderStatus === 'active').length },
              { key: 'pending', label: 'Pending', count: orders.filter(o => o.orderStatus === 'pending').length },
              { key: 'completed', label: 'Completed', count: orders.filter(o => o.orderStatus === 'completed').length },
              { key: 'cancelled', label: 'Cancelled', count: orders.filter(o => o.orderStatus === 'cancelled').length },
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setFilter(key as OrderFilter)}
                className={`flex-1 min-w-fit px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  filter === key
                    ? 'bg-green-600 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {label} ({count})
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
            <Loader2 className="w-8 h-8 text-green-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading your orders...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Error Loading Orders</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <button
              onClick={() => user && token && fetchOrders(user.phone, token)}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* No Orders State */}
        {!loading && !error && filteredOrders.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
            <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {filter === 'all' ? 'No Orders Yet' : `No ${filter.charAt(0).toUpperCase() + filter.slice(1)} Orders`}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {filter === 'all' 
                ? "You haven't placed any orders yet. Start by exploring our delicious tiffin menus!"
                : `You don't have any ${filter} orders at the moment.`
              }
            </p>
            {filter === 'all' && (
              <button
                onClick={() => window.location.href = '/home'}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl transition-colors"
              >
                Explore Menus
              </button>
            )}
          </div>
        )}

        {/* Orders List */}
        {!loading && !error && filteredOrders.length > 0 && (
          <div className="grid gap-6">
            {filteredOrders.map((order) => (
              <div
                key={order._id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    {/* Order Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                            {order.menuTitle}
                          </h3>
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              order.dietaryPreference === 'veg' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}>
                              {order.dietaryPreference === 'veg' ? 'Veg' : 'Non-Veg'}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}>
                              {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                            </span>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 p-2 rounded-lg transition-colors"
                        >
                          <Eye className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Calendar className="w-4 h-4" />
                          <span>Ordered: {formatDate(order.orderDate)}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Clock className="w-4 h-4" />
                          <span>Duration: {order.duration} {order.subscriptionType === 'monthly' ? 'month(s)' : 'day(s)'}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <IndianRupee className="w-4 h-4" />
                          <span>Amount: ₹{order.totalAmount}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm">
                          {getPaymentStatusIcon(order.paymentStatus)}
                          <span className={`capitalize ${
                            order.paymentStatus === 'success' ? 'text-green-600' :
                            order.paymentStatus === 'failed' ? 'text-red-600' : 'text-yellow-600'
                          }`}>
                            {order.paymentStatus}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <MapPin className="w-4 h-4" />
                        <span>{order.address.homeLodgeName}, {order.address.city}</span>
                      </div>
                    </div>

                    {/* Order Image */}
                    {order.imageUrl && (
                      <div className="lg:w-32 lg:h-32 w-full h-48">
                        <img
                          src={order.imageUrl}
                          alt={order.menuTitle}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Order Details</h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Order Summary */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Order Summary</h3>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Order ID:</span>
                      <span className="font-mono text-sm text-gray-900 dark:text-white">{selectedOrder._id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Menu:</span>
                      <span className="text-gray-900 dark:text-white">{selectedOrder.menuTitle}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Category:</span>
                      <span className="text-gray-900 dark:text-white">{selectedOrder.menuCategory}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Type:</span>
                      <span className="text-gray-900 dark:text-white">
                        {selectedOrder.subscriptionType === 'monthly' ? 'Monthly Subscription' : 'Trial Package'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                      <span className="text-gray-900 dark:text-white">
                        {selectedOrder.duration} {selectedOrder.subscriptionType === 'monthly' ? 'month(s)' : 'day(s)'}
                      </span>
                    </div>
                    <div className="flex justify-between text-lg font-semibold">
                      <span className="text-gray-600 dark:text-gray-400">Total Amount:</span>
                      <span className="text-gray-900 dark:text-white">₹{selectedOrder.totalAmount}</span>
                    </div>
                  </div>
                </div>

                {/* Weekly Menu */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Weekly Menu</h3>
                  <div className="grid gap-2">
                    {Object.entries(selectedOrder.weeklyMenu).map(([day, menu]) => (
                      <div key={day} className="flex justify-between py-2 px-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <span className="font-medium capitalize text-gray-900 dark:text-white">{day}:</span>
                        <span className="text-gray-600 dark:text-gray-400">{menu}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Delivery Details</h3>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 space-y-2">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-600 dark:text-gray-400 mt-0.5" />
                      <div>
                        <div className="text-gray-900 dark:text-white font-medium">{selectedOrder.address.homeLodgeName}</div>
                        <div className="text-gray-600 dark:text-gray-400 text-sm">
                          {selectedOrder.address.block}, {selectedOrder.address.city}, {selectedOrder.address.district}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      <span className="text-gray-900 dark:text-white">Delivery Time: {selectedOrder.deliveryTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      <span className="text-gray-900 dark:text-white">{selectedOrder.customerPhone}</span>
                    </div>
                    {selectedOrder.customerEmail && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        <span className="text-gray-900 dark:text-white">{selectedOrder.customerEmail}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Payment Details</h3>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Status:</span>
                      <div className="flex items-center gap-2">
                        {getPaymentStatusIcon(selectedOrder.paymentStatus)}
                        <span className={`capitalize ${
                          selectedOrder.paymentStatus === 'success' ? 'text-green-600' :
                          selectedOrder.paymentStatus === 'failed' ? 'text-red-600' : 'text-yellow-600'
                        }`}>
                          {selectedOrder.paymentStatus}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Method:</span>
                      <span className="text-gray-900 dark:text-white capitalize">{selectedOrder.paymentMethod.replace('_', ' ')}</span>
                    </div>
                    {selectedOrder.paymentId && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Payment ID:</span>
                        <span className="font-mono text-sm text-gray-900 dark:text-white">{selectedOrder.paymentId}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Timeline */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Order Timeline</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-gray-600 dark:text-gray-400">Order Placed:</span>
                      <span className="text-gray-900 dark:text-white">{formatDate(selectedOrder.orderDate)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-gray-600 dark:text-gray-400">Start Date:</span>
                      <span className="text-gray-900 dark:text-white">{new Date(selectedOrder.startDate).toLocaleDateString('en-IN')}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span className="text-gray-600 dark:text-gray-400">End Date:</span>
                      <span className="text-gray-900 dark:text-white">{new Date(selectedOrder.endDate).toLocaleDateString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {selectedOrder.notes && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Notes</h3>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                      <p className="text-gray-900 dark:text-white">{selectedOrder.notes}</p>
                    </div>
                  </div>
                )}

                {selectedOrder.paymentStatus === 'success' && (
                  <button
                    onClick={() => generateReceipt({
                      orderId: selectedOrder._id,
                      customerName: selectedOrder.customerName,
                      customerPhone: selectedOrder.customerPhone,
                      customerEmail: selectedOrder.customerEmail,
                      menuTitle: selectedOrder.menuTitle,
                      menuCategory: selectedOrder.menuCategory,
                      dietaryPreference: selectedOrder.dietaryPreference,
                      subscriptionType: selectedOrder.subscriptionType,
                      duration: selectedOrder.duration,
                      totalAmount: selectedOrder.totalAmount,
                      paymentStatus: selectedOrder.paymentStatus,
                      paymentMethod: selectedOrder.paymentMethod,
                      paymentId: selectedOrder.paymentId,
                      orderDate: selectedOrder.orderDate,
                      startDate: selectedOrder.startDate,
                      endDate: selectedOrder.endDate,
                      deliveryTime: selectedOrder.deliveryTime,
                    })}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white transition-all active:scale-95"
                    style={{ background: 'linear-gradient(135deg, rgb(50, 140, 129), rgb(34, 197, 94))' }}
                  >
                    <Download size={18} />
                    Download Receipt (PDF)
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrders;