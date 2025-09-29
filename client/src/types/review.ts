export interface Review {
  _id: string;
  userId: string;
  userName: string;
  userLocation: string;
  rating: number;
  title: string;
  comment: string;
  serviceType: 'veg-tiffin' | 'non-veg-tiffin' | 'delivery' | 'customer-support' | 'overall';
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface ReviewStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  averageRating: number;
}

export interface ReviewFormData {
  rating: number;
  title: string;
  comment: string;
  serviceType: 'veg-tiffin' | 'non-veg-tiffin' | 'delivery' | 'customer-support' | 'overall';
  userName: string;
  userLocation: string;
}

export interface PaginatedReviews {
  success: boolean;
  reviews: Review[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string | undefined;
  data?: T | undefined;
  errors?: unknown[] | undefined;
}