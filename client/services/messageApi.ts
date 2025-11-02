// services/messageService.ts - WITH AUTHENTICATION SUPPORT
import { API_BASE_URL } from '../src/configapi/api';

const API_URL = API_BASE_URL;

export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export interface Message {
  _id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  createdAt: string;
  updatedAt: string;
  adminReply?: string;
  repliedAt?: string;
}

export interface MessageFilters {
  status?: string;
  subject?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface MessageResponse {
  success: boolean;
  message: string;
  data?: Message | Message[] | Record<string, unknown>;
  errors?: string[] | Record<string, string>[];
}

export interface MessagesListResponse {
  success: boolean;
  data: {
    messages: Message[];
    stats: {
      unread: number;
      read: number;
      replied: number;
      total?: number;
    };
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
    currentPage?: number;
    totalMessages?: number;
    hasNextPage?: boolean;
    hasPrevPage?: boolean;
  };
  filters?: {
    status: string;
    type: string;
  };
  message?: string;
}

export interface MessageStats {
  unread: number;
  read: number;
  replied: number;
  total?: number;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data?: unknown;
  errors?: string[] | Record<string, string>[];
}

// ═══════════════════════════════════════════════════════════════════════
// MESSAGE SERVICE CLASS WITH AUTHENTICATION
// ═══════════════════════════════════════════════════════════════════════

class MessageService {
  private authToken: string | null = null;
  private onAuthError?: () => void;

  // Set authentication token
  setAuthToken(token: string | null) {
    this.authToken = token;
    console.log('🔐 Auth token set:', token ? 'Token present' : 'No token');
  }

  // Set auth error callback
  setAuthErrorCallback(callback: () => void) {
    this.onAuthError = callback;
  }

  // Get auth token from multiple sources
  private getAuthToken(): string | null {
    if (this.authToken) {
      return this.authToken;
    }
    
    const localToken = localStorage.getItem('ADMIN_TOKEN');
    if (localToken) {
      this.authToken = localToken;
      return localToken;
    }
    
    return null;
  }

  // Make authenticated request
  private async makeRequest<T = ApiResponse>(
    endpoint: string, 
    options: RequestInit = {},
    requireAuth: boolean = false
  ): Promise<T> {
    try {
      console.log('📡 Making API request to:', `${API_URL}${endpoint}`);
      
      const headersInit: HeadersInit = {
        'Content-Type': 'application/json',
        ...((options.headers as HeadersInit) || {}),
      };

      // Use a Headers instance so we can safely set header values
      const headers = new Headers(headersInit);

      // Add authentication headers if required
      if (requireAuth) {
        const token = this.getAuthToken();
        
        if (!token) {
          console.error('❌ No authentication token found');
          if (this.onAuthError) {
            this.onAuthError();
          }
          throw new Error('Authentication required');
        }

        headers.set('Authorization', `Bearer ${token}`);
        headers.set('x-auth-token', token);
        console.log('🔐 Auth headers added');
      }

      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
        credentials: 'include',
      });

      console.log('📊 Response status:', response.status);

      // Handle authentication errors
      if (response.status === 401 || response.status === 403) {
        console.error('❌ Authentication failed:', response.status);
        localStorage.removeItem('ADMIN_TOKEN');
        this.authToken = null;
        
        if (this.onAuthError) {
          this.onAuthError();
        }
        
        throw new Error('Authentication failed');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json() as T;
      console.log('✅ API response received');

      return data;
    } catch (error) {
      console.error('❌ API Request failed:', error);
      console.error('Endpoint:', `${API_URL}${endpoint}`);
      throw error;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // PUBLIC ENDPOINTS (No Auth Required)
  // ═══════════════════════════════════════════════════════════════════════

  async submitContactForm(formData: ContactFormData): Promise<MessageResponse> {
    return this.makeRequest<MessageResponse>('/api/messages', {
      method: 'POST',
      body: JSON.stringify(formData),
    }, false);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // ADMIN ENDPOINTS (Auth Required)
  // ═══════════════════════════════════════════════════════════════════════

  async getMessages(filters: MessageFilters = {}): Promise<MessagesListResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          queryParams.append(key, value.toString());
        }
      });

      const queryString = queryParams.toString();
      const endpoint = `/api/messages${queryString ? `?${queryString}` : ''}`;
      
      const response = await this.makeRequest<MessagesListResponse>(endpoint, {}, true);
      
      // Normalize response structure
      if (response.data && response.pagination) {
        return {
          ...response,
          data: {
            ...response.data,
            stats: response.data.stats || { unread: 0, read: 0, replied: 0 }
          }
        };
      }
      
      return response;
    } catch (error) {
      console.error('Error in getMessages:', error);
      throw error;
    }
  }

  async getMessageById(id: string): Promise<MessageResponse> {
    try {
      const response = await this.makeRequest<MessageResponse>(
        `/api/messages/${id}`, 
        {}, 
        true
      );
      
      return response;
    } catch (error) {
      console.error('Error in getMessageById:', error);
      throw error;
    }
  }

  async updateMessageStatus(id: string, status: string): Promise<MessageResponse> {
    return this.makeRequest<MessageResponse>(
      `/api/messages/${id}/status`, 
      {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      },
      true
    );
  }

  async replyToMessage(id: string, adminReply: string): Promise<MessageResponse> {
    return this.makeRequest<MessageResponse>(
      `/api/messages/${id}/reply`, 
      {
        method: 'PATCH',
        body: JSON.stringify({ adminReply }),
      },
      true
    );
  }

  async deleteMessage(id: string): Promise<MessageResponse> {
    return this.makeRequest<MessageResponse>(
      `/api/messages/${id}`, 
      {
        method: 'DELETE',
      },
      true
    );
  }

  async getMessageStats(): Promise<MessageStats> {
    try {
      const statsResponse = await this.makeRequest<{
        success: boolean;
        data: MessageStats;
      }>('/api/messages/stats/summary', {}, true);
      
      if (statsResponse.success && statsResponse.data) {
        return statsResponse.data;
      }
      
      const response = await this.getMessages({ limit: 1 });
      return response.data.stats;
    } catch (error) {
      console.error('Error getting message stats:', error);
      return { unread: 0, read: 0, replied: 0, total: 0 };
    }
  }

  async markMultipleAsRead(messageIds: string[]): Promise<MessageResponse[]> {
    const promises = messageIds.map(id => 
      this.updateMessageStatus(id, 'read')
    );
    
    return Promise.allSettled(promises).then(results =>
      results.map(result => 
        result.status === 'fulfilled' 
          ? result.value 
          : { success: false, message: 'Failed to update' }
      )
    );
  }

  async deleteMultipleMessages(messageIds: string[]): Promise<MessageResponse[]> {
    const promises = messageIds.map(id => this.deleteMessage(id));
    return Promise.allSettled(promises).then(results =>
      results.map(result => 
        result.status === 'fulfilled' 
          ? result.value 
          : { success: false, message: 'Failed to delete' }
      )
    );
  }

  async searchMessages(searchText: string, filters: Omit<MessageFilters, 'search'> = {}): Promise<MessagesListResponse> {
    return this.getMessages({
      ...filters,
      search: searchText,
    });
  }

  async getMessagesByStatus(status: string, filters: Omit<MessageFilters, 'status'> = {}): Promise<MessagesListResponse> {
    return this.getMessages({
      ...filters,
      status,
    });
  }

  async getMessagesBySubject(subject: string, filters: Omit<MessageFilters, 'subject'> = {}): Promise<MessagesListResponse> {
    return this.getMessages({
      ...filters,
      subject,
    });
  }

  async getRecentMessages(limit: number = 10): Promise<MessagesListResponse> {
    return this.getMessages({
      limit,
      page: 1,
    });
  }

  async getUnreadCount(): Promise<number> {
    try {
      const response = await this.getMessages({ status: 'unread', limit: 1 });
      return response.pagination?.total || response.pagination?.totalMessages || 0;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }
}

// Create a singleton instance
const messageService = new MessageService();

export default messageService;

// Hook for React components
export const useMessageService = () => {
  return messageService;
};