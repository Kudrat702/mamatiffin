import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const VegMenu: React.FC = () => {
  const navigate = useNavigate();
  
  const menuCategories = [
    { name: 'Breakfast', slug: 'breakfast', emoji: '🍳' },
    { name: 'Lunch', slug: 'lunch', emoji: '🍛' },
    { name: 'Dinner', slug: 'dinner', emoji: '🍽️' },
    { name: 'Breakfast + Lunch', slug: 'breakfast-lunch', emoji: '🍳🍛' },
    { name: 'Breakfast + Dinner', slug: 'breakfast-dinner', emoji: '🍳🍽️' },
    { name: 'Lunch + Dinner', slug: 'lunch-dinner', emoji: '🍛🍽️' },
    { name: 'Breakfast + Lunch + Dinner', slug: 'breakfast-lunch-dinner', emoji: '🍳🍛🍽️' }
  ];

  const handleCategoryClick = (slug: string) => {
    navigate(`/menu/veg/${slug}`);
  };

  const handleBackToHome = () => {
    navigate('/home');
  };

  return (
    <div 
      className="min-h-screen"
      style={{
        background: 'radial-gradient(circle, rgba(50, 140, 129, 1) 0%, rgba(255, 255, 255, 1) 100%)'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header with White Background */}
        <div 
          className="rounded-2xl shadow-lg mb-8 p-4 sm:p-8 overflow-hidden"
          style={{
            backgroundColor: 'white',
            border: '2px solid rgba(50, 140, 129, 0.2)'
          }}
        >
          <div className="flex items-center justify-between flex-wrap">
            <div className="flex items-center min-w-0 flex-1">
              <button
                onClick={handleBackToHome}
                className="mr-3 sm:mr-4 p-2 sm:p-3 hover:bg-gray-100 rounded-full transition-all duration-300 border border-gray-200 flex-shrink-0"
                style={{ backgroundColor: 'rgba(50, 140, 129, 0.1)' }}
              >
                <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: '#328c81' }} />
              </button>
              <h1 
                className="text-xl sm:text-2xl md:text-3xl font-normal font-poppins truncate"
                style={{ color: '#328c81' }}
              >
                Vegetarian Menu
              </h1>
            </div>
            <div className="hidden md:block">
              <span 
                className="px-4 py-2 rounded-full text-sm font-bold border border-gray-200"
                style={{ 
                  backgroundColor: 'rgba(50, 140, 129, 0.1)',
                  color: '#328c81'
                }}
              >
                {menuCategories.length} Categories Available
              </span>
            </div>
          </div>
        </div>
       
        {/* Menu Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {menuCategories.map((category) => (
            <div
              key={category.slug}
              onClick={() => handleCategoryClick(category.slug)}
              className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer p-8 border-2 border-transparent hover:scale-105 transform"
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgb(50, 140, 129)';
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'transparent';
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
              }}
            >
              <div className="text-center">
                <div className="text-5xl mb-6 transform hover:scale-110 transition-transform duration-300">
                  {category.emoji}
                </div>
                <h3 
                  className="text-2xl font-bold mb-3"
                  style={{ color: 'rgb(50, 140, 129)' }}
                >
                  {category.name}
                </h3>
                <p className="text-gray-600 text-base font-medium">
                  Click To View Menu Details

                </p>
                <div 
                  className="mt-4 w-16 h-1 mx-auto rounded-full"
                  style={{ backgroundColor: 'rgb(50, 140, 129)' }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info Section */}
        <div className="mt-12 text-center">
          <div 
            className="inline-block p-6 rounded-2xl backdrop-blur-sm border border-white/30"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
          >
            <p 
              className="text-lg font-semibold"
              style={{ color: 'rgb(50, 140, 129)' }}
            >
              Fresh, Quality Vegetarian Meals
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VegMenu;