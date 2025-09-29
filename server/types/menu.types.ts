import { Request, Response } from 'express';

export type AllowedCategory = 'veg' | 'non-veg';

export interface MenuRequest extends Request {
  body: MenuBody;
  file?: Express.Multer.File;
}

export interface MenuParams {
  diet: AllowedCategory;
  category: string;
  menuType?: string;
}

export interface MenuBody {
  category: AllowedCategory;
  menuType?: string;
  mealCategory?: string;
  title?: string;
  name?: string;
  description?: string;
  deliveryTime?: string;
  priceMonthly?: number;
  price?: number;
  priceTrial?: number;
  weeklyMenu?: any;
}

export interface MenuResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
  searchedFor?: {
    diet: string;
    category: string;
  };
  foundMenuType?: string;
  matchType?: string;
  suggestions?: string[];
  debugInfo?: any;
}

export interface SearchResult {
  found: boolean;
  data?: any;
  matchType?: string;
}

export interface MenuQueryParams {
  category?: string;
  menuType?: string;
  page?: string;
  limit?: string;
}

export interface HealthCheckResponse {
  success: boolean;
  message: string;
  timestamp: string;
  version: string;
  database: {
    connected: boolean;
    totalMenus: number;
    vegMenus: number;
    nonVegMenus: number;
  };
  sampleData: {
    vegMenuTypes: string[];
    nonVegMenuTypes: string[];
  };
  endpoints: Record<string, string>;
  searchFeatures: string[];
  supportedFormats: string[];
}