import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Save, X, AlertCircle, CheckCircle, Clock, ChefHat, Upload, Image as ImageIcon } from 'lucide-react';
import { apiEndpoints } from '../configapi/api';

// Types
interface MenuItem {
  _id?: string;
  diet: 'veg' | 'non-veg';
  category: string;
  title: string;
  description: string;
  imageUrl: string;
  imagePublicId?: string; // NEW: Cloudinary support
  deliveryTime: string;
  priceMonthly: number;
  priceTrial: number;
  createdAt?: string;
  updatedAt?: string;
}

interface FormData {
  category: string;
  title: string;
  description: string;
  imageFile: File | null;
  imageUrl: string;
  imagePublicId?: string; // NEW
  deliveryTime: string;
  priceMonthly: string;
  priceTrial: string;
}

interface ApiResponse<T = Record<string, unknown>> {
  success: boolean;
  data?: T;
  message?: string;
}

// Image Upload Utilities with Cloudinary
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

  // NEW: Upload to Cloudinary via backend
  uploadImageToCloudinary: async (file: File): Promise<{ imageUrl: string; imagePublicId: string }> => {
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

      const data = await response.json() as { imageUrl: string; publicId: string };
      
      return {
        imageUrl: data.imageUrl,
        imagePublicId: data.publicId
      };
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new Error('Failed to upload image to Cloudinary. Please try again.');
    }
  },

  // NEW: Delete from Cloudinary
  deleteImageFromCloudinary: async (publicId: string): Promise<void> => {
    try {
      // Build the delete endpoint URL
      let deleteEndpoint: string;
      
      // Check if apiEndpoints has a deleteImage method
      if (typeof apiEndpoints.deleteImage === 'function') {
        deleteEndpoint = apiEndpoints.deleteImage(publicId);
      } else if (typeof apiEndpoints.uploadImage === 'string') {
        // Fallback to uploadImage endpoint
        deleteEndpoint = apiEndpoints.uploadImage;
      } else {
        console.error('No valid delete endpoint found');
        return;
      }
      
      const response = await fetch(deleteEndpoint, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ publicId })
      });

      if (!response.ok) {
        console.error('Failed to delete image from Cloudinary');
      }
    } catch (error) {
      console.error('Error deleting image from Cloudinary:', error);
    }
  }
};

// API Service
const apiService = {
  createOrUpdateMenuItem: async (diet: 'veg' | 'non-veg', menuData: {
    category: string;
    title: string;
    description: string;
    imageUrl: string;
    imagePublicId?: string;
    deliveryTime: string;
    priceMonthly: number;
    priceTrial: number;
  }): Promise<MenuItem> => {
    try {
      // Use the generic menuDetails endpoint which accepts diet and category to construct the correct URL
      const endpoint = apiEndpoints.menuDetails(diet, menuData.category);
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(menuData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: ApiResponse<MenuItem> = await response.json();
      if (data.success && data.data) {
        return data.data;
      }
      throw new Error(data.message || 'Failed to save menu item');
    } catch (error) {
      console.error('Error creating/updating menu item:', error);
      throw error;
    }
  },

  getAllVegMenus: async (): Promise<MenuItem[]> => {
    try {
      const response = await fetch(apiEndpoints.vegMenus);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: ApiResponse<MenuItem[]> = await response.json();
      return data.success && data.data ? data.data : [];
    } catch (error) {
      console.error('Error fetching veg menus:', error);
      return [];
    }
  },

  getAllNonVegMenus: async (): Promise<MenuItem[]> => {
    try {
      const response = await fetch(apiEndpoints.nonVegMenus);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: ApiResponse<MenuItem[]> = await response.json();
      return data.success && data.data ? data.data : [];
    } catch (error) {
      console.error('Error fetching non-veg menus:', error);
      return [];
    }
  },

  deleteMenuItem: async (diet: 'veg' | 'non-veg', category: string, imagePublicId?: string): Promise<void> => {
    try {
      // Delete from Cloudinary first
      if (imagePublicId) {
        await imageUploadUtils.deleteImageFromCloudinary(imagePublicId);
      }

      // Then delete from database
      const response = await fetch(apiEndpoints.adminCategoryMenu(diet, category), {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: ApiResponse = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to delete menu item');
      }
    } catch (error) {
      console.error('Error deleting menu item:', error);
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
    <div className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-[10000] flex items-center`}>
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
      <div className="bg-white rounded-xl p-8 w-full max-w-4xl mx-4 max-h-[95vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        {children}
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
              <p className="text-xs text-blue-600 mt-1">✓ Will be uploaded to Cloudinary</p>
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
  initialData?: MenuItem; 
  diet: 'veg' | 'non-veg';
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
  loading: boolean;
}> = ({ initialData, diet, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState<FormData>({
    category: initialData?.category || '',
    title: initialData?.title || '',
    description: initialData?.description || '',
    imageFile: null,
    imageUrl: initialData?.imageUrl || '',
    imagePublicId: initialData?.imagePublicId || '',
    deliveryTime: initialData?.deliveryTime || '',
    priceMonthly: initialData?.priceMonthly?.toString() || '',
    priceTrial: initialData?.priceTrial?.toString() || ''
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData | 'imageFile', string>>>({});
  const [uploadingImage, setUploadingImage] = useState(false);

  const categories = [
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

    if (!formData.category) newErrors.category = 'Category is required';
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (): Promise<void> => {
    if (!validateForm()) return;

    setUploadingImage(true);
    try {
      let finalImageUrl = formData.imageUrl;
      let finalImagePublicId = formData.imagePublicId;

      // NEW: Upload to Cloudinary if new file selected
      if (formData.imageFile) {
        const uploadResult = await imageUploadUtils.uploadImageToCloudinary(formData.imageFile);
        finalImageUrl = uploadResult.imageUrl;
        finalImagePublicId = uploadResult.imagePublicId;
      }

      const submissionData = {
        ...formData,
        imageUrl: finalImageUrl,
        imagePublicId: finalImagePublicId
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

  const isVeg = diet === 'veg';

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="bg-gray-50 p-6 rounded-xl">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.category}
              onChange={(e) => {
                setFormData({ ...formData, category: e.target.value });
                if (errors.category) setErrors({ ...errors, category: undefined });
              }}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.category ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
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
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
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
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Describe your menu..."
          />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
        </div>
      </div>

      {/* Image and Pricing */}
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
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.deliveryTime ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="30-45 minutes"
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
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.priceMonthly ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="2999"
              min="0"
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
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.priceTrial ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="40"
              min="0"
            />
            {errors.priceTrial && <p className="text-red-500 text-sm mt-1">{errors.priceTrial}</p>}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4 pt-6 border-t">
        <button
          onClick={handleSubmit}
          disabled={loading || uploadingImage}
          className={`flex-1 py-4 px-6 rounded-xl font-semibold text-white transition-all ${
            isVeg ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
          } ${(loading || uploadingImage) ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
        >
          {(loading || uploadingImage) ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
              {uploadingImage ? 'Uploading to Cloudinary...' : 'Saving...'}
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
          className="flex-1 py-4 px-6 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

// Menu Card Component
const MenuCard: React.FC<{
  menu: MenuItem;
  onEdit: (menu: MenuItem) => void;
  onDelete: (diet: 'veg' | 'non-veg', category: string, imagePublicId?: string) => void;
  onView: (menu: MenuItem) => void;
}> = ({ menu, onEdit, onDelete, onView }) => {
  const isVeg = menu.diet === 'veg';
  
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all hover:scale-105 border border-gray-100">
      <div className="relative">
        <img 
          src={apiEndpoints.getImageUrl(menu.imageUrl)}
          alt={menu.title}
          className="w-full h-52 object-cover"
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://via.placeholder.com/400x300?text=No+Image';
          }}
        />
        <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-semibold ${
          isVeg ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {isVeg ? '🌱 VEG' : '🍖 NON-VEG'}
        </div>
        {/* NEW: Cloudinary indicator */}
        {menu.imagePublicId && (
          <div className="absolute top-4 right-4 bg-blue-600 text-white px-2 py-1 rounded text-xs">
            ☁️ Cloud
          </div>
        )}
      </div>
      
      <div className="p-6">
        <h3 className={`font-bold text-xl mb-3 ${isVeg ? 'text-green-700' : 'text-red-600'}`}>
          {menu.title}
        </h3>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{menu.description}</p>
        
        <div className="flex items-center justify-between mb-4">
          <span className="text-teal-600 font-bold text-xl">
            ₹{menu.priceMonthly}
            <span className="text-sm text-gray-500 font-normal">/month</span>
          </span>
          <span className="text-gray-500 text-sm">Trial: ₹{menu.priceTrial}</span>
        </div>

        <div className="flex items-center text-gray-500 text-sm mb-4">
          <Clock className="w-4 h-4 mr-2" />
          {menu.deliveryTime}
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => onView(menu)}
            className="py-2 px-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 text-sm font-semibold"
          >
            <Eye className="w-4 h-4 inline mr-1" />
            View
          </button>
          <button
            onClick={() => onEdit(menu)}
            className="py-2 px-3 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 text-sm font-semibold"
          >
            <Edit className="w-4 h-4 inline mr-1" />
            Edit
          </button>
          <button
            onClick={() => onDelete(menu.diet, menu.category, menu.imagePublicId)}
            className="py-2 px-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 text-sm font-semibold"
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
const AdminMenuCatalogManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'veg' | 'non-veg'>('veg');
  const [vegMenus, setVegMenus] = useState<MenuItem[]>([]);
  const [nonVegMenus, setNonVegMenus] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [notification, setNotification] = useState<{ 
    message: string; 
    type: 'success' | 'error' | 'info' 
  } | null>(null);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<MenuItem | null>(null);

  const loadData = async (): Promise<void> => {
    setLoading(true);
    try {
      const [vegData, nonVegData] = await Promise.all([
        apiService.getAllVegMenus(),
        apiService.getAllNonVegMenus()
      ]);
      
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showNotification = (message: string, type: 'success' | 'error' | 'info'): void => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleCreateOrUpdate = async (formData: FormData): Promise<void> => {
    setFormLoading(true);
    try {
      const menuData = {
        category: formData.category,
        title: formData.title,
        description: formData.description,
        imageUrl: formData.imageUrl,
        imagePublicId: formData.imagePublicId,
        deliveryTime: formData.deliveryTime,
        priceMonthly: parseFloat(formData.priceMonthly),
        priceTrial: parseFloat(formData.priceTrial)
      };

      const savedMenu = await apiService.createOrUpdateMenuItem(activeTab, menuData);
      
      if (activeTab === 'veg') {
        const existingIndex = vegMenus.findIndex(m => m.category === savedMenu.category);
        if (existingIndex >= 0) {
          const updated = [...vegMenus];
          updated[existingIndex] = savedMenu;
          setVegMenus(updated);
        } else {
          setVegMenus(prev => [savedMenu, ...prev]);
        }
      } else {
        const existingIndex = nonVegMenus.findIndex(m => m.category === savedMenu.category);
        if (existingIndex >= 0) {
          const updated = [...nonVegMenus];
          updated[existingIndex] = savedMenu;
          setNonVegMenus(updated);
        } else {
          setNonVegMenus(prev => [savedMenu, ...prev]);
        }
      }

      setShowCreateModal(false);
      setShowEditModal(false);
      setSelectedMenu(null);
      showNotification('Menu saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving menu:', error);
      showNotification('Failed to save menu', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (diet: 'veg' | 'non-veg', category: string, imagePublicId?: string): Promise<void> => {
    if (!window.confirm(`Delete ${category} menu? This will also remove the image from Cloudinary.`)) return;

    try {
      await apiService.deleteMenuItem(diet, category, imagePublicId);
      
      if (diet === 'veg') {
        setVegMenus(prev => prev.filter(m => m.category !== category));
      } else {
        setNonVegMenus(prev => prev.filter(m => m.category !== category));
      }

      showNotification('Menu deleted successfully!', 'success');
    } catch (error) {
      console.error('Error deleting menu:', error);
      showNotification('Failed to delete menu', 'error');
    }
  };

  const currentMenus = activeTab === 'veg' ? vegMenus : nonVegMenus;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Menu Catalog Manager</h1>
              <p className="text-gray-600 text-lg mt-2">Manage mamatiffin menu items with Cloudinary storage</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-gray-600 bg-gray-100 px-4 py-2 rounded-lg">
                <ChefHat className="w-5 h-5 mr-2" />
                <span className="font-medium">Total: {vegMenus.length + nonVegMenus.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
            <div className="flex items-center">
              <div className="p-4 bg-green-100 rounded-2xl">
                <span className="text-3xl">🌱</span>
              </div>
              <div className="ml-6">
                <h3 className="text-xl font-bold text-gray-900">Veg Menus</h3>
                <p className="text-4xl font-bold text-green-600 mt-1">{vegMenus.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
            <div className="flex items-center">
              <div className="p-4 bg-red-100 rounded-2xl">
                <span className="text-3xl">🍖</span>
              </div>
              <div className="ml-6">
                <h3 className="text-xl font-bold text-gray-900">Non-Veg Menus</h3>
                <p className="text-4xl font-bold text-red-600 mt-1">{nonVegMenus.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
            <div className="flex items-center">
              <div className="p-4 bg-blue-100 rounded-2xl">
                <ImageIcon className="w-8 h-8 text-blue-600" />
              </div>
              <div className="ml-6">
                <h3 className="text-xl font-bold text-gray-900">Cloud Storage</h3>
                <p className="text-lg font-bold text-blue-600 mt-1">Cloudinary</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
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
                  🌱 Vegetarian ({vegMenus.length})
                </button>
                <button
                  onClick={() => setActiveTab('non-veg')}
                  className={`py-3 px-2 border-b-3 font-semibold text-lg transition-colors ${
                    activeTab === 'non-veg'
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  🍖 Non-Vegetarian ({nonVegMenus.length})
                </button>
              </div>
              
              <button
                onClick={() => setShowCreateModal(true)}
                className={`px-6 py-3 rounded-xl font-semibold text-white transition-all shadow-lg hover:shadow-xl hover:scale-105 ${
                  activeTab === 'veg' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                <Plus className="w-5 h-5 inline mr-2" />
                Add {activeTab === 'veg' ? 'Veg' : 'Non-Veg'} Menu
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {loading ? (
              <div className="flex justify-center items-center h-80">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-gray-900 mx-auto mb-6"></div>
                  <p className="text-xl text-gray-600">Loading menus...</p>
                </div>
              </div>
            ) : currentMenus.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-8xl mb-6">🍽️</div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  No {activeTab === 'veg' ? 'Vegetarian' : 'Non-Vegetarian'} Menus
                </h3>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className={`px-8 py-4 rounded-xl font-semibold text-white text-lg shadow-lg hover:shadow-xl hover:scale-105 ${
                    activeTab === 'veg' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  <Plus className="w-5 h-5 inline mr-2" />
                  Create First Menu
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {currentMenus.map(menu => (
                  <MenuCard
                    key={menu._id}
                    menu={menu}
                    onEdit={menu => {
                      setSelectedMenu(menu);
                      setShowEditModal(true);
                    }}
                    onDelete={handleDelete}
                    onView={menu => {
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
        title={`Create ${activeTab === 'veg' ? 'Vegetarian' : 'Non-Vegetarian'} Menu`}
      >
        <MenuForm
          diet={activeTab}
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
            diet={activeTab}
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
          <div className="space-y-6">
            <div className="text-center">
              <img 
                src={apiEndpoints.getImageUrl(selectedMenu.imageUrl)}
                alt={selectedMenu.title}
                className="w-full h-64 object-cover rounded-2xl border-2 border-gray-200 shadow-lg"
              />
              {selectedMenu.imagePublicId && (
                <p className="text-xs text-blue-600 mt-2">
                  ☁️ Stored on Cloudinary: {selectedMenu.imagePublicId}
                </p>
              )}
            </div>
            
            <div className="bg-gray-50 p-6 rounded-xl">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Information</h4>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <p className="text-lg font-semibold text-gray-900 mt-1">{selectedMenu.category}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Diet Type</label>
                  <p className="text-lg font-semibold text-gray-900 mt-1 capitalize">{selectedMenu.diet}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Monthly Price</label>
                  <p className="text-lg font-semibold text-green-600 mt-1">₹{selectedMenu.priceMonthly}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Trial Price</label>
                  <p className="text-lg font-semibold text-blue-600 mt-1">₹{selectedMenu.priceTrial}</p>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Delivery Time</label>
                  <p className="text-lg font-semibold text-gray-900 mt-1">{selectedMenu.deliveryTime}</p>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <p className="text-lg font-semibold text-gray-900">{selectedMenu.title}</p>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <p className="text-gray-900 leading-relaxed">{selectedMenu.description}</p>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => {
                setShowViewModal(false);
                setShowEditModal(true);
              }}
              className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all shadow-lg hover:shadow-xl hover:scale-105 ${
                selectedMenu.diet === 'veg' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              <Edit className="w-5 h-5 inline mr-2" />
              Edit This Menu
            </button>
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

export default AdminMenuCatalogManager;