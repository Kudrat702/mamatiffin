// import React, { useState, useEffect, useCallback } from 'react';
// import {
//   Search,
//   Calendar,
//   TrendingUp,
//   Users,
//   DollarSign,
//   Package,
//   RefreshCw,
//   CheckCircle,
//   Clock,
//   XCircle,
//   Coffee,
//   Sun,
//   Moon,
//   Printer,
//   Download,
//   FileSpreadsheet,
//   FileText
// } from 'lucide-react';
// import { apiEndpoints } from '../configapi/api';

// interface Order {
//   _id: string;
//   customerName: string;
//   customerPhone: string;
//   address?: {
//     district?: string;
//     block?: string;
//     city?: string;
//     homeLodgeName?: string;
//   };
//   menuTitle: string;
//   menuCategory: string;
//   dietaryPreference: 'veg' | 'non-veg';
//   subscriptionType: 'monthly' | 'trial';
//   totalAmount: number;
//   paymentStatus: 'pending' | 'success' | 'failed';
//   orderStatus: 'active' | 'completed' | 'cancelled' | 'pending';
//   startDate: string;
//   endDate: string;
//   orderDate: string;
//   deliveryTime?: string;
//   createdAt: string;
// }

// interface SkipOrder {
//   _id: string;
//   customerPhone: string;
//   customerName: string;
//   date: string;
//   breakfast?: boolean;
//   lunch?: boolean;
//   dinner?: boolean;
//   informed: boolean;
//   notes?: string;
//   customerOrders: Order[];
//   orderedMeals: {
//     breakfast: boolean;
//     lunch: boolean;
//     dinner: boolean;
//   };
// }

// interface FinalDeliveryOrder extends Order {
//   skipInfo?: {
//     breakfast: boolean;
//     lunch: boolean;
//     dinner: boolean;
//     notes?: string;
//   };
//   deliveryStatus: {
//     breakfast: boolean;
//     lunch: boolean;
//     dinner: boolean;
//   };
//   targetDate: string;
// }

// interface OrderStats {
//   today: {
//     totalOrders: number;
//     totalRevenue: number;
//     vegOrders: number;
//     nonVegOrders: number;
//     monthlySubscriptions: number;
//     trialOrders: number;
//   };
//   allTime: {
//     totalOrders: number;
//     totalRevenue: number;
//   };
// }

// interface DeliverySummary {
//   totalActiveOrders: number;
//   totalWithDeliveries: number;
//   totalWithSkips: number;
//   totalCompletelySkipped: number;
//   deliveryBreakdown: {
//     breakfast: number;
//     lunch: number;
//     dinner: number;
//   };
//   date: string;
// }

// const AdminOrderDashboard: React.FC = () => {
//   const [activeTab, setActiveTab] = useState<'new' | 'old' | 'all' | 'skip' | 'delivery'>('new');
//   const [orders, setOrders] = useState<Order[]>([]);
//   const [skipOrders, setSkipOrders] = useState<SkipOrder[]>([]);
//   const [finalDeliveryOrders, setFinalDeliveryOrders] = useState<FinalDeliveryOrder[]>([]);
//   const [deliverySummary, setDeliverySummary] = useState<DeliverySummary | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [exporting, setExporting] = useState(false);
//   const [stats, setStats] = useState<OrderStats | null>(null);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filters, setFilters] = useState({
//     dietaryPreference: '',
//     city: '',
//     addressType: '',
//     customerName: '',
//     mealType: '',
//     dayName: '',
//   });
//   const [selectedDate, setSelectedDate] = useState('');
//   const [mealFilter, setMealFilter] = useState('');

//   // Helper function to determine which meals are in a menu category
//   const getMealsFromCategory = (category: string) => {
//     const categoryLower = category.toLowerCase();
//     const meals = {
//       breakfast: categoryLower.includes('breakfast'),
//       lunch: categoryLower.includes('lunch'),
//       dinner: categoryLower.includes('dinner'),
//     };
//     return meals;
//   };

//   // Helper function to get meal type display name
//   const getMealTypeDisplay = (category: string) => {
//     const meals = getMealsFromCategory(category);
//     const mealTypes = [];
//     if (meals.breakfast) mealTypes.push('Breakfast');
//     if (meals.lunch) mealTypes.push('Lunch');
//     if (meals.dinner) mealTypes.push('Dinner');
//     return mealTypes.join(' + ');
//   };

//   // Fetch order statistics
//   const fetchStats = useCallback(async () => {
//     try {
//       const response = await fetch(apiEndpoints.orderStatistics);
//       if (response.ok) {
//         const data = await response.json();
//         setStats(data.data);
//       }
//     } catch (error) {
//       console.error('Error fetching stats:', error);
//     }
//   }, []);

//   // Fetch orders based on active tab
//   const fetchOrders = useCallback(async () => {
//     try {
//       setLoading(true);
//       let url = apiEndpoints.orders;

//       if (activeTab === 'new') {
//         url = apiEndpoints.ordersByType('new');
//       } else if (activeTab === 'old') {
//         url = apiEndpoints.ordersByType('old');
//       } else if (activeTab === 'skip') {
//         // Fetch skip orders
//         const params = new URLSearchParams();
//         if (selectedDate) params.append('date', selectedDate);
//         if (searchTerm) params.append('customerPhone', searchTerm);

//         url = `${apiEndpoints.skipOrders}${params.toString() ? '?' + params.toString() : ''}`;

//         const response = await fetch(url);
//         if (response.ok) {
//           const data = await response.json();
//           setSkipOrders(data.data || []);
//         }
//         return;
//       } else if (activeTab === 'delivery') {
//         // Fetch final delivery orders
//         const params = new URLSearchParams();
//         if (selectedDate) params.append('date', selectedDate);
//         if (filters.dietaryPreference) params.append('dietaryPreference', filters.dietaryPreference);
//         if (filters.city) params.append('city', filters.city);
//         if (filters.addressType) params.append('addressType', filters.addressType);
//         if (filters.customerName) params.append('customerName', filters.customerName);
//         if (mealFilter) params.append('mealFilter', mealFilter);

//         url = `${apiEndpoints.finalDelivery}${params.toString() ? '?' + params.toString() : ''}`;

//         const response = await fetch(url);
//         if (response.ok) {
//           const data = await response.json();
//           setFinalDeliveryOrders(data.data || []);
//           setDeliverySummary(data.summary || null);
//         }
//         return;
//       } else {
//         // All orders with filters
//         const params = new URLSearchParams();
//         Object.entries(filters).forEach(([key, value]) => {
//           if (value) params.append(key, value);
//         });
//         if (selectedDate) params.append('date', selectedDate);
//         if (params.toString()) {
//           url += `?${params.toString()}`;
//         }
//       }

//       const response = await fetch(url);
//       if (response.ok) {
//         const data = await response.json();
//         setOrders(data.data || []);
//       } else {
//         console.error('Failed to fetch orders');
//       }
//     } catch (error) {
//       console.error('Error fetching orders:', error);
//     } finally {
//       setLoading(false);
//     }
//   }, [activeTab, filters, selectedDate, searchTerm, mealFilter]);

//   // Update order status
//   const updateOrderStatus = async (orderId: string, newStatus: string) => {
//     try {
//       const response = await fetch(apiEndpoints.orderStatus(orderId), {
//         method: 'PATCH',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           orderStatus: newStatus,
//         }),
//       });

//       if (response.ok) {
//         fetchOrders();
//         fetchStats();
//       } else {
//         alert('Failed to update order status');
//       }
//     } catch (error) {
//       console.error('Error updating order status:', error);
//       alert('Error updating order status');
//     }
//   };

//   // Enhanced print function for delivery orders
//   const handlePrint = () => {
//     const printContent = document.getElementById('print-content');
//     if (printContent) {
//       const printWindow = window.open('', '_blank');
//       if (printWindow) {
//         printWindow.document.write(`
//           <html>
//             <head>
//               <title>Delivery Orders - ${selectedDate || 'Today'}</title>
//               <style>
//                 body { font-family: Arial, sans-serif; font-size: 12px; margin: 20px; }
//                 table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
//                 th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
//                 th { background-color: #f2f2f2; font-weight: bold; }
//                 .header { text-align: center; margin-bottom: 20px; }
//                 .summary { background-color: #f8f9fa; padding: 15px; margin-bottom: 20px; border-radius: 8px; }
//                 .meal-badge { padding: 2px 6px; border-radius: 4px; font-size: 10px; margin: 1px; }
//                 .breakfast { background-color: #fef3c7; }
//                 .lunch { background-color: #fef9e7; }
//                 .dinner { background-color: #e0e7ff; }
//                 .veg { color: #059669; }
//                 .non-veg { color: #dc2626; }
//                 @media print {
//                   body { margin: 0; }
//                   .no-print { display: none; }
//                 }
//               </style>
//             </head>
//             <body>
//               <div class="header">
//                 <h2>Final Delivery Orders</h2>
//                 <p>Date: ${selectedDate || new Date().toDateString()}</p>
//                 <p>Generated: ${new Date().toLocaleString('en-IN')}</p>
//               </div>
//               ${deliverySummary ? `
//                 <div class="summary">
//                   <h3>Summary</h3>
//                   <p><strong>Total Active Orders:</strong> ${deliverySummary.totalActiveOrders}</p>
//                   <p><strong>Orders with Deliveries:</strong> ${deliverySummary.totalWithDeliveries}</p>
//                   <p><strong>Breakfast Deliveries:</strong> ${deliverySummary.deliveryBreakdown.breakfast}</p>
//                   <p><strong>Lunch Deliveries:</strong> ${deliverySummary.deliveryBreakdown.lunch}</p>
//                   <p><strong>Dinner Deliveries:</strong> ${deliverySummary.deliveryBreakdown.dinner}</p>
//                 </div>
//               ` : ''}
//               ${printContent.innerHTML}
//             </body>
//           </html>
//         `);
//         printWindow.document.close();
//         printWindow.focus();
//         printWindow.print();
//         printWindow.close();
//       }
//     }
//   };

//   // Enhanced export function with loading states
//   const handleExport = async (format: 'excel' | 'csv' | 'pdf') => {
//     try {
//       setExporting(true);
//       const params = new URLSearchParams();
//       if (selectedDate) params.append('date', selectedDate);
//       if (filters.dietaryPreference) params.append('dietaryPreference', filters.dietaryPreference);
//       if (filters.city) params.append('city', filters.city);
//       if (filters.addressType) params.append('addressType', filters.addressType);
//       if (filters.customerName) params.append('customerName', filters.customerName);
//       if (mealFilter) params.append('mealFilter', mealFilter);
//       params.append('format', format);

//       const response = await fetch(
//         `${apiEndpoints.exportFinalDelivery}?${params.toString()}`,
//         {
//           method: 'GET',
//         }
//       );

//       if (response.ok) {
//         if (format === 'pdf') {
//           // For PDF, we get HTML content that we can print or save
//           const htmlContent = await response.text();
//           const printWindow = window.open('', '_blank');
//           if (printWindow) {
//             printWindow.document.write(htmlContent);
//             printWindow.document.close();
//             printWindow.focus();

//             // Auto-print the PDF (user can choose "Save as PDF" in print dialog)
//             setTimeout(() => {
//               printWindow.print();
//             }, 1000);
//           }
//         } else {
//           // For Excel and CSV, download the file
//           const blob = await response.blob();
//           const url = window.URL.createObjectURL(blob);
//           const a = document.createElement('a');
//           a.style.display = 'none';
//           a.href = url;

//           // Get filename from response headers or create default
//           const contentDisposition = response.headers.get('content-disposition');
//           let filename = `Final_Delivery_Orders_${selectedDate || new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'csv'}`;

//           if (contentDisposition && contentDisposition.includes('filename=')) {
//             filename = contentDisposition.split('filename=')[1].replace(/['"]/g, '');
//           }

//           a.download = filename;
//           document.body.appendChild(a);
//           a.click();
//           window.URL.revokeObjectURL(url);
//           document.body.removeChild(a);
//         }
//       } else {
//         alert('Failed to export data');
//       }
//     } catch (error) {
//       console.error('Export error:', error);
//       alert('Error exporting data');
//     } finally {
//       setExporting(false);
//     }
//   };

//   // Filter logic for different tabs
//   const getFilteredData = () => {
//     if (activeTab === 'skip') {
//       return skipOrders.filter(
//         (order) =>
//           order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//           order.customerPhone?.includes(searchTerm)
//       );
//     } else if (activeTab === 'delivery') {
//       return finalDeliveryOrders.filter(
//         (order) =>
//           order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//           order.customerPhone?.includes(searchTerm) ||
//           order.menuTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//           order.address?.city?.toLowerCase().includes(searchTerm.toLowerCase())
//       );
//     } else {
//       return orders.filter(
//         (order) =>
//           order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//           order.customerPhone?.includes(searchTerm) ||
//           order.menuTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//           order.address?.city?.toLowerCase().includes(searchTerm.toLowerCase())
//       );
//     }
//   };

//   const filteredData = getFilteredData();

//   const formatDate = (dateString: string) => {
//     return new Date(dateString).toLocaleDateString('en-IN', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit',
//     });
//   };

//   const getStatusIcon = (status: string) => {
//     switch (status) {
//       case 'success':
//       case 'active':
//         return <CheckCircle className="w-4 h-4 text-green-500" />;
//       case 'pending':
//         return <Clock className="w-4 h-4 text-yellow-500" />;
//       case 'failed':
//       case 'cancelled':
//         return <XCircle className="w-4 h-4 text-red-500" />;
//       default:
//         return <Clock className="w-4 h-4 text-gray-500" />;
//     }
//   };

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'success':
//       case 'active':
//         return 'bg-green-100 text-green-800';
//       case 'pending':
//         return 'bg-yellow-100 text-yellow-800';
//       case 'failed':
//       case 'cancelled':
//         return 'bg-red-100 text-red-800';
//       case 'completed':
//         return 'bg-blue-100 text-blue-800';
//       default:
//         return 'bg-gray-100 text-gray-800';
//     }
//   };

//   useEffect(() => {
//     fetchOrders();
//     fetchStats();
//   }, [activeTab, fetchOrders, fetchStats]);

//   useEffect(() => {
//     if (activeTab === 'all' || activeTab === 'delivery') {
//       fetchOrders();
//     }
//   }, [filters, selectedDate, activeTab, fetchOrders, mealFilter]);

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="flex justify-between items-center mb-8">
//           <div>
//             <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
//             <p className="text-gray-600 mt-1">Manage and track all food orders</p>
//           </div>
//           <button
//             onClick={() => {
//               fetchOrders();
//               fetchStats();
//             }}
//             disabled={loading}
//             className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
//           >
//             <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
//             <span>Refresh</span>
//           </button>
//         </div>

//         {/* Statistics Cards */}
//         {stats && (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//             <div className="bg-white rounded-xl shadow-lg p-6">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-gray-600">Today's Orders</p>
//                   <p className="text-3xl font-bold text-gray-900">{stats.today.totalOrders}</p>
//                 </div>
//                 <Package className="w-12 h-12 text-blue-500" />
//               </div>
//               <div className="mt-4 text-sm text-gray-500">
//                 <span className="text-green-600">VEG: {stats.today.vegOrders}</span> |
//                 <span className="text-red-600 ml-1">NON-VEG: {stats.today.nonVegOrders}</span>
//               </div>
//             </div>

//             <div className="bg-white rounded-xl shadow-lg p-6">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-gray-600">Today's Revenue</p>
//                   <p className="text-3xl font-bold text-gray-900">₹{stats.today.totalRevenue}</p>
//                 </div>
//                 <DollarSign className="w-12 h-12 text-green-500" />
//               </div>
//             </div>

//             <div className="bg-white rounded-xl shadow-lg p-6">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-gray-600">Total Orders</p>
//                   <p className="text-3xl font-bold text-gray-900">{stats.allTime.totalOrders}</p>
//                 </div>
//                 <TrendingUp className="w-12 h-12 text-purple-500" />
//               </div>
//             </div>

//             <div className="bg-white rounded-xl shadow-lg p-6">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-gray-600">Total Revenue</p>
//                   <p className="text-3xl font-bold text-gray-900">₹{stats.allTime.totalRevenue}</p>
//                 </div>
//                 <Users className="w-12 h-12 text-orange-500" />
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Delivery Summary Card */}
//         {activeTab === 'delivery' && deliverySummary && (
//           <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
//             <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Summary for {deliverySummary.date}</h3>
//             <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
//               <div className="text-center">
//                 <div className="text-2xl font-bold text-blue-600">{deliverySummary.totalActiveOrders}</div>
//                 <div className="text-sm text-gray-500">Active Orders</div>
//               </div>
//               <div className="text-center">
//                 <div className="text-2xl font-bold text-green-600">{deliverySummary.totalWithDeliveries}</div>
//                 <div className="text-sm text-gray-500">With Deliveries</div>
//               </div>
//               <div className="text-center">
//                 <div className="text-2xl font-bold text-orange-600">{deliverySummary.deliveryBreakdown.breakfast}</div>
//                 <div className="text-sm text-gray-500">Breakfast</div>
//               </div>
//               <div className="text-center">
//                 <div className="text-2xl font-bold text-yellow-600">{deliverySummary.deliveryBreakdown.lunch}</div>
//                 <div className="text-sm text-gray-500">Lunch</div>
//               </div>
//               <div className="text-center">
//                 <div className="text-2xl font-bold text-indigo-600">{deliverySummary.deliveryBreakdown.dinner}</div>
//                 <div className="text-sm text-gray-500">Dinner</div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Tabs */}
//         <div className="bg-white rounded-xl shadow-lg mb-6">
//           <div className="border-b border-gray-200">
//             <nav className="flex space-x-8 px-6 overflow-x-auto">
//               {['new', 'old', 'all', 'skip', 'delivery'].map((tab) => (
//                 <button
//                   key={tab}
//                   onClick={() => setActiveTab(tab as typeof activeTab)}
//                   className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
//                     activeTab === tab
//                       ? 'border-blue-500 text-blue-600'
//                       : 'border-transparent text-gray-500 hover:text-gray-700'
//                   }`}
//                 >
//                   {tab === 'new' && 'New Orders (Today)'}
//                   {tab === 'old' && 'Old Orders'}
//                   {tab === 'all' && 'All Orders'}
//                   {tab === 'skip' && 'Skip Orders'}
//                   {tab === 'delivery' && 'Final Delivery'}
//                 </button>
//               ))}
//             </nav>
//           </div>

//           {/* Search and Filters */}
//           <div className="p-6">
//             <div className="flex flex-col lg:flex-row gap-4 mb-6">
//               {/* Search */}
//               <div className="flex-1 relative">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//                 <input
//                   type="text"
//                   placeholder="Search by customer name, phone, menu, or city..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 />
//               </div>

//               {/* Date Filter */}
//               <div className="flex items-center space-x-2">
//                 <Calendar className="w-5 h-5 text-gray-400" />
//                 <input
//                   type="date"
//                   value={selectedDate}
//                   onChange={(e) => setSelectedDate(e.target.value)}
//                   className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 />
//               </div>
//             </div>

//             {/* Filters for Final Delivery Tab */}
//             {activeTab === 'delivery' && (
//               <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
//                 <select
//                   value={filters.dietaryPreference}
//                   onChange={(e) => setFilters((prev) => ({ ...prev, dietaryPreference: e.target.value }))}
//                   className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 >
//                   <option value="">All Diet Types</option>
//                   <option value="veg">Vegetarian</option>
//                   <option value="non-veg">Non-Vegetarian</option>
//                 </select>

//                 <input
//                   type="text"
//                   placeholder="City"
//                   value={filters.city}
//                   onChange={(e) => setFilters((prev) => ({ ...prev, city: e.target.value }))}
//                   className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 />

//                 <select
//                   value={filters.addressType}
//                   onChange={(e) => setFilters((prev) => ({ ...prev, addressType: e.target.value }))}
//                   className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 >
//                   <option value="">Lodge or Home</option>
//                   <option value="lodge">Lodge/PG</option>
//                   <option value="home">Home</option>
//                 </select>

//                 <input
//                   type="text"
//                   placeholder="Customer Name"
//                   value={filters.customerName}
//                   onChange={(e) => setFilters((prev) => ({ ...prev, customerName: e.target.value }))}
//                   className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 />

//                 <select
//                   value={mealFilter}
//                   onChange={(e) => setMealFilter(e.target.value)}
//                   className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 >
//                   <option value="">All Meals</option>
//                   <option value="breakfast">Breakfast Only</option>
//                   <option value="lunch">Lunch Only</option>
//                   <option value="dinner">Dinner Only</option>
//                 </select>

//                 <button
//                   onClick={() => {
//                     setFilters({
//                       dietaryPreference: '',
//                       city: '',
//                       addressType: '',
//                       customerName: '',
//                       mealType: '',
//                       dayName: '',
//                     });
//                     setSelectedDate('');
//                     setMealFilter('');
//                   }}
//                   className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
//                 >
//                   Clear Filters
//                 </button>
//               </div>
//             )}

//             {/* Export Buttons for Delivery Tab */}
//             {activeTab === 'delivery' && (
//               <div className="flex flex-wrap gap-2 mb-6">
//                 <button
//                   onClick={handlePrint}
//                   disabled={exporting}
//                   className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
//                 >
//                   <Printer className="w-4 h-4" />
//                   <span>Print</span>
//                 </button>

//                 <button
//                   onClick={() => handleExport('excel')}
//                   disabled={exporting}
//                   className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
//                 >
//                   <FileSpreadsheet className="w-4 h-4" />
//                   <span>{exporting ? 'Exporting...' : 'Export Excel'}</span>
//                 </button>

//                 <button
//                   onClick={() => handleExport('csv')}
//                   disabled={exporting}
//                   className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50"
//                 >
//                   <Download className="w-4 h-4" />
//                   <span>{exporting ? 'Exporting...' : 'Export CSV'}</span>
//                 </button>

//                 <button
//                   onClick={() => handleExport('pdf')}
//                   disabled={exporting}
//                   className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
//                 >
//                   <FileText className="w-4 h-4" />
//                   <span>{exporting ? 'Generating...' : 'Export PDF'}</span>
//                 </button>
//               </div>
//             )}

//             {/* Orders Display */}
//             <div className="bg-white rounded-xl shadow-lg overflow-hidden">
//               {loading ? (
//                 <div className="flex items-center justify-center py-12">
//                   <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
//                   <span className="ml-2 text-gray-600">Loading orders...</span>
//                 </div>
//               ) : filteredData.length === 0 ? (
//                 <div className="text-center py-12">
//                   <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//                   <h3 className="text-xl font-semibold text-gray-900 mb-2">No Orders Found</h3>
//                   <p className="text-gray-600">There are no orders matching your criteria.</p>
//                 </div>
//               ) : (
//                 <div className="overflow-x-auto">
//                   {/* Final Delivery Orders Table with Print Content */}
//                   {activeTab === 'delivery' && (
//                     <>
//                       <div id="print-content" className="hidden">
//                         <table style={{ width: '100%', borderCollapse: 'collapse' }}>
//                           <thead>
//                             <tr>
//                               <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2' }}>Sr. No.</th>
//                               <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2' }}>Customer Name</th>
//                               <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2' }}>Phone</th>
//                               <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2' }}>Menu Type</th>
//                               <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2' }}>Address</th>
//                               <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2' }}>Meals to Deliver</th>
//                               <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2' }}>Amount</th>
//                             </tr>
//                           </thead>
//                           <tbody>
//                             {(filteredData as FinalDeliveryOrder[]).map((order, index) => (
//                               <tr key={order._id}>
//                                 <td style={{ border: '1px solid #ddd', padding: '8px' }}>{index + 1}</td>
//                                 <td style={{ border: '1px solid #ddd', padding: '8px' }}>{order.customerName}</td>
//                                 <td style={{ border: '1px solid #ddd', padding: '8px' }}>{order.customerPhone}</td>
//                                 <td style={{ border: '1px solid #ddd', padding: '8px' }} className={order.dietaryPreference === 'veg' ? 'veg' : 'non-veg'}>
//                                   {order.menuTitle} ({order.dietaryPreference.toUpperCase()})
//                                 </td>
//                                 <td style={{ border: '1px solid #ddd', padding: '8px' }}>
//                                   {`${order.address?.homeLodgeName || ''}, ${order.address?.block || ''}, ${order.address?.district || ''}, ${order.address?.city || ''}`.replace(/,\s*,/g, ',').replace(/^,\s*|,\s*$/g, '')}
//                                 </td>
//                                 <td style={{ border: '1px solid #ddd', padding: '8px' }}>
//                                   {order.deliveryStatus.breakfast && <span className="meal-badge breakfast">Breakfast</span>}
//                                   {order.deliveryStatus.lunch && <span className="meal-badge lunch">Lunch</span>}
//                                   {order.deliveryStatus.dinner && <span className="meal-badge dinner">Dinner</span>}
//                                 </td>
//                                 <td style={{ border: '1px solid #ddd', padding: '8px' }}>₹{order.totalAmount}</td>
//                               </tr>
//                             ))}
//                           </tbody>
//                         </table>
//                       </div>

//                       <table className="min-w-full divide-y divide-gray-200">
//                         <thead className="bg-gray-50">
//                           <tr>
//                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
//                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Menu Details</th>
//                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
//                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery Status</th>
//                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Skip Info</th>
//                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
//                           </tr>
//                         </thead>
//                         <tbody className="bg-white divide-y divide-gray-200">
//                           {(filteredData as FinalDeliveryOrder[]).map((order) => (
//                             <tr key={order._id} className="hover:bg-gray-50">
//                               <td className="px-6 py-4 whitespace-nowrap">
//                                 <div>
//                                   <div className="text-sm font-medium text-gray-900">{order.customerName}</div>
//                                   <div className="text-sm text-gray-500">{order.customerPhone}</div>
//                                 </div>
//                               </td>
//                               <td className="px-6 py-4">
//                                 <div>
//                                   <div className="text-sm font-medium text-gray-900 flex items-center">
//                                     <span className={`inline-block w-3 h-3 rounded-full mr-2 ${order.dietaryPreference === 'veg' ? 'bg-green-400' : 'bg-red-400'}`}></span>
//                                     {order.menuTitle}
//                                   </div>
//                                   <div className="text-sm text-gray-500">{getMealTypeDisplay(order.menuCategory)}</div>
//                                 </div>
//                               </td>
//                               <td className="px-6 py-4">
//                                 <div className="text-sm text-gray-900">{order.address?.homeLodgeName || 'Address not provided'}</div>
//                                 <div className="text-sm text-gray-500">{order.address?.city || 'City not specified'}</div>
//                               </td>
//                               <td className="px-6 py-4">
//                                 <div className="flex flex-col space-y-1">
//                                   {order.deliveryStatus.breakfast && (
//                                     <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
//                                       <Coffee className="w-3 h-3 mr-1" />
//                                       Breakfast
//                                     </span>
//                                   )}
//                                   {order.deliveryStatus.lunch && (
//                                     <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
//                                       <Sun className="w-3 h-3 mr-1" />
//                                       Lunch
//                                     </span>
//                                   )}
//                                   {order.deliveryStatus.dinner && (
//                                     <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
//                                       <Moon className="w-3 h-3 mr-1" />
//                                       Dinner
//                                     </span>
//                                   )}
//                                 </div>
//                               </td>
//                               <td className="px-6 py-4">
//                                 {order.skipInfo ? (
//                                   <div className="text-xs space-y-1">
//                                     {getMealsFromCategory(order.menuCategory).breakfast && (
//                                       <div className={order.skipInfo.breakfast ? 'text-green-600' : 'text-red-600'}>
//                                         B: {order.skipInfo.breakfast ? 'Deliver' : 'Skip'}
//                                       </div>
//                                     )}
//                                     {getMealsFromCategory(order.menuCategory).lunch && (
//                                       <div className={order.skipInfo.lunch ? 'text-green-600' : 'text-red-600'}>
//                                         L: {order.skipInfo.lunch ? 'Deliver' : 'Skip'}
//                                       </div>
//                                     )}
//                                     {getMealsFromCategory(order.menuCategory).dinner && (
//                                       <div className={order.skipInfo.dinner ? 'text-green-600' : 'text-red-600'}>
//                                         D: {order.skipInfo.dinner ? 'Deliver' : 'Skip'}
//                                       </div>
//                                     )}
//                                     {order.skipInfo.notes && (
//                                       <div className="text-gray-500 italic">{order.skipInfo.notes}</div>
//                                     )}
//                                   </div>
//                                 ) : (
//                                   <div className="text-sm text-gray-500">No skip preferences</div>
//                                 )}
//                               </td>
//                               <td className="px-6 py-4 whitespace-nowrap">
//                                 <div className="text-sm font-medium text-gray-900">₹{order.totalAmount}</div>
//                               </td>
//                             </tr>
//                           ))}
//                         </tbody>
//                       </table>
//                     </>
//                   )}

//                   {/* Skip Orders Table */}
//                   {activeTab === 'skip' && (
//                     <table className="min-w-full divide-y divide-gray-200">
//                       <thead className="bg-gray-50">
//                         <tr>
//                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
//                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
//                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Skip Preferences</th>
//                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active Orders</th>
//                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
//                         </tr>
//                       </thead>
//                       <tbody className="bg-white divide-y divide-gray-200">
//                         {(filteredData as SkipOrder[]).map((skipOrder) => (
//                           <tr key={skipOrder._id} className="hover:bg-gray-50">
//                             <td className="px-6 py-4 whitespace-nowrap">
//                               <div>
//                                 <div className="text-sm font-medium text-gray-900">{skipOrder.customerName}</div>
//                                 <div className="text-sm text-gray-500">{skipOrder.customerPhone}</div>
//                               </div>
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap">
//                               <div className="text-sm text-gray-900">{formatDate(skipOrder.date)}</div>
//                             </td>
//                             <td className="px-6 py-4">
//                               <div className="flex flex-wrap gap-2">
//                                 {skipOrder.customerOrders.map((order, orderIdx) => {
//                                   const orderMeals = getMealsFromCategory(order.menuCategory);
//                                   return (
//                                     <div key={orderIdx} className="mb-2 p-2 border rounded-lg bg-gray-50">
//                                       <div className="text-xs text-gray-600 mb-1 font-medium">
//                                         {order.menuTitle} ({getMealTypeDisplay(order.menuCategory)})
//                                       </div>
//                                       <div className="flex gap-1">
//                                         {orderMeals.breakfast && skipOrder.orderedMeals.breakfast && (
//                                           <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${skipOrder.breakfast !== undefined && skipOrder.breakfast ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
//                                             <Coffee className="w-3 h-3 mr-1" />
//                                             B: {skipOrder.breakfast !== undefined && skipOrder.breakfast ? 'Deliver' : 'Skip'}
//                                           </span>
//                                         )}
//                                         {orderMeals.lunch && skipOrder.orderedMeals.lunch && (
//                                           <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${skipOrder.lunch !== undefined && skipOrder.lunch ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
//                                             <Sun className="w-3 h-3 mr-1" />
//                                             L: {skipOrder.lunch !== undefined && skipOrder.lunch ? 'Deliver' : 'Skip'}
//                                           </span>
//                                         )}
//                                         {orderMeals.dinner && skipOrder.orderedMeals.dinner && (
//                                           <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${skipOrder.dinner !== undefined && skipOrder.dinner ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
//                                             <Moon className="w-3 h-3 mr-1" />
//                                             D: {skipOrder.dinner !== undefined && skipOrder.dinner ? 'Deliver' : 'Skip'}
//                                           </span>
//                                         )}
//                                       </div>
//                                     </div>
//                                   );
//                                 })}
//                               </div>
//                             </td>
//                             <td className="px-6 py-4">
//                               <div className="space-y-1">
//                                 {skipOrder.customerOrders.map((order, idx) => (
//                                   <div key={idx} className="text-sm text-gray-600">
//                                     <span className={`inline-block w-2 h-2 rounded-full mr-2 ${order.dietaryPreference === 'veg' ? 'bg-green-400' : 'bg-red-400'}`}></span>
//                                     {order.menuTitle} ({order.menuCategory})
//                                   </div>
//                                 ))}
//                               </div>
//                             </td>
//                             <td className="px-6 py-4">
//                               <div className="text-sm text-gray-600 max-w-xs">{skipOrder.notes || 'No notes'}</div>
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   )}

//                   {/* Regular Orders Table */}
//                   {(activeTab === 'new' || activeTab === 'old' || activeTab === 'all') && (
//                     <table className="min-w-full divide-y divide-gray-200">
//                       <thead className="bg-gray-50">
//                         <tr>
//                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
//                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Menu Details</th>
//                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
//                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
//                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
//                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Date</th>
//                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//                         </tr>
//                       </thead>
//                       <tbody className="bg-white divide-y divide-gray-200">
//                         {(filteredData as Order[]).map((order) => (
//                           <tr key={order._id} className="hover:bg-gray-50">
//                             <td className="px-6 py-4 whitespace-nowrap">
//                               <div>
//                                 <div className="text-sm font-medium text-gray-900">{order.customerName}</div>
//                                 <div className="text-sm text-gray-500">{order.customerPhone}</div>
//                               </div>
//                             </td>
//                             <td className="px-6 py-4">
//                               <div>
//                                 <div className="text-sm font-medium text-gray-900 flex items-center">
//                                   <span className={`inline-block w-3 h-3 rounded-full mr-2 ${order.dietaryPreference === 'veg' ? 'bg-green-400' : 'bg-red-400'}`}></span>
//                                   {order.menuTitle}
//                                 </div>
//                                 <div className="text-sm text-gray-500">{order.subscriptionType === 'trial' ? '1 Day Trial' : 'Monthly Plan'}</div>
//                               </div>
//                             </td>
//                             <td className="px-6 py-4">
//                               <div className="text-sm text-gray-900">{order.address?.homeLodgeName || 'Address not provided'}</div>
//                               <div className="text-sm text-gray-500">{order.address?.city || 'City not specified'}</div>
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap">
//                               <div className="text-sm font-medium text-gray-900">₹{order.totalAmount}</div>
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap">
//                               <div className="flex flex-col space-y-1">
//                                 <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.paymentStatus)}`}>
//                                   {getStatusIcon(order.paymentStatus)}
//                                   <span className="ml-1">{order.paymentStatus.toUpperCase()}</span>
//                                 </span>
//                                 <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}>
//                                   {getStatusIcon(order.orderStatus)}
//                                   <span className="ml-1">{order.orderStatus.toUpperCase()}</span>
//                                 </span>
//                               </div>
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap">
//                               <div className="text-sm text-gray-900">{formatDate(order.orderDate)}</div>
//                               {order.subscriptionType === 'monthly' && (
//                                 <div className="text-xs text-gray-500">Ends: {formatDate(order.endDate)}</div>
//                               )}
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                               <div className="flex space-x-2">
//                                 {order.orderStatus === 'active' && (
//                                   <button
//                                     onClick={() => updateOrderStatus(order._id, 'completed')}
//                                     className="text-green-600 hover:text-green-900 transition-colors"
//                                     title="Mark as Completed"
//                                   >
//                                     <CheckCircle className="w-4 h-4" />
//                                   </button>
//                                 )}
//                                 {order.orderStatus === 'pending' && (
//                                   <button
//                                     onClick={() => updateOrderStatus(order._id, 'active')}
//                                     className="text-blue-600 hover:text-blue-900 transition-colors"
//                                     title="Activate Order"
//                                   >
//                                     <CheckCircle className="w-4 h-4" />
//                                   </button>
//                                 )}
//                                 {(order.orderStatus === 'active' || order.orderStatus === 'pending') && (
//                                   <button
//                                     onClick={() => updateOrderStatus(order._id, 'cancelled')}
//                                     className="text-red-600 hover:text-red-900 transition-colors"
//                                     title="Cancel Order"
//                                   >
//                                     <XCircle className="w-4 h-4" />
//                                   </button>
//                                 )}
//                               </div>
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   )}
//                 </div>
//               )}
//             </div>

//             {/* Summary for Different Tabs */}
//             {activeTab === 'skip' && filteredData.length > 0 && (
//               <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
//                 <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
//                 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//                   <div className="text-center">
//                     <div className="text-2xl font-bold text-blue-600">{filteredData.length}</div>
//                     <div className="text-sm text-gray-500">Total Skip Orders</div>
//                   </div>
//                   <div className="text-center">
//                     <div className="text-2xl font-bold text-red-600">
//                       {(filteredData as SkipOrder[]).reduce((count, order) => {
//                         return count + order.customerOrders.reduce((orderCount, customerOrder) => {
//                           const orderMeals = getMealsFromCategory(customerOrder.menuCategory);
//                           return orderCount + (orderMeals.breakfast && order.orderedMeals.breakfast && !order.breakfast ? 1 : 0);
//                         }, 0);
//                       }, 0)}
//                     </div>
//                     <div className="text-sm text-gray-500">Breakfast Skips</div>
//                   </div>
//                   <div className="text-center">
//                     <div className="text-2xl font-bold text-orange-600">
//                       {(filteredData as SkipOrder[]).reduce((count, order) => {
//                         return count + order.customerOrders.reduce((orderCount, customerOrder) => {
//                           const orderMeals = getMealsFromCategory(customerOrder.menuCategory);
//                           return orderCount + (orderMeals.lunch && order.orderedMeals.lunch && !order.lunch ? 1 : 0);
//                         }, 0);
//                       }, 0)}
//                     </div>
//                     <div className="text-sm text-gray-500">Lunch Skips</div>
//                   </div>
//                   <div className="text-center">
//                     <div className="text-2xl font-bold text-purple-600">
//                       {(filteredData as SkipOrder[]).reduce((count, order) => {
//                         return count + order.customerOrders.reduce((orderCount, customerOrder) => {
//                           const orderMeals = getMealsFromCategory(customerOrder.menuCategory);
//                           return orderCount + (orderMeals.dinner && order.orderedMeals.dinner && !order.dinner ? 1 : 0);
//                         }, 0);
//                       }, 0)}
//                     </div>
//                     <div className="text-sm text-gray-500">Dinner Skips</div>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {activeTab !== 'skip' && activeTab !== 'delivery' && (
//               <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
//                 <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
//                 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//                   <div className="text-center">
//                     <div className="text-2xl font-bold text-blue-600">{filteredData.length}</div>
//                     <div className="text-sm text-gray-500">Total Orders</div>
//                   </div>
//                   <div className="text-center">
//                     <div className="text-2xl font-bold text-green-600">
//                       ₹{(filteredData as Order[]).reduce((sum, order) => sum + order.totalAmount, 0)}
//                     </div>
//                     <div className="text-sm text-gray-500">Total Amount</div>
//                   </div>
//                   <div className="text-center">
//                     <div className="text-2xl font-bold text-purple-600">
//                       {(filteredData as Order[]).filter(order => order.subscriptionType === 'monthly').length}
//                     </div>
//                     <div className="text-sm text-gray-500">Monthly Plans</div>
//                   </div>
//                   <div className="text-center">
//                     <div className="text-2xl font-bold text-orange-600">
//                       {(filteredData as Order[]).filter(order => order.subscriptionType === 'trial').length}
//                     </div>
//                     <div className="text-sm text-gray-500">Trial Orders</div>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AdminOrderDashboard;

// AdminOrder.tsx - COMPLETE FIXED VERSION
// ✅ Fixed: All endpoints now use admin routes (/api/admin/orders/*)
// ✅ Fixed: Statistics, skip orders, final delivery all use correct admin endpoints

import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Calendar,
  TrendingUp,
  Users,
  DollarSign,
  Package,
  RefreshCw,
  CheckCircle,
  Clock,
  XCircle,
  Coffee,
  Sun,
  Moon,
  Printer,
  Download,
  FileSpreadsheet,
  FileText
} from 'lucide-react';
import { apiEndpoints } from '../configapi/api';

interface Order {
  _id: string;
  customerName: string;
  customerPhone: string;
  address?: {
    district?: string;
    block?: string;
    city?: string;
    homeLodgeName?: string;
  };
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
  createdAt: string;
}

interface SkipOrder {
  _id: string;
  customerPhone: string;
  customerName: string;
  date: string;
  breakfast?: boolean;
  lunch?: boolean;
  dinner?: boolean;
  informed: boolean;
  notes?: string;
  customerOrders: Order[];
  orderedMeals: {
    breakfast: boolean;
    lunch: boolean;
    dinner: boolean;
  };
}

interface FinalDeliveryOrder extends Order {
  skipInfo?: {
    breakfast: boolean;
    lunch: boolean;
    dinner: boolean;
    notes?: string;
  };
  deliveryStatus: {
    breakfast: boolean;
    lunch: boolean;
    dinner: boolean;
  };
  targetDate: string;
}

interface OrderStats {
  today: {
    totalOrders: number;
    totalRevenue: number;
    vegOrders: number;
    nonVegOrders: number;
    monthlySubscriptions: number;
    trialOrders: number;
  };
  allTime: {
    totalOrders: number;
    totalRevenue: number;
  };
}

interface DeliverySummary {
  totalActiveOrders: number;
  totalWithDeliveries: number;
  totalWithSkips: number;
  totalCompletelySkipped: number;
  deliveryBreakdown: {
    breakfast: number;
    lunch: number;
    dinner: number;
  };
  date: string;
}

const AdminOrderDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'new' | 'old' | 'all' | 'skip' | 'delivery'>('new');
  const [orders, setOrders] = useState<Order[]>([]);
  const [skipOrders, setSkipOrders] = useState<SkipOrder[]>([]);
  const [finalDeliveryOrders, setFinalDeliveryOrders] = useState<FinalDeliveryOrder[]>([]);
  const [deliverySummary, setDeliverySummary] = useState<DeliverySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    dietaryPreference: '',
    city: '',
    addressType: '',
    customerName: '',
    mealType: '',
    dayName: '',
  });
  const [selectedDate, setSelectedDate] = useState('');
  const [mealFilter, setMealFilter] = useState('');

  // Helper function to determine which meals are in a menu category
  const getMealsFromCategory = (category: string) => {
    const categoryLower = category.toLowerCase();
    const meals = {
      breakfast: categoryLower.includes('breakfast'),
      lunch: categoryLower.includes('lunch'),
      dinner: categoryLower.includes('dinner'),
    };
    return meals;
  };

  // Helper function to get meal type display name
  const getMealTypeDisplay = (category: string) => {
    const meals = getMealsFromCategory(category);
    const mealTypes = [];
    if (meals.breakfast) mealTypes.push('Breakfast');
    if (meals.lunch) mealTypes.push('Lunch');
    if (meals.dinner) mealTypes.push('Dinner');
    return mealTypes.join(' + ');
  };

  // ✅ FIXED: Fetch order statistics using admin endpoint
  const fetchStats = useCallback(async () => {
    try {
      console.log('📊 Fetching admin order statistics...');
      const response = await fetch(apiEndpoints.adminOrderStatistics);
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Admin statistics loaded:', data);
        setStats(data.data);
      } else {
        console.error('❌ Failed to fetch admin statistics:', response.status);
      }
    } catch (error) {
      console.error('❌ Error fetching admin stats:', error);
    }
  }, []);

  // ✅ FIXED: Fetch orders based on active tab using admin endpoints
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      let url = apiEndpoints.adminOrders; // ✅ Default to admin orders

      if (activeTab === 'new') {
        console.log('📥 Fetching new admin orders...');
        url = apiEndpoints.adminNewOrders; // ✅ Use admin new orders
      } else if (activeTab === 'old') {
        console.log('📥 Fetching old admin orders...');
        url = apiEndpoints.adminOldOrders; // ✅ Use admin old orders
      } else if (activeTab === 'skip') {
        console.log('📥 Fetching admin skip orders...');
        // ✅ Fetch skip orders using admin endpoint
        const params = new URLSearchParams();
        if (selectedDate) params.append('date', selectedDate);
        if (searchTerm) params.append('customerPhone', searchTerm);

        url = `${apiEndpoints.adminSkipOrders}${params.toString() ? '?' + params.toString() : ''}`;

        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Admin skip orders loaded:', data.data?.length || 0);
          setSkipOrders(data.data || []);
        } else {
          console.error('❌ Failed to fetch admin skip orders:', response.status);
        }
        return;
      } else if (activeTab === 'delivery') {
        console.log('📥 Fetching admin final delivery orders...');
        // ✅ Fetch final delivery orders using admin endpoint
        const params = new URLSearchParams();
        if (selectedDate) params.append('date', selectedDate);
        if (filters.dietaryPreference) params.append('dietaryPreference', filters.dietaryPreference);
        if (filters.city) params.append('city', filters.city);
        if (filters.addressType) params.append('addressType', filters.addressType);
        if (filters.customerName) params.append('customerName', filters.customerName);
        if (mealFilter) params.append('mealFilter', mealFilter);

        url = `${apiEndpoints.adminFinalDelivery}${params.toString() ? '?' + params.toString() : ''}`;

        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Admin final delivery orders loaded:', data.data?.length || 0);
          setFinalDeliveryOrders(data.data || []);
          setDeliverySummary(data.summary || null);
        } else {
          console.error('❌ Failed to fetch admin final delivery orders:', response.status);
        }
        return;
      } else {
        console.log('📥 Fetching all admin orders with filters...');
        // ✅ All orders with filters using admin endpoint
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, value);
        });
        if (selectedDate) params.append('date', selectedDate);
        if (params.toString()) {
          url += `?${params.toString()}`;
        }
      }

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Admin orders loaded:', data.data?.length || 0);
        setOrders(data.data || []);
      } else {
        console.error('❌ Failed to fetch admin orders:', response.status);
      }
    } catch (error) {
      console.error('❌ Error fetching admin orders:', error);
    } finally {
      setLoading(false);
    }
  }, [activeTab, filters, selectedDate, searchTerm, mealFilter]);

  // ✅ FIXED: Update order status using admin endpoint
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      console.log('🔄 Updating admin order status:', orderId, newStatus);
      const response = await fetch(apiEndpoints.adminOrderStatus(orderId), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderStatus: newStatus,
        }),
      });

      if (response.ok) {
        console.log('✅ Admin order status updated successfully');
        fetchOrders();
        fetchStats();
      } else {
        console.error('❌ Failed to update admin order status:', response.status);
        alert('Failed to update order status');
      }
    } catch (error) {
      console.error('❌ Error updating admin order status:', error);
      alert('Error updating order status');
    }
  };

  // Enhanced print function for delivery orders
  const handlePrint = () => {
    const printContent = document.getElementById('print-content');
    if (printContent) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Delivery Orders - ${selectedDate || 'Today'}</title>
              <style>
                body { font-family: Arial, sans-serif; font-size: 12px; margin: 20px; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; font-weight: bold; }
                .header { text-align: center; margin-bottom: 20px; }
                .summary { background-color: #f8f9fa; padding: 15px; margin-bottom: 20px; border-radius: 8px; }
                .meal-badge { padding: 2px 6px; border-radius: 4px; font-size: 10px; margin: 1px; }
                .breakfast { background-color: #fef3c7; }
                .lunch { background-color: #fef9e7; }
                .dinner { background-color: #e0e7ff; }
                .veg { color: #059669; }
                .non-veg { color: #dc2626; }
                @media print {
                  body { margin: 0; }
                  .no-print { display: none; }
                }
              </style>
            </head>
            <body>
              <div class="header">
                <h2>Final Delivery Orders</h2>
                <p>Date: ${selectedDate || new Date().toDateString()}</p>
                <p>Generated: ${new Date().toLocaleString('en-IN')}</p>
              </div>
              ${deliverySummary ? `
                <div class="summary">
                  <h3>Summary</h3>
                  <p><strong>Total Active Orders:</strong> ${deliverySummary.totalActiveOrders}</p>
                  <p><strong>Orders with Deliveries:</strong> ${deliverySummary.totalWithDeliveries}</p>
                  <p><strong>Breakfast Deliveries:</strong> ${deliverySummary.deliveryBreakdown.breakfast}</p>
                  <p><strong>Lunch Deliveries:</strong> ${deliverySummary.deliveryBreakdown.lunch}</p>
                  <p><strong>Dinner Deliveries:</strong> ${deliverySummary.deliveryBreakdown.dinner}</p>
                </div>
              ` : ''}
              ${printContent.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }
    }
  };

  // ✅ FIXED: Enhanced export function with admin endpoint
  const handleExport = async (format: 'excel' | 'csv' | 'pdf') => {
    try {
      setExporting(true);
      console.log(`📤 Exporting admin final delivery orders as ${format}...`);
      
      const params = new URLSearchParams();
      if (selectedDate) params.append('date', selectedDate);
      if (filters.dietaryPreference) params.append('dietaryPreference', filters.dietaryPreference);
      if (filters.city) params.append('city', filters.city);
      if (filters.addressType) params.append('addressType', filters.addressType);
      if (filters.customerName) params.append('customerName', filters.customerName);
      if (mealFilter) params.append('mealFilter', mealFilter);
      params.append('format', format);

      const response = await fetch(
        `${apiEndpoints.adminExportFinalDelivery}?${params.toString()}`,
        {
          method: 'GET',
        }
      );

      if (response.ok) {
        console.log('✅ Export successful');
        if (format === 'pdf') {
          // For PDF, we get HTML content that we can print or save
          const htmlContent = await response.text();
          const printWindow = window.open('', '_blank');
          if (printWindow) {
            printWindow.document.write(htmlContent);
            printWindow.document.close();
            printWindow.focus();

            // Auto-print the PDF (user can choose "Save as PDF" in print dialog)
            setTimeout(() => {
              printWindow.print();
            }, 1000);
          }
        } else {
          // For Excel and CSV, download the file
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;

          // Get filename from response headers or create default
          const contentDisposition = response.headers.get('content-disposition');
          let filename = `Final_Delivery_Orders_${selectedDate || new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'csv'}`;

          if (contentDisposition && contentDisposition.includes('filename=')) {
            filename = contentDisposition.split('filename=')[1].replace(/['"]/g, '');
          }

          a.download = filename;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }
      } else {
        console.error('❌ Failed to export admin data:', response.status);
        alert('Failed to export data');
      }
    } catch (error) {
      console.error('❌ Export error:', error);
      alert('Error exporting data');
    } finally {
      setExporting(false);
    }
  };

  // Filter logic for different tabs
  const getFilteredData = () => {
    if (activeTab === 'skip') {
      return skipOrders.filter(
        (order) =>
          order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customerPhone?.includes(searchTerm)
      );
    } else if (activeTab === 'delivery') {
      return finalDeliveryOrders.filter(
        (order) =>
          order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customerPhone?.includes(searchTerm) ||
          order.menuTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.address?.city?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } else {
      return orders.filter(
        (order) =>
          order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customerPhone?.includes(searchTerm) ||
          order.menuTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.address?.city?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
  };

  const filteredData = getFilteredData();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed':
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  useEffect(() => {
    console.log('🔄 Active tab changed to:', activeTab);
    fetchOrders();
    fetchStats();
  }, [activeTab, fetchOrders, fetchStats]);

  useEffect(() => {
    if (activeTab === 'all' || activeTab === 'delivery') {
      console.log('🔄 Filters or date changed, refetching...');
      fetchOrders();
    }
  }, [filters, selectedDate, activeTab, fetchOrders, mealFilter]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
            <p className="text-gray-600 mt-1">Manage and track all food orders</p>
          </div>
          <button
            onClick={() => {
              console.log('🔄 Manual refresh triggered');
              fetchOrders();
              fetchStats();
            }}
            disabled={loading}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Today's Orders</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.today.totalOrders}</p>
                </div>
                <Package className="w-12 h-12 text-blue-500" />
              </div>
              <div className="mt-4 text-sm text-gray-500">
                <span className="text-green-600">VEG: {stats.today.vegOrders}</span> |
                <span className="text-red-600 ml-1">NON-VEG: {stats.today.nonVegOrders}</span>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Today's Revenue</p>
                  <p className="text-3xl font-bold text-gray-900">₹{stats.today.totalRevenue}</p>
                </div>
                <DollarSign className="w-12 h-12 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.allTime.totalOrders}</p>
                </div>
                <TrendingUp className="w-12 h-12 text-purple-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-3xl font-bold text-gray-900">₹{stats.allTime.totalRevenue}</p>
                </div>
                <Users className="w-12 h-12 text-orange-500" />
              </div>
            </div>
          </div>
        )}

        {/* Delivery Summary Card */}
        {activeTab === 'delivery' && deliverySummary && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Summary for {deliverySummary.date}</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{deliverySummary.totalActiveOrders}</div>
                <div className="text-sm text-gray-500">Active Orders</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{deliverySummary.totalWithDeliveries}</div>
                <div className="text-sm text-gray-500">With Deliveries</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{deliverySummary.deliveryBreakdown.breakfast}</div>
                <div className="text-sm text-gray-500">Breakfast</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{deliverySummary.deliveryBreakdown.lunch}</div>
                <div className="text-sm text-gray-500">Lunch</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">{deliverySummary.deliveryBreakdown.dinner}</div>
                <div className="text-sm text-gray-500">Dinner</div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6 overflow-x-auto">
              {['new', 'old', 'all', 'skip', 'delivery'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as typeof activeTab)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab === 'new' && 'New Orders (Today)'}
                  {tab === 'old' && 'Old Orders'}
                  {tab === 'all' && 'All Orders'}
                  {tab === 'skip' && 'Skip Orders'}
                  {tab === 'delivery' && 'Final Delivery'}
                </button>
              ))}
            </nav>
          </div>

          {/* Search and Filters */}
          <div className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by customer name, phone, menu, or city..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Date Filter */}
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filters for Final Delivery Tab */}
            {activeTab === 'delivery' && (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                <select
                  value={filters.dietaryPreference}
                  onChange={(e) => setFilters((prev) => ({ ...prev, dietaryPreference: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Diet Types</option>
                  <option value="veg">Vegetarian</option>
                  <option value="non-veg">Non-Vegetarian</option>
                </select>

                <input
                  type="text"
                  placeholder="City"
                  value={filters.city}
                  onChange={(e) => setFilters((prev) => ({ ...prev, city: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />

                <select
                  value={filters.addressType}
                  onChange={(e) => setFilters((prev) => ({ ...prev, addressType: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Lodge or Home</option>
                  <option value="lodge">Lodge/PG</option>
                  <option value="home">Home</option>
                </select>

                <input
                  type="text"
                  placeholder="Customer Name"
                  value={filters.customerName}
                  onChange={(e) => setFilters((prev) => ({ ...prev, customerName: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />

                <select
                  value={mealFilter}
                  onChange={(e) => setMealFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Meals</option>
                  <option value="breakfast">Breakfast Only</option>
                  <option value="lunch">Lunch Only</option>
                  <option value="dinner">Dinner Only</option>
                </select>

                <button
                  onClick={() => {
                    setFilters({
                      dietaryPreference: '',
                      city: '',
                      addressType: '',
                      customerName: '',
                      mealType: '',
                      dayName: '',
                    });
                    setSelectedDate('');
                    setMealFilter('');
                  }}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* Export Buttons for Delivery Tab */}
            {activeTab === 'delivery' && (
              <div className="flex flex-wrap gap-2 mb-6">
                <button
                  onClick={handlePrint}
                  disabled={exporting}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print</span>
                </button>

                <button
                  onClick={() => handleExport('excel')}
                  disabled={exporting}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>{exporting ? 'Exporting...' : 'Export Excel'}</span>
                </button>

                <button
                  onClick={() => handleExport('csv')}
                  disabled={exporting}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  <span>{exporting ? 'Exporting...' : 'Export CSV'}</span>
                </button>

                <button
                  onClick={() => handleExport('pdf')}
                  disabled={exporting}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  <FileText className="w-4 h-4" />
                  <span>{exporting ? 'Generating...' : 'Export PDF'}</span>
                </button>
              </div>
            )}

            {/* Orders Display */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
                  <span className="ml-2 text-gray-600">Loading orders...</span>
                </div>
              ) : filteredData.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Orders Found</h3>
                  <p className="text-gray-600">There are no orders matching your criteria.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  {/* Final Delivery Orders Table with Print Content */}
                  {activeTab === 'delivery' && (
                    <>
                      <div id="print-content" className="hidden">
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr>
                              <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2' }}>Sr. No.</th>
                              <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2' }}>Customer Name</th>
                              <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2' }}>Phone</th>
                              <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2' }}>Menu Type</th>
                              <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2' }}>Address</th>
                              <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2' }}>Meals to Deliver</th>
                              <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2' }}>Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(filteredData as FinalDeliveryOrder[]).map((order, index) => (
                              <tr key={order._id}>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{index + 1}</td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{order.customerName}</td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{order.customerPhone}</td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }} className={order.dietaryPreference === 'veg' ? 'veg' : 'non-veg'}>
                                  {order.menuTitle} ({order.dietaryPreference.toUpperCase()})
                                </td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                  {`${order.address?.homeLodgeName || ''}, ${order.address?.block || ''}, ${order.address?.district || ''}, ${order.address?.city || ''}`.replace(/,\s*,/g, ',').replace(/^,\s*|,\s*$/g, '')}
                                </td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                  {order.deliveryStatus.breakfast && <span className="meal-badge breakfast">Breakfast</span>}
                                  {order.deliveryStatus.lunch && <span className="meal-badge lunch">Lunch</span>}
                                  {order.deliveryStatus.dinner && <span className="meal-badge dinner">Dinner</span>}
                                </td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>₹{order.totalAmount}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Menu Details</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Skip Info</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {(filteredData as FinalDeliveryOrder[]).map((order) => (
                            <tr key={order._id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{order.customerName}</div>
                                  <div className="text-sm text-gray-500">{order.customerPhone}</div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div>
                                  <div className="text-sm font-medium text-gray-900 flex items-center">
                                    <span className={`inline-block w-3 h-3 rounded-full mr-2 ${order.dietaryPreference === 'veg' ? 'bg-green-400' : 'bg-red-400'}`}></span>
                                    {order.menuTitle}
                                  </div>
                                  <div className="text-sm text-gray-500">{getMealTypeDisplay(order.menuCategory)}</div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-900">{order.address?.homeLodgeName || 'Address not provided'}</div>
                                <div className="text-sm text-gray-500">{order.address?.city || 'City not specified'}</div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex flex-col space-y-1">
                                  {order.deliveryStatus.breakfast && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                      <Coffee className="w-3 h-3 mr-1" />
                                      Breakfast
                                    </span>
                                  )}
                                  {order.deliveryStatus.lunch && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                      <Sun className="w-3 h-3 mr-1" />
                                      Lunch
                                    </span>
                                  )}
                                  {order.deliveryStatus.dinner && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                      <Moon className="w-3 h-3 mr-1" />
                                      Dinner
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                {order.skipInfo ? (
                                  <div className="text-xs space-y-1">
                                    {getMealsFromCategory(order.menuCategory).breakfast && (
                                      <div className={order.skipInfo.breakfast ? 'text-green-600' : 'text-red-600'}>
                                        B: {order.skipInfo.breakfast ? 'Deliver' : 'Skip'}
                                      </div>
                                    )}
                                    {getMealsFromCategory(order.menuCategory).lunch && (
                                      <div className={order.skipInfo.lunch ? 'text-green-600' : 'text-red-600'}>
                                        L: {order.skipInfo.lunch ? 'Deliver' : 'Skip'}
                                      </div>
                                    )}
                                    {getMealsFromCategory(order.menuCategory).dinner && (
                                      <div className={order.skipInfo.dinner ? 'text-green-600' : 'text-red-600'}>
                                        D: {order.skipInfo.dinner ? 'Deliver' : 'Skip'}
                                      </div>
                                    )}
                                    {order.skipInfo.notes && (
                                      <div className="text-gray-500 italic">{order.skipInfo.notes}</div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="text-sm text-gray-500">No skip preferences</div>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">₹{order.totalAmount}</div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </>
                  )}

                  {/* Skip Orders Table */}
                  {activeTab === 'skip' && (
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Skip Preferences</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active Orders</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {(filteredData as SkipOrder[]).map((skipOrder) => (
                          <tr key={skipOrder._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{skipOrder.customerName}</div>
                                <div className="text-sm text-gray-500">{skipOrder.customerPhone}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{formatDate(skipOrder.date)}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-wrap gap-2">
                                {skipOrder.customerOrders.map((order, orderIdx) => {
                                  const orderMeals = getMealsFromCategory(order.menuCategory);
                                  return (
                                    <div key={orderIdx} className="mb-2 p-2 border rounded-lg bg-gray-50">
                                      <div className="text-xs text-gray-600 mb-1 font-medium">
                                        {order.menuTitle} ({getMealTypeDisplay(order.menuCategory)})
                                      </div>
                                      <div className="flex gap-1">
                                        {orderMeals.breakfast && skipOrder.orderedMeals.breakfast && (
                                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${skipOrder.breakfast !== undefined && skipOrder.breakfast ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            <Coffee className="w-3 h-3 mr-1" />
                                            B: {skipOrder.breakfast !== undefined && skipOrder.breakfast ? 'Deliver' : 'Skip'}
                                          </span>
                                        )}
                                        {orderMeals.lunch && skipOrder.orderedMeals.lunch && (
                                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${skipOrder.lunch !== undefined && skipOrder.lunch ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            <Sun className="w-3 h-3 mr-1" />
                                            L: {skipOrder.lunch !== undefined && skipOrder.lunch ? 'Deliver' : 'Skip'}
                                          </span>
                                        )}
                                        {orderMeals.dinner && skipOrder.orderedMeals.dinner && (
                                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${skipOrder.dinner !== undefined && skipOrder.dinner ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            <Moon className="w-3 h-3 mr-1" />
                                            D: {skipOrder.dinner !== undefined && skipOrder.dinner ? 'Deliver' : 'Skip'}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="space-y-1">
                                {skipOrder.customerOrders.map((order, idx) => (
                                  <div key={idx} className="text-sm text-gray-600">
                                    <span className={`inline-block w-2 h-2 rounded-full mr-2 ${order.dietaryPreference === 'veg' ? 'bg-green-400' : 'bg-red-400'}`}></span>
                                    {order.menuTitle} ({order.menuCategory})
                                  </div>
                                ))}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-600 max-w-xs">{skipOrder.notes || 'No notes'}</div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  {/* Regular Orders Table */}
                  {(activeTab === 'new' || activeTab === 'old' || activeTab === 'all') && (
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Menu Details</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {(filteredData as Order[]).map((order) => (
                          <tr key={order._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{order.customerName}</div>
                                <div className="text-sm text-gray-500">{order.customerPhone}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <div className="text-sm font-medium text-gray-900 flex items-center">
                                  <span className={`inline-block w-3 h-3 rounded-full mr-2 ${order.dietaryPreference === 'veg' ? 'bg-green-400' : 'bg-red-400'}`}></span>
                                  {order.menuTitle}
                                </div>
                                <div className="text-sm text-gray-500">{order.subscriptionType === 'trial' ? '1 Day Trial' : 'Monthly Plan'}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">{order.address?.homeLodgeName || 'Address not provided'}</div>
                              <div className="text-sm text-gray-500">{order.address?.city || 'City not specified'}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">₹{order.totalAmount}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex flex-col space-y-1">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.paymentStatus)}`}>
                                  {getStatusIcon(order.paymentStatus)}
                                  <span className="ml-1">{order.paymentStatus.toUpperCase()}</span>
                                </span>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}>
                                  {getStatusIcon(order.orderStatus)}
                                  <span className="ml-1">{order.orderStatus.toUpperCase()}</span>
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{formatDate(order.orderDate)}</div>
                              {order.subscriptionType === 'monthly' && (
                                <div className="text-xs text-gray-500">Ends: {formatDate(order.endDate)}</div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                {order.orderStatus === 'active' && (
                                  <button
                                    onClick={() => updateOrderStatus(order._id, 'completed')}
                                    className="text-green-600 hover:text-green-900 transition-colors"
                                    title="Mark as Completed"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </button>
                                )}
                                {order.orderStatus === 'pending' && (
                                  <button
                                    onClick={() => updateOrderStatus(order._id, 'active')}
                                    className="text-blue-600 hover:text-blue-900 transition-colors"
                                    title="Activate Order"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </button>
                                )}
                                {(order.orderStatus === 'active' || order.orderStatus === 'pending') && (
                                  <button
                                    onClick={() => updateOrderStatus(order._id, 'cancelled')}
                                    className="text-red-600 hover:text-red-900 transition-colors"
                                    title="Cancel Order"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>

            {/* Summary for Different Tabs */}
            {activeTab === 'skip' && filteredData.length > 0 && (
              <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{filteredData.length}</div>
                    <div className="text-sm text-gray-500">Total Skip Orders</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {(filteredData as SkipOrder[]).reduce((count, order) => {
                        return count + order.customerOrders.reduce((orderCount, customerOrder) => {
                          const orderMeals = getMealsFromCategory(customerOrder.menuCategory);
                          return orderCount + (orderMeals.breakfast && order.orderedMeals.breakfast && !order.breakfast ? 1 : 0);
                        }, 0);
                      }, 0)}
                    </div>
                    <div className="text-sm text-gray-500">Breakfast Skips</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {(filteredData as SkipOrder[]).reduce((count, order) => {
                        return count + order.customerOrders.reduce((orderCount, customerOrder) => {
                          const orderMeals = getMealsFromCategory(customerOrder.menuCategory);
                          return orderCount + (orderMeals.lunch && order.orderedMeals.lunch && !order.lunch ? 1 : 0);
                        }, 0);
                      }, 0)}
                    </div>
                    <div className="text-sm text-gray-500">Lunch Skips</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {(filteredData as SkipOrder[]).reduce((count, order) => {
                        return count + order.customerOrders.reduce((orderCount, customerOrder) => {
                          const orderMeals = getMealsFromCategory(customerOrder.menuCategory);
                          return orderCount + (orderMeals.dinner && order.orderedMeals.dinner && !order.dinner ? 1 : 0);
                        }, 0);
                      }, 0)}
                    </div>
                    <div className="text-sm text-gray-500">Dinner Skips</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab !== 'skip' && activeTab !== 'delivery' && (
              <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{filteredData.length}</div>
                    <div className="text-sm text-gray-500">Total Orders</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      ₹{(filteredData as Order[]).reduce((sum, order) => sum + order.totalAmount, 0)}
                    </div>
                    <div className="text-sm text-gray-500">Total Amount</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {(filteredData as Order[]).filter(order => order.subscriptionType === 'monthly').length}
                    </div>
                    <div className="text-sm text-gray-500">Monthly Plans</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {(filteredData as Order[]).filter(order => order.subscriptionType === 'trial').length}
                    </div>
                    <div className="text-sm text-gray-500">Trial Orders</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDashboard;