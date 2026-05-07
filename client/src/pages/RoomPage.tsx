import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  MapPin,
  Phone,
  User,
  Home,
  Filter,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  IndianRupee,
  Bed,
  X,
  ZoomIn,
} from 'lucide-react';
import {
  getAllRooms,
  type Room,
  type RoomGender,
  type RoomBedType,
} from '../configapi/api';

const ROOMS_PER_PAGE = 10;

// Helper: resolve image URL (Cloudinary URLs are absolute, fallback for legacy)
const resolveImageUrl = (url: string): string => {
  if (!url) return 'https://via.placeholder.com/400x300?text=Room+Image';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${import.meta.env.VITE_API_URL || ''}${url}`;
};

const RoomsPage: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [activeGender, setActiveGender] = useState<RoomGender | ''>('');
  const [activeBedType, setActiveBedType] = useState<RoomBedType | ''>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalRooms, setTotalRooms] = useState<number>(0);

  const [showMobileFilter, setShowMobileFilter] = useState<boolean>(false);

  // Lightbox state — when set, shows full-screen image viewer
  const [lightbox, setLightbox] = useState<{
    images: { url: string }[];
    index: number;
    lodgeName: string;
  } | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const fetchRooms = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await getAllRooms({
        gender: activeGender || undefined,
        bedType: activeBedType || undefined,
        search: debouncedSearch || undefined,
        page: currentPage,
        limit: ROOMS_PER_PAGE,
      });

      setRooms(result.rooms);
      setTotalPages(result.totalPages);
      setTotalRooms(result.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load rooms');
    } finally {
      setLoading(false);
    }
  }, [activeGender, activeBedType, debouncedSearch, currentPage]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeGender, activeBedType, debouncedSearch]);

  // Lock body scroll when lightbox open
  useEffect(() => {
    if (lightbox) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [lightbox]);

  // Keyboard navigation in lightbox
  useEffect(() => {
    if (!lightbox) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(null);
      if (e.key === 'ArrowRight' && lightbox.index < lightbox.images.length - 1) {
        setLightbox({ ...lightbox, index: lightbox.index + 1 });
      }
      if (e.key === 'ArrowLeft' && lightbox.index > 0) {
        setLightbox({ ...lightbox, index: lightbox.index - 1 });
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightbox]);

  const handleGenderChange = (g: RoomGender | '') => {
    setActiveGender(g);
    setShowMobileFilter(false);
  };

  const handleBedTypeChange = (b: RoomBedType | '') => {
    setActiveBedType(b);
    setShowMobileFilter(false);
  };

  const clearFilters = () => {
    setActiveGender('');
    setActiveBedType('');
    setSearchTerm('');
    setShowMobileFilter(false);
  };

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-3">Find Your Perfect Room</h1>
          <p className="text-emerald-50 text-lg">Affordable lodges for boys & girls near you</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6 flex flex-col sm:flex-row gap-3 items-stretch">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by lodge, owner, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:outline-none transition"
            />
          </div>
          <button
            onClick={() => setShowMobileFilter(true)}
            className="lg:hidden flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700"
          >
            <Filter className="w-5 h-5" /> Filters
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          {/* Desktop Sidebar Filter */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 bg-white rounded-2xl shadow-md p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Filter className="w-5 h-5 text-emerald-600" /> Filters
                </h3>
                {(activeGender || activeBedType || searchTerm) && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-red-500 hover:text-red-700 font-semibold"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Room For</h4>
                <div className="space-y-2">
                  {[
                    { val: '', label: 'All Rooms', emoji: '🏠' },
                    { val: 'boy', label: 'Boys Room', emoji: '👨' },
                    { val: 'girl', label: 'Girls Room', emoji: '👩' },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      onClick={() => handleGenderChange(opt.val as RoomGender | '')}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition ${
                        activeGender === opt.val
                          ? 'bg-emerald-100 text-emerald-800 border-2 border-emerald-500 font-semibold'
                          : 'bg-gray-50 text-gray-700 border-2 border-transparent hover:bg-gray-100'
                      }`}
                    >
                      <span className="text-xl">{opt.emoji}</span>
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Bed Type</h4>
                <div className="space-y-2">
                  {[
                    { val: '', label: 'All Types' },
                    { val: 'single', label: 'Single Bed' },
                    { val: 'double', label: 'Double Bed' },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      onClick={() => handleBedTypeChange(opt.val as RoomBedType | '')}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition ${
                        activeBedType === opt.val
                          ? 'bg-emerald-100 text-emerald-800 border-2 border-emerald-500 font-semibold'
                          : 'bg-gray-50 text-gray-700 border-2 border-transparent hover:bg-gray-100'
                      }`}
                    >
                      <Bed className="w-4 h-4" />
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Mobile Filter Drawer */}
          {showMobileFilter && (
            <div
              className="fixed inset-0 bg-black/50 z-50 lg:hidden"
              onClick={() => setShowMobileFilter(false)}
            >
              <div
                className="absolute right-0 top-0 h-full w-80 max-w-full bg-white p-6 overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold">Filters</h3>
                  <button onClick={() => setShowMobileFilter(false)} className="text-gray-500">
                    ✕
                  </button>
                </div>

                <h4 className="text-sm font-semibold text-gray-700 mb-3">Room For</h4>
                <div className="space-y-2 mb-6">
                  {[
                    { val: '', label: 'All Rooms', emoji: '🏠' },
                    { val: 'boy', label: 'Boys Room', emoji: '👨' },
                    { val: 'girl', label: 'Girls Room', emoji: '👩' },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      onClick={() => handleGenderChange(opt.val as RoomGender | '')}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left ${
                        activeGender === opt.val
                          ? 'bg-emerald-100 border-2 border-emerald-500 font-semibold'
                          : 'bg-gray-50'
                      }`}
                    >
                      <span className="text-xl">{opt.emoji}</span>
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>

                <h4 className="text-sm font-semibold text-gray-700 mb-3">Bed Type</h4>
                <div className="space-y-2 mb-6">
                  {[
                    { val: '', label: 'All Types' },
                    { val: 'single', label: 'Single Bed' },
                    { val: 'double', label: 'Double Bed' },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      onClick={() => handleBedTypeChange(opt.val as RoomBedType | '')}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left ${
                        activeBedType === opt.val
                          ? 'bg-emerald-100 border-2 border-emerald-500 font-semibold'
                          : 'bg-gray-50'
                      }`}
                    >
                      <Bed className="w-4 h-4" />
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>

                <button
                  onClick={clearFilters}
                  className="w-full py-3 bg-red-50 text-red-600 rounded-lg font-semibold"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          )}

          <main>
            <div className="mb-4 flex flex-wrap gap-2 items-center">
              <span className="text-sm text-gray-600 font-semibold">
                {totalRooms} room{totalRooms !== 1 ? 's' : ''} found
              </span>
              {activeGender && (
                <span className="text-xs bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-medium">
                  {activeGender === 'boy' ? '👨 Boys' : '👩 Girls'}
                </span>
              )}
              {activeBedType && (
                <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                  {activeBedType === 'single' ? 'Single Bed' : 'Double Bed'}
                </span>
              )}
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl p-5 animate-pulse">
                    <div className="h-64 bg-gray-200 rounded-lg mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
                <p className="text-red-700 font-semibold mb-3">{error}</p>
                <button
                  onClick={fetchRooms}
                  className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Try Again
                </button>
              </div>
            ) : rooms.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-md">
                <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-700 mb-2">No Rooms Found</h3>
                <p className="text-gray-500 mb-4">Try adjusting your filters or search term</p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {rooms.map((room) => (
                    <RoomCard
                      key={room._id}
                      room={room}
                      onImageClick={(idx) =>
                        setLightbox({
                          images: room.images || [],
                          index: idx,
                          lodgeName: room.lodgeName,
                        })
                      }
                    />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-2 flex-wrap">
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="flex items-center gap-1 px-3 py-2 rounded-lg bg-white border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      <ChevronLeft className="w-4 h-4" /> Prev
                    </button>

                    {renderPageNumbers().map((p, idx) =>
                      typeof p === 'number' ? (
                        <button
                          key={idx}
                          onClick={() => goToPage(p)}
                          className={`min-w-[40px] px-3 py-2 rounded-lg font-semibold ${
                            currentPage === p
                              ? 'bg-emerald-600 text-white'
                              : 'bg-white border border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {p}
                        </button>
                      ) : (
                        <span key={idx} className="px-2 text-gray-400">
                          {p}
                        </span>
                      )
                    )}

                    <button
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-1 px-3 py-2 rounded-lg bg-white border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Next <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* ============================================
          LIGHTBOX MODAL — full screen image viewer
          ============================================ */}
      {lightbox && (
        <Lightbox
          images={lightbox.images}
          index={lightbox.index}
          lodgeName={lightbox.lodgeName}
          onClose={() => setLightbox(null)}
          onChange={(newIdx) => setLightbox({ ...lightbox, index: newIdx })}
        />
      )}
    </div>
  );
};

// ==========================================
// ROOM CARD — full image visible + click to enlarge
// ==========================================
const RoomCard: React.FC<{
  room: Room;
  onImageClick: (index: number) => void;
}> = ({ room, onImageClick }) => {
  const [activeImg, setActiveImg] = useState(0);
  const images = room.images && room.images.length > 0 ? room.images : [{ url: '' }];
  const mainImageUrl = resolveImageUrl(images[activeImg]?.url || '');

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-emerald-200">
      {/* MAIN IMAGE — full visible (object-contain) on light bg */}
      <div className="relative bg-gradient-to-br from-gray-100 to-gray-200">
        <button
          type="button"
          onClick={() => onImageClick(activeImg)}
          className="block w-full group cursor-zoom-in"
          aria-label="View full image"
        >
          <div className="aspect-[4/3] flex items-center justify-center">
            <img
              src={mainImageUrl}
              alt={room.lodgeName}
              loading="lazy"
              className="max-w-full max-h-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://via.placeholder.com/400x300?text=Room+Image';
              }}
            />
          </div>
          {/* Zoom hint on hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition bg-black/60 text-white rounded-full p-2">
              <ZoomIn className="w-5 h-5" />
            </div>
          </div>
        </button>

        {/* Top-left badges */}
        <div className="absolute top-3 left-3 flex gap-2 pointer-events-none">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold shadow ${
              room.gender === 'boy' ? 'bg-blue-500 text-white' : 'bg-pink-500 text-white'
            }`}
          >
            {room.gender === 'boy' ? '👨 Boys' : '👩 Girls'}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/95 text-gray-800 shadow">
            <Bed className="w-3 h-3 inline mr-1" />
            {room.bedType === 'single' ? 'Single' : 'Double'}
          </span>
        </div>

        {/* Top-right rent badge */}
        {room.rentPrice && (
          <div className="absolute top-3 right-3 bg-emerald-600 text-white px-3 py-1 rounded-full font-bold text-sm flex items-center shadow pointer-events-none">
            <IndianRupee className="w-3 h-3" />
            {room.rentPrice}/mo
          </div>
        )}

        {/* Image count badge (bottom-right) */}
        {room.images && room.images.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded-md font-semibold pointer-events-none">
            {activeImg + 1} / {room.images.length}
          </div>
        )}
      </div>

      {/* THUMBNAIL STRIP (only if multiple images) */}
      {room.images && room.images.length > 1 && (
        <div className="px-3 pt-3 flex gap-2 overflow-x-auto">
          {room.images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveImg(idx)}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition ${
                activeImg === idx
                  ? 'border-emerald-500 ring-2 ring-emerald-200'
                  : 'border-gray-200 hover:border-gray-400'
              }`}
            >
              <img
                src={resolveImageUrl(img.url)}
                alt=""
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}

      {/* BODY */}
      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-1">{room.lodgeName}</h3>

        <div className="space-y-2.5">
          <div className="flex items-start gap-2 text-sm">
            <User className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <span className="text-gray-700 font-medium">{room.ownerName}</span>
          </div>

          <a
            href={`tel:${room.ownerContact}`}
            className="flex items-center gap-2 text-sm hover:text-emerald-700 transition"
          >
            <Phone className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="text-gray-700 font-medium">+91 {room.ownerContact}</span>
          </a>

          <div className="flex items-start gap-2 text-sm">
            <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <span className="text-gray-600 line-clamp-2">{room.address}</span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <a
            href={`tel:${room.ownerContact}`}
            className="flex items-center justify-center gap-1.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-sm transition"
          >
            <Phone className="w-4 h-4" /> Call
          </a>
          <a
            href={room.googleMapLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition"
          >
            <MapPin className="w-4 h-4" /> Map
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// LIGHTBOX — full-screen image viewer
// ==========================================
const Lightbox: React.FC<{
  images: { url: string }[];
  index: number;
  lodgeName: string;
  onClose: () => void;
  onChange: (index: number) => void;
}> = ({ images, index, lodgeName, onClose, onChange }) => {
  if (!images || images.length === 0) return null;
  const current = images[index];
  const hasPrev = index > 0;
  const hasNext = index < images.length - 1;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition"
        aria-label="Close"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Title */}
      <div className="absolute top-4 left-4 z-10 text-white">
        <p className="font-bold text-lg">{lodgeName}</p>
        <p className="text-sm text-white/70">
          {index + 1} of {images.length}
        </p>
      </div>

      {/* Prev button */}
      {hasPrev && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onChange(index - 1);
          }}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 transition"
          aria-label="Previous"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Next button */}
      {hasNext && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onChange(index + 1);
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 transition"
          aria-label="Next"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Main image */}
      <img
        src={resolveImageUrl(current.url)}
        alt={lodgeName}
        className="max-w-[95vw] max-h-[90vh] object-contain"
        onClick={(e) => e.stopPropagation()}
      />

      {/* Bottom thumbnail strip */}
      {images.length > 1 && (
        <div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 max-w-[90vw] overflow-x-auto p-2 bg-black/50 rounded-xl"
          onClick={(e) => e.stopPropagation()}
        >
          {images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onChange(idx)}
              className={`flex-shrink-0 w-14 h-14 rounded overflow-hidden border-2 transition ${
                idx === index ? 'border-white' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img
                src={resolveImageUrl(img.url)}
                alt=""
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default RoomsPage;