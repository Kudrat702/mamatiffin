// services/messageService.ts - FIXED VERSION
import { API_BASE_URL } from '../src/configapi/api'; // Fixed path - remove src/

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

// FIXED: Match backend response structure
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

class MessageService {
  private async makeRequest<T = ApiResponse>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    try {
      console.log('Making API request to:', `${API_URL}${endpoint}`);
      
      const response = await fetch(`${API_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json() as T;
      console.log('API response:', data);

      return data;
    } catch (error) {
      console.error('API Request failed:', error);
      console.error('Endpoint:', `${API_URL}${endpoint}`);
      throw error;
    }
  }

  // Submit contact form (public)
  async submitContactForm(formData: ContactFormData): Promise<MessageResponse> {
    return this.makeRequest<MessageResponse>('/api/messages', {
      method: 'POST',
      body: JSON.stringify(formData),
    });
  }

  // FIXED: Get all messages with proper response handling
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
      
      const response = await this.makeRequest<MessagesListResponse>(endpoint);
      
      // Handle backend response structure - normalize if needed
      if (response.data && response.pagination) {
        // Backend returns pagination outside data object
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

  // Get single message by ID (admin)
  async getMessageById(id: string): Promise<MessageResponse> {
    try {
      const response = await this.makeRequest<MessageResponse>(`/api/messages/${id}`);
      
      // Mark as read when viewed
      if (response.success && response.data) {
        await this.updateMessageStatus(id, 'read').catch(console.error);
      }
      
      return response;
    } catch (error) {
      console.error('Error in getMessageById:', error);
      throw error;
    }
  }

  // Update message status (admin)
  async updateMessageStatus(id: string, status: string): Promise<MessageResponse> {
    return this.makeRequest<MessageResponse>(`/api/messages/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // Reply to message (admin)
  async replyToMessage(id: string, adminReply: string): Promise<MessageResponse> {
    return this.makeRequest<MessageResponse>(`/api/messages/${id}/reply`, {
      method: 'PATCH',
      body: JSON.stringify({ adminReply }),
    });
  }

  // Delete message (admin)
  async deleteMessage(id: string): Promise<MessageResponse> {
    return this.makeRequest<MessageResponse>(`/api/messages/${id}`, {
      method: 'DELETE',
    });
  }

  // FIXED: Get message statistics with proper error handling
  async getMessageStats(): Promise<MessageStats> {
    try {
      // Try dedicated stats endpoint first
      const statsResponse = await this.makeRequest<{
        success: boolean;
        data: MessageStats;
      }>('/api/messages/stats/summary');
      
      if (statsResponse.success && statsResponse.data) {
        return statsResponse.data;
      }
      
      // Fallback to messages endpoint
      const response = await this.getMessages({ limit: 1 });
      return response.data.stats;
    } catch (error) {
      console.error('Error getting message stats:', error);
      // Return default stats on error
      return { unread: 0, read: 0, replied: 0, total: 0 };
    }
  }

  // Mark multiple messages as read (admin)
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

  // Delete multiple messages (admin)
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

  // Search messages by text (admin)
  async searchMessages(searchText: string, filters: Omit<MessageFilters, 'search'> = {}): Promise<MessagesListResponse> {
    return this.getMessages({
      ...filters,
      search: searchText,
    });
  }

  // Get messages by status (admin)
  async getMessagesByStatus(status: string, filters: Omit<MessageFilters, 'status'> = {}): Promise<MessagesListResponse> {
    return this.getMessages({
      ...filters,
      status,
    });
  }

  // Get messages by subject (admin)
  async getMessagesBySubject(subject: string, filters: Omit<MessageFilters, 'subject'> = {}): Promise<MessagesListResponse> {
    return this.getMessages({
      ...filters,
      subject,
    });
  }

  // Get recent messages (admin)
  async getRecentMessages(limit: number = 10): Promise<MessagesListResponse> {
    return this.getMessages({
      limit,
      page: 1,
    });
  }

  // FIXED: Get unread count with better error handling
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