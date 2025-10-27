// types/menu.ts - Updated with Cloudinary support

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
  imagePublicId?: string; // ✅ Already added - Perfect!
  deliveryTime: string;
  price?: number | undefined;
  priceMonthly: number;
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
  imagePublicId?: string; // NEW: Add Cloudinary support ✅
  deliveryTime: string;
  priceMonthly: number;
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
  imagePublicId?: string; // NEW: Add Cloudinary support ✅
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
  priceTrial: number;
  weeklyMenu: WeeklyMenuDay[];
  image?: File;
  imageUrl?: string;
  imagePublicId?: string; // NEW: Add Cloudinary support ✅
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

// NEW: Slider Image Interface ✅
export interface SliderImage {
  _id: string;
  title: string;
  alt: string;
  src: string;
  imagePublicId?: string; // NEW: Cloudinary support ✅
  dataAiHint?: string;
  isActive: boolean;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

// NEW: Slider Response Interface ✅
export interface SliderImageResponse {
  success: boolean;
  message: string;
  data?: SliderImage | SliderImage[];
}

// FIXED: Type-safe conversion with proper checks
export const convertObjectToArrayFormat = (weeklyMenuObj: Record<string, string>): WeeklyMenuDay[] => {
  const days: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const dayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
  
  return days.map((day, index) => {
    // FIXED: Type-safe index access with fallback
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

// FIXED: Type-safe object creation
export const convertArrayToObjectFormat = (weeklyMenuArray: WeeklyMenuDay[]): Record<string, string> => {
  const result: Record<string, string> = {};
  
  weeklyMenuArray.forEach(dayMenu => {
    const dayKey = dayMenu.day.toLowerCase();
    // FIXED: Type guard to ensure dayKey is valid
    if (dayKey && typeof dayKey === 'string') {
      const items = dayMenu.items.filter(item => item.trim() !== '');
      result[dayKey] = items.join(', ');
    }
  });
  
  return result;
};

// Type-safe helper
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