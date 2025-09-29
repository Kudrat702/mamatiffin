import React from 'react';
import { MapPin, X } from 'lucide-react';
import { useLocation } from '../context/LocationContext';

const LocationModal: React.FC = () => {
  const { isLocationModalOpen, setIsLocationModalOpen, locations, setSelectedLocation, selectedLocation } =
    useLocation();

  if (!isLocationModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        backgroundColor: '#328c81',
        opacity: 0.8,
        backgroundImage: 'radial-gradient(#FFFFFF 0.5px, transparent 0.5px), radial-gradient(#FFFFFF 0.5px, #328c81 0.5px)',
        backgroundSize: '20px 20px',
        backgroundPosition: '0 0, 10px 10px'
      }}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Select Your Location</h2>
            {selectedLocation && (
              <button
                onClick={() => setIsLocationModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            )}
          </div>
          <p className="text-gray-600 mb-6">
            Choose your delivery location to see available meals.
          </p>
          <div className="space-y-3">
            {locations.length > 0 ? (
              locations.map((location, index) => (
                <div
                  key={location.id || `location-${index}`} // Fixed: Added fallback key
                  onClick={() => setSelectedLocation(location)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedLocation?.id === location.id
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-800">{location.name}</h3>
                    </div>
                    {selectedLocation?.id === location.id && (
                      <MapPin className="text-green-500" size={20} />
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div key="no-locations" className="p-4 text-center">
                <p className="text-gray-600">No locations available.</p>
              </div>
            )}
          </div>
          {!selectedLocation && (
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-amber-800 text-sm">
                Please select a location to continue browsing our menu.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationModal;