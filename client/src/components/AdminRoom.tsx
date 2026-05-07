import React, { useState, useEffect, useCallback, useContext } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  RefreshCw,
  X,
  MapPin,
  Phone,
  User,
  Home,
  Eye,
  EyeOff,
  Upload,
  IndianRupee, 
  Bed,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { AuthContext } from '../context/AdminAuthContext';
import {
  getAllRoomsAdmin,
  createRoom,
  updateRoom,
  deleteRoom,
  toggleRoomAvailability,
  getRoomStats,
  type Room,
  type RoomGender,
  type RoomBedType,
  type RoomStats,
} from '../configapi/api';

interface AdminRoomProps {
  onNotification?: (message: string) => void;
}

const ROOMS_PER_PAGE = 10;

// Helper: build a usable image URL (Cloudinary URLs are already absolute)
const resolveImageUrl = (url: string): string => {
  if (!url) return 'https://via.placeholder.com/400x250?text=Room';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  // Fallback for legacy local /uploads/ paths (older data)
  return `${import.meta.env.VITE_API_URL || ''}${url}`;
};

const AdminRoom: React.FC<AdminRoomProps> = ({ onNotification }) => {
  const authContext = useContext(AuthContext);
  const token = authContext?.token || localStorage.getItem('ADMIN_TOKEN') || '';

  const [rooms, setRooms] = useState<Room[]>([]);
  const [stats, setStats] = useState<RoomStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filterGender, setFilterGender] = useState<RoomGender | ''>('');
  const [filterBedType, setFilterBedType] = useState<RoomBedType | ''>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRooms, setTotalRooms] = useState(0);

  const [showForm, setShowForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  const notify = (msg: string) => {
    if (onNotification) onNotification(msg);
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [roomsRes, statsRes] = await Promise.all([
        getAllRoomsAdmin(
          {
            gender: filterGender || undefined,
            bedType: filterBedType || undefined,
            search: searchTerm || undefined,
            page: currentPage,
            limit: ROOMS_PER_PAGE,
          },
          token
        ),
        getRoomStats(token).catch(() => null),
      ]);

      setRooms(roomsRes.rooms);
      setTotalPages(roomsRes.totalPages);
      setTotalRooms(roomsRes.total);
      if (statsRes) setStats(statsRes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load rooms');
    } finally {
      setLoading(false);
    }
  }, [filterGender, filterBedType, searchTerm, currentPage, token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterGender, filterBedType, searchTerm]);

  const handleAddNew = () => {
    setEditingRoom(null);
    setShowForm(true);
  };

  const handleEdit = (room: Room) => {
    setEditingRoom(room);
    setShowForm(true);
  };

  const handleFormClose = (refresh: boolean) => {
    setShowForm(false);
    setEditingRoom(null);
    if (refresh) fetchData();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await deleteRoom(id, token);
      notify('Room deleted successfully');
      fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await toggleRoomAvailability(id, token);
      notify('Room availability updated');
      fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to toggle');
    }
  };

  if (showForm) {
    return (
      <RoomForm
        room={editingRoom}
        token={token}
        onClose={handleFormClose}
        onNotify={notify}
      />
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Room Management</h2>
          <p className="text-gray-600">Manage lodge & room listings</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchData}
            className="flex items-center gap-2 rounded-lg bg-gray-500 px-4 py-2 font-bold text-white hover:bg-gray-600"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 font-bold text-white hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" />
            Add New Room
          </button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="mb-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          <StatCard label="Total" value={stats.total} color="blue" />
          <StatCard label="Boys" value={stats.boyRooms} color="indigo" />
          <StatCard label="Girls" value={stats.girlRooms} color="pink" />
          <StatCard label="Single" value={stats.singleBed} color="purple" />
          <StatCard label="Double" value={stats.doubleBed} color="orange" />
          <StatCard label="Available" value={stats.available} color="green" />
          <StatCard label="Unavailable" value={stats.unavailable} color="red" />
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 bg-gray-50 rounded-xl p-4 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by lodge, owner, contact..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <select
            value={filterGender}
            onChange={(e) => setFilterGender(e.target.value as RoomGender | '')}
            className="px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="">All Gender</option>
            <option value="boy">👨 Boys Room</option>
            <option value="girl">👩 Girls Room</option>
          </select>

          <select
            value={filterBedType}
            onChange={(e) => setFilterBedType(e.target.value as RoomBedType | '')}
            className="px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="">All Bed Types</option>
            <option value="single">Single Bed</option>
            <option value="double">Double Bed</option>
          </select>
        </div>
        <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
          <Filter className="w-4 h-4" />
          <span>{totalRooms} room(s) match your filters</span>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-12 text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-emerald-600"></div>
          <p className="text-gray-600">Loading rooms...</p>
        </div>
      ) : error ? (
        <div className="py-12 text-center bg-red-50 rounded-xl border border-red-200">
          <p className="text-red-700 font-semibold mb-3">{error}</p>
          <button
            onClick={fetchData}
            className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      ) : rooms.length === 0 ? (
        <div className="py-12 text-center bg-gray-50 rounded-xl border border-gray-200">
          <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-700 mb-2">No Rooms Found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || filterGender || filterBedType
              ? 'Try adjusting your filters'
              : 'Add your first room to get started'}
          </p>
          <button
            onClick={handleAddNew}
            className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            <Plus className="w-4 h-4 inline mr-1" /> Add Room
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {rooms.map((room) => (
              <AdminRoomCard
                key={room._id}
                room={room}
                onEdit={() => handleEdit(room)}
                onDelete={() => handleDelete(room._id, room.lodgeName)}
                onToggle={() => handleToggle(room._id)}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 py-2 rounded-lg bg-white border border-gray-200 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" /> Prev
              </button>
              <span className="px-4 py-2 text-sm font-semibold text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-3 py-2 rounded-lg bg-white border border-gray-200 disabled:opacity-40"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: number; color: string }> = ({
  label,
  value,
  color,
}) => {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    pink: 'bg-pink-50 text-pink-700 border-pink-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    red: 'bg-red-50 text-red-700 border-red-200',
  };
  return (
    <div className={`rounded-lg p-3 border ${colors[color] || colors.blue}`}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs font-semibold uppercase tracking-wide">{label}</div>
    </div>
  );
};

const AdminRoomCard: React.FC<{
  room: Room;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
}> = ({ room, onEdit, onDelete, onToggle }) => {
  const fullImageUrl = resolveImageUrl(room.images?.[0]?.url || '');

  return (
    <div
      className={`bg-white rounded-xl shadow-sm hover:shadow-lg transition-all overflow-hidden border-2 ${
        !room.isAvailable ? 'border-red-200 opacity-75' : 'border-gray-100'
      }`}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
        <img
          src={fullImageUrl}
          alt={room.lodgeName}
          className="w-full h-full object-contain"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x250?text=Room';
          }}
        />
        <div className="absolute top-2 left-2 flex gap-1">
          <span
            className={`px-2 py-1 rounded-full text-xs font-bold ${
              room.gender === 'boy' ? 'bg-blue-500 text-white' : 'bg-pink-500 text-white'
            }`}
          >
            {room.gender === 'boy' ? '👨 Boys' : '👩 Girls'}
          </span>
          <span className="px-2 py-1 rounded-full text-xs font-bold bg-white/90 text-gray-800">
            {room.bedType === 'single' ? 'Single' : 'Double'}
          </span>
        </div>
        {!room.isAvailable && (
          <div className="absolute inset-0 bg-red-900/60 flex items-center justify-center">
            <span className="bg-red-600 text-white px-4 py-2 rounded-full font-bold">
              UNAVAILABLE
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">{room.lodgeName}</h3>

        <div className="space-y-1.5 mb-3 text-sm">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-500" />
            <span className="text-gray-700">{room.ownerName}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-gray-500" />
            <span className="text-gray-700">{room.ownerContact}</span>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
            <span className="text-gray-600 line-clamp-2 text-xs">{room.address}</span>
          </div>
          {room.rentPrice && (
            <div className="flex items-center gap-2 font-bold text-emerald-600">
              <IndianRupee className="w-4 h-4" />
              <span>{room.rentPrice}/month</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={onEdit}
            className="flex items-center justify-center gap-1 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm font-semibold"
          >
            <Edit className="w-4 h-4" /> Edit
          </button>
          <button
            onClick={onToggle}
            className={`flex items-center justify-center gap-1 py-2 rounded-lg text-sm font-semibold text-white ${
              room.isAvailable
                ? 'bg-gray-500 hover:bg-gray-600'
                : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            {room.isAvailable ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {room.isAvailable ? 'Hide' : 'Show'}
          </button>
          <button
            onClick={onDelete}
            className="flex items-center justify-center gap-1 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-semibold"
          >
            <Trash2 className="w-4 h-4" /> Del
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// ROOM FORM (Add / Edit)  ← Cloudinary-aware
// ==========================================
interface RoomFormProps {
  room: Room | null;
  token: string;
  onClose: (refresh: boolean) => void;
  onNotify: (msg: string) => void;
}

const RoomForm: React.FC<RoomFormProps> = ({ room, token, onClose, onNotify }) => {
  const [form, setForm] = useState({
    lodgeName: room?.lodgeName || '',
    ownerName: room?.ownerName || '',
    ownerContact: room?.ownerContact || '',
    address: room?.address || '',
    googleMapLink: room?.googleMapLink || '',
    latitude: room?.latitude?.toString() || '',
    longitude: room?.longitude?.toString() || '',
    gender: (room?.gender || 'boy') as RoomGender,
    bedType: (room?.bedType || 'single') as RoomBedType,
    rentPrice: room?.rentPrice?.toString() || '',
    description: room?.description || '',
    isAvailable: room?.isAvailable ?? true,
  });

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState(room?.images || []);
  const [submitting, setSubmitting] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (field: string, value: string | boolean) => {
    setForm((p) => ({ ...p, [field]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    // Validate file size (5MB each, must match backend limit)
    const maxSize = 5 * 1024 * 1024;
    const oversize = files.find((f) => f.size > maxSize);
    if (oversize) {
      alert(`"${oversize.name}" is larger than 5MB. Please pick a smaller image.`);
      return;
    }

    // Validate file type
    const invalid = files.find((f) => !f.type.startsWith('image/'));
    if (invalid) {
      alert(`"${invalid.name}" is not an image file.`);
      return;
    }

    if (files.length + existingImages.length > 5) {
      alert('Max 5 images allowed in total');
      return;
    }

    // Revoke old previews
    imagePreviews.forEach((url) => URL.revokeObjectURL(url));

    setImageFiles(files);
    setImagePreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const removeExistingImage = (idx: number) => {
    setExistingImages((p) => p.filter((_, i) => i !== idx));
  };

  const validate = (): string | null => {
    if (!form.lodgeName.trim()) return 'Lodge name is required';
    if (!form.ownerName.trim()) return 'Owner name is required';
    if (!/^[0-9]{10}$/.test(form.ownerContact.trim())) return 'Contact must be 10 digits';
    if (!form.address.trim()) return 'Address is required';
    if (!form.googleMapLink.trim()) return 'Google Map link is required';

    // For new rooms, require at least 1 image
    if (!room && imageFiles.length === 0) {
      return 'Please upload at least 1 room image';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setErrMsg(err);
      return;
    }

    setSubmitting(true);
    setErrMsg(null);

    try {
      const fd = new FormData();
      fd.append('lodgeName', form.lodgeName.trim());
      fd.append('ownerName', form.ownerName.trim());
      fd.append('ownerContact', form.ownerContact.trim());
      fd.append('address', form.address.trim());
      fd.append('googleMapLink', form.googleMapLink.trim());
      if (form.latitude) fd.append('latitude', form.latitude);
      if (form.longitude) fd.append('longitude', form.longitude);
      fd.append('gender', form.gender);
      fd.append('bedType', form.bedType);
      if (form.rentPrice) fd.append('rentPrice', form.rentPrice);
      if (form.description) fd.append('description', form.description.trim());
      fd.append('isAvailable', String(form.isAvailable));

      // Existing images that admin wants to KEEP (only used in update flow)
      // Send full objects so backend keeps url + publicId
      if (room) {
        fd.append('images', JSON.stringify(existingImages));
      }

      // New uploaded files → backend uploads them to Cloudinary
      imageFiles.forEach((file) => fd.append('images', file));

      if (room) {
        await updateRoom(room._id, fd, token);
        onNotify('Room updated successfully');
      } else {
        await createRoom(fd, token);
        onNotify('Room created successfully');
      }

      onClose(true);
    } catch (err) {
      setErrMsg(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {room ? 'Edit Room' : 'Add New Room'}
          </h2>
          <p className="text-gray-600">
            {room ? 'Update lodge information' : 'Add a new lodge to the listings'}
          </p>
        </div>
        <button
          onClick={() => onClose(false)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
        >
          <X className="w-4 h-4" /> Cancel
        </button>
      </div>

      {errMsg && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {errMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Lodge Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.lodgeName}
            onChange={(e) => handleChange('lodgeName', e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            placeholder="e.g. Sunrise Boys Hostel"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Owner Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.ownerName}
              onChange={(e) => handleChange('ownerName', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              placeholder="Full name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Contact (10 digits) <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={form.ownerContact}
              onChange={(e) => handleChange('ownerContact', e.target.value.replace(/\D/g, ''))}
              maxLength={10}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              placeholder="9876543210"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Room For <span className="text-red-500">*</span>
            </label>
            <select
              value={form.gender}
              onChange={(e) => handleChange('gender', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              required
            >
              <option value="boy">👨 Boys Room</option>
              <option value="girl">👩 Girls Room</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Bed Type <span className="text-red-500">*</span>
            </label>
            <select
              value={form.bedType}
              onChange={(e) => handleChange('bedType', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              required
            >
              <option value="single">Single Bed</option>
              <option value="double">Double Bed</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Full Address <span className="text-red-500">*</span>
          </label>
          <textarea
            value={form.address}
            onChange={(e) => handleChange('address', e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            rows={2}
            placeholder="Full address with landmark"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Google Map Link <span className="text-red-500">*</span>
          </label>
          <input
            type="url"
            value={form.googleMapLink}
            onChange={(e) => handleChange('googleMapLink', e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            placeholder="https://maps.google.com/?q=..."
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Open Google Maps → Search location → Share → Copy link
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Latitude (optional)
            </label>
            <input
              type="number"
              step="any"
              value={form.latitude}
              onChange={(e) => handleChange('latitude', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              placeholder="23.3441"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Longitude (optional)
            </label>
            <input
              type="number"
              step="any"
              value={form.longitude}
              onChange={(e) => handleChange('longitude', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              placeholder="85.3096"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Monthly Rent (₹) - Optional
          </label>
          <input
            type="number"
            min="0"
            value={form.rentPrice}
            onChange={(e) => handleChange('rentPrice', e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            placeholder="3000"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Description (optional)
          </label>
          <textarea
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            rows={3}
            placeholder="Facilities, rules, nearby landmarks..."
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Room Images (max 5, each under 5MB)
            {!room && <span className="text-red-500"> *</span>}
          </label>

          {existingImages.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-2">Current images:</p>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                {existingImages.map((img, idx) => (
                  <div key={idx} className="relative">
                    <img
                      src={resolveImageUrl(img.url)}
                      alt=""
                      className="w-full h-24 object-cover rounded-lg border"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://via.placeholder.com/150?text=Img';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(idx)}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-md"
                      title="Remove image"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <label className="flex items-center justify-center gap-2 px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
            <Upload className="w-5 h-5 text-gray-500" />
            <span className="text-gray-600">
              Click to upload images (JPG, PNG, WEBP)
            </span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="hidden"
            />
          </label>

          {imagePreviews.length > 0 && (
            <div className="mt-3">
              <p className="text-xs text-gray-500 mb-2">New images to upload:</p>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                {imagePreviews.map((src, idx) => (
                  <img
                    key={idx}
                    src={src}
                    alt=""
                    className="w-full h-24 object-cover rounded-lg border-2 border-emerald-300"
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <input
            type="checkbox"
            id="isAvailable"
            checked={form.isAvailable}
            onChange={(e) => handleChange('isAvailable', e.target.checked)}
            className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500"
          />
          <label htmlFor="isAvailable" className="text-sm font-semibold text-gray-700">
            Mark as Available (visible to customers)
          </label>
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold disabled:opacity-50"
          >
            {submitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Bed className="w-4 h-4" /> {room ? 'Update Room' : 'Create Room'}
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => onClose(false)}
            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-bold"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminRoom;