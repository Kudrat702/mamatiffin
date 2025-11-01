// components/OrderSkip.tsx
import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import { 
  Calendar as CalendarIcon, 
  Coffee, 
  Sun, 
  Moon, 
  Check, 
  X,
  AlertCircle,
  Save,
  Trash2,
  CalendarDays
} from 'lucide-react';
import 'react-calendar/dist/Calendar.css';
import { apiEndpoints } from '../configapi/api';

// Define the Value type that react-calendar uses
type Value = Date | null | [Date | null, Date | null];

interface LocalUser {
  id: string;
  name: string;
  phone: string;
  address: {
    district: string;
    block: string;
    city: string;
    homeLodgeName: string;
  };
  role: string;
}

interface UserOrder {
  _id: string;
  customerName: string;
  customerPhone: string;
  menuTitle: string;
  menuCategory: string;
  dietaryPreference: 'veg' | 'non-veg';
  orderStatus: 'active' | 'completed' | 'cancelled' | 'pending';
  startDate: string;
  endDate: string;
  subscriptionType: 'monthly' | 'trial';
}

interface FoodPreference {
  date: string;
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
  informed: boolean;
}

interface MealAvailability {
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
}

const OrderSkip: React.FC = () => {
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [user, setUser] = useState<LocalUser | null>(null);
  const [userOrders, setUserOrders] = useState<UserOrder[]>([]);
  const [foodPreferences, setFoodPreferences] = useState<Record<string, FoodPreference>>({});
  const [mealAvailability, setMealAvailability] = useState<MealAvailability>({
    breakfast: false,
    lunch: false,
    dinner: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load user data
  useEffect(() => {
    const loadUserData = () => {
      const savedUser = sessionStorage.getItem('user');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        fetchUserOrders(userData.phone);
      } else {
        window.location.href = '/';
      }
    };

    loadUserData();
  }, []);

  // Fetch user's active orders
  const fetchUserOrders = async (phone: string) => {
    try {
      setLoading(true);
      const response = await fetch(`${apiEndpoints.customerOrders(phone)}?status=active`);
      
      if (response.ok) {
        const data = await response.json();
        setUserOrders(data.data || []);
        
        // Determine meal availability from active orders
        const availability = {
          breakfast: false,
          lunch: false,
          dinner: false
        }; 

        data.data.forEach((order: UserOrder) => {
          const category = order.menuCategory.toLowerCase();
          if (category.includes('breakfast')) availability.breakfast = true;
          if (category.includes('lunch')) availability.lunch = true;
          if (category.includes('dinner')) availability.dinner = true;
        });

        setMealAvailability(availability);
        
        // Fetch existing food preferences
        await fetchFoodPreferences(phone);
      }
    } catch (error) {
      console.error('Error fetching user orders:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user's food preferences
  const fetchFoodPreferences = async (phone: string) => {
    try {
      const response = await fetch(apiEndpoints.userFoodPreferences(phone));
      
      if (response.ok) {
        const data = await response.json();
        const preferencesMap: Record<string, FoodPreference> = {};
        
        data.data.forEach((pref: FoodPreference) => {
          const dateKey = new Date(pref.date).toDateString();
          preferencesMap[dateKey] = {
            date: pref.date,
            breakfast: pref.breakfast,
            lunch: pref.lunch,
            dinner: pref.dinner,
            informed: pref.informed || false
          };
        });
        
        setFoodPreferences(preferencesMap);
      }
    } catch (error) {
      console.error('Error fetching food preferences:', error);
    }
  };

  // Handle date selection (multi-select)
  const handleDateClick = (value: Value) => {
    // Only handle single date clicks
    if (!value || Array.isArray(value)) return;
    
    const date = value as Date;
    if (!(date instanceof Date)) return;
    
    const dateString = date.toDateString();
    const isSelected = selectedDates.some(d => d.toDateString() === dateString);
    
    if (isSelected) {
      // Remove date from selection
      setSelectedDates(prev => prev.filter(d => d.toDateString() !== dateString));
    } else {
      // Add date to selection
      setSelectedDates(prev => [...prev, date]);
    }
  };

  // Clear all selected dates
  const clearSelection = () => {
    setSelectedDates([]);
  };

  // Handle meal preference toggle for selected dates
  const handleMealToggle = (meal: 'breakfast' | 'lunch' | 'dinner') => {
    selectedDates.forEach(date => {
      const dateKey = date.toDateString();
      const currentPrefs = foodPreferences[dateKey] || {
        date: date.toISOString(),
        breakfast: true,
        lunch: true,
        dinner: true,
        informed: false
      };

      setFoodPreferences(prev => ({
        ...prev,
        [dateKey]: {
          ...currentPrefs,
          [meal]: !currentPrefs[meal],
          informed: false // Reset informed status when preference changes
        }
      }));
    });
  };

  // Save preferences for all selected dates
  const handleInformAll = async () => {
    if (!user || selectedDates.length === 0) {
      alert('Please select at least one date');
      return;
    }

    try {
      setSaving(true);
      
      // Process each selected date
      const promises = selectedDates.map(async (date) => {
        const dateKey = date.toDateString();
        const preferences = foodPreferences[dateKey] || {
          date: date.toISOString(),
          breakfast: true,
          lunch: true,
          dinner: true,
          informed: false
        };

        const response = await fetch(apiEndpoints.userFoodSelection, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            customerPhone: user.phone,
            date: date.toISOString(),
            breakfast: preferences.breakfast,
            lunch: preferences.lunch,
            dinner: preferences.dinner
          })
        });

        if (response.ok) {
          // Update local state to mark as informed
          setFoodPreferences(prev => ({
            ...prev,
            [dateKey]: {
              ...preferences,
              informed: true
            }
          }));
          return { success: true, date: dateKey };
        } else {
          return { success: false, date: dateKey };
        }
      });

      const results = await Promise.all(promises);
      const successCount = results.filter(r => r.success).length;
      const failCount = results.length - successCount;

      if (failCount === 0) {
        alert(`Successfully saved preferences for all ${successCount} selected dates!`);
        setSelectedDates([]); // Clear selection after successful save
      } else {
        alert(`Saved ${successCount} dates successfully, but ${failCount} dates failed. Please try again for the failed dates.`);
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Error saving preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Get tile content for calendar
  const getTileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view !== 'month') return null;
    
    const dateKey = date.toDateString();
    const preferences = foodPreferences[dateKey];
    const isSelected = selectedDates.some(d => d.toDateString() === dateKey);
    
    return (
      <div className="flex justify-center mt-1 space-x-1">
        {preferences?.informed && (
          <Check className="w-3 h-3 text-green-500" />
        )}
        {preferences && !preferences.informed && (
          <AlertCircle className="w-3 h-3 text-orange-500" />
        )}
        {isSelected && (
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
        )}
      </div>
    );
  };

  // Get tile class names for calendar
  const getTileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view !== 'month') return '';
    
    let className = '';
    const dateKey = date.toDateString();
    const preferences = foodPreferences[dateKey];
    const isSelected = selectedDates.some(d => d.toDateString() === dateKey);
    
    if (isSelected) {
      className += ' bg-blue-100 text-blue-800 ring-2 ring-blue-400';
    } else if (preferences?.informed) {
      className += ' bg-green-100 text-green-800';
    } else if (preferences) {
      className += ' bg-orange-100 text-orange-800';
    } else {
      className += ' hover:bg-gray-50';
    }
    
    return className;
  };

  // Get the meal preferences for selected dates (common preferences)
  const getCommonPreferences = () => {
    if (selectedDates.length === 0) return null;

    let commonBreakfast: boolean | undefined = undefined;
    let commonLunch: boolean | undefined = undefined;
    let commonDinner: boolean | undefined = undefined;
    let isFirstDate = true;

    selectedDates.forEach(date => {
      const dateKey = date.toDateString();
      const prefs = foodPreferences[dateKey] || {
        breakfast: true,
        lunch: true,
        dinner: true,
        informed: false
      };

      if (isFirstDate) {
        commonBreakfast = prefs.breakfast;
        commonLunch = prefs.lunch;
        commonDinner = prefs.dinner;
        isFirstDate = false;
      } else {
        if (commonBreakfast !== prefs.breakfast) commonBreakfast = undefined;
        if (commonLunch !== prefs.lunch) commonLunch = undefined;
        if (commonDinner !== prefs.dinner) commonDinner = undefined;
      }
    });

    return { commonBreakfast, commonLunch, commonDinner };
  };

  const commonPrefs = getCommonPreferences();
  const allInformed = selectedDates.length > 0 && selectedDates.every(date => 
    foodPreferences[date.toDateString()]?.informed
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (userOrders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-xl shadow-lg p-8 max-w-md">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Active Orders</h2>
          <p className="text-gray-600 mb-4">
            You don't have any active meal subscriptions to skip.
          </p>
          <a
            href="/veg-menu"
            className="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Browse Menus
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Skip Your Meals</h1>
          <p className="text-gray-600">
            Select multiple dates to skip meals. Click dates to select/deselect them.
          </p>
        </div>

        {/* Active Orders Display */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Active Orders</h2>
          <div className="grid gap-4">
            {userOrders.map((order) => (
              <div key={order._id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{order.menuTitle}</h3>
                    <p className="text-sm text-gray-600">{order.menuCategory}</p>
                  </div>
                  <span className={`inline-block w-3 h-3 rounded-full ${
                    order.dietaryPreference === 'veg' ? 'bg-green-400' : 'bg-red-400'
                  }`}></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Calendar */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <CalendarIcon className="w-5 h-5 text-green-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">Select Dates</h2>
              </div>
              {selectedDates.length > 0 && (
                <button
                  onClick={clearSelection}
                  className="flex items-center text-sm text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Clear ({selectedDates.length})
                </button>
              )}
            </div>
            
            <Calendar
              onChange={handleDateClick}
              value={null}
              minDate={new Date()}
              maxDate={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)}
              tileContent={getTileContent}
              tileClassName={getTileClassName}
              className="w-full"
            />
            
            <div className="mt-4 text-sm text-gray-600">
              <div className="flex items-center space-x-4 mb-2">
                <div className="flex items-center">
                  <Check className="w-4 h-4 text-green-500 mr-1" />
                  <span>Informed</span>
                </div>
                <div className="flex items-center">
                  <AlertCircle className="w-4 h-4 text-orange-500 mr-1" />
                  <span>Pending</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-1"></div>
                  <span>Selected</span>
                </div>
              </div>
              {selectedDates.length > 0 && (
                <div className="text-blue-600 font-medium">
                  {selectedDates.length} date{selectedDates.length > 1 ? 's' : ''} selected
                </div>
              )}
            </div>
          </div>

          {/* Meal Selection */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <CalendarDays className="w-5 h-5 text-blue-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">
                Meal Selection
                {selectedDates.length > 0 && (
                  <span className="text-sm font-normal text-gray-600 ml-2">
                    ({selectedDates.length} date{selectedDates.length > 1 ? 's' : ''})
                  </span>
                )}
              </h2>
            </div>

            {selectedDates.length === 0 ? (
              <div className="text-center py-8">
                <CalendarDays className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">
                  Select dates from the calendar to configure meal preferences
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Selected Dates List */}
                <div className="bg-gray-50 rounded-lg p-3 max-h-32 overflow-y-auto">
                  <p className="text-sm font-medium text-gray-700 mb-2">Selected Dates:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedDates
                      .sort((a, b) => a.getTime() - b.getTime())
                      .map((date, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md"
                        >
                          {date.toLocaleDateString()}
                          <button
                            onClick={() => setSelectedDates(prev => 
                              prev.filter(d => d.toDateString() !== date.toDateString())
                            )}
                            className="ml-1 text-blue-600 hover:text-blue-800"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                  </div>
                </div>

                {/* Breakfast */}
                {mealAvailability.breakfast && (
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <Coffee className="w-5 h-5 text-orange-500 mr-3" />
                      <span className="font-medium">Breakfast</span>
                      {commonPrefs?.commonBreakfast === undefined && (
                        <span className="ml-2 text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
                          Mixed
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleMealToggle('breakfast')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        commonPrefs?.commonBreakfast === false
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : commonPrefs?.commonBreakfast === undefined
                          ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {commonPrefs?.commonBreakfast === false 
                        ? 'Skip' 
                        : commonPrefs?.commonBreakfast === undefined 
                        ? 'Toggle' 
                        : 'Deliver'}
                    </button>
                  </div>
                )}

                {/* Lunch */}
                {mealAvailability.lunch && (
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <Sun className="w-5 h-5 text-yellow-500 mr-3" />
                      <span className="font-medium">Lunch</span>
                      {commonPrefs?.commonLunch === undefined && (
                        <span className="ml-2 text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
                          Mixed
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleMealToggle('lunch')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        commonPrefs?.commonLunch === false
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : commonPrefs?.commonLunch === undefined
                          ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {commonPrefs?.commonLunch === false 
                        ? 'Skip' 
                        : commonPrefs?.commonLunch === undefined 
                        ? 'Toggle' 
                        : 'Deliver'}
                    </button>
                  </div>
                )}

                {/* Dinner */}
                {mealAvailability.dinner && (
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <Moon className="w-5 h-5 text-indigo-500 mr-3" />
                      <span className="font-medium">Dinner</span>
                      {commonPrefs?.commonDinner === undefined && (
                        <span className="ml-2 text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
                          Mixed
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleMealToggle('dinner')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        commonPrefs?.commonDinner === false
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : commonPrefs?.commonDinner === undefined
                          ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {commonPrefs?.commonDinner === false 
                        ? 'Skip' 
                        : commonPrefs?.commonDinner === undefined 
                        ? 'Toggle' 
                        : 'Deliver'}
                    </button>
                  </div>
                )}

                {/* Inform Button */}
                <button
                  onClick={handleInformAll}
                  disabled={saving || allInformed}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : allInformed ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      All Dates Informed
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Inform Mamatiffin ({selectedDates.length} date{selectedDates.length > 1 ? 's' : ''})
                    </>
                  )}
                </button>

                {allInformed && (
                  <div className="text-center text-sm text-green-600 mt-2">
                    All selected dates have been informed to the mamatiffin
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSkip;