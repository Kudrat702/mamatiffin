import React from 'react';
import { ShoppingCart, Clock, MapPin } from 'lucide-react';
import type { CatalogItem } from '../types/catalogItem';

interface MenuCardProps {
  item: CatalogItem;
  onSubscribe: (item: CatalogItem) => void;
}

const MenuCard: React.FC<MenuCardProps> = ({ item, onSubscribe }) => {
  const isVeg = item.type === 'veg';
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative">
        <img 
          src={item.imageUrl} 
          alt={item.category}
          className="w-full h-48 object-cover"
          loading="lazy"
        />
        <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium ${
          isVeg ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {isVeg ? '🌱 VEG' : '🍖 NON-VEG'}
        </div>
      </div>
      
      <div className="p-4">
        <h3 className={`font-bold text-lg mb-2 font-poppins ${
          isVeg ? 'text-deep-green' : 'text-soft-red'
        }`}>
          {item.category}
        </h3>
        
        <div className="flex items-center justify-between mb-3">
          <span className="text-teal font-medium text-xl font-roboto">
            ₹{item.price}
          </span>
          <div className="flex items-center text-gray-600 text-sm">
            <Clock className="w-4 h-4 mr-1" />
            <span className="font-roboto">30-45 min</span>
          </div>
        </div>
        
        <div className="flex items-center text-gray-600 text-sm mb-4">
          <MapPin className="w-4 h-4 mr-1" />
          <span className="font-roboto">Free delivery available</span>
        </div>
        
        <button
          onClick={() => onSubscribe(item)}
          className={`w-full py-2 px-4 rounded-md font-medium transition-colors duration-200 ${
            isVeg 
              ? 'bg-warm-yellow hover:bg-yellow-500 text-gray-900' 
              : 'bg-vibrant-orange hover:bg-orange-600 text-white'
          }`}
        >
          <ShoppingCart className="w-4 h-4 inline mr-2" />
          Subscribe Now
        </button>
      </div>
    </div>
  );
};

export default MenuCard;