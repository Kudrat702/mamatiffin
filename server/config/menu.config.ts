export const MENU_CONFIG = {
  // Search configuration
  FUZZY_MATCH_THRESHOLD: 0.6,
  MAX_SEARCH_PATTERNS: 10,
  CACHE_TTL: 300000, // 5 minutes in milliseconds

  // Default values
  DEFAULT_DELIVERY_TIME: '30-45 minutes',
  DEFAULT_VEG_PRICE: 299,
  DEFAULT_NON_VEG_PRICE: 399,
  TRIAL_PRICE_MULTIPLIER: 0.6,

  // Validation
  ALLOWED_CATEGORIES: ['veg', 'non-veg'] as const,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],

  // Pagination
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,

  // Security
  MAX_SEARCH_LENGTH: 100,
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: 100,

  // Error messages
  ERRORS: {
    INVALID_CATEGORY: 'Invalid diet preference. Must be "veg" or "non-veg"',
    CATEGORY_REQUIRED: 'Category is required',
    MENU_TYPE_REQUIRED: 'MenuType is required',
    MENU_NOT_FOUND: 'Menu not found',
    INVALID_FILE_TYPE: 'Invalid file type. Only image files are allowed.',
    FILE_TOO_LARGE: 'File size too large. Maximum size is 5MB.',
    SERVER_ERROR: 'Internal server error',
    DATABASE_ERROR: 'Database connection failed'
  }
} as const;

export type AllowedCategory = typeof MENU_CONFIG.ALLOWED_CATEGORIES[number];