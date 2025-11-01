// import React, { useState, useEffect, useCallback } from 'react';
// import { Plus, Edit, Trash2, Eye, Save, X, AlertCircle, CheckCircle, Clock, Users, Upload } from 'lucide-react';
// import { apiEndpoints } from '../configapi/api';

// // Types
// interface CatalogItem {
//   _id: string;
//   category: string;
//   imageUrl: string;
//   imagePublicId?: string;
//   price: number;
//   type: 'veg' | 'non-veg';
//   createdAt?: string;
//   updatedAt?: string;
// }

// interface FormData {
//   category: string;
//   imageFile: File | null;
//   imageUrl: string;
//   imagePublicId?: string; 
//   price: string;
// }

// // API Response interface
// interface ApiResponse {
//   success: boolean;
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   data?: any;
//   message?: string;
// }

// // Image upload utility functions
// const imageUploadUtils = {
//   fileToBase64: (file: File): Promise<string> => {
//     return new Promise((resolve, reject) => {
//       const reader = new FileReader();
//       reader.readAsDataURL(file);
//       reader.onload = () => resolve(reader.result as string);
//       reader.onerror = error => reject(error);
//     });
//   },

//   validateImageFile: (file: File): { isValid: boolean; error?: string } => {
//     const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
//     const maxSize = 5 * 1024 * 1024; // 5MB

//     if (!allowedTypes.includes(file.type)) {
//       return { isValid: false, error: 'Please select a valid image file (JPEG, PNG, WebP)' };
//     }

//     if (file.size > maxSize) {
//       return { isValid: false, error: 'Image size should be less than 5MB' };
//     }

//     return { isValid: true };
//   },

//   uploadImageToServer: async (file: File): Promise<string> => {
//     try {
//       const formData = new FormData();
//       formData.append('image', file);
      
//       const response = await fetch(apiEndpoints.uploadImage, {
//         method: 'POST',
//         body: formData
//       });

//       if (!response.ok) {
//         throw new Error('Image upload failed');
//       }

//       const data = await response.json();
//       return data.imageUrl;
//     } catch (error) {
//       console.error('Image upload error:', error);
//       throw new Error('Failed to upload image. Please try again.');
//     }
//   }
// };

// // API Service - FIXED: Using correct endpoint functions
// const apiService = {
//   // Veg Catalog APIs
//   getVegCatalog: async (): Promise<CatalogItem[]> => {
//     try {
//       const response = await fetch(apiEndpoints.vegCatalog);
//       const data: ApiResponse = await response.json();
//       return data.success ? data.data : [];
//     } catch (error) {
//       console.error('Error fetching veg catalog:', error);
//       return [
//         {
//           _id: '1',
//           category: 'Breakfast',
//           imageUrl: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=400&h=300&fit=crop',
//           price: 149,
//           type: 'veg',
//           createdAt: '2024-01-15T10:30:00Z'
//         },
//         {
//           _id: '2',
//           category: 'Lunch',
//           imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
//           price: 199,
//           type: 'veg',
//           createdAt: '2024-01-15T10:30:00Z'
//         }
//       ];
//     }
//   },

//   createVegItem: async (item: Omit<CatalogItem, '_id' | 'type' | 'createdAt' | 'updatedAt'>): Promise<CatalogItem> => {
//     try {
//       const response = await fetch(apiEndpoints.vegCatalog, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({ ...item, type: 'veg' })
//       });
//       const data: ApiResponse = await response.json();
//       if (data.success) {
//         return data.data;
//       }
//       throw new Error(data.message);
//     } catch (error) {
//       console.error('Error creating veg item:', error);
//       return {
//         _id: Date.now().toString(),
//         ...item,
//         type: 'veg',
//         createdAt: new Date().toISOString()
//       };
//     }
//   },

//   // FIXED: Using correct endpoint function
//   updateVegItem: async (id: string, item: Partial<CatalogItem>): Promise<CatalogItem> => {
//     try {
//       const response = await fetch(apiEndpoints.vegCatalogById(id), {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(item)
//       });
//       const data: ApiResponse = await response.json();
//       if (data.success) {
//         return data.data;
//       }
//       throw new Error(data.message);
//     } catch (error) {
//       console.error('Error updating veg item:', error);
//       return {
//         _id: id,
//         category: item.category || 'Updated Category',
//         imageUrl: item.imageUrl || '',
//         price: item.price || 0,
//         type: 'veg',
//         updatedAt: new Date().toISOString()
//       };
//     }
//   },

//   // FIXED: Using correct endpoint function
//   deleteVegItem: async (id: string): Promise<void> => {
//     try {
//       const response = await fetch(apiEndpoints.vegCatalogById(id), {
//         method: 'DELETE'
//       });
//       const data: ApiResponse = await response.json();
//       if (!data.success) {
//         throw new Error(data.message);
//       }
//     } catch (error) {
//       console.error('Error deleting veg item:', error);
//       await new Promise(resolve => setTimeout(resolve, 500));
//     }
//   },

//   // Non-Veg Catalog APIs
//   getNonVegCatalog: async (): Promise<CatalogItem[]> => {
//     try {
//       const response = await fetch(apiEndpoints.nonVegCatalog);
//       const data: ApiResponse = await response.json();
//       return data.success ? data.data : [];
//     } catch (error) {
//       console.error('Error fetching non-veg catalog:', error);
//       return [
//         {
//           _id: '3',
//           category: 'Breakfast',
//           imageUrl: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=400&h=300&fit=crop',
//           price: 179,
//           type: 'non-veg',
//           createdAt: '2024-01-15T10:30:00Z'
//         },
//         {
//           _id: '4',
//           category: 'Dinner',
//           imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
//           price: 299,
//           type: 'non-veg',
//           createdAt: '2024-01-15T10:30:00Z'
//         }
//       ];
//     }
//   },

//   createNonVegItem: async (item: Omit<CatalogItem, '_id' | 'type' | 'createdAt' | 'updatedAt'>): Promise<CatalogItem> => {
//     try {
//       const response = await fetch(apiEndpoints.nonVegCatalog, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({ ...item, type: 'non-veg' })
//       });
//       const data: ApiResponse = await response.json();
//       if (data.success) {
//         return data.data;
//       }
//       throw new Error(data.message);
//     } catch (error) {
//       console.error('Error creating non-veg item:', error);
//       return {
//         _id: Date.now().toString(),
//         ...item,
//         type: 'non-veg',
//         createdAt: new Date().toISOString()
//       };
//     }
//   },

//   // FIXED: Using correct endpoint function
//   updateNonVegItem: async (id: string, item: Partial<CatalogItem>): Promise<CatalogItem> => {
//     try {
//       const response = await fetch(apiEndpoints.nonVegCatalogById(id), {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(item)
//       });
//       const data: ApiResponse = await response.json();
//       if (data.success) {
//         return data.data;
//       }
//       throw new Error(data.message);
//     } catch (error) {
//       console.error('Error updating non-veg item:', error);
//       return {
//         _id: id,
//         category: item.category || 'Updated Category',
//         imageUrl: item.imageUrl || '',
//         price: item.price || 0,
//         type: 'non-veg',
//         updatedAt: new Date().toISOString()
//       };
//     }
//   },

//   // FIXED: Using correct endpoint function
//   deleteNonVegItem: async (id: string): Promise<void> => {
//     try {
//       const response = await fetch(apiEndpoints.nonVegCatalogById(id), {
//         method: 'DELETE'
//       });
//       const data: ApiResponse = await response.json();
//       if (!data.success) {
//         throw new Error(data.message);
//       }
//     } catch (error) {
//       console.error('Error deleting non-veg item:', error);
//       await new Promise(resolve => setTimeout(resolve, 500));
//     }
//   }
// };

// // Notification Component
// const Notification: React.FC<{ 
//   message: string; 
//   type: 'success' | 'error' | 'info'; 
//   onClose: () => void 
// }> = ({ message, type, onClose }) => {
//   const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
//   const Icon = type === 'success' ? CheckCircle : type === 'error' ? AlertCircle : Clock;

//   return (
//     <div className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center animate-slide-in`}>
//       <Icon className="w-5 h-5 mr-2" />
//       <span>{message}</span>
//       <button onClick={onClose} className="ml-4 text-white hover:text-gray-200">
//         <X className="w-4 h-4" />
//       </button>
//     </div>
//   );
// };

// // Modal Component
// const Modal: React.FC<{ 
//   isOpen: boolean; 
//   onClose: () => void; 
//   title: string; 
//   children: React.ReactNode 
// }> = ({ isOpen, onClose, title, children }) => {
//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
//       <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
//         <div className="flex justify-between items-center mb-4">
//           <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
//           <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
//             <X className="w-6 h-6" />
//           </button>
//         </div>
//         {children}
//       </div>
//     </div>
//   );
// };

// // Image Upload Component
// const ImageUploadComponent: React.FC<{
//   imageFile: File | null;
//   imageUrl: string;
//   onImageChange: (file: File | null, url: string) => void;
//   error?: string;
// }> = ({ imageFile, imageUrl, onImageChange, error }) => {
//   const [dragActive, setDragActive] = useState(false);
//   const [uploading, setUploading] = useState(false);

//   const handleFileChange = async (file: File) => {
//     setUploading(true);
//     try {
//       const validation = imageUploadUtils.validateImageFile(file);
//       if (!validation.isValid) {
//         throw new Error(validation.error);
//       }

//       const previewUrl = await imageUploadUtils.fileToBase64(file);
//       onImageChange(file, previewUrl);
//     } catch (error) {
//       console.error('File handling error:', error);
//       onImageChange(null, '');
//     } finally {
//       setUploading(false);
//     }
//   };

//   const handleDrag = (e: React.DragEvent) => {
//     e.preventDefault();
//     e.stopPropagation();
//     if (e.type === "dragenter" || e.type === "dragover") {
//       setDragActive(true);
//     } else if (e.type === "dragleave") {
//       setDragActive(false);
//     }
//   };

//   const handleDrop = (e: React.DragEvent) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setDragActive(false);

//     const files = e.dataTransfer.files;
//     if (files && files[0]) {
//       handleFileChange(files[0]);
//     }
//   };

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const files = e.target.files;
//     if (files && files[0]) {
//       handleFileChange(files[0]);
//     }
//   };

//   return (
//     <div className="space-y-3">
//       <label className="block text-sm font-medium text-gray-700 mb-1">
//         Item Image <span className="text-red-500">*</span>
//       </label>
      
//       <div
//         className={`relative border-2 border-dashed rounded-md p-4 text-center transition-colors ${
//           dragActive
//             ? 'border-blue-500 bg-blue-50'
//             : error
//             ? 'border-red-500 bg-red-50'
//             : 'border-gray-300 hover:border-gray-400'
//         }`}
//         onDragEnter={handleDrag}
//         onDragLeave={handleDrag}
//         onDragOver={handleDrag}
//         onDrop={handleDrop}
//       >
//         <input
//           type="file"
//           accept="image/*"
//           onChange={handleInputChange}
//           className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
//           disabled={uploading}
//         />
        
//         {uploading ? (
//           <div className="flex flex-col items-center py-2">
//             <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent mb-2"></div>
//             <p className="text-gray-600 text-sm">Processing image...</p>
//           </div>
//         ) : imageUrl ? (
//           <div className="space-y-2">
//             <img 
//               src={imageUrl} 
//               alt="Preview" 
//               className="w-full h-32 object-cover rounded-md border"
//             />
//             <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
//               <CheckCircle className="w-4 h-4 text-green-500" />
//               <span>Image selected {imageFile ? `(${imageFile.name})` : ''}</span>
//             </div>
//             <button
//               type="button"
//               onClick={() => onImageChange(null, '')}
//               className="text-red-600 hover:text-red-800 text-sm font-medium"
//             >
//               Remove Image
//             </button>
//           </div>
//         ) : (
//           <div className="space-y-2 py-2">
//             <div className="flex justify-center">
//               <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
//                 <Upload className="w-4 h-4 text-gray-400" />
//               </div>
//             </div>
//             <div>
//               <p className="text-gray-600 font-medium text-sm">Click to upload or drag and drop</p>
//               <p className="text-xs text-gray-500">PNG, JPG, WebP up to 5MB</p>
//             </div>
//           </div>
//         )}
//       </div>

//       {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
//     </div>
//   );
// };

// // Form Component
// const ItemForm: React.FC<{
//   initialData?: CatalogItem;
//   type: 'veg' | 'non-veg';
//   onSubmit: (data: FormData) => void;
//   onCancel: () => void;
//   loading: boolean;
// }> = ({ initialData, type, onSubmit, onCancel, loading }) => {
//   const [formData, setFormData] = useState<FormData>({
//     category: initialData?.category || '',
//     imageFile: null,
//     imageUrl: initialData?.imageUrl || '',
//     price: initialData?.price?.toString() || ''
//   });

//   const [errors, setErrors] = useState<Partial<Record<keyof FormData | 'imageFile', string>>>({});
//   const [uploadingImage, setUploadingImage] = useState(false);

//   const categories = [
//     'Breakfast',
//     'Lunch',
//     'Dinner',
//     'Breakfast + Lunch',
//     'Breakfast + Dinner',
//     'Lunch + Dinner',
//     'Breakfast + Lunch + Dinner'
//   ];

//   const validateForm = (): boolean => {
//     const newErrors: Record<string, string> = {};

//     if (!formData.category) {
//       newErrors.category = 'Category is required';
//     }

//     if (!formData.imageFile && !formData.imageUrl) {
//       newErrors.imageFile = 'Please select an image';
//     }

//     if (!formData.price) {
//       newErrors.price = 'Price is required';
//     } else if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
//       newErrors.price = 'Price must be a positive number';
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async (): Promise<void> => {
//     if (!validateForm()) return;

//     setUploadingImage(true);
//     try {
//       let finalImageUrl = formData.imageUrl;

//       if (formData.imageFile) {
//         finalImageUrl = await imageUploadUtils.uploadImageToServer(formData.imageFile);
//       }

//       const submissionData = {
//         ...formData,
//         imageUrl: finalImageUrl
//       };

//       onSubmit(submissionData);
//     } catch (error) {
//       console.error('Error during submission:', error);
//       setErrors({ ...errors, imageFile: 'Failed to upload image. Please try again.' });
//     } finally {
//       setUploadingImage(false);
//     }
//   };

//   const handleImageChange = (file: File | null, url: string) => {
//     setFormData({ ...formData, imageFile: file, imageUrl: url });
//     if (errors.imageFile) {
//       setErrors({ ...errors, imageFile: undefined });
//     }
//   };

//   const isVeg = type === 'veg';

//   return (
//     <div className="space-y-4">
//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-1">
//           Category <span className="text-red-500">*</span>
//         </label>
//         <select
//           value={formData.category}
//           onChange={(e) => {
//             setFormData({ ...formData, category: e.target.value });
//             if (errors.category) setErrors({ ...errors, category: undefined });
//           }}
//           className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
//             errors.category ? 'border-red-500' : 'border-gray-300'
//           }`}
//         >
//           <option value="">Select Category</option>
//           {categories.map(cat => (
//             <option key={cat} value={cat}>{cat}</option>
//           ))}
//         </select>
//         {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
//       </div>

//       <ImageUploadComponent
//         imageFile={formData.imageFile}
//         imageUrl={formData.imageUrl}
//         onImageChange={handleImageChange}
//         error={errors.imageFile}
//       />

//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-1">
//           Price (₹) <span className="text-red-500">*</span>
//         </label>
//         <input
//           type="number"
//           value={formData.price}
//           onChange={(e) => {
//             setFormData({ ...formData, price: e.target.value });
//             if (errors.price) setErrors({ ...errors, price: undefined });
//           }}
//           className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
//             errors.price ? 'border-red-500' : 'border-gray-300'
//           }`}
//           placeholder="199"
//           min="0"
//           step="0.01"
//         />
//         {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
//       </div>

//       <div className="flex space-x-3 pt-4">
//         <button
//           onClick={handleSubmit}
//           disabled={loading || uploadingImage}
//           className={`flex-1 py-2 px-4 rounded-md font-medium text-white transition-colors ${
//             isVeg 
//               ? 'bg-green-600 hover:bg-green-700' 
//               : 'bg-red-600 hover:bg-red-700'
//           } ${(loading || uploadingImage) ? 'opacity-50 cursor-not-allowed' : ''}`}
//         >
//           {(loading || uploadingImage) ? (
//             <div className="flex items-center justify-center">
//               <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
//               {uploadingImage ? 'Uploading...' : 'Saving...'}
//             </div>
//           ) : (
//             <div className="flex items-center justify-center">
//               <Save className="w-4 h-4 mr-2" />
//               {initialData ? 'Update Item' : 'Create Item'}
//             </div>
//           )}
//         </button>
//         <button
//           onClick={onCancel}
//           disabled={loading || uploadingImage}
//           className="flex-1 py-2 px-4 border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
//         >
//           Cancel
//         </button>
//       </div>
//     </div>
//   );
// };

// // Item Card Component
// const ItemCard: React.FC<{
//   item: CatalogItem;
//   onEdit: (item: CatalogItem) => void;
//   onDelete: (id: string) => void;
//   onView: (item: CatalogItem) => void;
// }> = ({ item, onEdit, onDelete, onView }) => {
//   const isVeg = item.type === 'veg';
  
//   return (
//     <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
//       <div className="relative">
//         <img 
//           src={item.imageUrl} 
//           alt={item.category}
//           className="w-full h-48 object-cover"
//           loading="lazy"
//         />
//         <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium ${
//           isVeg ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
//         }`}>
//           {isVeg ? '🌱 VEG' : '🍖 NON-VEG'}
//         </div>
//       </div>
      
//       <div className="p-4">
//         <h3 className={`font-bold text-lg mb-2 ${
//           isVeg ? 'text-green-700' : 'text-red-600'
//         }`}>
//           {item.category}
//         </h3>
        
//         <div className="flex items-center justify-between mb-3">
//           <span className="text-teal-600 font-medium text-xl">
//             ₹{item.price}
//           </span>
//           <span className="text-gray-500 text-sm">
//             ID: {item._id.slice(-6)}
//           </span>
//         </div>
        
//         <div className="flex space-x-2">
//           <button
//             onClick={() => onView(item)}
//             className="flex-1 py-2 px-3 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm font-medium"
//           >
//             <Eye className="w-4 h-4 inline mr-1" />
//             View
//           </button>
//           <button
//             onClick={() => onEdit(item)}
//             className="flex-1 py-2 px-3 bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200 transition-colors text-sm font-medium"
//           >
//             <Edit className="w-4 h-4 inline mr-1" />
//             Edit
//           </button>
//           <button
//             onClick={() => onDelete(item._id)}
//             className="flex-1 py-2 px-3 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors text-sm font-medium"
//           >
//             <Trash2 className="w-4 h-4 inline mr-1" />
//             Delete
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// // Main Menu Catalog Manager Component
// const MenuTimeCatalogManager: React.FC = () => {
//   const [activeTab, setActiveTab] = useState<'veg' | 'non-veg'>('veg');
//   const [vegItems, setVegItems] = useState<CatalogItem[]>([]);
//   const [nonVegItems, setNonVegItems] = useState<CatalogItem[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [formLoading, setFormLoading] = useState(false);
//   const [notification, setNotification] = useState<{ 
//     message: string; 
//     type: 'success' | 'error' | 'info' 
//   } | null>(null);
  
//   // Modal states
//   const [showCreateModal, setShowCreateModal] = useState(false);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [showViewModal, setShowViewModal] = useState(false);
//   const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);

//   // FIXED: Added useCallback to fix the dependency warning
//   const loadData = useCallback(async (): Promise<void> => {
//     setLoading(true);
//     try {
//       const [vegData, nonVegData] = await Promise.all([
//         apiService.getVegCatalog(),
//         apiService.getNonVegCatalog()
//       ]);
//       setVegItems(vegData);
//       setNonVegItems(nonVegData);
//     } catch (error) {
//       console.error(error);
//       showNotification('Failed to load data', 'error');
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     void loadData();
//   }, [loadData]);

//   const showNotification = (message: string, type: 'success' | 'error' | 'info'): void => {
//     setNotification({ message, type });
//     setTimeout(() => setNotification(null), 4000);
//   };

//   const handleCreate = async (formData: FormData): Promise<void> => {
//     setFormLoading(true);
//     try {
//       const itemData = {
//         category: formData.category,
//         imageUrl: formData.imageUrl,
//         price: parseFloat(formData.price)
//       };

//       let newItem: CatalogItem;
//       if (activeTab === 'veg') {
//         newItem = await apiService.createVegItem(itemData);
//         setVegItems(prev => [newItem, ...prev]);
//       } else {
//         newItem = await apiService.createNonVegItem(itemData);
//         setNonVegItems(prev => [newItem, ...prev]);
//       }

//       setShowCreateModal(false);
//       showNotification(`${activeTab === 'veg' ? 'Vegetarian' : 'Non-Vegetarian'} item created successfully!`, 'success');
//     } catch (error) {
//       console.error(error);
//       showNotification('Failed to create item. Please try again.', 'error');
//     } finally {
//       setFormLoading(false);
//     }
//   };

//   const handleUpdate = async (formData: FormData): Promise<void> => {
//     if (!selectedItem) return;
    
//     setFormLoading(true);
//     try {
//       const itemData = {
//         category: formData.category,
//         imageUrl: formData.imageUrl,
//         price: parseFloat(formData.price)
//       };

//       let updatedItem: CatalogItem;
//       if (activeTab === 'veg') {
//         updatedItem = await apiService.updateVegItem(selectedItem._id, itemData);
//         setVegItems(prev => prev.map(item => item._id === selectedItem._id ? updatedItem : item));
//       } else {
//         updatedItem = await apiService.updateNonVegItem(selectedItem._id, itemData);
//         setNonVegItems(prev => prev.map(item => item._id === selectedItem._id ? updatedItem : item));
//       }

//       setShowEditModal(false);
//       setSelectedItem(null);
//       showNotification(`${activeTab === 'veg' ? 'Vegetarian' : 'Non-Vegetarian'} item updated successfully!`, 'success');
//     } catch (error) {
//       console.error(error);
//       showNotification('Failed to update item. Please try again.', 'error');
//     } finally {
//       setFormLoading(false);
//     }
//   };

//   // Delete item
//   const handleDelete = async (id: string): Promise<void> => {
//     if (!window.confirm('Are you sure you want to delete this item? This action cannot be undone.')) return;

//     try {
//       if (activeTab === 'veg') {
//         await apiService.deleteVegItem(id);
//         setVegItems(prev => prev.filter(item => item._id !== id));
//       } else {
//         await apiService.deleteNonVegItem(id);
//         setNonVegItems(prev => prev.filter(item => item._id !== id));
//       }

//       showNotification(`${activeTab === 'veg' ? 'Vegetarian' : 'Non-Vegetarian'} item deleted successfully!`, 'success');
//     } catch (error) {
//       console.error(error);
//       showNotification('Failed to delete item. Please try again.', 'error');
//     }
//   };

//   const currentItems = activeTab === 'veg' ? vegItems : nonVegItems;
//   const totalVegItems = vegItems.length;
//   const totalNonVegItems = nonVegItems.length;

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <div className="bg-white shadow-sm border-b">
//         <div className="max-w-7xl mx-auto px-4 py-4">
//           <div className="flex justify-between items-center">
//             <div>
//               <h1 className="text-2xl font-bold text-gray-900">Menu Catalog Management</h1>
//               <p className="text-gray-600 text-sm mt-1">Manage your mamatiffin menu items</p>
//             </div>
//             <div className="flex items-center space-x-4">
//               <div className="flex items-center text-gray-600">
//                 <Users className="w-5 h-5 mr-2" />
//                 <span className="text-sm">Total Items: {totalVegItems + totalNonVegItems}</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Stats Cards */}
//       <div className="max-w-7xl mx-auto px-4 py-6">
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
//           <div className="bg-white rounded-lg shadow p-6">
//             <div className="flex items-center">
//               <div className="p-2 bg-green-100 rounded-lg">
//                 <span className="text-2xl">🌱</span>
//               </div>
//               <div className="ml-4">
//                 <h3 className="text-lg font-semibold text-gray-900">Veg Items</h3>
//                 <p className="text-3xl font-bold text-green-600">{totalVegItems}</p>
//                 <p className="text-xs text-gray-500">Vegetarian Menu Items</p>
//               </div>
//             </div>
//           </div>
          
//           <div className="bg-white rounded-lg shadow p-6">
//             <div className="flex items-center">
//               <div className="p-2 bg-red-100 rounded-lg">
//                 <span className="text-2xl">🍖</span>
//               </div>
//               <div className="ml-4">
//                 <h3 className="text-lg font-semibold text-gray-900">Non-Veg Items</h3>
//                 <p className="text-3xl font-bold text-red-600">{totalNonVegItems}</p>
//                 <p className="text-xs text-gray-500">Non-Vegetarian Menu Items</p>
//               </div>
//             </div>
//           </div>
          
//           <div className="bg-white rounded-lg shadow p-6">
//             <div className="flex items-center">
//               <div className="p-2 bg-blue-100 rounded-lg">
//                 <span className="text-2xl">📊</span>
//               </div>
//               <div className="ml-4">
//                 <h3 className="text-lg font-semibold text-gray-900">Total Items</h3>
//                 <p className="text-3xl font-bold text-blue-600">{totalVegItems + totalNonVegItems}</p>
//                 <p className="text-xs text-gray-500">All Menu Items</p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Tabs and Actions */}
//         <div className="bg-white rounded-lg shadow">
//           <div className="border-b border-gray-200">
//             <div className="flex justify-between items-center px-6 py-4">
//               <div className="flex space-x-8">
//                 <button
//                   onClick={() => setActiveTab('veg')}
//                   className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
//                     activeTab === 'veg'
//                       ? 'border-green-500 text-green-600'
//                       : 'border-transparent text-gray-500 hover:text-gray-700'
//                   }`}
//                 >
//                   🌱 Vegetarian Catalog ({totalVegItems})
//                 </button>
//                 <button
//                   onClick={() => setActiveTab('non-veg')}
//                   className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
//                     activeTab === 'non-veg'
//                       ? 'border-red-500 text-red-600'
//                       : 'border-transparent text-gray-500 hover:text-gray-700'
//                   }`}
//                 >
//                   🍖 Non-Vegetarian Catalog ({totalNonVegItems})
//                 </button>
//               </div>
              
//               <button
//                 onClick={() => setShowCreateModal(true)}
//                 className={`px-4 py-2 rounded-md font-medium text-white transition-colors ${
//                   activeTab === 'veg' 
//                     ? 'bg-green-600 hover:bg-green-700' 
//                     : 'bg-red-600 hover:bg-red-700'
//                 }`}
//               >
//                 <Plus className="w-4 h-4 inline mr-2" />
//                 Add New {activeTab === 'veg' ? 'Veg' : 'Non-Veg'} Item
//               </button>
//             </div>
//           </div>

//           {/* Content */}
//           <div className="p-6">
//             {loading ? (
//               <div className="flex justify-center items-center h-64">
//                 <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900"></div>
//                 <p className="ml-4 text-gray-600">Loading menu items...</p>
//               </div>
//             ) : currentItems.length === 0 ? (
//               <div className="text-center py-12">
//                 <div className="text-6xl mb-4">🍽️</div>
//                 <h3 className="text-xl font-semibold text-gray-900 mb-2">
//                   No {activeTab === 'veg' ? 'Vegetarian' : 'Non-Vegetarian'} Items
//                 </h3>
//                 <p className="text-gray-600 mb-4">Get started by adding your first menu item!</p>
//                 <button
//                   onClick={() => setShowCreateModal(true)}
//                   className={`px-6 py-3 rounded-md font-medium text-white ${
//                     activeTab === 'veg' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
//                   }`}
//                 >
//                   <Plus className="w-4 h-4 inline mr-2" />
//                   Add First Item
//                 </button>
//               </div>
//             ) : (
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                 {currentItems.map((item) => (
//                   <ItemCard
//                     key={item._id}
//                     item={item}
//                     onEdit={(item) => {
//                       setSelectedItem(item);
//                       setShowEditModal(true);
//                     }}
//                     onDelete={handleDelete}
//                     onView={(item) => {
//                       setSelectedItem(item);
//                       setShowViewModal(true);
//                     }}
//                   />
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Modals */}
//       <Modal
//         isOpen={showCreateModal}
//         onClose={() => setShowCreateModal(false)}
//         title={`Create New ${activeTab === 'veg' ? 'Vegetarian' : 'Non-Vegetarian'} Item`}
//       >
//         <ItemForm
//           type={activeTab}
//           onSubmit={handleCreate}
//           onCancel={() => setShowCreateModal(false)}
//           loading={formLoading}
//         />
//       </Modal>

//       <Modal
//         isOpen={showEditModal}
//         onClose={() => {
//           setShowEditModal(false);
//           setSelectedItem(null);
//         }}
//         title={`Edit ${activeTab === 'veg' ? 'Vegetarian' : 'Non-Vegetarian'} Item`}
//       >
//         {selectedItem && (
//           <ItemForm
//             initialData={selectedItem}
//             type={activeTab}
//             onSubmit={handleUpdate}
//             onCancel={() => {
//               setShowEditModal(false);
//               setSelectedItem(null);
//             }}
//             loading={formLoading}
//           />
//         )}
//       </Modal>

//       <Modal
//         isOpen={showViewModal}
//         onClose={() => {
//           setShowViewModal(false);
//           setSelectedItem(null);
//         }}
//         title="Item Details"
//       >
//         {selectedItem && (
//           <div className="space-y-4">
//             <div>
//               <img 
//                 src={selectedItem.imageUrl} 
//                 alt={selectedItem.category}
//                 className="w-full h-48 object-cover rounded-md border"
//               />
//             </div>
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Category</label>
//                 <p className="text-gray-900 font-semibold">{selectedItem.category}</p>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Price</label>
//                 <p className="text-gray-900 font-semibold">₹{selectedItem.price}</p>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Type</label>
//                 <p className="text-gray-900 font-semibold capitalize">{selectedItem.type}</p>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">ID</label>
//                 <p className="text-gray-900 font-mono text-sm">{selectedItem._id}</p>
//               </div>
//             </div>
//             {selectedItem.createdAt && (
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Created At</label>
//                 <p className="text-gray-900">{new Date(selectedItem.createdAt).toLocaleString()}</p>
//               </div>
//             )}
//             {selectedItem.updatedAt && (
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Last Updated</label>
//                 <p className="text-gray-900">{new Date(selectedItem.updatedAt).toLocaleString()}</p>
//               </div>
//             )}
//             <div className="pt-4">
//               <button
//                 onClick={() => {
//                   setShowViewModal(false);
//                   setShowEditModal(true);
//                 }}
//                 className={`w-full py-2 px-4 rounded-md font-medium text-white ${
//                   selectedItem.type === 'veg' 
//                     ? 'bg-green-600 hover:bg-green-700' 
//                     : 'bg-red-600 hover:bg-red-700'
//                 }`}
//               >
//                 <Edit className="w-4 h-4 inline mr-2" />
//                 Edit This Item
//               </button>
//             </div>
//           </div>
//         )}
//       </Modal>

//       {/* Notification */}
//       {notification && (
//         <Notification
//           message={notification.message}
//           type={notification.type}
//           onClose={() => setNotification(null)}
//         />
//       )}
//     </div>
//   );
// };

// export default MenuTimeCatalogManager;

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Eye, Save, X, AlertCircle, CheckCircle, Clock, Users, Upload } from 'lucide-react';
import { apiEndpoints } from '../configapi/api';

// Types - UPDATED with imagePublicId
interface CatalogItem {
  _id: string;
  category: string;
  imageUrl: string;
  imagePublicId?: string; // NEW: Cloudinary support
  price: number;
  type: 'veg' | 'non-veg';
  createdAt?: string;
  updatedAt?: string;
}

interface FormData {
  category: string;
  imageFile: File | null;
  imageUrl: string;
  imagePublicId?: string; // NEW: Cloudinary support
  price: string;
}

// API Response interface
interface ApiResponse {
  success: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
  message?: string;
}

// UPDATED: Image upload utility functions with Cloudinary
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
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      return { isValid: false, error: 'Please select a valid image file (JPEG, PNG, WebP)' };
    }

    if (file.size > maxSize) {
      return { isValid: false, error: 'Image size should be less than 5MB' };
    }

    return { isValid: true };
  },

  // NEW: Upload to Cloudinary
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

      const data = await response.json();
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
        // support apiEndpoints objects that may not define deleteImage
        type ImageEndpoints = {
          deleteImage?: string | ((publicId: string) => string);
          uploadImage?: string;
        };
        const endpoints = apiEndpoints as unknown as ImageEndpoints;
        const deleteImageProp = endpoints.deleteImage;
        const url =
          typeof deleteImageProp === 'function'
            ? deleteImageProp(publicId)
            : deleteImageProp ?? `${endpoints.uploadImage}/delete`;
  
        const response = await fetch(url, {
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
  // Veg Catalog APIs
  getVegCatalog: async (): Promise<CatalogItem[]> => {
    try {
      const response = await fetch(apiEndpoints.vegCatalog);
      const data: ApiResponse = await response.json();
      return data.success ? data.data : [];
    } catch (error) {
      console.error('Error fetching veg catalog:', error);
      return [];
    }
  },

  createVegItem: async (item: Omit<CatalogItem, '_id' | 'type' | 'createdAt' | 'updatedAt'>): Promise<CatalogItem> => {
    try {
      const response = await fetch(apiEndpoints.vegCatalog, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...item, type: 'veg' })
      });
      const data: ApiResponse = await response.json();
      if (data.success) {
        return data.data;
      }
      throw new Error(data.message);
    } catch (error) {
      console.error('Error creating veg item:', error);
      throw error;
    }
  },

  updateVegItem: async (id: string, item: Partial<CatalogItem>): Promise<CatalogItem> => {
    try {
      const response = await fetch(apiEndpoints.vegCatalogById(id), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(item)
      });
      const data: ApiResponse = await response.json();
      if (data.success) {
        return data.data;
      }
      throw new Error(data.message);
    } catch (error) {
      console.error('Error updating veg item:', error);
      throw error;
    }
  },

  deleteVegItem: async (id: string, imagePublicId?: string): Promise<void> => {
    try {
      // Delete from Cloudinary first
      if (imagePublicId) {
        await imageUploadUtils.deleteImageFromCloudinary(imagePublicId);
      }

      const response = await fetch(apiEndpoints.vegCatalogById(id), {
        method: 'DELETE'
      });
      const data: ApiResponse = await response.json();
      if (!data.success) {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error deleting veg item:', error);
      throw error;
    }
  },

  // Non-Veg Catalog APIs
  getNonVegCatalog: async (): Promise<CatalogItem[]> => {
    try {
      const response = await fetch(apiEndpoints.nonVegCatalog);
      const data: ApiResponse = await response.json();
      return data.success ? data.data : [];
    } catch (error) {
      console.error('Error fetching non-veg catalog:', error);
      return [];
    }
  },

  createNonVegItem: async (item: Omit<CatalogItem, '_id' | 'type' | 'createdAt' | 'updatedAt'>): Promise<CatalogItem> => {
    try {
      const response = await fetch(apiEndpoints.nonVegCatalog, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...item, type: 'non-veg' })
      });
      const data: ApiResponse = await response.json();
      if (data.success) {
        return data.data;
      }
      throw new Error(data.message);
    } catch (error) {
      console.error('Error creating non-veg item:', error);
      throw error;
    }
  },

  updateNonVegItem: async (id: string, item: Partial<CatalogItem>): Promise<CatalogItem> => {
    try {
      const response = await fetch(apiEndpoints.nonVegCatalogById(id), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(item)
      });
      const data: ApiResponse = await response.json();
      if (data.success) {
        return data.data;
      }
      throw new Error(data.message);
    } catch (error) {
      console.error('Error updating non-veg item:', error);
      throw error;
    }
  },

  deleteNonVegItem: async (id: string, imagePublicId?: string): Promise<void> => {
    try {
      // Delete from Cloudinary first
      if (imagePublicId) {
        await imageUploadUtils.deleteImageFromCloudinary(imagePublicId);
      }

      const response = await fetch(apiEndpoints.nonVegCatalogById(id), {
        method: 'DELETE'
      });
      const data: ApiResponse = await response.json();
      if (!data.success) {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error deleting non-veg item:', error);
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
    <div className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center animate-slide-in`}>
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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
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
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Item Image <span className="text-red-500">*</span>
      </label>
      
      <div
        className={`relative border-2 border-dashed rounded-md p-4 text-center transition-colors ${
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
          <div className="flex flex-col items-center py-2">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent mb-2"></div>
            <p className="text-gray-600 text-sm">Processing image...</p>
          </div>
        ) : imageUrl ? (
          <div className="space-y-2">
            <img 
              src={imageUrl} 
              alt="Preview" 
              className="w-full h-32 object-cover rounded-md border"
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
          <div className="space-y-2 py-2">
            <div className="flex justify-center">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <Upload className="w-4 h-4 text-gray-400" />
              </div>
            </div>
            <div>
              <p className="text-gray-600 font-medium text-sm">Click to upload or drag and drop</p>
              <p className="text-xs text-gray-500">PNG, JPG, WebP up to 5MB</p>
              <p className="text-xs text-blue-600 mt-1">✓ Will be uploaded to Cloudinary</p>
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

// UPDATED: Form Component with Cloudinary support
const ItemForm: React.FC<{
  initialData?: CatalogItem;
  type: 'veg' | 'non-veg';
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
  loading: boolean;
}> = ({ initialData, type, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState<FormData>({
    category: initialData?.category || '',
    imageFile: null,
    imageUrl: initialData?.imageUrl || '',
    imagePublicId: initialData?.imagePublicId || '', // NEW
    price: initialData?.price?.toString() || ''
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

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.imageFile && !formData.imageUrl) {
      newErrors.imageFile = 'Please select an image';
    }

    if (!formData.price) {
      newErrors.price = 'Price is required';
    } else if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Price must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // UPDATED: Handle submit with Cloudinary
  const handleSubmit = async (): Promise<void> => {
    if (!validateForm()) return;

    setUploadingImage(true);
    try {
      let finalImageUrl = formData.imageUrl;
      let finalImagePublicId = formData.imagePublicId;

      // NEW: Upload to Cloudinary if new file
      if (formData.imageFile) {
        const uploadResult = await imageUploadUtils.uploadImageToCloudinary(formData.imageFile);
        finalImageUrl = uploadResult.imageUrl;
        finalImagePublicId = uploadResult.imagePublicId;
      }

      const submissionData = {
        ...formData,
        imageUrl: finalImageUrl,
        imagePublicId: finalImagePublicId // NEW
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

  const isVeg = type === 'veg';

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Category <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.category}
          onChange={(e) => {
            setFormData({ ...formData, category: e.target.value });
            if (errors.category) setErrors({ ...errors, category: undefined });
          }}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.category ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">Select Category</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
      </div>

      <ImageUploadComponent
        imageFile={formData.imageFile}
        imageUrl={formData.imageUrl}
        onImageChange={handleImageChange}
        error={errors.imageFile}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Price (₹) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          value={formData.price}
          onChange={(e) => {
            setFormData({ ...formData, price: e.target.value });
            if (errors.price) setErrors({ ...errors, price: undefined });
          }}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.price ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="199"
          min="0"
          step="0.01"
        />
        {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
      </div>

      <div className="flex space-x-3 pt-4">
        <button
          onClick={handleSubmit}
          disabled={loading || uploadingImage}
          className={`flex-1 py-2 px-4 rounded-md font-medium text-white transition-colors ${
            isVeg 
              ? 'bg-green-600 hover:bg-green-700' 
              : 'bg-red-600 hover:bg-red-700'
          } ${(loading || uploadingImage) ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {(loading || uploadingImage) ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
              {uploadingImage ? 'Uploading to Cloudinary...' : 'Saving...'}
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <Save className="w-4 h-4 mr-2" />
              {initialData ? 'Update Item' : 'Create Item'}
            </div>
          )}
        </button>
        <button
          onClick={onCancel}
          disabled={loading || uploadingImage}
          className="flex-1 py-2 px-4 border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

// UPDATED: Item Card Component with Cloudinary support
const ItemCard: React.FC<{
  item: CatalogItem;
  onEdit: (item: CatalogItem) => void;
  onDelete: (id: string, imagePublicId?: string) => void;
  onView: (item: CatalogItem) => void;
}> = ({ item, onEdit, onDelete, onView }) => {
  const isVeg = item.type === 'veg';
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative">
        <img 
          src={apiEndpoints.getImageUrl(item.imageUrl)} 
          alt={item.category}
          className="w-full h-48 object-cover"
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://via.placeholder.com/400x300?text=No+Image';
          }}
        />
        <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium ${
          isVeg ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {isVeg ? '🌱 VEG' : '🍖 NON-VEG'}
        </div>
        {item.imagePublicId && (
          <div className="absolute top-3 right-3 bg-blue-600 text-white px-2 py-1 rounded text-xs">
            ☁️ Cloud
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className={`font-bold text-lg mb-2 ${
          isVeg ? 'text-green-700' : 'text-red-600'
        }`}>
          {item.category}
        </h3>
        
        <div className="flex items-center justify-between mb-3">
          <span className="text-teal-600 font-medium text-xl">
            ₹{item.price}
          </span>
          <span className="text-gray-500 text-sm">
            ID: {item._id.slice(-6)}
          </span>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => onView(item)}
            className="flex-1 py-2 px-3 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm font-medium"
          >
            <Eye className="w-4 h-4 inline mr-1" />
            View
          </button>
          <button
            onClick={() => onEdit(item)}
            className="flex-1 py-2 px-3 bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200 transition-colors text-sm font-medium"
          >
            <Edit className="w-4 h-4 inline mr-1" />
            Edit
          </button>
          <button
            onClick={() => onDelete(item._id, item.imagePublicId)}
            className="flex-1 py-2 px-3 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors text-sm font-medium"
          >
            <Trash2 className="w-4 h-4 inline mr-1" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Menu Catalog Manager Component
const MenuTimeCatalogManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'veg' | 'non-veg'>('veg');
  const [vegItems, setVegItems] = useState<CatalogItem[]>([]);
  const [nonVegItems, setNonVegItems] = useState<CatalogItem[]>([]);
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
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);

  const loadData = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const [vegData, nonVegData] = await Promise.all([
        apiService.getVegCatalog(),
        apiService.getNonVegCatalog()
      ]);
      setVegItems(vegData);
      setNonVegItems(nonVegData);
    } catch (error) {
      console.error(error);
      showNotification('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const showNotification = (message: string, type: 'success' | 'error' | 'info'): void => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // UPDATED: Create with imagePublicId
  const handleCreate = async (formData: FormData): Promise<void> => {
    setFormLoading(true);
    try {
      const itemData = {
        category: formData.category,
        imageUrl: formData.imageUrl,
        imagePublicId: formData.imagePublicId, // NEW
        price: parseFloat(formData.price)
      };

      let newItem: CatalogItem;
      if (activeTab === 'veg') {
        newItem = await apiService.createVegItem(itemData);
        setVegItems(prev => [newItem, ...prev]);
      } else {
        newItem = await apiService.createNonVegItem(itemData);
        setNonVegItems(prev => [newItem, ...prev]);
      }

      setShowCreateModal(false);
      showNotification(`${activeTab === 'veg' ? 'Vegetarian' : 'Non-Vegetarian'} item created successfully!`, 'success');
    } catch (error) {
      console.error(error);
      showNotification('Failed to create item. Please try again.', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  // UPDATED: Update with imagePublicId
  const handleUpdate = async (formData: FormData): Promise<void> => {
    if (!selectedItem) return;
    
    setFormLoading(true);
    try {
      const itemData = {
        category: formData.category,
        imageUrl: formData.imageUrl,
        imagePublicId: formData.imagePublicId, // NEW
        price: parseFloat(formData.price)
      };

      let updatedItem: CatalogItem;
      if (activeTab === 'veg') {
        updatedItem = await apiService.updateVegItem(selectedItem._id, itemData);
        setVegItems(prev => prev.map(item => item._id === selectedItem._id ? updatedItem : item));
      } else {
        updatedItem = await apiService.updateNonVegItem(selectedItem._id, itemData);
        setNonVegItems(prev => prev.map(item => item._id === selectedItem._id ? updatedItem : item));
      }

      setShowEditModal(false);
      setSelectedItem(null);
      showNotification(`${activeTab === 'veg' ? 'Vegetarian' : 'Non-Vegetarian'} item updated successfully!`, 'success');
    } catch (error) {
      console.error(error);
      showNotification('Failed to update item. Please try again.', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  // UPDATED: Delete with Cloudinary cleanup
  const handleDelete = async (id: string, imagePublicId?: string): Promise<void> => {
    if (!window.confirm('Are you sure you want to delete this item? This will also remove the image from Cloudinary.')) return;

    try {
      if (activeTab === 'veg') {
        await apiService.deleteVegItem(id, imagePublicId);
        setVegItems(prev => prev.filter(item => item._id !== id));
      } else {
        await apiService.deleteNonVegItem(id, imagePublicId);
        setNonVegItems(prev => prev.filter(item => item._id !== id));
      }

      showNotification(`${activeTab === 'veg' ? 'Vegetarian' : 'Non-Vegetarian'} item deleted successfully!`, 'success');
    } catch (error) {
      console.error(error);
      showNotification('Failed to delete item. Please try again.', 'error');
    }
  };

  const currentItems = activeTab === 'veg' ? vegItems : nonVegItems;
  const totalVegItems = vegItems.length;
  const totalNonVegItems = nonVegItems.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Menu Catalog Management</h1>
              <p className="text-gray-600 text-sm mt-1">Manage your mamatiffin menu items with Cloudinary storage</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-gray-600">
                <Users className="w-5 h-5 mr-2" />
                <span className="text-sm">Total Items: {totalVegItems + totalNonVegItems}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">🌱</span>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Veg Items</h3>
                <p className="text-3xl font-bold text-green-600">{totalVegItems}</p>
                <p className="text-xs text-gray-500">Vegetarian Menu Items</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <span className="text-2xl">🍖</span>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Non-Veg Items</h3>
                <p className="text-3xl font-bold text-red-600">{totalNonVegItems}</p>
                <p className="text-xs text-gray-500">Non-Vegetarian Menu Items</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">☁️</span>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Cloud Storage</h3>
                <p className="text-lg font-bold text-blue-600">Cloudinary</p>
                <p className="text-xs text-gray-500">Image Management</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs and Actions */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <div className="flex justify-between items-center px-6 py-4">
              <div className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('veg')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'veg'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  🌱 Vegetarian Catalog ({totalVegItems})
                </button>
                <button
                  onClick={() => setActiveTab('non-veg')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'non-veg'
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  🍖 Non-Vegetarian Catalog ({totalNonVegItems})
                </button>
              </div>
              
              <button
                onClick={() => setShowCreateModal(true)}
                className={`px-4 py-2 rounded-md font-medium text-white transition-colors ${
                  activeTab === 'veg' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                <Plus className="w-4 h-4 inline mr-2" />
                Add New {activeTab === 'veg' ? 'Veg' : 'Non-Veg'} Item
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900"></div>
                <p className="ml-4 text-gray-600">Loading menu items...</p>
              </div>
            ) : currentItems.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🍽️</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No {activeTab === 'veg' ? 'Vegetarian' : 'Non-Vegetarian'} Items
                </h3>
                <p className="text-gray-600 mb-4">Get started by adding your first menu item!</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className={`px-6 py-3 rounded-md font-medium text-white ${
                    activeTab === 'veg' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  <Plus className="w-4 h-4 inline mr-2" />
                  Add First Item
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentItems.map((item) => (
                  <ItemCard
                    key={item._id}
                    item={item}
                    onEdit={(item) => {
                      setSelectedItem(item);
                      setShowEditModal(true);
                    }}
                    onDelete={handleDelete}
                    onView={(item) => {
                      setSelectedItem(item);
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
        title={`Create New ${activeTab === 'veg' ? 'Vegetarian' : 'Non-Vegetarian'} Item`}
      >
        <ItemForm
          type={activeTab}
          onSubmit={handleCreate}
          onCancel={() => setShowCreateModal(false)}
          loading={formLoading}
        />
      </Modal>

      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedItem(null);
        }}
        title={`Edit ${activeTab === 'veg' ? 'Vegetarian' : 'Non-Vegetarian'} Item`}
      >
        {selectedItem && (
          <ItemForm
            initialData={selectedItem}
            type={activeTab}
            onSubmit={handleUpdate}
            onCancel={() => {
              setShowEditModal(false);
              setSelectedItem(null);
            }}
            loading={formLoading}
          />
        )}
      </Modal>

      <Modal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedItem(null);
        }}
        title="Item Details"
      >
        {selectedItem && (
          <div className="space-y-4">
            <div>
              <img 
                src={apiEndpoints.getImageUrl(selectedItem.imageUrl)} 
                alt={selectedItem.category}
                className="w-full h-48 object-cover rounded-md border"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                }}
              />
              {selectedItem.imagePublicId && (
                <p className="text-xs text-blue-600 mt-2 text-center">
                  ☁️ Stored on Cloudinary: {selectedItem.imagePublicId}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <p className="text-gray-900 font-semibold">{selectedItem.category}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Price</label>
                <p className="text-gray-900 font-semibold">₹{selectedItem.price}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <p className="text-gray-900 font-semibold capitalize">{selectedItem.type}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">ID</label>
                <p className="text-gray-900 font-mono text-sm">{selectedItem._id}</p>
              </div>
            </div>
            {selectedItem.createdAt && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Created At</label>
                <p className="text-gray-900">{new Date(selectedItem.createdAt).toLocaleString()}</p>
              </div>
            )}
            {selectedItem.updatedAt && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Updated</label>
                <p className="text-gray-900">{new Date(selectedItem.updatedAt).toLocaleString()}</p>
              </div>
            )}
            <div className="pt-4">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setShowEditModal(true);
                }}
                className={`w-full py-2 px-4 rounded-md font-medium text-white ${
                  selectedItem.type === 'veg' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                <Edit className="w-4 h-4 inline mr-2" />
                Edit This Item
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

export default MenuTimeCatalogManager;