// client/src/components/AdminLocation.tsx
// ✅ Custom confirmation modal - works in all browsers

import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Download,
  Save,
  X,
  AlertTriangle, // ✅ Add this
} from 'lucide-react';
import { apiEndpoints } from '../configapi/api';

interface Location {
  _id: string;
  name: string;
  id?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface AdminLocationProps {
  onNotification?: (message: string) => void;
}

const AdminLocation: React.FC<AdminLocationProps> = ({ onNotification }) => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLocationForm, setShowLocationForm] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [locationFormData, setLocationFormData] = useState({
    name: '',
    id: '',
  });
  const [refreshKey, setRefreshKey] = useState(0);
  
  // ✅ NEW: Confirmation modal state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState<Location | null>(null);

  // Fetch locations
  const fetchLocations = async (): Promise<void> => {
    try {
      console.log('📡 Fetching locations...');
      setLoading(true);
      setError(null);

      const response = await fetch(apiEndpoints.locations);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('📦 Locations received:', data);

      if (data.success) {
        const locationList = data.data || [];
        console.log(`✅ Setting ${locationList.length} locations to state`);
        setLocations([...locationList]);
        setRefreshKey(prev => prev + 1);
      } else {
        throw new Error(data.message || 'Failed to fetch locations');
      }
    } catch (err) {
      console.error('❌ Error fetching locations:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to load locations. Please try again.'
      );
    } finally {
      setLoading(false);
      console.log('✅ Fetch locations complete');
    }
  };

  // Add/Update location
  const handleLocationSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (!locationFormData.name.trim()) {
      alert('Please fill in location name');
      return;
    }

    try {
      let url: string;
      let method: string;

      if (editingLocation) {
        const locationId = editingLocation.id || editingLocation._id;
        url = apiEndpoints.location(locationId);
        method = 'PUT';
        console.log('📝 Updating location:', locationId);
      } else {
        url = apiEndpoints.locations;
        method = 'POST';
        console.log('➕ Adding new location');
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: locationFormData.name,
          id: locationFormData.id || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const message = editingLocation
          ? 'Location updated successfully!'
          : 'Location added successfully!';
        alert(message);
        if (onNotification) onNotification(message);
        
        setShowLocationForm(false);
        setEditingLocation(null);
        setLocationFormData({ name: '', id: '' });
        await fetchLocations();
      } else {
        throw new Error(data.message || 'Failed to save location');
      }
    } catch (err) {
      console.error('Error saving location:', err);
      alert(err instanceof Error ? err.message : 'Failed to save location');
    }
  };

  // Edit location
  const handleEditLocation = (location: Location): void => {
    console.log('✏️ Editing location:', location);
    setEditingLocation(location);
    setLocationFormData({
      name: location.name,
      id: location.id || '',
    });
    setShowLocationForm(true);
  };

  // ✅ NEW: Show delete confirmation modal
  const handleDeleteClick = (location: Location): void => {
    console.log('🔍 Delete button clicked for location:', location);
    setLocationToDelete(location);
    setShowDeleteConfirm(true);
  };

  // ✅ NEW: Confirm delete
  const confirmDelete = async (): Promise<void> => {
    if (!locationToDelete) return;

    const locationId = locationToDelete.id || locationToDelete._id;
    console.log('🗑️ Delete confirmed for ID:', locationId);

    try {
      const url = apiEndpoints.location(locationId);
      console.log('🌐 DELETE URL:', url);

      const response = await fetch(url, {
        method: 'DELETE',
      });

      console.log('📡 Response Status:', response.status);
      const data = await response.json();
      console.log('📦 Response Data:', data);

      if (response.ok && data.success) {
        console.log('✅ Delete successful on server');
        
        setLocations(prevLocations => {
          const newLocations = prevLocations.filter(loc => {
            const locId = loc.id || loc._id;
            return locId !== locationId;
          });
          console.log(`📊 Updated locations count: ${newLocations.length}`);
          return newLocations;
        });
        
        setRefreshKey(prev => prev + 1);
        alert('Location deleted successfully!');
        if (onNotification) onNotification('Location deleted successfully!');
        
        setTimeout(() => {
          fetchLocations();
        }, 100);
        
      } else {
        console.error('❌ Delete failed:', data.message);
        throw new Error(data.message || 'Failed to delete location');
      }
    } catch (err) {
      console.error('❌ Error deleting location:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete location');
      await fetchLocations();
    } finally {
      setShowDeleteConfirm(false);
      setLocationToDelete(null);
    }
  };

  // ✅ NEW: Cancel delete
  const cancelDelete = (): void => {
    console.log('⚠️ Delete cancelled by user');
    setShowDeleteConfirm(false);
    setLocationToDelete(null);
  };

  // Cancel form
  const handleCancelLocationForm = (): void => {
    setShowLocationForm(false);
    setEditingLocation(null);
    setLocationFormData({ name: '', id: '' });
  };

  // Export data
  const handleExport = () => {
    console.log('Exporting locations...');
    const dataStr = JSON.stringify(locations, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `locations-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    if (onNotification) onNotification('Locations exported successfully');
  };

  // Load locations on mount
  useEffect(() => {
    fetchLocations();
  }, []);

  // ===================================
  // RENDER
  // ===================================

  if (loading && locations.length === 0) {
    return (
      <div className="p-6">
        <div className="py-12 text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Loading locations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="py-12 text-center">
          <div className="mb-4 text-6xl">⚠️</div>
          <h3 className="mb-2 text-xl font-semibold text-gray-900">Error Loading Locations</h3>
          <p className="mb-4 text-gray-600">{error}</p>
          <button
            onClick={fetchLocations}
            className="mx-auto flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-bold text-white transition-colors duration-200 hover:bg-blue-700"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6" key={refreshKey}>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Location Management</h2>
          <p className="text-gray-600">
            Manage delivery areas and zones ({locations.length} total)
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchLocations}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-gray-500 px-4 py-2 font-bold text-white transition-colors duration-200 hover:bg-gray-600 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 font-bold text-white transition-colors duration-200 hover:bg-green-700"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
          <button
            onClick={() => setShowLocationForm(true)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-bold text-white transition-colors duration-200 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add Location
          </button>
        </div>
      </div>

      {/* ✅ NEW: Delete Confirmation Modal */}
      {showDeleteConfirm && locationToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-full bg-red-100 p-3">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Confirm Delete</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>
            
            <div className="mb-6 rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-700">
                Are you sure you want to delete{' '}
                <span className="font-semibold text-red-600">"{locationToDelete.name}"</span>?
              </p>
              <p className="mt-2 text-xs text-gray-500">
                Location ID: {locationToDelete.id || locationToDelete._id}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={cancelDelete}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gray-500 px-4 py-2 font-bold text-white transition-colors duration-200 hover:bg-gray-600"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 font-bold text-white transition-colors duration-200 hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showLocationForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <h3 className="mb-4 text-lg font-semibold">
              {editingLocation ? 'Edit Location' : 'Add New Location'}
            </h3>
            <form onSubmit={handleLocationSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Location Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={locationFormData.name}
                  onChange={e =>
                    setLocationFormData({ ...locationFormData, name: e.target.value })
                  }
                  placeholder="e.g., Patna City Center"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Location ID (Optional)
                </label>
                <input
                  type="text"
                  value={locationFormData.id}
                  onChange={e => setLocationFormData({ ...locationFormData, id: e.target.value })}
                  placeholder="e.g., PAT_001"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Leave empty for existing locations without custom ID
                </p>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-bold text-white transition-colors duration-200 hover:bg-blue-700"
                >
                  <Save className="h-4 w-4" />
                  {editingLocation ? 'Update' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={handleCancelLocationForm}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gray-500 px-4 py-2 font-bold text-white transition-colors duration-200 hover:bg-gray-600"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Locations List */}
      {locations.length === 0 ? (
        <div className="py-12 text-center">
          <div className="mb-4 text-6xl">📍</div>
          <h3 className="mb-2 text-xl font-semibold text-gray-900">No Locations Added</h3>
          <p className="mb-4 text-gray-600">Start by adding your first delivery location!</p>
          <button
            onClick={() => setShowLocationForm(true)}
            className="mx-auto flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-bold text-white transition-colors duration-200 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add First Location
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Delivery Locations ({locations.length})
              </h3>
              <span className="text-sm text-gray-500">Manage areas where you deliver</span>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {locations.map((location, index) => (
              <div 
                key={`${location._id}-${index}-${refreshKey}`} 
                className="px-6 py-4 transition-colors hover:bg-gray-50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-blue-100 p-2">
                      <MapPin className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{location.name}</h4>
                      <p className="text-sm text-gray-500">
                        ID: {location.id || location._id}
                      </p>
                      {location.createdAt && (
                        <p className="text-xs text-gray-400">
                          Added: {new Date(location.createdAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditLocation(location)}
                      className="flex items-center gap-1 rounded-lg bg-yellow-500 px-3 py-2 font-bold text-white transition-colors duration-200 hover:bg-yellow-600"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </button>
                    {/* ✅ UPDATED: Use custom modal instead of window.confirm */}
                    <button
                      onClick={() => handleDeleteClick(location)}
                      className="flex items-center gap-1 rounded-lg bg-red-500 px-3 py-2 font-bold text-white transition-colors duration-200 hover:bg-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLocation;