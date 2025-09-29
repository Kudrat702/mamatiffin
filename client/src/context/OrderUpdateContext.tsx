// contexts/OrderUpdateContext.tsx - Create this new file
import React, { createContext, useContext, useCallback, useState } from 'react';

interface OrderUpdateContextType {
  lastUpdate: number;
  triggerUpdate: () => void;
  isUpdating: boolean;
  setIsUpdating: (updating: boolean) => void;
}

const OrderUpdateContext = createContext<OrderUpdateContextType | undefined>(undefined);

export const useOrderUpdate = () => {
  const context = useContext(OrderUpdateContext);
  if (!context) {
    throw new Error('useOrderUpdate must be used within an OrderUpdateProvider');
  }
  return context;
};

interface OrderUpdateProviderProps {
  children: React.ReactNode;
}

export const OrderUpdateProvider: React.FC<OrderUpdateProviderProps> = ({ children }) => {
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [isUpdating, setIsUpdating] = useState(false);

  const triggerUpdate = useCallback(() => {
    setLastUpdate(Date.now());
  }, []);

  const value = {
    lastUpdate,
    triggerUpdate,
    isUpdating,
    setIsUpdating
  };

  return (
    <OrderUpdateContext.Provider value={value}>
      {children}
    </OrderUpdateContext.Provider>
  );
};