import React, { useState, useEffect } from 'react';
import { ArrowLeft, Upload, X, Loader, Save, Trash2 } from 'lucide-react';
import { phoneAPI, apiUtils } from '../utils/api';
import { useAuth } from '../utils/AuthContext';

const EditPhonePage = ({ onNavigate, phoneId }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [phone, setPhone] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    brand: '',
    price: '',
    originalPrice: '',
    condition: '',
    description: '',
    location: '',
    specs: {
      ram: '',
      storage: '',
      battery: '',
      camera: '',
      processor: '',
      screen: '',
      os: ''
    }
  });
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);

  useEffect(() => {
    if (!phoneId) {
      setError('Phone ID is required');
      setLoading(false);
      return;
    }
    fetchPhone();
  }, [phoneId]);

  const fetchPhone = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await phoneAPI.getPhoneById(phoneId);
      const phoneData = response.data;
      
      // Check if user owns this phone
      if (phoneData.sellerId._id !== user.id) {
        setError('You can only edit your own listings');
        return;
      }
      
      setPhone(phoneData);
      setFormData({
        title: phoneData.title || '',
        brand: phoneData.brand || '',
        price: phoneData.price?.toString() || '',
        originalPrice: phoneData.originalPrice?.toString() || '',
        condition: phoneData.condition || '',
        description: phoneData.description || '',
        location: phoneData.location || '',
        specs: {
          ram: phoneData.specs?.ram || '',
          storage: phoneData.specs?.storage || '',
          battery: phoneData.specs?.battery || '',
          camera: phoneData.specs?.camera || '',
          processor: phoneData.specs?.processor || '',
          screen: phoneData.specs?.screen || '',
          os: phoneData.specs?.os || ''
        }
      });
      setExistingImages(phoneData.images || []);
      
    } catch (err) {
      console.error('Failed to fetch phone:', err);
      setError(apiUtils.handleError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('specs.')) {
      const specField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        specs: { ...prev.specs, [specField]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (existingImages.length + newImages.length + files.length > 6) {
      setError('Maximum 6 images allowed');
      return;
    }
    
    files.forEach(file => {
      if (!file.type.startsWith('image/')) {
        setError('Only image files are allowed');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('Image size must be less than 10MB');
        return;
      }
    });
    
    setNewImages(prev => [...prev, ...files]);
    setError(null);
  };

  const removeExistingImage = (index) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);
      
      // Validate form
      apiUtils.validatePhoneData({
        ...formData,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null
      });
      
      if (existingImages.length + newImages.length === 0) {
        throw new Error('At least one image is required');
      }
      
      // Create form data if new images exist
      let updateData;
      if (newImages.length > 0) {
        updateData = new FormData();
        updateData.append('title', formData.title.trim());
        updateData.append('brand', formData.brand);
        updateData.append('price', formData.price);
        if (formData.originalPrice) updateData.append('originalPrice', formData.originalPrice);
        updateData.append('condition', formData.condition);
        updateData.append('description', formData.description);
        updateData.append('location', formData.location);
        updateData.append('specs', JSON.stringify(formData.specs));
        updateData.append('existingImages', JSON.stringify(existingImages));
        
        newImages.forEach(file => {
          updateData.append('images', file);
        });
      } else {
        // JSON update without new images
        updateData = {
          ...formData,
          price: parseFloat(formData.price),
          originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
          images: existingImages
        };
      }
      
      const response = await phoneAPI.updatePhone(phoneId, updateData);
      console.log('Phone updated successfully');
      
      // Navigate back to profile page with listings tab active
      onNavigate('profile', { activeTab: 'listings' });
      
    } catch (err) {
      console.error('Failed to update phone:', err);
      setError(apiUtils.handleError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${phone?.title}"?\n\nThis action cannot be undone.`)) {
      try {
        setSaving(true);
        await phoneAPI.deletePhone(phoneId);
        console.log('Phone deleted successfully');
        
        // Navigate back to profile page
        onNavigate('profile', { activeTab: 'listings' });
      } catch (err) {
        console.error('Failed to delete phone:', err);
        setError(apiUtils.handleError(err));
        setSaving(false);
      }
    }
  };

  const handleBackToProfile = () => {
    onNavigate('profile', { activeTab: 'listings' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-16 w-16 text-purple-500 mx-auto mb-4 animate-spin" />
          <p className="text-gray-400 text-xl">Loading phone details...</p>
        </div>
      </div>
    );
  }

  if (error && !phone) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-900/20 backdrop-blur-lg rounded-2xl p-8 border border-red-500/30 max-w-md">
            <h3 className="text-red-300 font-semibold mb-2">Error</h3>
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={handleBackToProfile}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-xl transition-colors"
            >
              Go Back to Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black pt-32 pb-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button
              onClick={handleBackToProfile}
              className="mr-4 p-2 rounded-xl bg-gray-800 hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="h-6 w-6 text-gray-300" />
            </button>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Edit Phone Listing
            </h1>
          </div>
          
          <button
            onClick={handleDelete}
            disabled={saving}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl transition-colors flex items-center disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </button>
        </div>

        {error && (
          <div className="mb-8 bg-red-900/20 backdrop-blur-lg rounded-2xl p-4 border border-red-500/30">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <div className="bg-gray-900/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50">
            <h3 className="text-xl font-semibold text-white mb-6">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-300 mb-2">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-xl bg-gray-800 border border-gray-600 text-white focus:border-purple-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Brand *</label>
                <select
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-xl bg-gray-800 border border-gray-600 text-white focus:border-purple-500 focus:outline-none"
                  required
                >
                  <option value="">Select Brand</option>
                  {['Apple','Samsung','Google','OnePlus','Xiaomi','Huawei','Sony','LG','Motorola','Nokia','Other'].map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Price (LKR) *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-xl bg-gray-800 border border-gray-600 text-white focus:border-purple-500 focus:outline-none"
                  required
                  min="0"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Original Price (LKR)</label>
                <input
                  type="number"
                  name="originalPrice"
                  value={formData.originalPrice}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-xl bg-gray-800 border border-gray-600 text-white focus:border-purple-500 focus:outline-none"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Condition *</label>
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-xl bg-gray-800 border border-gray-600 text-white focus:border-purple-500 focus:outline-none"
                  required
                >
                  <option value="">Select Condition</option>
                  {['Excellent','Very Good','Good','Fair'].map(condition => (
                    <option key={condition} value={condition}>{condition}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-xl bg-gray-800 border border-gray-600 text-white focus:border-purple-500 focus:outline-none"
                  placeholder="e.g., Colombo"
                />
              </div>
            </div>
            
            <div className="mt-6">
              <label className="block text-gray-300 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
                className="w-full p-3 rounded-xl bg-gray-800 border border-gray-600 text-white focus:border-purple-500 focus:outline-none"
                placeholder="Describe your phone's condition, features, and any additional details..."
              />
            </div>
          </div>

          {/* Specifications */}
          <div className="bg-gray-900/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50">
            <h3 className="text-xl font-semibold text-white mb-6">Specifications</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-300 mb-2">RAM</label>
                <input
                  type="text"
                  name="specs.ram"
                  value={formData.specs.ram}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-xl bg-gray-800 border border-gray-600 text-white focus:border-purple-500 focus:outline-none"
                  placeholder="e.g., 8GB"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Storage</label>
                <input
                  type="text"
                  name="specs.storage"
                  value={formData.specs.storage}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-xl bg-gray-800 border border-gray-600 text-white focus:border-purple-500 focus:outline-none"
                  placeholder="e.g., 256GB"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Battery</label>
                <input
                  type="text"
                  name="specs.battery"
                  value={formData.specs.battery}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-xl bg-gray-800 border border-gray-600 text-white focus:border-purple-500 focus:outline-none"
                  placeholder="e.g., 4000mAh"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Camera</label>
                <input
                  type="text"
                  name="specs.camera"
                  value={formData.specs.camera}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-xl bg-gray-800 border border-gray-600 text-white focus:border-purple-500 focus:outline-none"
                  placeholder="e.g., 48MP Triple Camera"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Processor</label>
                <input
                  type="text"
                  name="specs.processor"
                  value={formData.specs.processor}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-xl bg-gray-800 border border-gray-600 text-white focus:border-purple-500 focus:outline-none"
                  placeholder="e.g., Snapdragon 888"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Screen</label>
                <input
                  type="text"
                  name="specs.screen"
                  value={formData.specs.screen}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-xl bg-gray-800 border border-gray-600 text-white focus:border-purple-500 focus:outline-none"
                  placeholder="e.g., 6.7 inch AMOLED"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Operating System</label>
                <input
                  type="text"
                  name="specs.os"
                  value={formData.specs.os}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-xl bg-gray-800 border border-gray-600 text-white focus:border-purple-500 focus:outline-none"
                  placeholder="e.g., Android 14"
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-gray-900/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/50">
            <h3 className="text-xl font-semibold text-white mb-6">Images</h3>
            
            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div className="mb-6">
                <h4 className="text-gray-300 mb-3">Current Images</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {existingImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Phone ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(index)}
                        className="absolute top-2 right-2 p-1 bg-red-600 hover:bg-red-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Images */}
            {newImages.length > 0 && (
              <div className="mb-6">
                <h4 className="text-gray-300 mb-3">New Images</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {newImages.map((file, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`New ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        className="absolute top-2 right-2 p-1 bg-red-600 hover:bg-red-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload New Images */}
            {(existingImages.length + newImages.length) < 6 && (
              <div>
                <label className="cursor-pointer">
                  <div className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center hover:border-purple-500 transition-colors">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-300 mb-2">Upload additional images</p>
                    <p className="text-gray-500 text-sm">
                      {6 - existingImages.length - newImages.length} more images allowed (Max 10MB each)
                    </p>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={handleBackToProfile}
              disabled={saving}
              className="px-8 py-3 rounded-xl bg-gray-600 hover:bg-gray-700 text-white font-medium transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-medium transition-all flex items-center disabled:opacity-50 shadow-lg shadow-purple-500/25"
            >
              {saving ? (
                <>
                  <Loader className="h-5 w-5 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  Update Phone
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPhonePage;