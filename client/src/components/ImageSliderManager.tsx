import React, { useState, useEffect } from 'react';
import { sliderService } from '../../services/sliderService';
import type { SliderImage } from '../types/slider';
import { Button } from './ui/button';
import { apiEndpoints } from '../configapi/api';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Upload,
  X,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface ImageFormData {
  title: string;
  alt: string;
  dataAiHint: string;
  isActive: boolean;
  order: number;
}

const ImageSliderManager: React.FC = () => {
  const [images, setImages] = useState<SliderImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingImage, setEditingImage] = useState<SliderImage | null>(null);
  const [uploading, setUploading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form state
  const [formData, setFormData] = useState<ImageFormData>({
    title: '',
    alt: '',
    dataAiHint: '',
    isActive: true,
    order: 0
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Fetch all images
  const fetchImages = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedImages = await sliderService.getAllSliderImages();
      setImages(fetchedImages);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch images';
      setError(errorMessage);
      showNotification('error', errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  // Show notification
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      alt: '',
      dataAiHint: '',
      isActive: true,
      order: 0
    });
    setSelectedFile(null);
    setPreviewUrl(null);
    setEditingImage(null);
    setShowForm(false);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile && !editingImage) {
      showNotification('error', 'Please select an image file');
      return;
    }

    setUploading(true);
    try {
      const formDataToSend = new FormData();
      if (selectedFile) {
        formDataToSend.append('image', selectedFile);
      }
      formDataToSend.append('title', formData.title);
      formDataToSend.append('alt', formData.alt);
      formDataToSend.append('dataAiHint', formData.dataAiHint);
      formDataToSend.append('isActive', formData.isActive.toString());
      formDataToSend.append('order', formData.order.toString());

      if (editingImage) {
        await sliderService.updateSliderImage(editingImage._id, formDataToSend);
        showNotification('success', 'Image updated successfully!');
      } else {
        await sliderService.createSliderImage(formDataToSend);
        showNotification('success', 'Image uploaded successfully!');
      }

      resetForm();
      await fetchImages();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save image';
      showNotification('error', errorMessage);
    } finally {
      setUploading(false);
    }
  };

  // Handle edit
  const handleEdit = (image: SliderImage) => {
    setEditingImage(image);
    setFormData({
      title: image.title,
      alt: image.alt,
      dataAiHint: image.dataAiHint || '',
      isActive: image.isActive,
      order: image.order
    });
    setPreviewUrl(apiEndpoints.getImageUrl(image.src));
    setShowForm(true);
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;

    try {
      await sliderService.deleteSliderImage(id);
      showNotification('success', 'Image deleted successfully!');
      await fetchImages();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete image';
      showNotification('error', errorMessage);
    }
  };

  // Handle toggle status
  const handleToggleStatus = async (id: string) => {
    try {
      await sliderService.toggleSliderImageStatus(id);
      showNotification('success', 'Image status updated!');
      await fetchImages();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update status';
      showNotification('error', errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading images...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Image Slider Management</h2>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Image
        </Button>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`p-4 rounded-lg flex items-center ${
          notification.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle className="h-5 w-5 mr-2" />
          ) : (
            <AlertCircle className="h-5 w-5 mr-2" />
          )}
          {notification.message}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium">Error loading images</h3>
              <p className="text-sm mt-1">{error}</p>
              <Button
                size="sm"
                variant="outline"
                onClick={fetchImages}
                className="mt-2"
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Upload/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">
                {editingImage ? 'Edit Image' : 'Add New Image'}
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image File {!editingImage && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="mt-2 h-32 w-full object-cover rounded-lg"
                  />
                )}
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter image title"
                />
              </div>

              {/* Alt Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alt Text <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.alt}
                  onChange={(e) => setFormData(prev => ({ ...prev, alt: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter alt text for accessibility"
                />
              </div>

              {/* AI Hint */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  AI Hint
                </label>
                <input
                  type="text"
                  value={formData.dataAiHint}
                  onChange={(e) => setFormData(prev => ({ ...prev, dataAiHint: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter AI hint (optional)"
                />
              </div>

              {/* Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                />
              </div>

              {/* Active Status */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                  Active (show in slider)
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex space-x-3 pt-4">
                <Button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {editingImage ? 'Updating...' : 'Uploading...'}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {editingImage ? 'Update' : 'Upload'}
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  disabled={uploading}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Images Grid */}
      {images.length === 0 ? (
        <div className="text-center py-12">
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No images uploaded</h3>
          <p className="text-gray-500 mb-4">Get started by uploading your first slider image.</p>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add First Image
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image) => (
            <div key={image._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="aspect-video relative">
                <img
                  src={apiEndpoints.getImageUrl(image.src)}
                  alt={image.alt}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://placehold.co/400x225.png?text=Image+Not+Found';
                  }}
                />
                <div className="absolute top-2 right-2 flex space-x-1">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    image.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {image.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="font-medium text-gray-900 mb-1">{image.title}</h3>
                <p className="text-sm text-gray-500 mb-2">{image.alt}</p>
                {image.dataAiHint && (
                  <p className="text-xs text-gray-400 mb-3">Hint: {image.dataAiHint}</p>
                )}
                <div className="text-xs text-gray-400 mb-3">Order: {image.order}</div>
                
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(image)}
                    className="flex-1"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleStatus(image._id)}
                    className="flex-1"
                  >
                    {image.isActive ? (
                      <EyeOff className="h-3 w-3 mr-1" />
                    ) : (
                      <Eye className="h-3 w-3 mr-1" />
                    )}
                    {image.isActive ? 'Hide' : 'Show'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(image._id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageSliderManager;