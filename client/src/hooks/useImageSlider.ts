// import { useState, useEffect } from 'react';
// import type { SliderImage } from '../types/slider';
// import { sliderService } from '../../services/sliderService';

// interface UseImageSliderReturn {
//   images: SliderImage[];
//   loading: boolean;
//   error: string | null;
//   refetch: () => Promise<void>;
// }

// export const useImageSlider = (): UseImageSliderReturn => {
//   const [images, setImages] = useState<SliderImage[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);

//   const fetchImages = async () => {
//     try {
//       setLoading(true);
//       setError(null);
//       const fetchedImages = await sliderService.getSliderImages();
//       setImages(fetchedImages);
//     } catch (err) {
//       const errorMessage = err instanceof Error ? err.message : 'Failed to fetch slider images';
//       setError(errorMessage);
//       console.error('Error in useImageSlider:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchImages();
//   }, []);

//   const refetch = async () => {
//     await fetchImages();
//   };

//   return {
//     images,
//     loading,
//     error,
//     refetch
//   };
// };

import { useState, useEffect, useCallback } from 'react';
import type { SliderImage } from '../types/slider';
import { sliderService } from '../../services/sliderService';

interface UseImageSliderReturn {
  images: SliderImage[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useImageSlider = (): UseImageSliderReturn => {
  const [images, setImages] = useState<SliderImage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchImages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedImages = await sliderService.getSliderImages();
      if (fetchedImages.length === 0) {
        setError('No valid slider images found');
      }
      setImages(fetchedImages);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch slider images';
      setError(errorMessage);
      console.error('Error in useImageSlider:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const refetch = async () => {
    await fetchImages();
  };

  return {
    images,
    loading,
    error,
    refetch
  };
};