// CatalogItem Types
export interface CatalogItem {
  _id: string;
  category: string;
  imageUrl: string;
  price: number;
  type: 'veg' | 'non-veg';
  createdAt?: string | undefined;
  updatedAt?: string | undefined;
  description?: string | undefined;
  isActive?: boolean | undefined;
  tags?: string[] | undefined;
}

// Form Data for Creating/Updating Items
export interface FormData {
  category: string;
  imageUrl: string;
  price: string;
  description?: string | undefined;
}

// API Response Structure
export interface ApiResponse<T> {
  success: boolean;
  data?: T | undefined;
  message?: string | undefined;
  error?: string | undefined;
}

// Category Options
export type CategoryType = 
  | 'Breakfast'
  | 'Lunch'
  | 'Dinner'
  | 'Breakfast + Lunch'
  | 'Breakfast + Dinner'
  | 'Lunch + Dinner'
  | 'Breakfast + Lunch + Dinner';

// Menu Type
export type MenuType = 'veg' | 'non-veg';

// Create Item Request
export interface CreateCatalogItemRequest {
  category: CategoryType;
  imageUrl: string;
  price: number;
  type: MenuType;
  description?: string | undefined;
  tags?: string[] | undefined;
}

// Update Item Request
export interface UpdateCatalogItemRequest {
  category?: CategoryType | undefined;
  imageUrl?: string | undefined;
  price?: number | undefined;
  description?: string | undefined;
  tags?: string[] | undefined;
  isActive?: boolean | undefined;
}

// Filter Options
export interface FilterOptions {
  type?: MenuType | undefined;
  category?: CategoryType | undefined;
  minPrice?: number | undefined;
  maxPrice?: number | undefined;
  isActive?: boolean | undefined;
}

// Sort Options
export interface SortOptions {
  field: 'price' | 'category' | 'createdAt' | 'updatedAt';
  direction: 'asc' | 'desc';
}

// Pagination
export interface PaginationOptions {
  page: number;
  limit: number;
}

// Paginated Response
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    current: number;
    total: number;
    pages: number;
    limit: number;
  };
  message?: string | undefined;
}

// Error Response
export interface ErrorResponse {
  success: false;
  error: string;
  message: string;
  statusCode?: number | undefined;
}

// Menu Statistics
export interface MenuStats {
  totalItems: number;
  vegItems: number;
  nonVegItems: number;
  categories: Record<CategoryType, number>;
  averagePrice: {
    overall: number;
    veg: number;
    nonVeg: number;
  };
}

// Constants
export const CATEGORIES: readonly CategoryType[] = [
  'Breakfast',
  'Lunch',
  'Dinner',
  'Breakfast + Lunch',
  'Breakfast + Dinner',
  'Lunch + Dinner',
  'Breakfast + Lunch + Dinner'
] as const;

export const MENU_TYPES: readonly MenuType[] = ['veg', 'non-veg'] as const;

// Default Values
export const DEFAULT_CATALOG_ITEM: Partial<CatalogItem> = {
  isActive: true,
  tags: [],
  description: ''
};

export const DEFAULT_FORM_DATA: FormData = {
  category: '',
  imageUrl: '',
  price: '',
  description: ''
};

// Validation Rules
export const VALIDATION_RULES = {
  category: {
    required: true,
    allowedValues: CATEGORIES
  },
  imageUrl: {
    required: true,
    pattern: /^https?:\/\/.+\..+/,
    message: 'Please enter a valid URL'
  },
  price: {
    required: true,
    min: 0,
    max: 10000,
    message: 'Price must be between 0 and 10000'
  },
  description: {
    required: false,
    maxLength: 500,
    message: 'Description cannot exceed 500 characters'
  }
} as const;

// Helper Functions
export const validateCatalogItem = (item: Partial<CatalogItem>): string[] => {
  const errors: string[] = [];

  if (!item.category) {
    errors.push('Category is required');
  } else if (!CATEGORIES.includes(item.category as CategoryType)) {
    errors.push('Invalid category selected');
  }

  if (!item.imageUrl) {
    errors.push('Image URL is required');
  } else if (!VALIDATION_RULES.imageUrl.pattern.test(item.imageUrl)) {
    errors.push(VALIDATION_RULES.imageUrl.message);
  }

  if (item.price === undefined || item.price === null) {
    errors.push('Price is required');
  } else if (item.price < VALIDATION_RULES.price.min || item.price > VALIDATION_RULES.price.max) {
    errors.push(VALIDATION_RULES.price.message);
  }

  if (item.description && item.description.length > VALIDATION_RULES.description.maxLength) {
    errors.push(VALIDATION_RULES.description.message);
  }

  return errors;
};

export const formatPrice = (price: number): string => {
  return `₹${price.toLocaleString('en-IN')}`;
};

export const getCategoryDisplayName = (category: CategoryType): string => {
  return category;
};

export const getMenuTypeColor = (type: MenuType): 'green' | 'red' => {
  return type === 'veg' ? 'green' : 'red';
};

export const getMenuTypeIcon = (type: MenuType): '🌱' | '🍖' => {
  return type === 'veg' ? '🌱' : '🍖';
};

export const getMenuTypeLabel = (type: MenuType): 'VEG' | 'NON-VEG' => {
  return type === 'veg' ? 'VEG' : 'NON-VEG';
};

// Type guards for runtime type checking
export const isCatalogItem = (obj: unknown): obj is CatalogItem => {
  if (typeof obj !== 'object' || obj === null) return false;
  
  const item = obj as Record<string, unknown>;
  
  return (
    typeof item._id === 'string' &&
    typeof item.category === 'string' &&
    typeof item.imageUrl === 'string' &&
    typeof item.price === 'number' &&
    (item.type === 'veg' || item.type === 'non-veg')
  );
};

export const isCategoryType = (value: string): value is CategoryType => {
  return CATEGORIES.includes(value as CategoryType);
};

export const isMenuType = (value: string): value is MenuType => {
  return MENU_TYPES.includes(value as MenuType);
};

// Utility functions
export const createEmptyFormData = (): FormData => ({
  category: '',
  imageUrl: '',
  price: '',
  description: ''
});

export const createCatalogItemFromForm = (
  formData: FormData, 
  type: MenuType): Omit<CatalogItem, '_id' | 'createdAt' | 'updatedAt'> => {
  return {
    category: formData.category,
    imageUrl: formData.imageUrl,
    price: parseFloat(formData.price),
    type,
    description: formData.description || '',
    isActive: true,
    tags: []
  };
};

export const convertCatalogItemToFormData = (item: CatalogItem): FormData => {
  return {
    category: item.category,
    imageUrl: item.imageUrl,
    price: item.price.toString(),
    description: item.description || ''
  };
};

// Price utilities
export const calculateTotalPrice = (items: CatalogItem[]): number => {
  return items.reduce((total, item) => total + item.price, 0);
};

export const getAveragePrice = (items: CatalogItem[]): number => {
  if (items.length === 0) return 0;
  return calculateTotalPrice(items) / items.length;
};

export const filterItemsByType = (items: CatalogItem[], type: MenuType): CatalogItem[] => {
  return items.filter(item => item.type === type);
};

export const filterItemsByCategory = (items: CatalogItem[], category: CategoryType): CatalogItem[] => {
  return items.filter(item => item.category === category);
};

export const sortItemsByPrice = (items: CatalogItem[], direction: 'asc' | 'desc' = 'asc'): CatalogItem[] => {
  return [...items].sort((a, b) => {
    return direction === 'asc' ? a.price - b.price : b.price - a.price;
  });
};

// Error handling utilities
export const createErrorResponse = (message: string, statusCode?: number | undefined): ErrorResponse => {
  return {
    success: false,
    error: 'VALIDATION_ERROR',
    message,
    statusCode
  };
};

export const createSuccessResponse = <T>(data: T, message?: string | undefined): ApiResponse<T> => {
  return {
    success: true,
    data,
    message
  };
};

// Menu statistics calculator
export const calculateMenuStats = (items: CatalogItem[]): MenuStats => {
  const vegItems = filterItemsByType(items, 'veg');
  const nonVegItems = filterItemsByType(items, 'non-veg');
  
  const categories = CATEGORIES.reduce((acc, category) => {
    acc[category] = filterItemsByCategory(items, category).length;
    return acc;
  }, {} as Record<CategoryType, number>);

  return {
    totalItems: items.length,
    vegItems: vegItems.length,
    nonVegItems: nonVegItems.length,
    categories,
    averagePrice: {
      overall: getAveragePrice(items),
      veg: getAveragePrice(vegItems),
      nonVeg: getAveragePrice(nonVegItems)
    }
  };
};