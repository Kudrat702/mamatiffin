import React, { useState, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { useImageSlider } from '../hooks/useImageSlider';
import { apiEndpoints } from '../configapi/api';

export const ImageSlider: React.FC = () => {
  const { images, loading, error, refetch } = useImageSlider();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isImageLoaded, setIsImageLoaded] = useState<{[key: number]: boolean}>({});
  const [animating, setAnimating] = useState(false);

  const isAutoPlaying = true;

  const nextSlide = useCallback(() => {
    if (images.length > 0 && !animating) {
      setAnimating(true);
      setTimeout(() => setAnimating(false), 700);
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }
  }, [images.length, animating]);

  const prevSlide = useCallback(() => {
    if (images.length > 0 && !animating) {
      setAnimating(true);
      setTimeout(() => setAnimating(false), 700);
      setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
    }
  }, [images.length, animating]);

  const getImageUrl = useCallback((src: string) => {
    if (!src) return 'https://placehold.co/900x700/1f2937/ffffff?text=Image+Not+Found';
    if (src.startsWith('http') || src.startsWith('data:')) return src;
    return apiEndpoints.getImageUrl(src);
  }, []);

  useEffect(() => {
    if (images.length === 0 || !isAutoPlaying) return;
    if (currentIndex >= images.length) { setCurrentIndex(0); return; }
    if (images.length > 1) {
      const interval = setInterval(nextSlide, 6000);
      return () => clearInterval(interval);
    }
  }, [images.length, currentIndex, nextSlide, isAutoPlaying]);

  useEffect(() => {
    if (images.length > 0) {
      images.forEach((image, index) => {
        const img = new Image();
        img.onload = () => setIsImageLoaded(prev => ({ ...prev, [index]: true }));
        img.src = getImageUrl(image.src);
      });
    }
  }, [images, getImageUrl]);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="relative w-full h-[50vw] min-h-[280px] max-h-[92vh] md:h-[520px] lg:h-[600px] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3 text-gray-600">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          <p className="text-sm font-medium">Loading Images…</p>
        </div>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="relative w-full h-[50vw] min-h-[280px] max-h-[92vh] md:h-[520px] overflow-hidden bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="text-center max-w-sm mx-auto p-6">
          <AlertCircle className="h-14 w-14 text-red-500 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-red-700 mb-2">Oops! Something went wrong</h3>
          <p className="text-sm text-red-500 bg-red-100 p-3 rounded-lg mb-4">{error}</p>
          <Button onClick={refetch} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full shadow-lg">
            <Loader2 className="h-4 w-4 mr-2" /> Try Again
          </Button>
        </div>
      </div>
    );
  }

  // ── Empty ────────────────────────────────────────────────────────────────
  if (images.length === 0) {
    return (
      <div className="relative w-full h-[50vw] min-h-[280px] max-h-[92vh] md:h-[520px] overflow-hidden bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-lg mx-auto p-8">
          <div className="w-20 h-20 mx-auto mb-5 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
            <AlertCircle className="h-10 w-10 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">No Images</h3>
          <p className="text-sm text-gray-500 bg-gray-100 p-4 rounded-lg">
            Add images from the admin panel to showcase your content.
          </p>
        </div>
      </div>
    );
  }

  // ── Reusable: Slide Images ───────────────────────────────────────────────
  const renderSlides = (placeholderSize: string) =>
    images.map((image, index) => (
      <div
        key={image._id || index}
        className={`absolute inset-0 transition-all duration-700 ease-in-out ${
          index === currentIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
        }`}
      >
        {!isImageLoaded[index] && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
          </div>
        )}
        <img
          src={getImageUrl(image.src)}
          alt={image.alt || ''}
          data-ai-hint={image.dataAiHint}
          className={`w-full h-full object-cover transition-opacity duration-700 ${isImageLoaded[index] ? 'opacity-100' : 'opacity-0'}`}
          loading={index === 0 ? 'eager' : 'lazy'}
          onLoad={() => setIsImageLoaded(prev => ({ ...prev, [index]: true }))}
          onError={(e) => { e.currentTarget.src = `https://placehold.co/${placeholderSize}/1f2937/ffffff?text=Failed+to+Load`; }}
        />
      </div>
    ));

  // ── Reusable: Nav Arrows + Dots + Progress ───────────────────────────────
  const renderControls = () => (
    <>
      <button onClick={prevSlide}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-20 h-9 w-9 rounded-full bg-white/25 hover:bg-white/40 backdrop-blur-sm border border-white/30 text-white flex items-center justify-center transition-all active:scale-95"
        aria-label="Previous">
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button onClick={nextSlide}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-20 h-9 w-9 rounded-full bg-white/25 hover:bg-white/40 backdrop-blur-sm border border-white/30 text-white flex items-center justify-center transition-all active:scale-95"
        aria-label="Next">
        <ChevronRight className="h-5 w-5" />
      </button>
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-black/25 backdrop-blur-sm rounded-full px-3 py-1.5">
        {images.map((_, idx) => (
          <button key={idx} onClick={() => setCurrentIndex(idx)}
            className={`rounded-full transition-all duration-300 ${
              idx === currentIndex ? 'h-2 w-6 bg-white' : 'h-2 w-2 bg-white/60 hover:bg-white/90'
            }`}
            aria-label={`Slide ${idx + 1}`}
          />
        ))}
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10 z-20">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out"
          style={{ width: `${((currentIndex + 1) / images.length) * 100}%` }}
        />
      </div>
    </>
  );

  return (
    <>
      {/* ════════════════════════════════════════════
          MOBILE RESPONSIVE  (below md / below 768px)
          Full-width square image slider + hero text below
          ════════════════════════════════════════════ */}
      <div className="block md:hidden">

        {/* Slider */}
        <div className="relative w-full overflow-hidden rounded-2xl" style={{ aspectRatio: '1 / 1' }}>

          {renderSlides('800x800')}

          {/* Hygiene Badge – mobile bottom-left overlay */}
          <div className="absolute bottom-14 left-4 z-20 bg-white/95 backdrop-blur-sm rounded-xl px-3 py-2 shadow-lg flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 flex-shrink-0 animate-pulse" />
            <div>
              <p className="text-xs font-semibold text-gray-800 leading-tight">Hygiene Checked</p>
              <p className="text-[10px] text-gray-500 leading-tight">Temp: 65°C | Staff: Masked</p>
            </div>
          </div>

          {images.length > 1 && renderControls()}
        </div>

        {/* Hero Text – slider ke niche, center aligned */}
        <div className="mt-5 text-center px-4">
          <h1 className="text-3xl font-extrabold leading-tight mb-3">
            <span className="text-green-800">Ghar Ka Khana</span><br />
            <span className="text-purple-700">Har Student Ke Room Tak</span>
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">
            Taste, Trust, Together. Healthy, hygienic Indian meals inspired by flavours from across India — delivered fresh to your doorstep.
          </p>
        </div>

      </div>

      {/* ════════════════════════════════════════════
          DESKTOP RESPONSIVE  (md and above / 768px+)
          Left: Hero text | Right: Image slider card
          ════════════════════════════════════════════ */}
      <div className="hidden md:flex items-center justify-between w-full gap-8 px-6 lg:px-10 xl:px-16 py-10 lg:py-14">

        {/* LEFT — Hero Text */}
        <div className="flex-1 flex flex-col justify-center">

          {/* Top badge pill */}
          <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 shadow-sm mb-6 w-fit">
            <span className="text-sm">🚀</span>
            <span className="text-sm font-semibold text-gray-700">#1 Daily Indian Meal Brand in Hazaribagh</span>
            <span className="text-xs text-gray-400 hidden lg:inline">(Expanding soon across India)</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl lg:text-5xl xl:text-6xl font-extrabold leading-tight mb-5">
            <span className="text-green-800">Ghar Ka Khana</span><br />
            <span className="text-purple-700">Har Student Ke Room Tak</span><br />
          </h1>

          {/* Subtitle */}
          <p className="text-gray-600 text-base lg:text-lg leading-relaxed mb-8 max-w-md">
            Taste, Trust, Together. Healthy, hygienic Indian meals inspired by flavours from across India — delivered fresh to your doorstep.
          </p>
        </div>

        {/* RIGHT — Image Slider Card (same square size as mobile) */}
        <div className="flex-shrink-0 relative pb-5" style={{ width: 'min(44%, 460px)' }}>

          {/* Rounded card with same 1:1 aspect ratio as mobile */}
          <div className="relative rounded-3xl overflow-hidden shadow-2xl" style={{ aspectRatio: '1 / 1' }}>
            {renderSlides('800x800')}
            {images.length > 1 && renderControls()}
          </div>

          {/* Hygiene Badge – desktop floating below card */}
          <div className="absolute -bottom-1 left-5 z-30 bg-white rounded-2xl px-4 py-3 shadow-xl flex items-center gap-3" style={{ minWidth: '210px' }}>
            <span className="w-3 h-3 rounded-full bg-green-500 flex-shrink-0 animate-pulse shadow-sm shadow-green-300" />
            <div>
              <p className="text-sm font-bold text-gray-800 leading-tight">Hygiene Checked</p>
              <p className="text-xs text-gray-500 leading-tight">Temp: 65°C | Staff: Masked</p>
            </div>
          </div>
        </div>

      </div>
    </>
  );
};

// import React, { useState, useEffect, useCallback } from 'react';
// import { Button } from './ui/button';
// import { ChevronLeft, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
// import { useImageSlider } from '../hooks/useImageSlider';
// import { apiEndpoints } from '../configapi/api';

// export const ImageSlider: React.FC = () => {
//   const { images, loading, error, refetch } = useImageSlider();
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [isImageLoaded, setIsImageLoaded] = useState<{[key: number]: boolean}>({});
//   const [animating, setAnimating] = useState(false);

//   const isAutoPlaying = true;

//   const nextSlide = useCallback(() => {
//     if (images.length > 0 && !animating) {
//       setAnimating(true);
//       setTimeout(() => setAnimating(false), 700);
//       setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
//     }
//   }, [images.length, animating]);

//   const prevSlide = useCallback(() => {
//     if (images.length > 0 && !animating) {
//       setAnimating(true);
//       setTimeout(() => setAnimating(false), 700);
//       setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
//     }
//   }, [images.length, animating]);

//   const getImageUrl = useCallback((src: string) => {
//     if (!src) return 'https://placehold.co/900x700/1f2937/ffffff?text=Image+Not+Found';
//     if (src.startsWith('http') || src.startsWith('data:')) return src;
//     return apiEndpoints.getImageUrl(src);
//   }, []);

//   useEffect(() => {
//     if (images.length === 0 || !isAutoPlaying) return;
//     if (currentIndex >= images.length) { setCurrentIndex(0); return; }
//     if (images.length > 1) {
//       const interval = setInterval(nextSlide, 6000);
//       return () => clearInterval(interval);
//     }
//   }, [images.length, currentIndex, nextSlide, isAutoPlaying]);

//   useEffect(() => {
//     if (images.length > 0) {
//       images.forEach((image, index) => {
//         const img = new Image();
//         img.onload = () => setIsImageLoaded(prev => ({ ...prev, [index]: true }));
//         img.src = getImageUrl(image.src);
//       });
//     }
//   }, [images, getImageUrl]);

//   // ── Loading ──────────────────────────────────────────────────────────────
//   if (loading) {
//     return (
//       <div className="relative w-full h-[50vw] min-h-[280px] max-h-[92vh] md:h-[520px] lg:h-[600px] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse flex items-center justify-center">
//         <div className="flex flex-col items-center space-y-3 text-gray-600">
//           <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
//           <p className="text-sm font-medium">Loading Images…</p>
//         </div>
//       </div>
//     );
//   }

//   // ── Error ────────────────────────────────────────────────────────────────
//   if (error) {
//     return (
//       <div className="relative w-full h-[50vw] min-h-[280px] max-h-[92vh] md:h-[520px] overflow-hidden bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
//         <div className="text-center max-w-sm mx-auto p-6">
//           <AlertCircle className="h-14 w-14 text-red-500 mx-auto mb-3" />
//           <h3 className="text-xl font-bold text-red-700 mb-2">Oops! Something went wrong</h3>
//           <p className="text-sm text-red-500 bg-red-100 p-3 rounded-lg mb-4">{error}</p>
//           <Button onClick={refetch} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full shadow-lg">
//             <Loader2 className="h-4 w-4 mr-2" /> Try Again
//           </Button>
//         </div>
//       </div>
//     );
//   }

//   // ── Empty ────────────────────────────────────────────────────────────────
//   if (images.length === 0) {
//     return (
//       <div className="relative w-full h-[50vw] min-h-[280px] max-h-[92vh] md:h-[520px] overflow-hidden bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
//         <div className="text-center max-w-lg mx-auto p-8">
//           <div className="w-20 h-20 mx-auto mb-5 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
//             <AlertCircle className="h-10 w-10 text-blue-600" />
//           </div>
//           <h3 className="text-2xl font-bold text-gray-800 mb-3">No Images</h3>
//           <p className="text-sm text-gray-500 bg-gray-100 p-4 rounded-lg">
//             Add images from the admin panel to showcase your content.
//           </p>
//         </div>
//       </div>
//     );
//   }

//   // ── Reusable: Slide Images ───────────────────────────────────────────────
//   const renderSlides = (placeholderSize: string) =>
//     images.map((image, index) => (
//       <div
//         key={image._id || index}
//         className={`absolute inset-0 transition-all duration-700 ease-in-out ${
//           index === currentIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
//         }`}
//       >
//         {!isImageLoaded[index] && (
//           <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse flex items-center justify-center">
//             <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
//           </div>
//         )}
//         <img
//           src={getImageUrl(image.src)}
//           alt={image.alt || ''}
//           data-ai-hint={image.dataAiHint}
//           className={`w-full h-full object-cover transition-opacity duration-700 ${isImageLoaded[index] ? 'opacity-100' : 'opacity-0'}`}
//           loading={index === 0 ? 'eager' : 'lazy'}
//           onLoad={() => setIsImageLoaded(prev => ({ ...prev, [index]: true }))}
//           onError={(e) => { e.currentTarget.src = `https://placehold.co/${placeholderSize}/1f2937/ffffff?text=Failed+to+Load`; }}
//         />
//       </div>
//     ));

//   // ── Reusable: Nav Arrows + Dots + Progress ───────────────────────────────
//   const renderControls = () => (
//     <>
//       <button onClick={prevSlide}
//         className="absolute left-2 top-1/2 -translate-y-1/2 z-20 h-9 w-9 rounded-full bg-white/25 hover:bg-white/40 backdrop-blur-sm border border-white/30 text-white flex items-center justify-center transition-all active:scale-95"
//         aria-label="Previous">
//         <ChevronLeft className="h-5 w-5" />
//       </button>
//       <button onClick={nextSlide}
//         className="absolute right-2 top-1/2 -translate-y-1/2 z-20 h-9 w-9 rounded-full bg-white/25 hover:bg-white/40 backdrop-blur-sm border border-white/30 text-white flex items-center justify-center transition-all active:scale-95"
//         aria-label="Next">
//         <ChevronRight className="h-5 w-5" />
//       </button>
//       <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-black/25 backdrop-blur-sm rounded-full px-3 py-1.5">
//         {images.map((_, idx) => (
//           <button key={idx} onClick={() => setCurrentIndex(idx)}
//             className={`rounded-full transition-all duration-300 ${
//               idx === currentIndex ? 'h-2 w-6 bg-white' : 'h-2 w-2 bg-white/60 hover:bg-white/90'
//             }`}
//             aria-label={`Slide ${idx + 1}`}
//           />
//         ))}
//       </div>
//       <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10 z-20">
//         <div
//           className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out"
//           style={{ width: `${((currentIndex + 1) / images.length) * 100}%` }}
//         />
//       </div>
//     </>
//   );

//   // ── Reusable: Opening Date Badge ─────────────────────────────────────────
//   const OpeningDateBadge = () => (
//     <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-300 rounded-full px-4 py-1.5 mb-4 w-fit shadow-sm">
//       <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0 animate-pulse" />
//       <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">
//         Coming Soon
//       </span>
//       <span className="text-xs font-extrabold text-amber-900">
//         18 May 2026
//       </span>
//     </div>
//   );

//   return (
//     <>
//       {/* ════════════════════════════════════════════
//           MOBILE RESPONSIVE  (below md / below 768px)
//           Full-width square image slider + hero text below
//           ════════════════════════════════════════════ */}
//       <div className="block md:hidden">

//         {/* Slider */}
//         <div className="relative w-full overflow-hidden rounded-2xl" style={{ aspectRatio: '1 / 1' }}>

//           {renderSlides('800x800')}

//           {/* Hygiene Badge – mobile bottom-left overlay */}
//           <div className="absolute bottom-14 left-4 z-20 bg-white/95 backdrop-blur-sm rounded-xl px-3 py-2 shadow-lg flex items-center gap-2">
//             <span className="w-2.5 h-2.5 rounded-full bg-green-500 flex-shrink-0 animate-pulse" />
//             <div>
//               <p className="text-xs font-semibold text-gray-800 leading-tight">Hygiene Checked</p>
//               <p className="text-[10px] text-gray-500 leading-tight">Temp: 65°C | Staff: Masked</p>
//             </div>
//           </div>

//           {images.length > 1 && renderControls()}
//         </div>

//         {/* Hero Text – slider ke niche, center aligned */}
//         <div className="mt-5 text-center px-4">

//           {/* ── Opening Date Badge (Mobile) ── */}
//           <div className="flex justify-center mb-1">
//             <OpeningDateBadge />
//           </div>

//           <h1 className="text-3xl font-extrabold leading-tight mb-3">
//             <span className="text-green-800">Ghar Ka Khana</span><br />
//             <span className="text-purple-700">Har Student Ke Room Tak</span>
//           </h1>
//           <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">
//             Taste, Trust, Together. Healthy, hygienic Indian meals inspired by flavours from across India — delivered fresh to your doorstep.
//           </p>
//         </div>

//       </div>

//       {/* ════════════════════════════════════════════
//           DESKTOP RESPONSIVE  (md and above / 768px+)
//           Left: Hero text | Right: Image slider card
//           ════════════════════════════════════════════ */}
//       <div className="hidden md:flex items-center justify-between w-full gap-8 px-6 lg:px-10 xl:px-16 py-10 lg:py-14">

//         {/* LEFT — Hero Text */}
//         <div className="flex-1 flex flex-col justify-center">

//           {/* Top badge pill */}
//           <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 shadow-sm mb-6 w-fit">
//             <span className="text-sm">🚀</span>
//             <span className="text-sm font-semibold text-gray-700">#1 Daily Indian Meal Brand in Hazaribagh</span>
//             <span className="text-xs text-gray-400 hidden lg:inline">(Expanding soon across India)</span>
//           </div>

//           {/* ── Opening Date Badge (Desktop) ── */}
//           <OpeningDateBadge />

//           {/* Heading */}
//           <h1 className="text-4xl lg:text-5xl xl:text-6xl font-extrabold leading-tight mb-5">
//             <span className="text-green-800">Ghar Ka Khana</span><br />
//             <span className="text-purple-700">Har Student Ke Room Tak</span><br />
//           </h1>

//           {/* Subtitle */}
//           <p className="text-gray-600 text-base lg:text-lg leading-relaxed mb-8 max-w-md">
//             Taste, Trust, Together. Healthy, hygienic Indian meals inspired by flavours from across India — delivered fresh to your doorstep.
//           </p>
//         </div>

//         {/* RIGHT — Image Slider Card (same square size as mobile) */}
//         <div className="flex-shrink-0 relative pb-5" style={{ width: 'min(44%, 460px)' }}>

//           {/* Rounded card with same 1:1 aspect ratio as mobile */}
//           <div className="relative rounded-3xl overflow-hidden shadow-2xl" style={{ aspectRatio: '1 / 1' }}>
//             {renderSlides('800x800')}
//             {images.length > 1 && renderControls()}
//           </div>

//           {/* Hygiene Badge – desktop floating below card */}
//           <div className="absolute -bottom-1 left-5 z-30 bg-white rounded-2xl px-4 py-3 shadow-xl flex items-center gap-3" style={{ minWidth: '210px' }}>
//             <span className="w-3 h-3 rounded-full bg-green-500 flex-shrink-0 animate-pulse shadow-sm shadow-green-300" />
//             <div>
//               <p className="text-sm font-bold text-gray-800 leading-tight">Hygiene Checked</p>
//               <p className="text-xs text-gray-500 leading-tight">Temp: 65°C | Staff: Masked</p>
//             </div>
//           </div>
//         </div>

//       </div>
//     </>
//   );
// };