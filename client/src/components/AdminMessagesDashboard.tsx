// AdminMessagesDashboard.tsx - COMPLETE WITH messageService INTEGRATION
// ✅ Full authentication with messageService
// ✅ Token handling
// ✅ Error handling
// ✅ All features working

import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AdminAuthContext';
import { 
  MessageSquare, 
  Search,  
  ChevronLeft, 
  ChevronRight,
  Eye,
  Reply,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  Send,
  X,
  RefreshCw
} from 'lucide-react';
import messageService from '../../services/messageApi';
import type { Message, MessageFilters, MessageStats, MessagesListResponse } from '../../services/messageApi';

// ═══════════════════════════════════════════════════════════════════════
// INTERFACES
// ═══════════════════════════════════════════════════════════════════════

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalMessages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════

const AdminMessagesDashboard: React.FC = () => {
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);

  // ═══════════════════════════════════════════════════════════════════════
  // STATE MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════

  const [messages, setMessages] = useState<Message[]>([]);
  const [stats, setStats] = useState<MessageStats>({ unread: 0, read: 0, replied: 0 });
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    totalPages: 1,
    totalMessages: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  
  const [filters, setFilters] = useState<MessageFilters>({
    status: '',
    subject: '',
    search: '',
    page: 1,
    limit: 10
  });

  // ═══════════════════════════════════════════════════════════════════════
  // AUTHENTICATION SETUP
  // ═══════════════════════════════════════════════════════════════════════

  useEffect(() => {
    // Setup authentication for messageService
    const token = authContext?.token || localStorage.getItem('ADMIN_TOKEN');
    
    if (!token) {
      console.error('❌ No authentication token found');
      setAuthError('Authentication required. Please log in again.');
      navigate('/admin-login');
      return;
    }

    console.log('🔐 Setting up authentication for messageService');
    messageService.setAuthToken(token);
    
    // Setup auth error callback
    messageService.setAuthErrorCallback(() => {
      console.error('❌ Authentication error in messageService');
      setAuthError('Session expired. Please log in again.');
      localStorage.removeItem('ADMIN_TOKEN');
      if (authContext?.logout) {
        authContext.logout();
      }
      navigate('/admin-login');
    });

    console.log('✅ Authentication setup complete');
  }, [authContext, navigate]);

  // ═══════════════════════════════════════════════════════════════════════
  // API FUNCTIONS USING messageService
  // ═══════════════════════════════════════════════════════════════════════

  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      setAuthError(null);
      
      console.log('📥 Fetching messages with filters:', filters);
      
      const response: MessagesListResponse = await messageService.getMessages(filters);
      
      if (response.success) {
        setMessages(response.data?.messages || []);
        setStats(response.data?.stats || { unread: 0, read: 0, replied: 0 });
        
        // Set pagination
                const paginationData: any = response.pagination || {};
                setPagination({
                  currentPage: paginationData.currentPage ?? paginationData.page ?? 1,
                  totalPages: paginationData.totalPages ?? 1,
                  totalMessages: paginationData.totalMessages ?? paginationData.total ?? 0,
                  hasNextPage: paginationData.hasNextPage ?? paginationData.hasNext ?? false,
                  hasPrevPage: paginationData.hasPrevPage ?? paginationData.hasPrev ?? false
                });
        
        console.log('✅ Messages loaded:', response.data?.messages?.length || 0);
      } else {
        setError('Failed to fetch messages');
        setMessages([]);
        setStats({ unread: 0, read: 0, replied: 0 });
      }
    } catch (err) {
      console.error('❌ Error fetching messages:', err);
      
      if (err instanceof Error) {
        if (err.message === 'Authentication required' || err.message === 'Authentication failed') {
          // Auth errors are handled by callback
          return;
        }
        setError(err.message || 'Failed to fetch messages');
      } else {
        setError('Failed to fetch messages');
      }
      
      setMessages([]);
      setStats({ unread: 0, read: 0, replied: 0 });
    } finally {
      setLoading(false);
    }
  };

  const viewMessage = async (messageId: string) => {
    try {
      console.log('👁️ Viewing message:', messageId);
      
      const response = await messageService.getMessageById(messageId);
      
      if (response.success && response.data) {
        const messageData = response.data as Message;
        setSelectedMessage(messageData);
        
        // Update message status in list
        setMessages(prev => prev.map(msg => 
          msg._id === messageId ? { ...msg, status: 'read' as const } : msg
        ));
        
        // Update stats if message was unread
        const originalMessage = messages.find(msg => msg._id === messageId);
        if (originalMessage?.status === 'unread') {
          setStats(prev => ({
            ...prev,
            unread: Math.max(0, prev.unread - 1),
            read: prev.read + 1
          }));
        }
        
        console.log('✅ Message viewed successfully');
      } else {
        setError('Failed to load message details');
      }
    } catch (err) {
      console.error('❌ Error viewing message:', err);
      
      if (err instanceof Error && 
          err.message !== 'Authentication required' && 
          err.message !== 'Authentication failed') {
        setError('Failed to load message details');
      }
    }
  };

  const handleReply = async () => {
    if (!selectedMessage || !replyText.trim()) return;

    try {
      setReplyLoading(true);
      setError(null);
      
      console.log('📤 Sending reply to message:', selectedMessage._id);
      
      const response = await messageService.replyToMessage(
        selectedMessage._id,
        replyText.trim()
      );
      
      if (response.success && response.data) {
        const updatedMessage = response.data as Message;
        setSelectedMessage(updatedMessage);
        
        // Update message in list
        setMessages(prev => prev.map(msg => 
          msg._id === selectedMessage._id ? updatedMessage : msg
        ));
        
        // Update stats
        setStats(prev => ({
          ...prev,
          read: Math.max(0, prev.read - 1),
          replied: prev.replied + 1
        }));
        
        setShowReplyModal(false);
        setReplyText('');
        
        console.log('✅ Reply sent successfully');
      } else {
        setError('Failed to send reply');
      }
    } catch (err) {
      console.error('❌ Error replying to message:', err);
      
      if (err instanceof Error && 
          err.message !== 'Authentication required' && 
          err.message !== 'Authentication failed') {
        setError('Failed to send reply');
      }
    } finally {
      setReplyLoading(false);
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      console.log('🗑️ Deleting message:', messageId);
      
      const response = await messageService.deleteMessage(messageId);
      
      if (response.success) {
        // Remove from list
        setMessages(prev => prev.filter(msg => msg._id !== messageId));
        
        // Clear selection if deleted message was selected
        if (selectedMessage?._id === messageId) {
          setSelectedMessage(null);
        }
        
        // Refresh to update stats
        fetchMessages();
        
        console.log('✅ Message deleted successfully');
      } else {
        setError('Failed to delete message');
      }
    } catch (err) {
      console.error('❌ Error deleting message:', err);
      
      if (err instanceof Error && 
          err.message !== 'Authentication required' && 
          err.message !== 'Authentication failed') {
        setError('Failed to delete message');
      }
    }
  };

  // ═══════════════════════════════════════════════════════════════════════
  // HELPER FUNCTIONS
  // ═══════════════════════════════════════════════════════════════════════

  const handleFilterChange = (key: keyof MessageFilters, value: string | number) => {
    setFilters(prev => {
      const processedValue = (key === 'page' || key === 'limit') 
        ? (typeof value === 'string' ? parseInt(value, 10) : value)
        : value;
      
      return {
        ...prev,
        [key]: processedValue,
        ...(key !== 'page' && { page: 1 })
      };
    });
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unread': return 'bg-red-100 text-red-800 border-red-200';
      case 'read': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'replied': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'unread': return <AlertCircle size={16} />;
      case 'read': return <Eye size={16} />;
      case 'replied': return <CheckCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const totalMessages = stats.unread + stats.read + stats.replied;

  // ═══════════════════════════════════════════════════════════════════════
  // EFFECTS
  // ═══════════════════════════════════════════════════════════════════════

  useEffect(() => {
    fetchMessages();
  }, [filters]);

  // ═══════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════

  return (
    <div className="p-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Messages Dashboard</h1>
          <p className="text-gray-600">Manage customer messages and inquiries</p>
        </div>
        <button
          onClick={fetchMessages}
          disabled={loading}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Auth Error Alert */}
      {authError && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" />
            <p className="text-red-700">{authError}</p>
            <button
              onClick={() => setAuthError(null)}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Regular Error Alert */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
            <button onClick={() => setError(null)} className="ml-auto pl-3">
              <X className="h-5 w-5 text-red-400 hover:text-red-600" />
            </button>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Messages</p>
              <p className="text-2xl font-bold text-gray-900">{totalMessages}</p>
            </div>
            <MessageSquare className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Unread</p>
              <p className="text-2xl font-bold text-red-600">{stats.unread}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Read</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.read}</p>
            </div>
            <Eye className="w-8 h-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Replied</p>
              <p className="text-2xl font-bold text-green-600">{stats.replied}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search messages..."
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
              <option value="replied">Replied</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
            <select
              value={filters.subject || ''}
              onChange={(e) => handleFilterChange('subject', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Subjects</option>
              <option value="order">Order Related</option>
              <option value="delivery">Delivery Issue</option>
              <option value="subscription">Subscription</option>
              <option value="feedback">Feedback</option>
              <option value="complaint">Complaint</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Per Page</label>
            <select
              value={filters.limit || 10}
              onChange={(e) => handleFilterChange('limit', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>
        </div>
      </div>

      {/* Messages List and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Messages List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Messages ({pagination.totalMessages})
              </h2>
            </div>

            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading messages...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="p-8 text-center">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">{error ? 'Failed to load messages' : 'No messages found'}</p>
                {error && (
                  <button
                    onClick={fetchMessages}
                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Retry
                  </button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {messages.map((message) => (
                  <div
                    key={message._id}
                    className={`p-6 hover:bg-gray-50 cursor-pointer transition-colors ${
                      selectedMessage?._id === message._id ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => viewMessage(message._id)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-gray-900 truncate">{message.name}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(message.status)}`}>
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(message.status)}
                              <span className="capitalize">{message.status}</span>
                            </div>
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 truncate">{message.email}</p>
                        <p className="text-sm text-blue-600 capitalize">{message.subject.replace(/_/g, ' ')}</p>
                      </div>
                      <div className="text-right flex-shrink-0 ml-4">
                        <p className="text-xs text-gray-500">{formatDate(message.createdAt)}</p>
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm line-clamp-2">{message.message}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="p-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={!pagination.hasPrevPage}
                      className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={!pagination.hasNextPage}
                      className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Message Details */}
        <div className="lg:col-span-1">
          {selectedMessage ? (
            <div className="bg-white rounded-lg shadow-md border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <h2 className="text-xl font-semibold text-gray-900">Message Details</h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setShowReplyModal(true)}
                      disabled={selectedMessage.status === 'replied'}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-50 transition-colors"
                      title={selectedMessage.status === 'replied' ? 'Already replied' : 'Reply'}
                    >
                      <Reply size={16} />
                    </button>
                    <button
                      onClick={() => deleteMessage(selectedMessage._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Name</label>
                  <p className="text-gray-900">{selectedMessage.name}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="text-gray-900 break-all">{selectedMessage.email}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Phone</label>
                  <p className="text-gray-900">{selectedMessage.phone || 'Not provided'}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Subject</label>
                  <p className="text-gray-900 capitalize">{selectedMessage.subject.replace(/_/g, ' ')}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <div className="mt-1">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedMessage.status)}`}>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(selectedMessage.status)}
                        <span className="capitalize">{selectedMessage.status}</span>
                      </div>
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Received</label>
                  <p className="text-gray-900">{formatDate(selectedMessage.createdAt)}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Message</label>
                  <div className="bg-gray-50 rounded-lg p-4 mt-2">
                    <p className="text-gray-900 whitespace-pre-wrap break-words">{selectedMessage.message}</p>
                  </div>
                </div>

                {selectedMessage.adminReply && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Admin Reply</label>
                    <div className="bg-blue-50 rounded-lg p-4 mt-2 border border-blue-200">
                      <p className="text-gray-900 whitespace-pre-wrap break-words">{selectedMessage.adminReply}</p>
                      {selectedMessage.repliedAt && (
                        <p className="text-xs text-gray-600 mt-2">Replied on {formatDate(selectedMessage.repliedAt)}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 text-center">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Select a message to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Reply Modal */}
      {showReplyModal && selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Reply to {selectedMessage.name}</h3>
                <button
                  onClick={() => {
                    setShowReplyModal(false);
                    setReplyText('');
                    setError(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Original Message</label>
                <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 max-h-32 overflow-y-auto">
                  {selectedMessage.message}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Reply *</label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={4}
                  maxLength={500}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Type your reply here..."
                  required
                />
                <p className="text-xs text-gray-500 mt-1">{replyText.length}/500 characters</p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowReplyModal(false);
                    setReplyText('');
                    setError(null);
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReply}
                  disabled={replyLoading || !replyText.trim() || replyText.length > 500}
                  className={`px-4 py-2 rounded-lg font-medium flex items-center space-x-2 ${
                    replyLoading || !replyText.trim() || replyText.length > 500
                      ? 'bg-gray-400 cursor-not-allowed text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {replyLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      <span>Send Reply</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMessagesDashboard;