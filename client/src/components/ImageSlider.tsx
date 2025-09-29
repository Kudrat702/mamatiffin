import React, { useState, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { useImageSlider } from '../hooks/useImageSlider';
import { apiEndpoints } from '../configapi/api';

export const ImageSlider: React.FC = () => {
  const { images, loading, error, refetch } = useImageSlider();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isImageLoaded, setIsImageLoaded] = useState<{[key: number]: boolean}>({});
  
  // Auto-play state - kept for useEffect dependency
  const isAutoPlaying = true;

  // Memoized navigation functions
  const nextSlide = useCallback(() => {
    if (images.length > 0) {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }
  }, [images.length]);

  const prevSlide = useCallback(() => {
    if (images.length > 0) {
      setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
    }
  }, [images.length]);

  // Improved image URL handling with error prevention
  const getImageUrl = useCallback((src: string) => {
    if (!src) return 'https://placehold.co/1920x800/1f2937/ffffff?text=Image+Not+Found';
    
    if (src.startsWith('http') || src.startsWith('data:')) return src;

    // Use the centralized getImageUrl function from apiEndpoints
    return apiEndpoints.getImageUrl(src);
  }, []);

  // Auto-slide with play/pause functionality
  useEffect(() => {
    if (images.length === 0 || !isAutoPlaying) return;

    // Reset index if out of bounds
    if (currentIndex >= images.length) {
      setCurrentIndex(0);
      return;
    }

    // Only set interval if multiple images exist
    if (images.length > 1) {
      const interval = setInterval(nextSlide, 6000);
      return () => clearInterval(interval);
    }
  }, [images.length, currentIndex, nextSlide, isAutoPlaying]);

  // Preload images for smooth transitions
  useEffect(() => {
    if (images.length > 0) {
      images.forEach((image, index) => {
        const img = new Image();
        img.onload = () => {
          setIsImageLoaded(prev => ({ ...prev, [index]: true }));
        };
        img.src = getImageUrl(image.src);
      });
    }
  }, [images, getImageUrl]);

  // Toggle auto-play - Commented out since controls are disabled
  // const toggleAutoPlay = useCallback(() => {
  //   setIsAutoPlaying(prev => !prev);
  // }, []);

  // Loading state with modern skeleton
  if (loading) {
    return (
      <div className="relative w-full aspect-square sm:aspect-[4/3] md:aspect-[3/2] lg:aspect-[16/9] xl:aspect-[21/10] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
        <div className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center space-y-3 text-gray-600 px-4">
            <div className="relative">
              <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 animate-spin text-blue-600" />
              <div className="absolute inset-0 h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 animate-ping bg-blue-400 rounded-full opacity-20" />
            </div>
            <div className="text-center">
              <p className="text-sm sm:text-base lg:text-lg font-medium">Loading Images</p>
              <p className="text-xs sm:text-sm text-gray-500">Please wait...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state with modern design
  if (error) {
    return (
      <div className="relative w-full aspect-square sm:aspect-[4/3] md:aspect-[3/2] lg:aspect-[16/9] xl:aspect-[21/10] overflow-hidden bg-gradient-to-br from-red-50 to-red-100">
        <div className="flex items-center justify-center h-full">
          <div className="text-center max-w-xs sm:max-w-md mx-auto p-4 sm:p-8">
            <div className="mb-4 sm:mb-6">
              <AlertCircle className="h-12 w-12 sm:h-16 sm:w-16 text-red-500 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-2xl font-bold text-red-700 mb-2">Oops! Something went wrong</h3>
              <p className="text-sm sm:text-base text-red-600 mb-2">Failed to load images</p>
              <p className="text-xs sm:text-sm text-red-500 bg-red-100 p-2 sm:p-3 rounded-lg">{error}</p>
            </div>
            <Button
              onClick={refetch}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base"
            >
              <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Empty state with call-to-action
  if (images.length === 0) {
    return (
      <div className="relative w-full aspect-square sm:aspect-[4/3] md:aspect-[3/2] lg:aspect-[16/9] xl:aspect-[21/10] overflow-hidden bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="flex items-center justify-center h-full">
          <div className="text-center max-w-xs sm:max-w-lg mx-auto p-4 sm:p-8">
            <div className="mb-6 sm:mb-8">
              <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                <AlertCircle className="h-8 w-8 sm:h-12 sm:w-12 text-blue-600" />
              </div>
              <h3 className="text-xl sm:text-3xl font-bold text-gray-800 mb-3 sm:mb-4">No Images</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-2">Your section is waiting for some amazing images!</p>
              <p className="text-xs sm:text-sm text-gray-500 bg-gray-100 p-3 sm:p-4 rounded-lg">
                Add stunning images from the admin panel to showcase your content
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-square sm:aspect-[4/3] md:aspect-[3/2] lg:aspect-[16/9] xl:aspect-[21/10] overflow-hidden group">
      {/* Minimal gradient overlay only at bottom for controls visibility */}
      <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-20 lg:h-24 bg-gradient-to-t from-black/30 to-transparent z-10 pointer-events-none" />
      
      {/* Image container with full width and height */}
      <div className="relative h-full w-full">
        {images.map((image, index) => (
          <div
            key={image._id || index}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              index === currentIndex 
                ? 'opacity-100 scale-100' 
                : 'opacity-0 scale-105 pointer-events-none'
            }`}
          >
            {/* Image with loading placeholder */}
            <div className="relative h-full w-full">
              {!isImageLoaded[index] && (
                <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse flex items-center justify-center">
                  <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
                </div>
              )}
              <img
                src={getImageUrl(image.src)}
                alt={image.alt || ''}
                data-ai-hint={image.dataAiHint}
                className={`w-full h-full transition-all duration-700 ${
                  isImageLoaded[index] ? 'opacity-100' : 'opacity-0'
                } object-cover`}
                loading={index === 0 ? 'eager' : 'lazy'}
                onLoad={() => {
                  setIsImageLoaded(prev => ({ ...prev, [index]: true }));
                }}
                onError={(e) => {
                  console.error('Image load failed:', image.src);
                  e.currentTarget.src = 'https://placehold.co/1920x800/1f2937/ffffff?text=Failed+to+Load+Image';
                  e.currentTarget.alt = 'Failed to load image';
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Navigation controls - only show if multiple images */}
      {images.length > 1 && (
        <>
          {/* Navigation buttons with better mobile spacing */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 sm:left-3 md:left-4 lg:left-6 top-1/2 -translate-y-1/2 z-20 
                     h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 lg:h-14 lg:w-14 rounded-full 
                     bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30
                     text-white hover:text-white transition-all duration-300
                     opacity-80 hover:opacity-100 hover:scale-105 active:scale-95
                     shadow-lg hover:shadow-xl touch-manipulation"
            onClick={prevSlide}
            aria-label="Previous image"
          >
            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 lg:h-7 lg:w-7" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 sm:right-3 md:right-4 lg:right-6 top-1/2 -translate-y-1/2 z-20 
                     h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 lg:h-14 lg:w-14 rounded-full 
                     bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30
                     text-white hover:text-white transition-all duration-300
                     opacity-80 hover:opacity-100 hover:scale-105 active:scale-95
                     shadow-lg hover:shadow-xl touch-manipulation"
            onClick={nextSlide}
            aria-label="Next image"
          >
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 lg:h-7 lg:w-7" />
          </Button>

          {/* Dot indicators with better mobile sizing */}
          <div className="absolute bottom-3 sm:bottom-4 md:bottom-5 lg:bottom-6 left-1/2 -translate-x-1/2 z-20">
            <div className="flex items-center space-x-1.5 sm:space-x-2 md:space-x-3 bg-black/30 backdrop-blur-sm rounded-full px-2 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-3 border border-white/20">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`transition-all duration-300 rounded-full touch-manipulation ${
                    idx === currentIndex 
                      ? 'h-2 w-5 sm:h-3 sm:w-7 md:h-4 md:w-8 lg:h-5 lg:w-10 bg-white shadow-md' 
                      : 'h-1.5 w-1.5 sm:h-2 sm:w-2 md:h-2.5 md:w-2.5 lg:h-3 lg:w-3 bg-white/70 hover:bg-white/90 hover:scale-125'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                  aria-current={idx === currentIndex ? 'true' : 'false'}
                />
              ))}
            </div>
          </div>

          {/* Controls panel - Commented out as requested */}
          {/*
          <div className="absolute top-2 sm:top-3 md:top-4 lg:top-6 right-2 sm:right-3 md:right-4 lg:right-6 z-20 flex items-center space-x-1.5 sm:space-x-2 md:space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleAutoPlay}
              className="h-6 px-1.5 sm:h-8 sm:px-2 md:h-9 md:px-3 lg:h-10 lg:px-4 rounded-full bg-black/30 hover:bg-black/40 
                       backdrop-blur-sm border border-white/20 text-white hover:text-white
                       transition-all duration-300 opacity-80 hover:opacity-100
                       hidden xs:flex touch-manipulation"
              aria-label={isAutoPlaying ? 'Pause slideshow' : 'Play slideshow'}
            >
              {isAutoPlaying ? (
                <Pause className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4 lg:h-5 lg:w-5" />
              ) : (
                <Play className="h-2.5 w-2.5 sm:h-3 sm:w-3 md:h-4 md:w-4 lg:h-5 lg:w-5 ml-0.5" />
              )}
            </Button>

            <div className="h-6 px-1.5 sm:h-8 sm:px-2 md:h-9 md:px-3 lg:h-10 lg:px-4 rounded-full bg-black/30 backdrop-blur-sm 
                          border border-white/20 text-white text-xs sm:text-sm md:text-base font-medium
                          flex items-center transition-all duration-300 opacity-80">
              <span className="tabular-nums">
                {currentIndex + 1}/{images.length}
              </span>
            </div>
          </div>
          */}

          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 right-0 z-20">
            <div className="h-1 sm:h-2 lg:h-3 bg-black/20">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out"
                style={{
                  width: `${((currentIndex + 1) / images.length) * 100}%`
                }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};