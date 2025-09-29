import React, { useState } from 'react';
import { MapPin, ChevronDown } from 'lucide-react';
import { useLocation } from '../context/LocationContext';

const LocationDropdown: React.FC = () => {
  const { selectedLocation, setIsLocationModalOpen } = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLocationChange = () => {
    setIsDropdownOpen(false);
    setIsLocationModalOpen(true);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <MapPin size={18} className="text-green-600" />
        <span className="text-sm font-medium text-gray-700">
          {selectedLocation ? selectedLocation.name : 'Select Location'}
        </span>
        <ChevronDown size={16} className="text-gray-500" />
      </button>

      {isDropdownOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[200px] z-40">
          <div className="p-2">
            <div className="px-3 py-2 text-xs text-gray-500 uppercase tracking-wide font-medium">
              Current Location
            </div>
            {selectedLocation && (
              <div className="px-3 py-2 text-sm">
                <div className="font-medium text-gray-800">{selectedLocation.name}</div>
              </div>
            )}
            <hr className="my-2" />
            <button
              onClick={handleLocationChange}
              className="w-full text-left px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded"
            >
              Change Location
            </button>
          </div>
        </div>
      )}

      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  );
};

export default LocationDropdown;