// components/VegNonvegDetailsManager.tsx - COMPLETE CLEAN VERSION FOR ARRAY FORMAT

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Eye, Save, X, AlertCircle, CheckCircle, Clock, ChefHat, Upload } from 'lucide-react';
import { apiEndpoints } from '../configapi/api';

// Types for Array Format Weekly Menu
interface WeeklyMenuItem {
  day: string;
  items: string[];
}

interface MenuDetails {
  _id?: string;
  category: 'veg' | 'non-veg';
  menuType: string;
  title: string;
  description: string;
  imageUrl: string;
  deliveryTime: string;
  priceMonthly: number;
  priceTrial: number;
  weeklyMenu: WeeklyMenuItem[];
  catalogItemId?: string;
  createdAt?: string;
  updatedAt?: string;
}


interface FormData {
  menuType: string;
  title: string;
  description: string;
  imageFile: File | null;
  imageUrl: string;
  deliveryTime: string;
  priceMonthly: string;
  priceTrial: string;
  weeklyMenu: WeeklyMenuItem[];
}

interface ApiResponse<T = Record<string, unknown>> {
  success: boolean;
  data?: T;
  message?: string;
}

// Weekly Menu Utilities
// weeklyMenuUtils (replace your existing one with this)
const weeklyMenuUtils = {
  getDefaultWeeklyMenu: (): WeeklyMenuItem[] => [
    { day: 'Monday', items: [''] },
    { day: 'Tuesday', items: [''] },
    { day: 'Wednesday', items: [''] },
    { day: 'Thursday', items: [''] },
    { day: 'Friday', items: [''] },
    { day: 'Saturday', items: [''] },
    { day: 'Sunday', items: [''] }
  ],

  isValidArrayFormat: (weeklyMenu: unknown): weeklyMenu is WeeklyMenuItem[] => {
    return (
      Array.isArray(weeklyMenu) &&
      weeklyMenu.length === 7 &&
      weeklyMenu.every(day =>
        day &&
        typeof day === 'object' &&
        typeof (day as WeeklyMenuItem).day === 'string' &&
        Array.isArray((day as WeeklyMenuItem).items)
      )
    );
  },

  // Normalizes many common shapes into the array-of-{day, items[]} format
  convertObjectToArray: (weeklyMenuRaw: unknown): WeeklyMenuItem[] => {
    const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
    const dayKeysLower = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];

    // If string (maybe JSON), try to parse
    if (typeof weeklyMenuRaw === 'string') {
      try {
        weeklyMenuRaw = JSON.parse(weeklyMenuRaw);
      } catch {
        // not parseable -> fallback
        return weeklyMenuUtils.getDefaultWeeklyMenu();
      }
    }

    // If it's already an array but not necessarily in exact format
    if (Array.isArray(weeklyMenuRaw)) {
      // Case: array of 7 objects with different key names (e.g., { name: 'Monday', items: [...] })
      if (weeklyMenuRaw.every(it => it && typeof it === 'object')) {
        const normalized = days.map(day => {
          const found = (weeklyMenuRaw as { day?: string; name?: string; dayName?: string; items?: unknown; menu?: unknown }[]).find(it => {
            const name = (it.day || it.name || it.dayName || '').toString().toLowerCase();
            return name === day.toLowerCase();
          });
          if (found) {
            // found.items might be array or comma string
            const rawItems = found.items ?? found.menu ?? [];
            if (Array.isArray(rawItems)) {
              const items = rawItems.map(String).map(s => s.trim()).filter(Boolean);
              return { day, items: items.length ? items : [''] };
            } else if (typeof rawItems === 'string') {
              const items = rawItems.split('||').map((s:string)=>s.trim()).filter(Boolean);
              return { day, items: items.length ? items : [''] };
            }
            return { day, items: [''] };
          }
          return { day, items: [''] };
        });
        return normalized;
      }

      // Case: array of 7 strings (each string maybe comma/|| separated)
      if (weeklyMenuRaw.length === 7 && weeklyMenuRaw.every(it => typeof it === 'string' || Array.isArray(it))) {
        return days.map((day, idx) => {
          const val = weeklyMenuRaw[idx];
          if (Array.isArray(val)) {
            const items = val.map(String).map(s => s.trim()).filter(Boolean);
            return { day, items: items.length ? items : [''] };
          }
          const items = String(val).split('||').map((s:string)=>s.trim()).filter(Boolean);
          return { day, items: items.length ? items : [''] };
        });
      }
    }

    // If it's an object with keys monday..sunday
    if (weeklyMenuRaw && typeof weeklyMenuRaw === 'object') {
      return days.map((day, idx) => {
        const key = dayKeysLower[idx];
        const val = (weeklyMenuRaw as Record<string, unknown>)[key];

        // Nested shape: { monday: { items: [...] } }
        if (
          val &&
          typeof val === 'object' &&
          Array.isArray((val as { items?: unknown[] }).items)
        ) {
          const items = ((val as { items?: unknown[] }).items || []).map(String).map(s => s.trim()).filter(Boolean);
          return { day, items: items.length ? items : [''] };
        }

        // If string e.g. "dal,roti || sabji"
        if (typeof val === 'string') {
          const items = val.split('||').map((s:string) => s.trim()).filter(Boolean);
          return { day, items: items.length ? items : [''] };
        }

        // If array
        if (Array.isArray(val)) {
          const items = val.map(String).map(s => s.trim()).filter(Boolean);
          return { day, items: items.length ? items : [''] };
        }

        return { day, items: [''] };
      });
    }

    // fallback default
    return weeklyMenuUtils.getDefaultWeeklyMenu();
  },

  // Main entry: accept valid array directly, otherwise convert
  ensureArrayFormat: (weeklyMenu: unknown): WeeklyMenuItem[] => {
    if (weeklyMenuUtils.isValidArrayFormat(weeklyMenu)) {
      return weeklyMenu as WeeklyMenuItem[];
    }

    try {
      return weeklyMenuUtils.convertObjectToArray(weeklyMenu);
    } catch {
      return weeklyMenuUtils.getDefaultWeeklyMenu();
    }
  }
};

// Image Upload Utilities
const imageUploadUtils = {
  fileToBase64: (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  },

  validateImageFile: (file: File): { isValid: boolean; error?: string } => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      return { isValid: false, error: 'Please select a valid image file (JPEG, PNG, WebP)' };
    }

    if (file.size > maxSize) {
      return { isValid: false, error: 'Image size should be less than 5MB' };
    }

    return { isValid: true };
  },

  uploadImageToServer: async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch(apiEndpoints.uploadImage, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Image upload failed');
      }

      const data = await response.json() as { imageUrl: string };
      return data.imageUrl;
    } catch (error) {
      console.error('Image upload error:', error);
      throw new Error('Failed to upload image. Please try again.');
    }
  }
};

// API Service
const apiService = {
  createOrUpdateVegMenu: async (menuData: {
    menuType: string;
    title: string;
    description: string;
    imageUrl: string;
    deliveryTime: string;
    priceMonthly: number;
    priceTrial: number;
    weeklyMenu: WeeklyMenuItem[];
  }): Promise<MenuDetails> => {
    try {
      const response = await fetch(apiEndpoints.vegMenuDetails, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(menuData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: ApiResponse<MenuDetails> = await response.json();
      if (data.success && data.data) {
        data.data.weeklyMenu = weeklyMenuUtils.ensureArrayFormat(data.data.weeklyMenu);
        return data.data;
      }
      throw new Error(data.message || 'Failed to save veg menu');
    } catch (error) {
      console.error('Error creating/updating veg menu:', error);
      throw error;
    }
  },

  getAllVegMenus: async (): Promise<MenuDetails[]> => {
    try {
      const response = await fetch(apiEndpoints.vegMenus);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: ApiResponse<MenuDetails[]> = await response.json();
      if (data.success && data.data) {
        return data.data.map(menu => ({
          ...menu,
          weeklyMenu: weeklyMenuUtils.ensureArrayFormat(menu.weeklyMenu)
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching veg menus:', error);
      return [];
    }
  },

  createOrUpdateNonVegMenu: async (menuData: {
    menuType: string;
    title: string;
    description: string;
    imageUrl: string;
    deliveryTime: string;
    priceMonthly: number;
    priceTrial: number;
    weeklyMenu: WeeklyMenuItem[];
  }): Promise<MenuDetails> => {
    try {
      const response = await fetch(apiEndpoints.nonVegMenuDetails, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(menuData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: ApiResponse<MenuDetails> = await response.json();
      if (data.success && data.data) {
        data.data.weeklyMenu = weeklyMenuUtils.ensureArrayFormat(data.data.weeklyMenu);
        return data.data;
      }
      throw new Error(data.message || 'Failed to save non-veg menu');
    } catch (error) {
      console.error('Error creating/updating non-veg menu:', error);
      throw error;
    }
  },

  getAllNonVegMenus: async (): Promise<MenuDetails[]> => {
    try {
      const response = await fetch(apiEndpoints.nonVegMenus);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: ApiResponse<MenuDetails[]> = await response.json();
      if (data.success && data.data) {
        return data.data.map(menu => ({
          ...menu,
          weeklyMenu: weeklyMenuUtils.ensureArrayFormat(menu.weeklyMenu)
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching non-veg menus:', error);
      return [];
    }
  },

  deleteMenu: async (category: 'veg' | 'non-veg', menuType: string): Promise<void> => {
    try {
      const response = await fetch(apiEndpoints.adminCategoryMenu(category, menuType), {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: ApiResponse = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to delete menu');
      }
    } catch (error) {
      console.error('Error deleting menu:', error);
      throw error;
    }
  }
};

// Notification Component
const Notification: React.FC<{ 
  message: string; 
  type: 'success' | 'error' | 'info'; 
  onClose: () => void 
}> = ({ message, type, onClose }) => {
  const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
  const Icon = type === 'success' ? CheckCircle : type === 'error' ? AlertCircle : Clock;

  return (
    <div className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-[10000] flex items-center animate-slide-in`}>
      <Icon className="w-5 h-5 mr-2" />
      <span>{message}</span>
      <button onClick={onClose} className="ml-4 text-white hover:text-gray-200">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

// Modal Component
const Modal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  title: string; 
  children: React.ReactNode 
}> = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-xl p-8 w-full max-w-6xl mx-4 max-h-[95vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="relative">
          {children}
        </div>
      </div>
    </div>
  );
};

// Image Upload Component
const ImageUploadComponent: React.FC<{
  imageFile: File | null;
  imageUrl: string;
  onImageChange: (file: File | null, url: string) => void;
  error?: string;
}> = ({ imageFile, imageUrl, onImageChange, error }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (file: File) => {
    setUploading(true);
    try {
      const validation = imageUploadUtils.validateImageFile(file);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      const previewUrl = await imageUploadUtils.fileToBase64(file);
      onImageChange(file, previewUrl);
    } catch (error) {
      console.error('File handling error:', error);
      onImageChange(null, '');
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileChange(files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFileChange(files[0]);
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Menu Image <span className="text-red-500">*</span>
      </label>
      
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : error
            ? 'border-red-500 bg-red-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploading}
        />
        
        {uploading ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mb-3"></div>
            <p className="text-gray-600">Processing image...</p>
          </div>
        ) : imageUrl ? (
          <div className="space-y-3">
            <img 
              src={imageUrl} 
              alt="Preview" 
              className="w-full h-48 object-cover rounded-lg border"
            />
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Image selected {imageFile ? `(${imageFile.name})` : ''}</span>
            </div>
            <button
              type="button"
              onClick={() => onImageChange(null, '')}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Remove Image
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <Upload className="w-6 h-6 text-gray-400" />
              </div>
            </div>
            <div>
              <p className="text-gray-600 font-medium">Click to upload or drag and drop</p>
              <p className="text-sm text-gray-500">PNG, JPG, WebP up to 5MB</p>
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};

// Menu Form Component
const MenuForm: React.FC<{
  initialData?: MenuDetails;
  type: 'veg' | 'non-veg';
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
  loading: boolean;
}> = ({ initialData, type, onSubmit, onCancel, loading }) => {
  
  const getInitialWeeklyMenu = useCallback((): WeeklyMenuItem[] => {
    if (!initialData?.weeklyMenu) {
      return weeklyMenuUtils.getDefaultWeeklyMenu();
    }
    return weeklyMenuUtils.ensureArrayFormat(initialData.weeklyMenu);
  }, [initialData]);

  const [formData, setFormData] = useState<FormData>({
    menuType: initialData?.menuType || '',
    title: initialData?.title || '',
    description: initialData?.description || '',
    imageFile: null,
    imageUrl: initialData?.imageUrl || '',
    deliveryTime: initialData?.deliveryTime || '',
    priceMonthly: initialData?.priceMonthly?.toString() || '',
    priceTrial: initialData?.priceTrial?.toString() || '',
    weeklyMenu: getInitialWeeklyMenu()
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData | 'imageFile', string>>>({});
  const [uploadingImage, setUploadingImage] = useState(false);

  const menuTypes = [
    'Breakfast',
    'Lunch',
    'Dinner',
    'Breakfast + Lunch',
    'Breakfast + Dinner',
    'Lunch + Dinner',
    'Breakfast + Lunch + Dinner'
  ];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.menuType) newErrors.menuType = 'Menu type is required';
    if (!formData.title) newErrors.title = 'Title is required';
    if (!formData.description) newErrors.description = 'Description is required';
    
    if (!formData.imageFile && !formData.imageUrl) {
      newErrors.imageFile = 'Please select an image';
    }
    
    if (!formData.deliveryTime) newErrors.deliveryTime = 'Delivery time is required';
    if (!formData.priceMonthly || isNaN(parseFloat(formData.priceMonthly)) || parseFloat(formData.priceMonthly) <= 0) {
      newErrors.priceMonthly = 'Valid monthly price is required';
    }
    if (!formData.priceTrial || isNaN(parseFloat(formData.priceTrial)) || parseFloat(formData.priceTrial) <= 0) {
      newErrors.priceTrial = 'Valid trial price is required';
    }

    const weeklyMenuErrors = formData.weeklyMenu.some(dayMenu => 
      dayMenu.items.length === 0 || dayMenu.items.every(item => !item.trim())
    );
    if (weeklyMenuErrors) {
      newErrors.weeklyMenu = 'Each day must have at least one menu item';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (): Promise<void> => {
    if (!validateForm()) return;

    setUploadingImage(true);
    try {
      let finalImageUrl = formData.imageUrl;

      if (formData.imageFile) {
        finalImageUrl = await imageUploadUtils.uploadImageToServer(formData.imageFile);
      }

      const submissionData = {
        ...formData,
        imageUrl: finalImageUrl
      };

      onSubmit(submissionData);
    } catch (error) {
      console.error('Error during submission:', error);
      setErrors({ ...errors, imageFile: 'Failed to upload image. Please try again.' });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageChange = (file: File | null, url: string) => {
    setFormData({ ...formData, imageFile: file, imageUrl: url });
    if (errors.imageFile) {
      setErrors({ ...errors, imageFile: undefined });
    }
  };

  const updateWeeklyMenuItem = (dayIndex: number, itemIndex: number, value: string): void => {
    const updatedWeeklyMenu = [...formData.weeklyMenu];
    updatedWeeklyMenu[dayIndex].items[itemIndex] = value;
    setFormData({ ...formData, weeklyMenu: updatedWeeklyMenu });
  };

  const addWeeklyMenuItem = (dayIndex: number): void => {
    const updatedWeeklyMenu = [...formData.weeklyMenu];
    updatedWeeklyMenu[dayIndex].items.push('');
    setFormData({ ...formData, weeklyMenu: updatedWeeklyMenu });
  };

  const removeWeeklyMenuItem = (dayIndex: number, itemIndex: number): void => {
    const updatedWeeklyMenu = [...formData.weeklyMenu];
    if (updatedWeeklyMenu[dayIndex].items.length > 1) {
      updatedWeeklyMenu[dayIndex].items.splice(itemIndex, 1);
      setFormData({ ...formData, weeklyMenu: updatedWeeklyMenu });
    }
  };

  const isVeg = type === 'veg';

  return (
    <div className="space-y-8">
      {/* Basic Information */}
      <div className="bg-gray-50 p-6 rounded-xl">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Menu Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.menuType}
              onChange={(e) => {
                setFormData({ ...formData, menuType: e.target.value });
                if (errors.menuType) setErrors({ ...errors, menuType: undefined });
              }}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                errors.menuType ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select Menu Type</option>
              {menuTypes.map(menuTypeOption => (
                <option key={menuTypeOption} value={menuTypeOption}>{menuTypeOption}</option>
              ))}
            </select>
            {errors.menuType && <p className="text-red-500 text-sm mt-1">{errors.menuType}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => {
                setFormData({ ...formData, title: e.target.value });
                if (errors.title) setErrors({ ...errors, title: undefined });
              }}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g. Healthy Breakfast Menu"
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => {
              setFormData({ ...formData, description: e.target.value });
              if (errors.description) setErrors({ ...errors, description: undefined });
            }}
            rows={4}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Describe your menu offering in detail..."
          />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
        </div>
      </div>

      {/* Image Upload and Pricing Section */}
      <div className="bg-gray-50 p-6 rounded-xl">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Image & Pricing</h4>
        
        <div className="mb-6">
          <ImageUploadComponent
            imageFile={formData.imageFile}
            imageUrl={formData.imageUrl}
            onImageChange={handleImageChange}
            error={errors.imageFile}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Delivery Time <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.deliveryTime}
              onChange={(e) => {
                setFormData({ ...formData, deliveryTime: e.target.value });
                if (errors.deliveryTime) setErrors({ ...errors, deliveryTime: undefined });
              }}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                errors.deliveryTime ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g. 30-45 minutes"
            />
            {errors.deliveryTime && <p className="text-red-500 text-sm mt-1">{errors.deliveryTime}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monthly Price (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.priceMonthly}
              onChange={(e) => {
                setFormData({ ...formData, priceMonthly: e.target.value });
                if (errors.priceMonthly) setErrors({ ...errors, priceMonthly: undefined });
              }}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                errors.priceMonthly ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="2999"
              min="0"
              step="1"
            />
            {errors.priceMonthly && <p className="text-red-500 text-sm mt-1">{errors.priceMonthly}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trial Price (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.priceTrial}
              onChange={(e) => {
                setFormData({ ...formData, priceTrial: e.target.value });
                if (errors.priceTrial) setErrors({ ...errors, priceTrial: undefined });
              }}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                errors.priceTrial ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="40"
              min="0"
              step="1"
            />
            {errors.priceTrial && <p className="text-red-500 text-sm mt-1">{errors.priceTrial}</p>}
          </div>
        </div>
      </div>

      {/* Weekly Menu Section */}
      <div className="bg-gray-50 p-6 rounded-xl">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-lg font-semibold text-gray-900">
            Weekly Menu Plan <span className="text-red-500">*</span>
          </h4>
          {errors.weeklyMenu && <p className="text-red-500 text-sm">{errors.weeklyMenu}</p>}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {formData.weeklyMenu.map((dayMenu, dayIndex) => (
            <div key={dayMenu.day} className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-gray-300 transition-colors">
              <div className="flex items-center mb-4">
                <div className={`w-4 h-4 rounded-full mr-3 ${isVeg ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <h5 className="font-semibold text-gray-900 text-lg">{dayMenu.day}</h5>
              </div>
              <div className="space-y-3">
                {dayMenu.items.length === 0 ? (
                  <div className="text-gray-500 text-center py-4">
                    <p className="text-sm">No items added yet</p>
                    <button
                      type="button"
                      onClick={() => addWeeklyMenuItem(dayIndex)}
                      className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${
                        isVeg 
                          ? 'text-green-600 hover:text-green-800 hover:bg-green-50' 
                          : 'text-red-600 hover:text-red-800 hover:bg-red-50'
                      }`}
                    >
                      + Add First Item
                    </button>
                  </div>
                ) : (
                  dayMenu.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-center space-x-3">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => updateWeeklyMenuItem(dayIndex, itemIndex, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="Enter menu item..."
                      />
                      {dayMenu.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeWeeklyMenuItem(dayIndex, itemIndex)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))
                )}
                {dayMenu.items.length > 0 && (
                  <button
                    type="button"
                    onClick={() => addWeeklyMenuItem(dayIndex)}
                    className={`text-sm font-medium transition-colors ${
                      isVeg 
                        ? 'text-green-600 hover:text-green-800' 
                        : 'text-red-600 hover:text-red-800'
                    }`}
                  >
                    + Add Item
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4 pt-6 border-t border-gray-200">
        <button
          onClick={handleSubmit}
          disabled={loading || uploadingImage}
          className={`flex-1 py-4 px-6 rounded-xl font-semibold text-white transition-all duration-200 ${
            isVeg 
              ? 'bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl' 
              : 'bg-red-600 hover:bg-red-700 shadow-lg hover:shadow-xl'
          } ${(loading || uploadingImage) ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
        >
          {(loading || uploadingImage) ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
              {uploadingImage ? 'Uploading Image...' : 'Saving Menu...'}
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <Save className="w-5 h-5 mr-3" />
              {initialData ? 'Update Menu' : 'Create Menu'}
            </div>
          )}
        </button>
        <button
          onClick={onCancel}
          disabled={loading || uploadingImage}
          className="flex-1 py-4 px-6 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 hover:scale-105"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

// Menu Card Component
const MenuCard: React.FC<{
  menu: MenuDetails;
  onEdit: (menu: MenuDetails) => void;
  onDelete: (category: 'veg' | 'non-veg', menuType: string) => void;
  onView: (menu: MenuDetails) => void;
}> = ({ menu, onEdit, onDelete, onView }) => {
  const isVeg = menu.category === 'veg';
  
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100">
      <div className="relative">
        <img 
          src={menu.imageUrl} 
          alt={`${menu.category} ${menu.menuType} Menu`}
          className="w-full h-52 object-cover"
          loading="lazy"
        />
        <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-semibold ${
          isVeg ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {isVeg ? '🌱 VEG' : '🍖 NON-VEG'}
        </div>
        <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm font-medium">
          {menu.menuType}
        </div>
      </div>
      
      <div className="p-6">
        <h3 className={`font-bold text-xl mb-3 ${
          isVeg ? 'text-green-700' : 'text-red-600'
        }`}>
          {menu.title}
        </h3>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
          {menu.description}
        </p>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <span className="text-teal-600 font-bold text-xl">
              ₹{menu.priceMonthly}
              <span className="text-sm text-gray-500 font-normal">/month</span>
            </span>
            <span className="text-gray-500 text-sm">
              Trial: ₹{menu.priceTrial}
            </span>
          </div>
        </div>

        <div className="flex items-center text-gray-500 text-sm mb-4">
          <Clock className="w-4 h-4 mr-2" />
          {menu.deliveryTime}
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => onView(menu)}
            className="py-2 px-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-semibold"
          >
            <Eye className="w-4 h-4 inline mr-1" />
            View
          </button>
          <button
            onClick={() => onEdit(menu)}
            className="py-2 px-3 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors text-sm font-semibold"
          >
            <Edit className="w-4 h-4 inline mr-1" />
            Edit
          </button>
          <button
            onClick={() => onDelete(menu.category, menu.menuType)}
            className="py-2 px-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-semibold"
          >
            <Trash2 className="w-4 h-4 inline mr-1" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Component
const VegNonvegDetailsManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'veg' | 'non-veg'>('veg');
  const [vegMenus, setVegMenus] = useState<MenuDetails[]>([]);
  const [nonVegMenus, setNonVegMenus] = useState<MenuDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [notification, setNotification] = useState<{ 
    message: string; 
    type: 'success' | 'error' | 'info' 
  } | null>(null);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<MenuDetails | null>(null);

  // Load data
  const loadData = async (): Promise<void> => {
    setLoading(true);
    try {
      const [vegData, nonVegData] = await Promise.all([
        apiService.getAllVegMenus(),
        apiService.getAllNonVegMenus()
      ]);
      
      console.log('Loaded veg menus:', vegData.length);
      console.log('Loaded non-veg menus:', nonVegData.length);
      
      setVegMenus(vegData);
      setNonVegMenus(nonVegData);
    } catch (error) {
      console.error('Error loading data:', error);
      showNotification('Failed to load menu data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const showNotification = (message: string, type: 'success' | 'error' | 'info'): void => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Create or update menu
  const handleCreateOrUpdate = async (formData: FormData): Promise<void> => {
    setFormLoading(true);
    try {
      console.log('Submitting form data:', {
        menuType: formData.menuType,
        title: formData.title,
        weeklyMenuLength: formData.weeklyMenu.length
      });

      const menuData = {
        menuType: formData.menuType,
        title: formData.title,
        description: formData.description,
        imageUrl: formData.imageUrl,
        deliveryTime: formData.deliveryTime,
        priceMonthly: parseFloat(formData.priceMonthly),
        priceTrial: parseFloat(formData.priceTrial),
        weeklyMenu: formData.weeklyMenu
      };

      let savedMenu: MenuDetails;
      if (activeTab === 'veg') {
        savedMenu = await apiService.createOrUpdateVegMenu(menuData);
        const existingIndex = vegMenus.findIndex(m => m.menuType === savedMenu.menuType);
        if (existingIndex >= 0) {
          const updatedMenus = [...vegMenus];
          updatedMenus[existingIndex] = savedMenu;
          setVegMenus(updatedMenus);
        } else {
          setVegMenus(prev => [savedMenu, ...prev]);
        }
      } else {
        savedMenu = await apiService.createOrUpdateNonVegMenu(menuData);
        const existingIndex = nonVegMenus.findIndex(m => m.menuType === savedMenu.menuType);
        if (existingIndex >= 0) {
          const updatedMenus = [...nonVegMenus];
          updatedMenus[existingIndex] = savedMenu;
          setNonVegMenus(updatedMenus);
        } else {
          setNonVegMenus(prev => [savedMenu, ...prev]);
        }
      }

      setShowCreateModal(false);
      setShowEditModal(false);
      setSelectedMenu(null);
      showNotification(
        `${activeTab === 'veg' ? 'Vegetarian' : 'Non-Vegetarian'} menu saved successfully!`, 
        'success'
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save menu. Please try again.';
      console.error('Error saving menu:', error);
      showNotification(errorMessage, 'error');
    } finally {
      setFormLoading(false);
    }
  };

  // Delete menu
  const handleDelete = async (category: 'veg' | 'non-veg', menuType: string): Promise<void> => {
    if (!window.confirm(`Are you sure you want to delete the ${menuType} menu? This action cannot be undone.`)) return;

    try {
      await apiService.deleteMenu(category, menuType);
      
      if (category === 'veg') {
        setVegMenus(prev => prev.filter(menu => menu.menuType !== menuType));
      } else {
        setNonVegMenus(prev => prev.filter(menu => menu.menuType !== menuType));
      }

      showNotification(`${category === 'veg' ? 'Vegetarian' : 'Non-Vegetarian'} menu deleted successfully!`, 'success');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete menu. Please try again.';
      console.error('Error deleting menu:', error);
      showNotification(errorMessage, 'error');
    }
  };

  const currentMenus = activeTab === 'veg' ? vegMenus : nonVegMenus;
  const totalVegMenus = vegMenus.length;
  const totalNonVegMenus = nonVegMenus.length;

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Menu Details Management</h1>
              <p className="text-gray-600 text-lg mt-2">Manage your restaurant menu details and weekly plans with array format support.</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-gray-600 bg-gray-100 px-4 py-2 rounded-lg">
                <ChefHat className="w-5 h-5 mr-2" />
                <span className="font-medium">Total Menus: {totalVegMenus + totalNonVegMenus}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center">
              <div className="p-4 bg-green-100 rounded-2xl">
                <span className="text-3xl">🌱</span>
              </div>
              <div className="ml-6">
                <h3 className="text-xl font-bold text-gray-900">Veg Menus</h3>
                <p className="text-4xl font-bold text-green-600 mt-1">{totalVegMenus}</p>
                <p className="text-sm text-gray-500 mt-1">Vegetarian Menu Plans</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center">
              <div className="p-4 bg-red-100 rounded-2xl">
                <span className="text-3xl">🍖</span>
              </div>
              <div className="ml-6">
                <h3 className="text-xl font-bold text-gray-900">Non-Veg Menus</h3>
                <p className="text-4xl font-bold text-red-600 mt-1">{totalNonVegMenus}</p>
                <p className="text-sm text-gray-500 mt-1">Non-Vegetarian Menu Plans</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center">
              <div className="p-4 bg-blue-100 rounded-2xl">
                <span className="text-3xl">📊</span>
              </div>
              <div className="ml-6">
                <h3 className="text-xl font-bold text-gray-900">Total Menus</h3>
                <p className="text-4xl font-bold text-blue-600 mt-1">{totalVegMenus + totalNonVegMenus}</p>
                <p className="text-sm text-gray-500 mt-1">All Menu Plans</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs and Actions */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
          <div className="border-b border-gray-200">
            <div className="flex justify-between items-center px-8 py-6">
              <div className="flex space-x-12">
                <button
                  onClick={() => setActiveTab('veg')}
                  className={`py-3 px-2 border-b-3 font-semibold text-lg transition-colors ${
                    activeTab === 'veg'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  🌱 Vegetarian Menus ({totalVegMenus})
                </button>
                <button
                  onClick={() => setActiveTab('non-veg')}
                  className={`py-3 px-2 border-b-3 font-semibold text-lg transition-colors ${
                    activeTab === 'non-veg'
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  🍖 Non-Vegetarian Menus ({totalNonVegMenus})
                </button>
              </div>
              
              <button
                onClick={() => setShowCreateModal(true)}
                className={`px-6 py-3 rounded-xl font-semibold text-white transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 ${
                  activeTab === 'veg' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                <Plus className="w-5 h-5 inline mr-2" />
                Add New {activeTab === 'veg' ? 'Veg' : 'Non-Veg'} Menu
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {loading ? (
              <div className="flex justify-center items-center h-80">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-gray-900 mx-auto mb-6"></div>
                  <p className="text-xl text-gray-600">Loading menu details...</p>
                </div>
              </div>
            ) : currentMenus.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-8xl mb-6">🍽️</div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  No {activeTab === 'veg' ? 'Vegetarian' : 'Non-Vegetarian'} Menus
                </h3>
                <p className="text-xl text-gray-600 mb-8">Start by creating your first menu plan to offer to customers!</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className={`px-8 py-4 rounded-xl font-semibold text-white text-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 ${
                    activeTab === 'veg' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  <Plus className="w-5 h-5 inline mr-2" />
                  Create First Menu
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {currentMenus.map((menu) => (
                  <MenuCard
                    key={menu._id}
                    menu={menu}
                    onEdit={(menu) => {
                      console.log('Editing menu:', menu.menuType);
                      setSelectedMenu(menu);
                      setShowEditModal(true);
                    }}
                    onDelete={handleDelete}
                    onView={(menu) => {
                      setSelectedMenu(menu);
                      setShowViewModal(true);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title={`Create New ${activeTab === 'veg' ? 'Vegetarian' : 'Non-Vegetarian'} Menu`}
      >
        <MenuForm
          type={activeTab}
          onSubmit={handleCreateOrUpdate}
          onCancel={() => setShowCreateModal(false)}
          loading={formLoading}
        />
      </Modal>

      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedMenu(null);
        }}
        title={`Edit ${activeTab === 'veg' ? 'Vegetarian' : 'Non-Vegetarian'} Menu`}
      >
        {selectedMenu && (
          <MenuForm
            initialData={selectedMenu}
            type={activeTab}
            onSubmit={handleCreateOrUpdate}
            onCancel={() => {
              setShowEditModal(false);
              setSelectedMenu(null);
            }}
            loading={formLoading}
          />
        )}
      </Modal>

      <Modal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedMenu(null);
        }}
        title="Menu Details"
      >
        {selectedMenu && (
          <div className="space-y-8">
            <div className="text-center">
              <img 
                src={selectedMenu.imageUrl} 
                alt={`${selectedMenu.category} ${selectedMenu.menuType} Menu`}
                className="w-full h-64 object-cover rounded-2xl border-2 border-gray-200 shadow-lg"
              />
            </div>
            
            <div className="bg-gray-50 p-6 rounded-xl">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Menu Type</label>
                  <p className="text-lg font-semibold text-gray-900 mt-1">{selectedMenu.menuType}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <p className="text-lg font-semibold text-gray-900 mt-1 capitalize">{selectedMenu.category}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Monthly Price</label>
                  <p className="text-lg font-semibold text-green-600 mt-1">₹{selectedMenu.priceMonthly}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Trial Price</label>
                  <p className="text-lg font-semibold text-blue-600 mt-1">₹{selectedMenu.priceTrial}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Delivery Time</label>
                  <p className="text-lg font-semibold text-gray-900 mt-1">{selectedMenu.deliveryTime}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Menu Information</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <p className="text-lg font-semibold text-gray-900">{selectedMenu.title}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <p className="text-gray-900 leading-relaxed">{selectedMenu.description}</p>
                </div>
              </div>
            </div>

            {/* Weekly Menu Display */}
            <div className="bg-gray-50 p-6 rounded-xl">
              <h4 className="text-lg font-semibold text-gray-900 mb-6">Weekly Menu Plan</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {weeklyMenuUtils.ensureArrayFormat(selectedMenu.weeklyMenu).map((dayMenu, index) => (
                  <div key={index} className="bg-white border-2 border-gray-200 rounded-xl p-4">
                    <div className="flex items-center mb-3">
                      <div className={`w-3 h-3 rounded-full mr-3 ${
                        selectedMenu.category === 'veg' ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      <h5 className="font-semibold text-gray-900">{dayMenu.day}</h5>
                    </div>
                    <ul className="space-y-2">
                      {dayMenu.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="text-gray-700 text-sm flex items-start">
                          <span className="text-gray-400 mr-2">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="pt-6">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setShowEditModal(true);
                }}
                className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 ${
                  selectedMenu.category === 'veg' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                <Edit className="w-5 h-5 inline mr-2" />
                Edit This Menu
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Notification */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
};

export default VegNonvegDetailsManager;