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
  priceWeekly: string;
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
    priceWeekly: '',
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
  const [imagePublicId, setImagePublicId] = useState<string>('');
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

  const ensureArrayFormat = (weeklyMenu: unknown): WeeklyMenuDay[] => {
    if (Array.isArray(weeklyMenu) && weeklyMenu.length > 0) {
      const normalizedWeeklyMenu = weeklyMenu.map((item: WeeklyMenuDay) => ({
        day: item.day,
        items: Array.isArray(item.items) ? item.items : [item.items].filter(Boolean)
      }));

      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      return days.map(dayName => {
        const existingDay = normalizedWeeklyMenu.find(d => d.day === dayName);
        if (existingDay) {
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
          return {
            day: dayName,
            items: processedItems.length > 0 ? processedItems : ['']
          };
        }
        return { day: dayName, items: [''] };
      });
    }

    if (weeklyMenu && typeof weeklyMenu === 'object' && !Array.isArray(weeklyMenu)) {
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      const dayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      const weeklyMenuObj = weeklyMenu as Record<string, unknown>;

      return days.map((day, index) => {
        const dayKey = dayKeys[index];
        const dayMenu = weeklyMenuObj[dayKey!] || '';
        let items: string[] = [];

        if (typeof dayMenu === 'string' && dayMenu.trim().length > 0) {
          if (dayMenu.includes('||')) {
            items = dayMenu.split('||').map(s => s.trim()).filter(s => s.length > 0);
          } else if (dayMenu.includes('|')) {
            items = dayMenu.split('|').map(s => s.trim()).filter(s => s.length > 0);
          } else if (dayMenu.includes(',')) {
            items = dayMenu.split(',').map(s => s.trim()).filter(s => s.length > 0);
          } else {
            items = [dayMenu.trim()];
          }
        } else if (Array.isArray(dayMenu)) {
          items = (dayMenu as unknown[]).filter(
            (item): item is string => typeof item === 'string' && item.trim().length > 0
          );
        }

        return { day, items: items.length > 0 ? items : [''] };
      });
    }

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

  // ✅ MAIN FIX — useEffect mein priceWeekly ke liye undefined/null check
  // Pehle tha: menu.priceWeekly ? menu.priceWeekly.toString() : ''
  // Problem: JavaScript mein 0 falsy hota hai, toh priceWeekly=0 hone par
  //          condition false hoti thi aur '' (empty string) set hoti thi
  //          Isliye edit mein Weekly Price field blank dikhti thi
  // Fix: undefined/null explicitly check karo — 0 valid value hai
  useEffect(() => {
    if (menu) {
      const weeklyMenuArray = ensureArrayFormat(menu.weeklyMenu);

      setFormData({
        category: menu.category || 'veg',
        menuType: menu.menuType || '',
        title: menu.title || `${menu.category} ${menu.menuType} Menu`,
        description: menu.description || '',
        deliveryTime: menu.deliveryTime || '',

        // ✅ priceMonthly — undefined/null check
        priceMonthly: menu.priceMonthly !== undefined && menu.priceMonthly !== null
          ? menu.priceMonthly.toString()
          : '',

        // ✅ priceWeekly — YAHI MAIN FIX HAI
        // Pehle: menu.priceWeekly ? menu.priceWeekly.toString() : ''
        // 0 falsy tha isliye '' return hota tha — field blank dikhti thi
        // Ab: 0 bhi correctly "0" mein convert hoga
        priceWeekly: menu.priceWeekly !== undefined && menu.priceWeekly !== null
          ? menu.priceWeekly.toString()
          : '',

        // ✅ priceTrial — same safe check
        priceTrial: menu.priceTrial !== undefined && menu.priceTrial !== null
          ? menu.priceTrial.toString()
          : '',

        weeklyMenu: weeklyMenuArray
      });

      if (menu.imageUrl) {
        setImagePreview(apiEndpoints.getImageUrl(menu.imageUrl));
      }
      if (menu.imagePublicId) {
        setImagePublicId(menu.imagePublicId);
      }
    }
  }, [menu]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (!name) return;

    if (name === 'priceMonthly' || name === 'priceWeekly' || name === 'priceTrial') {
      const priceValue = value.replace(/[^0-9.]/g, '');
      if (priceValue.split('.').length <= 2) {
        setFormData(prev => ({ ...prev, [name]: priceValue }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name as keyof MenuFormData]: value }));
    }
  };

  const handleWeeklyMenuChange = (dayIndex: number, itemIndex: number, value: string) => {
    setFormData(prev => {
      const updatedWeeklyMenu = [...prev.weeklyMenu];
      updatedWeeklyMenu[dayIndex] = {
        ...updatedWeeklyMenu[dayIndex],
        items: [...updatedWeeklyMenu[dayIndex].items]
      };
      updatedWeeklyMenu[dayIndex].items[itemIndex] = value;
      return { ...prev, weeklyMenu: updatedWeeklyMenu };
    });
  };

  const addWeeklyMenuItem = (dayIndex: number) => {
    setFormData(prev => {
      const updatedWeeklyMenu = [...prev.weeklyMenu];
      updatedWeeklyMenu[dayIndex] = {
        ...updatedWeeklyMenu[dayIndex],
        items: [...updatedWeeklyMenu[dayIndex].items, '']
      };
      return { ...prev, weeklyMenu: updatedWeeklyMenu };
    });
  };

  const removeWeeklyMenuItem = (dayIndex: number, itemIndex: number) => {
    setFormData(prev => {
      const updatedWeeklyMenu = [...prev.weeklyMenu];
      if (updatedWeeklyMenu[dayIndex].items.length > 1) {
        updatedWeeklyMenu[dayIndex] = {
          ...updatedWeeklyMenu[dayIndex],
          items: updatedWeeklyMenu[dayIndex].items.filter((_, index) => index !== itemIndex)
        };
      }
      return { ...prev, weeklyMenu: updatedWeeklyMenu };
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
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const validateForm = (): string | null => {
    if (!formData.category) return 'Please select a dietary category';
    if (!formData.menuType) return 'Please select a meal category';
    if (!formData.title.trim()) return 'Please enter a title';
    if (!formData.description.trim()) return 'Please enter a description';
    if (!formData.deliveryTime.trim()) return 'Please enter delivery time';
    if (!formData.priceMonthly.trim()) return 'Please enter a monthly price';
    if (!formData.priceWeekly.trim()) return 'Please enter a weekly price';
    if (!formData.priceTrial.trim()) return 'Please enter a trial price';

    const monthlyPrice = parseFloat(formData.priceMonthly);
    const weeklyPrice = parseFloat(formData.priceWeekly);
    const trialPrice = parseFloat(formData.priceTrial);

    if (isNaN(monthlyPrice) || monthlyPrice <= 0) return 'Please enter a valid monthly price greater than 0';
    if (isNaN(weeklyPrice) || weeklyPrice <= 0) return 'Please enter a valid weekly price greater than 0';
    if (isNaN(trialPrice) || trialPrice <= 0) return 'Please enter a valid trial price greater than 0';

    const emptyDays = formData.weeklyMenu.filter(dayMenu =>
      !dayMenu.items || dayMenu.items.length === 0 || dayMenu.items.every(item => !item.trim())
    );
    if (emptyDays.length > 0) {
      return `Please fill menu items for: ${emptyDays.map(d => d.day).join(', ')}`;
    }

    if (!menu && !selectedImage) return 'Please select an image';

    return null;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const validationError = validateForm();
      if (validationError) {
        setError(validationError);
        setLoading(false);
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append('category', formData.category);
      formDataToSend.append('menuType', formData.menuType);
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('deliveryTime', formData.deliveryTime);
      formDataToSend.append('priceMonthly', formData.priceMonthly);
      // ✅ priceWeekly correctly FormData mein append
      formDataToSend.append('priceWeekly', formData.priceWeekly);
      formDataToSend.append('priceTrial', formData.priceTrial);
      formDataToSend.append('weeklyMenu', JSON.stringify(formData.weeklyMenu));

      if (selectedImage) {
        formDataToSend.append('image', selectedImage);
      } else if (menu && menu.imageUrl) {
        formDataToSend.append('imageUrl', menu.imageUrl);
        if (imagePublicId) {
          formDataToSend.append('imagePublicId', imagePublicId);
        }
      }

      const endpoint = formData.category === 'veg'
        ? apiEndpoints.vegMenuDetails
        : apiEndpoints.nonVegMenuDetails;

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formDataToSend,
      });

      const responseData = await response.json();

      if (response.ok && responseData.success) {
        if (responseData.data?.imagePublicId) {
          setImagePublicId(responseData.data.imagePublicId);
        }

        alert(menu ? 'Menu updated successfully!' : 'Menu created successfully!');

        if (!menu) {
          setFormData({
            category: 'veg',
            menuType: '',
            title: '',
            description: '',
            deliveryTime: '',
            priceMonthly: '',
            priceWeekly: '',
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
          setImagePublicId('');
        }

        onClose();
      } else {
        throw new Error(responseData.message || `Server error: ${response.status}`);
      }
    } catch (err: unknown) {
      console.error('Submit error:', err);
      setError(err instanceof Error ? err.message : 'Failed to save menu. Please try again.');
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
      setError(err instanceof Error ? err.message : 'Failed to delete menu');
    } finally {
      setIsDeleting(false);
    }
  };

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

            {/* Image Upload */}
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
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column */}
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
                      <option key={category} value={category}>{category}</option>
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
              </div>

              {/* Right Column — Pricing */}
              <div className="space-y-6">
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

                {/* ✅ Weekly Price — value ab sahi load hogi */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <IndianRupee className="w-5 h-5 text-purple-600" />
                    <label className="text-lg font-semibold text-gray-800">Weekly Price *</label>
                  </div>
                  <div className="relative">
                    <IndianRupee className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="text"
                      name="priceWeekly"
                      value={formData.priceWeekly}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter weekly price"
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-lg font-semibold"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Enter exact weekly price for customers</p>
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
                      placeholder="Enter trial price"
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-lg font-semibold"
                    />
                  </div>
                  {formData.priceMonthly && formData.priceWeekly && formData.priceTrial && (
                    <p className="text-sm text-gray-600 mt-2">
                      Monthly: ₹{parseFloat(formData.priceMonthly) || 0} | Weekly: ₹{parseFloat(formData.priceWeekly) || 0} | Trial: ₹{parseFloat(formData.priceTrial) || 0}
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

            {/* Weekly Menu Section */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">Weekly Menu Plan *</h3>
              <p className="text-sm text-gray-600 mb-6 text-center">
                Add menu items for each day of the week
              </p>
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
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:opacity-50 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                >
                  <Trash2 className="w-5 h-5" />
                  {isDeleting ? 'Deleting...' : 'Delete Menu'}
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || isDeleting}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
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