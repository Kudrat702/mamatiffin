import React, { useEffect, useState } from 'react';

const FloatingBubblesFoodBackground: React.FC<{ children?: React.ReactNode; className?: string }> = ({ 
  children, 
  className = "" 
}) => {
  const [screenHeight, setScreenHeight] = useState(0);

  useEffect(() => {
    const updateScreenHeight = () => {
      setScreenHeight(Math.max(window.innerHeight, document.documentElement.scrollHeight));
    };
    
    updateScreenHeight();
    window.addEventListener('resize', updateScreenHeight);
    
    return () => window.removeEventListener('resize', updateScreenHeight);
  }, []);

  const foodItems = [
    "🥗", "🍛", "🥔", "🍞", "🍚", "🥬", "🥒", "🌶️", "🥖", "🍱",
    "🍗", "🥩", "🐟", "🍖", "🍳", "🦐", "🍤", "🥓", "🐔", "🦆",
    "🍔", "🍕", "🍟", "🥟", "🍜", "🌭", "🥪", "🌮", "🌯", "🥙",
    "🍽️", "🥄", "🍴", "🔪", "🥣", "🍷", "☕", "🍵", "🥤", "🍶",
    "🥞", "🧇", "🥨", "🍰", "🧁", "🍮", "🥧", "🍩", "🍪", "🥛"
  ];

  const createFloatingBubbles = () => {
    const bubbles = [];
    
    // Calculate dynamic bubble count based on screen height
    const bubbleCount = Math.max(150, Math.floor(screenHeight / 8));
    const gridCols = 20;
    const gridRows = Math.ceil(bubbleCount / gridCols);
    
    const cellWidth = 100 / gridCols;
    const cellHeight = 100 / gridRows;
    
    for (let i = 0; i < bubbleCount; i++) {
      const gridCol = i % gridCols;
      const gridRow = Math.floor(i / gridCols);
      
      const baseX = gridCol * cellWidth + cellWidth / 2;
      const baseY = gridRow * cellHeight + cellHeight / 2;
      
      const randomOffsetX = (Math.random() - 0.5) * cellWidth * 0.8;
      const randomOffsetY = (Math.random() - 0.5) * cellHeight * 0.8;
      
      const x = Math.max(2, Math.min(98, baseX + randomOffsetX));
      const y = Math.max(2, Math.min(98, baseY + randomOffsetY));
      
      const size = 20 + Math.random() * 40;
      const delay = Math.random() * 20;
      const duration = 8 + Math.random() * 12;
      const foodItem = foodItems[Math.floor(Math.random() * foodItems.length)];
      
      bubbles.push(
        <div
          key={`bubble-${i}`}
          className="absolute rounded-full flex items-center justify-center"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            left: `${x}%`,
            top: `${y}%`,
            background: `radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.8), rgba(50, 140, 129, 0.1), rgba(34, 197, 94, 0.05))`,
            backdropFilter: 'blur(1px)',
            border: '0.5px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
            animation: `floatBubble ${duration}s ease-in-out infinite`,
            animationDelay: `${delay}s`,
            zIndex: 1,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <span 
            className="opacity-65"
            style={{
              fontSize: `${Math.max(10, size * 0.35)}px`,
              animation: `spinEmoji ${duration * 2}s linear infinite reverse`,
              animationDelay: `${delay}s`,
              filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.08))'
            }}
          >
            {foodItem}
          </span>
        </div>
      );
    }
    
    // Extra bottom coverage bubbles
    const bottomBubbles = [];
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * 100;
      const y = 85 + Math.random() * 15; // Bottom 15% coverage
      const size = 15 + Math.random() * 30;
      const delay = Math.random() * 25;
      const duration = 6 + Math.random() * 10;
      const foodItem = foodItems[Math.floor(Math.random() * foodItems.length)];
      
      bottomBubbles.push(
        <div
          key={`bottom-bubble-${i}`}
          className="absolute rounded-full flex items-center justify-center"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            left: `${x}%`,
            top: `${y}%`,
            background: `radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.75), rgba(50, 140, 129, 0.08), rgba(34, 197, 94, 0.04))`,
            backdropFilter: 'blur(0.5px)',
            border: '0.5px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 1px 6px rgba(0, 0, 0, 0.04)',
            animation: `floatBubble ${duration}s ease-in-out infinite`,
            animationDelay: `${delay}s`,
            zIndex: 1,
            transform: 'translate(-50%, -50%)',
            opacity: 0.7
          }}
        >
          <span 
            className="opacity-60"
            style={{
              fontSize: `${Math.max(8, size * 0.3)}px`,
              animation: `spinEmoji ${duration * 2}s linear infinite reverse`,
              animationDelay: `${delay}s`
            }}
          >
            {foodItem}
          </span>
        </div>
      );
    }
    
    // Edge coverage bubbles
    const edgeBubbles = [];
    for (let edge = 0; edge < 60; edge++) {
      const side = Math.floor(Math.random() * 4); // 0=top, 1=right, 2=bottom, 3=left
      let x, y;
      
      switch(side) {
        case 0: // Top
          x = Math.random() * 100;
          y = Math.random() * 5;
          break;
        case 1: // Right
          x = 95 + Math.random() * 5;
          y = Math.random() * 100;
          break;
        case 2: // Bottom
          x = Math.random() * 100;
          y = 95 + Math.random() * 5;
          break;
        case 3: // Left
          x = Math.random() * 5;
          y = Math.random() * 100;
          break;
        default:
          x = Math.random() * 100;
          y = Math.random() * 100;
      }
      
      const size = 12 + Math.random() * 25;
      const delay = Math.random() * 30;
      const duration = 5 + Math.random() * 8;
      const foodItem = foodItems[Math.floor(Math.random() * foodItems.length)];
      
      edgeBubbles.push(
        <div
          key={`edge-bubble-${edge}`}
          className="absolute rounded-full flex items-center justify-center"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            left: `${x}%`,
            top: `${y}%`,
            background: `radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.7), rgba(50, 140, 129, 0.06), rgba(34, 197, 94, 0.03))`,
            backdropFilter: 'blur(0.5px)',
            border: '0.5px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 1px 4px rgba(0, 0, 0, 0.03)',
            animation: `floatBubble ${duration}s ease-in-out infinite`,
            animationDelay: `${delay}s`,
            zIndex: 1,
            transform: 'translate(-50%, -50%)',
            opacity: 0.6
          }}
        >
          <span 
            className="opacity-55"
            style={{
              fontSize: `${Math.max(6, size * 0.25)}px`,
              animation: `spinEmoji ${duration * 2}s linear infinite reverse`,
              animationDelay: `${delay}s`
            }}
          >
            {foodItem}
          </span>
        </div>
      );
    }
    
    return [...bubbles, ...bottomBubbles, ...edgeBubbles];
  };

  return (
    <div className={`relative w-full overflow-hidden ${className}`} style={{ minHeight: '100vh', height: 'auto' }}>
      {/* CSS Animations - Fixed for React */}
      <style>
        {`
          @keyframes floatBubble {
            0%, 100% { 
              transform: translate(-50%, -50%) translateY(0px) rotate(0deg) scale(1); 
            }
            25% { 
              transform: translate(-50%, -50%) translateY(-12px) rotate(30deg) scale(1.01); 
            }
            50% { 
              transform: translate(-50%, -50%) translateY(-6px) rotate(60deg) scale(0.99); 
            }
            75% { 
              transform: translate(-50%, -50%) translateY(-15px) rotate(90deg) scale(1.005); 
            }
          }
          
          @keyframes spinEmoji {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}
      </style>
      
      {/* Full coverage background */}
      <div 
        className="fixed inset-0 w-full"
        style={{
          height: '100vh',
          background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 25%, #ecfdf5 45%, #ffffff 70%, #f0fdfa 100%)',
          backgroundSize: '400% 400%',
          animation: 'gradientShift 30s ease infinite'
        }}
      />
      
      {/* Extended background for scrollable content */}
      <div 
        className="absolute inset-0 w-full"
        style={{
          minHeight: `${Math.max(screenHeight, 2000)}px`,
          background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 25%, #ecfdf5 45%, #ffffff 70%, #f0fdfa 100%)',
          backgroundSize: '400% 400%',
          animation: 'gradientShift 30s ease infinite'
        }}
      />
      
      {/* Floating Bubbles with full coverage */}
      <div 
        className="absolute inset-0 w-full"
        style={{
          minHeight: `${Math.max(screenHeight, 2000)}px`
        }}
      >
        {createFloatingBubbles()}
      </div>
      
      {/* Enhanced glass overlay */}
      <div 
        className="absolute inset-0 w-full"
        style={{
          minHeight: `${Math.max(screenHeight, 2000)}px`,
          background: `
            linear-gradient(45deg, rgba(255, 255, 255, 0.04) 25%, transparent 25%, transparent 75%, rgba(255, 255, 255, 0.04) 75%), 
            linear-gradient(45deg, rgba(255, 255, 255, 0.04) 25%, transparent 25%, transparent 75%, rgba(255, 255, 255, 0.04) 75%),
            radial-gradient(circle at 15% 15%, rgba(50, 140, 129, 0.03) 0%, transparent 30%),
            radial-gradient(circle at 85% 85%, rgba(34, 197, 94, 0.02) 0%, transparent 30%)
          `,
          backgroundSize: '20px 20px, 20px 20px, 120px 120px, 120px 120px',
          backgroundPosition: '0 0, 10px 10px, 0 0, 0 0'
        }}
      />
      
      {/* Bottom gradient overlay for smooth fade */}
      <div 
        className="absolute bottom-0 left-0 w-full h-32"
        style={{
          background: 'linear-gradient(to top, rgba(240, 253, 244, 0.8) 0%, transparent 100%)',
          pointerEvents: 'none'
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
};

export default FloatingBubblesFoodBackground;