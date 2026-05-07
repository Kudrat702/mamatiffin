// types/menu.ts - NO FALLBACK - Only Admin's Exact Values

export interface WeeklyMenuDay {
  day: string;
  items: string[];
}

export interface Menu {
  _id: string;
  category: 'veg' | 'non-veg';
  menuType: string;
  title: string;
  description: string;
  imageUrl: string;
  imagePublicId?: string;
  deliveryTime: string;
  price?: number | undefined;
  priceMonthly: number;
  priceWeekly?: number;
  priceTrial: number;
  weeklyMenu: WeeklyMenuDay[];
  catalogItemId?: string | undefined;
  createdAt?: string | undefined;
  updatedAt?: string | undefined;
}

export interface MenuDetails {
  _id: string;
  category: 'veg' | 'non-veg';
  menuType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Breakfast + Lunch' | 'Breakfast + Dinner' | 'Lunch + Dinner' | 'Breakfast + Lunch + Dinner';
  title: string;
  description: string;
  imageUrl: string;
  imagePublicId?: string;
  deliveryTime: string;
  priceMonthly: number;
  priceWeekly?: number;
  priceTrial: number;
  weeklyMenu: WeeklyMenuDay[];
  catalogItemId?: string | undefined;
  createdAt?: string | undefined;
  updatedAt?: string | undefined;
}

export interface CatalogItem {
  _id: string;
  category: string;
  imageUrl: string;
  imagePublicId?: string;
  price: number;
  type: 'veg' | 'non-veg';
  menuDetailId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MenuResponse {
  success: boolean;
  message: string;
  data?: MenuDetails;
}

export interface MenuListResponse {
  success: boolean;
  message: string;
  data?: MenuDetails[];
}

export interface CatalogResponse {
  success: boolean;
  message: string;
  data?: CatalogItem[];
}

export type MenuFormErrors = {
  [K in keyof Partial<Menu>]?: string;
};

export const MENU_CATEGORIES = [
  'Breakfast',
  'Lunch',
  'Dinner',
  'Breakfast + Lunch',
  'Breakfast + Dinner',
  'Lunch + Dinner',
  'Breakfast + Lunch + Dinner'
] as const;

export const DIETARY_PREFERENCES = ['veg', 'non-veg'] as const;

export type MenuCategory = typeof MENU_CATEGORIES[number];
export type DietaryPreference = typeof DIETARY_PREFERENCES[number];

export interface MenuFormSubmission {
  category: DietaryPreference;
  menuType: MenuCategory;
  title: string;
  description: string;
  deliveryTime: string;
  priceMonthly: number;
  priceWeekly: number;
  priceTrial: number;
  weeklyMenu: WeeklyMenuDay[];
  image?: File;
  imageUrl?: string;
  imagePublicId?: string;
}

export const DAYS_OF_WEEK = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday',
  'Friday', 'Saturday', 'Sunday'
] as const;

export type DayOfWeek = typeof DAYS_OF_WEEK[number];

export interface FormValidation {
  isValid: boolean;
  errors: Partial<Record<keyof MenuFormSubmission, string>>;
}

export type MenuStatus = 'active' | 'inactive' | 'draft';

export interface ExtendedMenu extends MenuDetails {
  status?: MenuStatus;
  isPopular?: boolean;
  rating?: number;
  orderCount?: number;
}

// ✅ Subscription Type (used in payment flow)
export type SubscriptionType = 'monthly' | 'weekly' | 'trial';

// ✅ Pricing Helper Interface
export interface MenuPricing {
  monthly: number;
  weekly: number;
  trial: number;
}

// Slider Image Interface
export interface SliderImage {
  _id: string;
  title: string;
  alt: string;
  src: string;
  imagePublicId?: string;
  dataAiHint?: string;
  isActive: boolean;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

// Slider Response Interface
export interface SliderImageResponse {
  success: boolean;
  message: string;
  data?: SliderImage | SliderImage[];
}

// Type-safe conversion helpers
export const convertObjectToArrayFormat = (weeklyMenuObj: Record<string, string>): WeeklyMenuDay[] => {
  const days: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const dayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
  
  return days.map((day, index) => {
    const dayKey = dayKeys[index];
    if (!dayKey) {
      return { day, items: ['No items'] };
    }
    
    const dayMenu = weeklyMenuObj[dayKey] || '';
    
    const items = dayMenu
      .split(',')
      .map((item: string) => item.trim())
      .filter((item: string) => item.length > 0);
    
    if (items.length === 0) {
      items.push('No items');
    }
    
    return { day, items };
  });
};

export const convertArrayToObjectFormat = (weeklyMenuArray: WeeklyMenuDay[]): Record<string, string> => {
  const result: Record<string, string> = {};
  
  weeklyMenuArray.forEach(dayMenu => {
    const dayKey = dayMenu.day.toLowerCase();
    if (dayKey && typeof dayKey === 'string') {
      const items = dayMenu.items.filter(item => item.trim() !== '');
      result[dayKey] = items.join(', ');
    }
  });
  
  return result;
};

export const ensureArrayFormat = (weeklyMenu: unknown): WeeklyMenuDay[] => {
  if (Array.isArray(weeklyMenu)) {
    return weeklyMenu;
  }
  
  if (weeklyMenu && typeof weeklyMenu === 'object' && !Array.isArray(weeklyMenu)) {
    return convertObjectToArrayFormat(weeklyMenu as Record<string, string>);
  }
  
  return DAYS_OF_WEEK.map(day => ({
    day,
    items: ['No items']
  }));
};

export const getDefaultWeeklyMenu = (): WeeklyMenuDay[] => {
  return DAYS_OF_WEEK.map(day => ({
    day,
    items: ['']
  }));
};

// ✅ UPDATED: NO FALLBACK - Only return admin's exact value
export const calculateWeeklyPrice = (menu: Menu | MenuDetails): number => {
  return menu.priceWeekly || 0;  // ✅ NO calculation - sirf admin value ya 0
};

// ✅ UPDATED: NO FALLBACK - Only return admin's exact value
export const calculateTrialPrice = (menu: Menu | MenuDetails): number => {
  return menu.priceTrial || 0;  // ✅ NO calculation - sirf admin value ya 0
};

// ✅ Get price based on subscription type - NO FALLBACK
export const getPriceBySubscriptionType = (
  menu: Menu | MenuDetails, 
  subscriptionType: SubscriptionType
): number => {
  switch (subscriptionType) {
    case 'trial':
      return menu.priceTrial || 0;  // ✅ Only admin value
    case 'weekly':
      return menu.priceWeekly || 0;  // ✅ Only admin value
    case 'monthly':
    default:
      return menu.priceMonthly || 0;  // ✅ Only admin value
  }
};

// Get duration in days based on subscription type
export const getDurationDays = (subscriptionType: SubscriptionType): number => {
  switch (subscriptionType) {
    case 'trial':
      return 1;
    case 'weekly':
      return 7;
    case 'monthly':
    default:
      return 30;
  }
};

// Get subscription label
export const getSubscriptionLabel = (subscriptionType: SubscriptionType): string => {
  switch (subscriptionType) {
    case 'trial':
      return '1 Day Trial';
    case 'weekly':
      return '7 Days Weekly Plan';
    case 'monthly':
    default:
      return 'Monthly Plan';
  }
};

// ✅ Get all pricing for a menu - NO FALLBACK
export const getMenuPricing = (menu: Menu | MenuDetails): MenuPricing => {
  return {
    monthly: menu.priceMonthly || 0,  // ✅ Only admin value
    weekly: menu.priceWeekly || 0,    // ✅ Only admin value
    trial: menu.priceTrial || 0       // ✅ Only admin value
  };
};

// ✅ NEW: Helper to check if subscription is available
export const isSubscriptionAvailable = (
  menu: Menu | MenuDetails,
  subscriptionType: SubscriptionType
): boolean => {
  const price = getPriceBySubscriptionType(menu, subscriptionType);
  return price > 0;
};