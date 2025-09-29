import { API_BASE_URL } from '../src/configapi/api';

const API_BASE_URL_WITH_API = `${API_BASE_URL}/api`;

export interface SignUpData {
  name: string;
  phone: string;
  password: string;
  address: {
    district: string;
    block: string;
    city: string;
    homeLodgeName: string;
  };
}

export interface SignInData {
  phone: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
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
  };
  errors?: string[];
}

export interface AddressOptionsResponse {
  success: boolean;
  data: {
    district: string;
    blocks: string[];
    cities: string[];
    homeLodgeNames: string[];
  }[];
}

class AuthService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL_WITH_API}${endpoint}`;
   
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
      },
    };
    const config = { ...defaultOptions, ...options };
    try {
      const response = await fetch(url, config);
      const data = await response.json();
     
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }
     
      return data;
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  async signUp(userData: SignUpData): Promise<AuthResponse> {
    return this.makeRequest<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async signIn(credentials: SignInData): Promise<AuthResponse> {
    return this.makeRequest<AuthResponse>('/auth/signin', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async getAddressOptions(): Promise<AddressOptionsResponse> {
    return this.makeRequest<AddressOptionsResponse>('/auth/address-options');
  }

  // Helper method to get auth headers for authenticated requests
  getAuthHeaders(token: string): Record<string, string> {
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  // Method to make authenticated requests
  async makeAuthenticatedRequest<T>(
    endpoint: string,
    token: string,
    options: RequestInit = {}
  ): Promise<T> {
    const authOptions = {
      ...options,
      headers: {
        ...this.getAuthHeaders(token),
        ...(options.headers || {}),
      },
    };
    return this.makeRequest<T>(endpoint, authOptions);
  }
}

export const authService = new AuthService();