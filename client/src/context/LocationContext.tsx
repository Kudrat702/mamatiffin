import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { apiEndpoints } from '../configapi/api';

// Types
interface Location {
  id: string;
  name: string;
}

interface LocationContextType {
  selectedLocation: Location | null;
  setSelectedLocation: (location: Location) => void;
  isLocationModalOpen: boolean;
  setIsLocationModalOpen: (open: boolean) => void;
  locations: Location[];
  isLoading: boolean;
}

// Create Context
const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

// Location Provider Component
export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedLocation, setSelectedLocationState] = useState<Location | null>(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch locations from backend on mount
  useEffect(() => {
    const loadLocations = async () => {
      try {
        const response = await axios.get(apiEndpoints.locations);
        const data = response.data as { data: Location[] };
        const fetchedLocations: Location[] = data.data;
        setLocations(fetchedLocations);
        setIsLoading(false);

        // Check if location is stored in localStorage
        const storedLocation = localStorage.getItem('selectedLocation');
        if (storedLocation) {
          const parsedLocation = JSON.parse(storedLocation);
          const validLocation = fetchedLocations.find((loc) => loc.id === parsedLocation.id);
          if (validLocation) {
            setSelectedLocationState(validLocation);
          } else {
            setIsLocationModalOpen(true);
          }
        } else {
          setIsLocationModalOpen(true);
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
        setIsLoading(false);
        setIsLocationModalOpen(true); // Show modal even if fetch fails
      }
    };

    loadLocations();
  }, []);

  const setSelectedLocation = (location: Location) => {
    setSelectedLocationState(location);
    localStorage.setItem('selectedLocation', JSON.stringify(location));
    setIsLocationModalOpen(false);
  };

  return (
    <LocationContext.Provider
      value={{
        selectedLocation,
        setSelectedLocation,
        isLocationModalOpen,
        setIsLocationModalOpen,
        locations,
        isLoading,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};