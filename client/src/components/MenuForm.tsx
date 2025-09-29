import React, { useState, useEffect } from 'react';
import { X, Upload, Trash2, IndianRupee, Clock, FileText, Tag } from 'lucide-react';
import { apiEndpoints } from '../configapi/api';
import { type WeeklyMenuDay, type Menu } from '../types/menu';

interface MenuFormProps {
  menu: Menu | null;
  onClose: () => void;
  onDelete?: (id: string) => void;
}

interface MenuFormData {
  category: 'veg' | 'non-veg';
  menuType: string;
  title: string;
  description: string;
  deliveryTime: string;
  priceMonthly: string;
  priceTrial: string;
  weeklyMenu: WeeklyMenuDay[];
}

const MenuForm: React.FC<MenuFormProps> = ({ menu, onClose, onDelete }) => {
  const [formData, setFormData] = useState<MenuFormData>({
    category: 'veg',
    menuType: '',
    title: '',
    description: '',
    deliveryTime: '',
    priceMonthly: '',
    priceTrial: '',
    weeklyMenu: [
      { day: 'Monday', items: [''] },
      { day: 'Tuesday', items: [''] },
      { day: 'Wednesday', items: [''] },
      { day: 'Thursday', items: [''] },
      { day: 'Friday', items: [''] },
      { day: 'Saturday', items: [''] },
      { day: 'Sunday', items: [''] }
    ]
  });

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const categoryOptions = [
    'Breakfast',
    'Lunch',
    'Dinner',
    'Breakfast + Lunch',
    'Breakfast + Dinner',
    'Lunch + Dinner',
    'Breakfast + Lunch + Dinner'
  ];

  // FIXED: Enhanced function using MenuDetailsPage logic
  const ensureArrayFormat = (weeklyMenu: unknown): WeeklyMenuDay[] => {
    const isDev = process.env.NODE_ENV === 'development';
    if (isDev) console.log('🚀 PROCESSING WEEKLY MENU:', weeklyMenu);
    if (isDev) console.log('🚀 TYPE:', typeof weeklyMenu);
    if (isDev) console.log('🚀 IS ARRAY:', Array.isArray(weeklyMenu));

    // Case 1: Array format (using MenuDetailsPage logic)
    if (Array.isArray(weeklyMenu) && weeklyMenu.length > 0) {
      if (isDev) console.log('🚀 USING MENUDETAILSPAGE LOGIC...');
      
      // SAME LOGIC AS MenuDetailsPage - this works!
      const normalizedWeeklyMenu = weeklyMenu.map((item: WeeklyMenuDay) => {
        if (isDev) console.log(`🚀 Processing day: ${item.day}`, item);
        
        return {
          day: item.day,
          items: Array.isArray(item.items) ? item.items : [item.items].filter(Boolean)
        };
      });
      
      // Ensure we have all 7 days
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      const result = days.map(dayName => {
        const existingDay = normalizedWeeklyMenu.find(d => d.day === dayName);
        if (existingDay) {
          // ADDITIONAL: Handle pipe-separated strings in items
          const processedItems = existingDay.items.flatMap((item: string) => {
            if (typeof item === 'string' && item.trim().length > 0) {
              if (item.includes('||')) {
                return item.split('||').map(s => s.trim()).filter(s => s.length > 0);
              } else if (item.includes('|') && !item.includes('||')) {
                return item.split('|').map(s => s.trim()).filter(s => s.length > 0);
              } else if (item.includes(',')) {
                return item.split(',').map(s => s.trim()).filter(s => s.length > 0);
              } else {
                return [item.trim()];
              }
            }
            return [];
          });
          
          if (isDev) console.log(`🚀 Day ${dayName} processed items:`, processedItems);
          
          return {
            day: dayName,
            items: processedItems.length > 0 ? processedItems : ['']
          };
        }
        return { day: dayName, items: [''] };
      });
      
      if (isDev) console.log('🚀 FINAL RESULT:', result);
      return result;
    }

    // Case 2: Object format (backward compatibility)
    if (weeklyMenu && typeof weeklyMenu === 'object' && !Array.isArray(weeklyMenu)) {
      if (isDev) console.log('Converting object to array format');
      
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      const dayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      
      const weeklyMenuObj = weeklyMenu as Record<string, unknown>;
      return days.map((day, index) => {
        const dayKey = dayKeys[index];
        const dayMenu = weeklyMenuObj[dayKey] || '';
        
        let items: string[] = [];
        if (typeof dayMenu === 'string' && dayMenu.trim().length > 0) {
          // FIXED: Handle pipe-separated values properly
          if (dayMenu.includes('||')) {
            items = dayMenu.split('||').map((item: string) => item.trim()).filter((item: string) => item.length > 0);
          } else if (dayMenu.includes('|')) {
            items = dayMenu.split('|').map((item: string) => item.trim()).filter((item: string) => item.length > 0);
          } else if (dayMenu.includes(',')) {
            items = dayMenu.split(',').map((item: string) => item.trim()).filter((item: string) => item.length > 0);
          } else {
            items = [dayMenu.trim()];
          }
        } else if (Array.isArray(dayMenu)) {
          items = dayMenu.filter((item: unknown) => 
            typeof item === 'string' && item.trim().length > 0
          ) as string[];
        }
        
        return {
          day,
          items: items.length > 0 ? items : ['']
        };
      });
    }

    // Case 3: Default fallback
    if (isDev) console.log('Using default fallback structure');
    return [
      { day: 'Monday', items: [''] },
      { day: 'Tuesday', items: [''] },
      { day: 'Wednesday', items: [''] },
      { day: 'Thursday', items: [''] },
      { day: 'Friday', items: [''] },
      { day: 'Saturday', items: [''] },
      { day: 'Sunday', items: [''] }
    ];
  };

  // Load menu data when menu prop changes  
  useEffect(() => {
    if (menu) {
      const isDev = process.env.NODE_ENV === 'development';
      
      // CRITICAL DEBUG - RAW DATABASE DATA CHECK
      console.log('🔍 RAW MENU DATA FROM DATABASE:', menu);
      console.log('🔍 RAW WEEKLY MENU STRUCTURE:', menu.weeklyMenu);
      console.log('🔍 WeeklyMenu type:', typeof menu.weeklyMenu);
      console.log('🔍 WeeklyMenu isArray:', Array.isArray(menu.weeklyMenu));
      
      // Check each day individually to find actual data
      if (Array.isArray(menu.weeklyMenu)) {
        console.log('🔍 WeeklyMenu array length:', menu.weeklyMenu.length);
        menu.weeklyMenu.forEach((day, index) => {
          console.log(`🔍 RAW Day ${index}:`, day);
          console.log(`🔍 RAW Day ${index} items:`, day.items);
          console.log(`🔍 RAW Day ${index} items type:`, typeof day.items);
          console.log(`🔍 RAW Day ${index} items isArray:`, Array.isArray(day.items));
          
          if (Array.isArray(day.items)) {
            day.items.forEach((item, itemIndex) => {
              console.log(`🔍 RAW Day ${index} Item ${itemIndex}:`, `"${item}"`);
              console.log(`🔍 RAW Day ${index} Item ${itemIndex} type:`, typeof item);
              console.log(`🔍 RAW Day ${index} Item ${itemIndex} length:`, item?.length || 0);
              if (typeof item === 'string') {
                console.log(`🔍 RAW Day ${index} Item ${itemIndex} includes ||:`, item.includes('||'));
              }
            });
          }
        });
      }
      
      console.log('🔍 CALLING ensureArrayFormat with:', menu.weeklyMenu);
      
      // Process weekly menu
      const weeklyMenuArray = ensureArrayFormat(menu.weeklyMenu);
      console.log('🔍 FINAL PROCESSED weeklyMenu for form:', weeklyMenuArray);

      // Set form data
      const newFormData = {
        category: menu.category || 'veg',
        menuType: menu.menuType || '',
        title: menu.title || `${menu.category} ${menu.menuType} Menu`,
        description: menu.description || '',
        deliveryTime: menu.deliveryTime || '',
        priceMonthly: menu.priceMonthly ? menu.priceMonthly.toString() : 
                     (menu.price ? menu.price.toString() : ''),
        priceTrial: menu.priceTrial ? menu.priceTrial.toString() : 
                   (menu.priceMonthly ? Math.floor(menu.priceMonthly * 0.6).toString() : ''),
        weeklyMenu: weeklyMenuArray
      };

      if (isDev) console.log('Setting form data:', newFormData);
      setFormData(newFormData);
      
      // Set image preview
      if (menu.imageUrl) {
        const imageUrl = apiEndpoints.getImageUrl(menu.imageUrl);
        if (isDev) console.log('Setting image preview:', imageUrl);
        setImagePreview(imageUrl);
      }
    }
  }, [menu]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Type guard to ensure name is not undefined
    if (!name) return;

    if (name === 'priceMonthly') {
      const priceValue = value.replace(/[^0-9.]/g, '');
      if (priceValue.split('.').length <= 2) {
        setFormData(prev => ({
          ...prev,
          [name]: priceValue,
          priceTrial: priceValue ? Math.floor(parseFloat(priceValue) * 0.6).toString() : ''
        }));
      }
    } else if (name === 'priceTrial') {
      const priceValue = value.replace(/[^0-9.]/g, '');
      if (priceValue.split('.').length <= 2) {
        setFormData(prev => ({
          ...prev,
          [name]: priceValue
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name as keyof MenuFormData]: value
      }));
    }
  };

  // Handle weekly menu changes
  const handleWeeklyMenuChange = (dayIndex: number, itemIndex: number, value: string) => {
    const isDev = process.env.NODE_ENV === 'development';
    if (isDev) console.log(`Updating day ${dayIndex}, item ${itemIndex} with value:`, value);
    
    setFormData(prev => {
      const updatedWeeklyMenu = [...prev.weeklyMenu];
      updatedWeeklyMenu[dayIndex] = {
        ...updatedWeeklyMenu[dayIndex],
        items: [...updatedWeeklyMenu[dayIndex].items]
      };
      updatedWeeklyMenu[dayIndex].items[itemIndex] = value;
      
      if (isDev) console.log('Updated weeklyMenu:', updatedWeeklyMenu);
      
      return {
        ...prev,
        weeklyMenu: updatedWeeklyMenu
      };
    });
  };

  // Add new item to a day
  const addWeeklyMenuItem = (dayIndex: number) => {
    const isDev = process.env.NODE_ENV === 'development';
    if (isDev) console.log(`Adding item to day ${dayIndex}`);
    
    setFormData(prev => {
      const updatedWeeklyMenu = [...prev.weeklyMenu];
      updatedWeeklyMenu[dayIndex] = {
        ...updatedWeeklyMenu[dayIndex],
        items: [...updatedWeeklyMenu[dayIndex].items, '']
      };
      
      return {
        ...prev,
        weeklyMenu: updatedWeeklyMenu
      };
    });
  };

  // Remove item from a day
  const removeWeeklyMenuItem = (dayIndex: number, itemIndex: number) => {
    const isDev = process.env.NODE_ENV === 'development';
    if (isDev) console.log(`Removing item ${itemIndex} from day ${dayIndex}`);
    
    setFormData(prev => {
      const updatedWeeklyMenu = [...prev.weeklyMenu];
      if (updatedWeeklyMenu[dayIndex].items.length > 1) {
        updatedWeeklyMenu[dayIndex] = {
          ...updatedWeeklyMenu[dayIndex],
          items: updatedWeeklyMenu[dayIndex].items.filter((_, index) => index !== itemIndex)
        };
      }
      
      return {
        ...prev,
        weeklyMenu: updatedWeeklyMenu
      };
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }

      setSelectedImage(file);
      setError(null);

      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Form validation
  const validateForm = (): string | null => {
    const isDev = process.env.NODE_ENV === 'development';
    if (isDev) console.log('Validating form with data:', formData);

    if (!formData.category) return 'Please select a dietary category';
    if (!formData.menuType) return 'Please select a meal category';
    if (!formData.title.trim()) return 'Please enter a title';
    if (!formData.description.trim()) return 'Please enter a description';
    if (!formData.deliveryTime.trim()) return 'Please enter delivery time';
    if (!formData.priceMonthly.trim()) return 'Please enter a monthly price';
    if (!formData.priceTrial.trim()) return 'Please enter a trial price';

    const monthlyPrice = parseFloat(formData.priceMonthly);
    const trialPrice = parseFloat(formData.priceTrial);
    
    if (isNaN(monthlyPrice) || monthlyPrice <= 0) {
      return 'Please enter a valid monthly price greater than 0';
    }

    if (isNaN(trialPrice) || trialPrice <= 0) {
      return 'Please enter a valid trial price greater than 0';
    }

    // Validate weekly menu
    const emptyDays = formData.weeklyMenu.filter(dayMenu => 
      !dayMenu.items || dayMenu.items.length === 0 || dayMenu.items.every(item => !item.trim())
    );

    if (emptyDays.length > 0) {
      const dayNames = emptyDays.map(dayMenu => dayMenu.day);
      return `Please fill menu items for: ${dayNames.join(', ')}`;
    }

    if (!menu && !selectedImage) {
      return 'Please select an image';
    }

    if (isDev) console.log('Form validation passed');
    return null;
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const isDev = process.env.NODE_ENV === 'development';
    if (isDev) {
      console.log('Form submission started');
      console.log('Form data being submitted:', formData);
    }

    try {
      const validationError = validateForm();
      if (validationError) {
        setError(validationError);
        setLoading(false);
        return;
      }

      // Create FormData for submission
      const formDataToSend = new FormData();
      
      // Include all fields
      formDataToSend.append('category', formData.category);
      formDataToSend.append('menuType', formData.menuType);
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('deliveryTime', formData.deliveryTime);
      formDataToSend.append('priceMonthly', formData.priceMonthly);
      formDataToSend.append('priceTrial', formData.priceTrial);
      
      // Send weeklyMenu as JSON string
      const weeklyMenuJSON = JSON.stringify(formData.weeklyMenu);
      formDataToSend.append('weeklyMenu', weeklyMenuJSON);
      if (isDev) console.log('WeeklyMenu JSON being sent:', weeklyMenuJSON);

      // Handle image
      if (selectedImage) {
        formDataToSend.append('image', selectedImage);
        if (isDev) console.log('Including new image file:', selectedImage.name);
      } else if (menu && menu.imageUrl) {
        formDataToSend.append('imageUrl', menu.imageUrl);
        if (isDev) console.log('Using existing image URL:', menu.imageUrl);
      }

      // Use correct endpoint
      const endpoint = formData.category === 'veg' 
        ? apiEndpoints.vegMenuDetails
        : apiEndpoints.nonVegMenuDetails;

      if (isDev) console.log('Sending request to endpoint:', endpoint);

      // Debug FormData contents (development only)
      if (isDev) {
        console.log('FormData contents:');
        for (const [key, value] of formDataToSend.entries()) {
          if (key === 'image') {
            console.log(`${key}: [File] ${(value as File).name}`);
          } else {
            console.log(`${key}: ${value}`);
          }
        }
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formDataToSend,
      });

      if (isDev) console.log('Response status:', response.status);
      
      const responseData = await response.json();
      if (isDev) console.log('API response:', responseData);
      
      if (response.ok && responseData.success) {
        if (isDev) console.log('Menu saved successfully');
        alert(menu ? 'Menu updated successfully!' : 'Menu created successfully!');
        
        if (!menu) {
          // Reset form for new menu creation
          setFormData({
            category: 'veg',
            menuType: '',
            title: '',
            description: '',
            deliveryTime: '',
            priceMonthly: '',
            priceTrial: '',
            weeklyMenu: [
              { day: 'Monday', items: [''] },
              { day: 'Tuesday', items: [''] },
              { day: 'Wednesday', items: [''] },
              { day: 'Thursday', items: [''] },
              { day: 'Friday', items: [''] },
              { day: 'Saturday', items: [''] },
              { day: 'Sunday', items: [''] }
            ]
          });
          setSelectedImage(null);
          setImagePreview('');
        }
        
        onClose();
      } else {
        throw new Error(responseData.message || `Server error: ${response.status}`);
      }
    } catch (err: unknown) {
      console.error('Submit error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to save menu. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!menu || !menu._id) return;
    
    if (!window.confirm('Are you sure you want to delete this menu?')) return;

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(
        apiEndpoints.adminCategoryMenu(menu.category, menu.menuType), 
        { method: 'DELETE' }
      );

      const responseData = await response.json();

      if (response.ok) {
        alert('Menu deleted successfully!');
        onDelete?.(menu._id);
        onClose();
      } else {
        throw new Error(responseData.message || 'Failed to delete menu');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete menu';
      setError(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    console.log('Rendering MenuForm with state:', {
      hasMenu: !!menu,
      formDataWeeklyMenuLength: formData.weeklyMenu.length,
      firstDayItems: formData.weeklyMenu[0]?.items,
      sampleDayData: formData.weeklyMenu[0],
    });
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold">
                {menu ? 'Edit Menu Details' : 'Add New Menu Details'}
              </h2>
              <p className="text-blue-100 mt-1">
                {menu ? 'Update your menu details' : 'Create a delicious new menu with weekly planning'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-3 hover:bg-white/20 rounded-full transition-colors duration-200"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(95vh-120px)]">
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 shadow-sm">
                <p className="text-red-800 font-medium">⚠️ {error}</p>
              </div>
            )}

            {/* Image Upload Section */}
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Upload className="w-5 h-5 text-blue-600" />
                <label className="text-lg font-semibold text-gray-800">Menu Image *</label>
              </div>
              <div className="flex items-center space-x-6">
                <div className="flex-1">
                  <label className="group flex flex-col items-center justify-center w-full h-48 border-3 border-gray-300 border-dashed rounded-xl cursor-pointer bg-white hover:bg-gray-50 transition-all duration-300 hover:border-blue-400">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-12 h-12 mb-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                      <p className="mb-2 text-lg text-gray-600 font-semibold group-hover:text-blue-600">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-sm text-gray-500">PNG, JPG, JPEG, WebP, GIF (max 5MB)</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
                
                {imagePreview && (
                  <div className="w-48 h-48 rounded-xl overflow-hidden border-2 border-gray-200 shadow-lg">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Tag className="w-5 h-5 text-green-600" />
                    <label className="text-lg font-semibold text-gray-800">Dietary Category *</label>
                  </div>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-lg"
                  >
                    <option value="veg">Vegetarian</option>
                    <option value="non-veg">Non-Vegetarian</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Tag className="w-5 h-5 text-purple-600" />
                    <label className="text-lg font-semibold text-gray-800">Menu Type *</label>
                  </div>
                  <select
                    name="menuType"
                    value={formData.menuType}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-lg"
                  >
                    <option value="">Select Menu Type</option>
                    {categoryOptions.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-5 h-5 text-indigo-600" />
                    <label className="text-lg font-semibold text-gray-800">Menu Title *</label>
                  </div>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Premium Vegetarian Breakfast Menu"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-lg"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-5 h-5 text-orange-600" />
                    <label className="text-lg font-semibold text-gray-800">Delivery Time *</label>
                  </div>
                  <input
                    type="text"
                    name="deliveryTime"
                    value={formData.deliveryTime}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., 30-45 minutes"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-lg"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <IndianRupee className="w-5 h-5 text-green-600" />
                    <label className="text-lg font-semibold text-gray-800">Monthly Price *</label>
                  </div>
                  <div className="relative">
                    <IndianRupee className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="text"
                      name="priceMonthly"
                      value={formData.priceMonthly}
                      onChange={handleInputChange}
                      required
                      placeholder="0.00"
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-lg font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <IndianRupee className="w-5 h-5 text-blue-600" />
                    <label className="text-lg font-semibold text-gray-800">Trial Price *</label>
                  </div>
                  <div className="relative">
                    <IndianRupee className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="text"
                      name="priceTrial"
                      value={formData.priceTrial}
                      onChange={handleInputChange}
                      required
                      placeholder="0.00"
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-lg font-semibold"
                    />
                  </div>
                  {formData.priceMonthly && (
                    <p className="text-sm text-gray-600 mt-2">
                      Monthly: ₹{parseFloat(formData.priceMonthly) || 0} | Trial: ₹{parseFloat(formData.priceTrial) || 0}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-5 h-5 text-blue-600" />
                <label className="text-lg font-semibold text-gray-800">Description *</label>
              </div>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={4}
                placeholder="Describe your delicious menu in detail..."
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none text-lg"
              />
            </div>

            {/* Weekly Menu Section - FIXED with proper pipe handling */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">Weekly Menu Plan *</h3>
              <p className="text-sm text-gray-600 mb-6 text-center">
                Add menu items for each day of the week (Database pipe-separated items will be properly split)
              </p>
              
              {/* Debug info - only in development */}
              {isDev && (
                <div className="mb-4 p-3 bg-yellow-100 rounded text-xs">
                  <div>Debug: WeeklyMenu has {formData.weeklyMenu.length} days</div>
                  <div>Sample items from Monday: {JSON.stringify(formData.weeklyMenu[0]?.items)}</div>
                  <div>Is data properly parsed: {formData.weeklyMenu[0]?.items?.length > 1 ? 'YES' : 'NO (might be pipe-separated string)'}</div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {formData.weeklyMenu.map((dayMenu, dayIndex) => (
                  <div key={`${dayMenu.day}-${dayIndex}`} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                    <label className="block text-lg font-semibold text-gray-800 mb-3">
                      {dayMenu.day} *
                    </label>
                    <div className="space-y-2">
                      {dayMenu.items && dayMenu.items.map((item, itemIndex) => (
                        <div key={`${dayMenu.day}-${itemIndex}`} className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => handleWeeklyMenuChange(dayIndex, itemIndex, e.target.value)}
                            placeholder="Enter menu item..."
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
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
                      ))}
                      <button
                        type="button"
                        onClick={() => addWeeklyMenuItem(dayIndex)}
                        className="text-sm text-purple-600 hover:text-purple-800 font-medium"
                      >
                        + Add Item
                      </button>
                    </div>
                    {/* Enhanced debug info per day - only in development */}
                    {isDev && (
                      <div className="mt-2 text-xs text-gray-500">
                        <div>Items count: {dayMenu.items?.length || 0}</div>
                        <div>Sample item: {dayMenu.items?.[0]?.substring(0, 20) || 'None'}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6 border-t-2 border-gray-200">
              {menu && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-red-400 disabled:to-red-400 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                >
                  <Trash2 className="w-5 h-5" />
                  {isDeleting ? 'Deleting...' : 'Delete Menu'}
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || isDeleting}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-blue-400 disabled:to-purple-400 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
              >
                {loading ? 'Saving...' : (menu ? 'Update Menu Details' : 'Create Menu Details')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MenuForm;